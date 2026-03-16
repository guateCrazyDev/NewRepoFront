import './GuideNavbar.css'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import {
  getUser,
  getRole,
  getImgProfile,
  clearSession,
} from '../storage/StorageService'
import { getUserImage } from '../service/UserService'

function GuideNavbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [img, setImg] = useState('')
  const [role, setRole] = useState('')
  const [imgKey, setImgKey] = useState(0)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const sync = () => {
      setUsername(getUser() || '')
      setImg(getImgProfile() || '')
      setRole(getRole() || '')
      setImgKey((prev) => prev + 1)
    }

    sync()

    window.addEventListener('userUpdated', sync)

    return () => {
      window.removeEventListener('userUpdated', sync)
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const profileImg = img ? getUserImage(img) + '?t=' + imgKey : null

  const initials =
    username
      ?.split(' ')
      ?.map((p) => p[0]?.toUpperCase())
      ?.slice(0, 2)
      ?.join('') || 'U'

  const go = (p) => {
    if (location.pathname !== p) {
      navigate(p)
    }
  }

  const logout = () => {
    clearSession()
    navigate('/login')
  }

  const isHome = location.pathname === '/home';
  const isPlace = location.pathname.startsWith("/places");

  return (
    <div className="div-nav">
      <nav className={`GuideNavbar-Container ${scrolled ? 'scrolled' : ''}`}>
        <div id="title">
          <img src="/images/SkyRoute.ico" alt="logo" />
          <h1>SkyRoute</h1>
        </div>

        <div className="right-actions">
          <div id="div-buttons">
            {role === "ADMIN" && isHome && (
              <button
                id="ButtonCreate"
                className="nav-item"
                onClick={() => go("/home/CForm")}
              >
                Create Category
              </button>
            )}
            {role === "ADMIN" && isPlace && (
              <button
                id="ButtonCreate"
                className="nav-item"
                onClick={() => go("/home/PForm"+location.pathname.slice(location.pathname.lastIndexOf("/")))}
              >
                Create Place
              </button>
            )}

            <Link
              to="/home"
              id="homeButton"
              className="nav-item"
            >
              Home
            </Link>
          </div>

          <div className="profile-wrapper" tabIndex={0}>
            <div className="profile-tile">
              <span className="username">{username}</span>

              {profileImg ? (
                <img
                  key={imgKey}
                  src={profileImg}
                  className="avatar"
                  alt="avatar"
                />
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
