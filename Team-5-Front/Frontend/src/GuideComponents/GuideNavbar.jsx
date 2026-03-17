import './GuideNavbar.css'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useEffect, useState, useCallback } from 'react'
import {
  getUser,
  getRole,
  getImgProfile,
  clearSession,
} from '../storage/StorageService'

/**
 * Ajusta esto a tu backend real (sin trailing slash).
 * Si ya estás detrás de un proxy, úsalo tal cual.
 */
const BASE_URL = 'http://localhost:8080'

/** Quita los slashes finales para evitar // en concatenaciones */
const trimTrailingSlash = (s = '') => s.replace(/\/+$/, '')

/**
 * Normaliza cualquier "pic" (string u objeto) a una ruta relativa comenzando
 * en "uploads/..." y la convierte a URL absoluta bajo BASE_URL.
 * Casos soportados:
 *  - 'C:\\uploads\\avatar.jpg'
 *  - '\\uploads\\avatar.jpg'
 *  - '/uploads/avatar.jpg'
 *  - 'uploads/avatar.jpg'
 *  - { path: 'C:\\uploads\\avatar.jpg' } | { url: '/uploads/avatar.jpg' }
 *  - http/https (se respeta tal cual)
 */
const toAbsoluteUploadUrl = (pic) => {
  if (!pic) return ''

  // 1) Extraer string base
  const rawPath =
    typeof pic === 'string'
      ? pic
      : pic.path || pic.url || pic.location || pic.filename || ''

  if (!rawPath) return ''

  if (/^https?:\/\//i.test(rawPath)) return rawPath

  let p = String(rawPath)
    .replace(/^file:\/\//i, '')
    .replace(/\\/g, '/') 
  p = p.replace(/^([A-Z]:)?\/+uploads\/+/i, 'uploads/')

  // Quitar slashes iniciales redundantes: '/uploads/...' -> 'uploads/...'
  p = p.replace(/^\/+/, '')

  // Si no empieza por uploads/, intenta localizarlo dentro del string
  if (!/^uploads\//i.test(p)) {
    const idx = p.toLowerCase().indexOf('uploads/')
    if (idx !== -1) {
      p = p.slice(idx)
    }
  }

  // Deducplicar 'uploads/uploads/...'
  p = p.replace(/(^|\/)(uploads\/)+(?!$)/gi, (m) => {
    // deja solo un 'uploads/'
    return m.includes('/') ? m.replace(/(uploads\/)+/gi, 'uploads/') : 'uploads/'
  })

  // Si aún no empieza por uploads/, no podemos asumir ruta válida
  if (!/^uploads\//i.test(p)) return ''

  // 4) Construir URL absoluta hacia el backend
  const base = trimTrailingSlash(BASE_URL)
  return `${base}/${p}`
}

/** Cache-bust agregando ?v=timestamp */
const cacheBust = (url) => {
  if (!url) return ''
  try {
    const u = new URL(url, window.location.origin)
    u.searchParams.set('v', Date.now())
    return u.toString()
  } catch {
    return url.includes('?') ? `${url}&v=${Date.now()}` : `${url}?v=${Date.now()}`
  }
}

/** Decide URL final a mostrar para el avatar */
const toDisplayUrl = (imgFromLS) => {
  if (!imgFromLS) return ''

  // Si es data URL, úsala tal cual
  if (typeof imgFromLS === 'string' && imgFromLS.startsWith('data:')) {
    return cacheBust(imgFromLS)
  }

  // Si es http(s), respeta
  if (typeof imgFromLS === 'string' && /^https?:\/\//i.test(imgFromLS)) {
    return cacheBust(imgFromLS)
  }

  // En cualquier otro caso, normaliza a BASE_URL/uploads/...
  const absolute = toAbsoluteUploadUrl(imgFromLS)
  return cacheBust(absolute)
}

/** Normaliza el "user" a string legible */
const normalizeUsername = (u) => {
  if (!u) return ''

  // Si viene como JSON string
  if (typeof u === 'string') {
    // 1) Prueba parsear JSON
    try {
      const parsed = JSON.parse(u)
      u = parsed
    } catch {
      // 2) Si no es JSON, úsalo literal como username
      return u
    }
  }

  // 3) Si es objeto, encuentra mejor campo disponible
  if (typeof u === 'object' && u !== null) {
    const name =
      u.username ||
      u.userName ||
      u.name ||
      u.fullName ||
      [u.firstName, u.lastName].filter(Boolean).join(' ').trim()

    return (name || '').trim()
  }

  return ''
}

function GuideNavbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [role, setRoleState] = useState('')
  const [scrolled, setScrolled] = useState(false)

  /** Refresca desde StorageService con tolerancia a formatos */
  const refreshAuthFromStorage = useCallback(() => {
    try {
      const rawUser = getUser()
      const rawRole = getRole()
      const rawImg = getImgProfile()

      const name = normalizeUsername(rawUser)
      const r = typeof rawRole === 'string' ? rawRole : (rawRole?.role || '')
      const img = toDisplayUrl(rawImg)

      setUsername(name || '')
      setRoleState(r || '')
      setAvatarUrl(img || '')
    } catch (err) {
      // Si algo falla, al menos evita romper la barra
      console.error('refreshAuthFromStorage error:', err)
    }
  }, [])

  useEffect(() => {
    // Cargar al montar
    refreshAuthFromStorage()

    // Evento custom de la misma pestaña (emítelo cuando actualices perfil)
    const onAuthChanged = () => refreshAuthFromStorage()
    window.addEventListener('auth:changed', onAuthChanged)

    // Evento storage para otras pestañas/ventanas
    const onStorage = () => {
      // No filtramos por key para evitar problemas de casing ('User' vs 'user')
      refreshAuthFromStorage()
    }
    window.addEventListener('storage', onStorage)

    return () => {
      window.removeEventListener('auth:changed', onAuthChanged)
      window.removeEventListener('storage', onStorage)
    }
  }, [refreshAuthFromStorage])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const initials =
    username
      ?.split(' ')
      ?.filter(Boolean)
      ?.map((p) => p[0]?.toUpperCase())
      ?.slice(0, 2)
      ?.join('') || 'U'

  const go = (p) => {
    if (location.pathname !== p) navigate(p)
  }

  const logout = () => {
    clearSession()
    window.dispatchEvent(new Event('auth:changed'))
    navigate('/')
  }

  const isHome = location.pathname === '/home'
  const isPlace = location.pathname.startsWith('/places')

  return (
    <div className="div-nav">
      <nav className={`GuideNavbar-Container ${scrolled ? 'scrolled' : ''}`}>
        <div id="title">
          <img src="/images/SkyRoute.ico" alt="logo" />
          <h1>SkyRoute</h1>
        </div>

        <div className="right-actions">
          <div id="div-buttons">
            {role === 'ADMIN' && isHome && (
              <button
                id="ButtonCreate"
                className="nav-item"
                onClick={() => go('/home/CForm')}
              >
                Create Category
              </button>
            )}

            {role === 'ADMIN' && isPlace && (
              <button
                id="ButtonCreate"
                className="nav-item"
                onClick={() =>
                  go(
                    '/home/PForm' +
                      location.pathname.slice(location.pathname.lastIndexOf('/'))
                  )
                }
              >
                Create Place
              </button>
            )}

            <Link to="/home" id="homeButton" className="nav-item">
              Home
            </Link>
          </div>

          <div className="profile-wrapper" tabIndex={0}>
            <div className="profile-tile">
              <span className="username">{username}</span>

              {avatarUrl ? (
                <img src={avatarUrl} className="avatar" alt="avatar" />
              ) : (
                <div className="avatar initials">{initials}</div>
              )}
            </div>

            <div className="profile-dropdown">
              <button
                className="dropdown-item"
                onClick={() => go('/home/profile')}
              >
                Profile
              </button>

              <button
                className="dropdown-item"
                onClick={() => go('/home/change-password')}
              >
                Change Password
              </button>

              <button className="dropdown-item danger" onClick={logout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
    </div>
  )
}

export default GuideNavbar