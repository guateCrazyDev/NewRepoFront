// Token
export function setToken(token) {
  localStorage.setItem('Token', token)
}

export function getToken() {
  return localStorage.getItem('Token')
}

export function clearToken() {
  localStorage.removeItem('Token')
}

// Role
export function setRole(role) {
  localStorage.setItem('Role', role)
}

export function getRole() {
  return localStorage.getItem('Role')
}

export function clearRole() {
  localStorage.removeItem('Role')
}

// User
export function setUser(username) {
  localStorage.setItem('User', username)
}

export function getUser() {
  return localStorage.getItem('User')
}

export function clearUser() {
  localStorage.removeItem('User')
}

// Profile Image
export function setImgProfile(img) {
  localStorage.setItem('ProfileImg', img)
}

export function getImgProfile() {
  return localStorage.getItem('ProfileImg')
}

export function clearImgProfile() {
  localStorage.removeItem('ProfileImg')
}

// Clear all
export function clearSession() {
  clearToken()
  clearRole()
  clearUser()
  clearImgProfile()
}
