import api from "./AxiosConfig";

// Token functions
export function setToken(token) {
  localStorage.setItem("Token", token);
}

export function getToken() {
  return localStorage.getItem("Token");
}

export function clearToken() {
  localStorage.removeItem("Token");
}

// Role functions
export function setRole(role) {
  localStorage.setItem("Role", role);
}

export function getRole() {
  return localStorage.getItem("Role");
}

export function clearRole() {
  localStorage.removeItem("Role");
}

// User Functions
export function setUser(username) {
  localStorage.setItem("User", username);
}

export function getUser() {
  return localStorage.getItem("User");
}

export function clearUser() {
  localStorage.removeItem("User");
}

// User img
export function setImgProfile(img) {
  localStorage.setItem("ProfileImg", img);
}

export function getImgProfile() {
  return localStorage.getItem("ProfileImg");
}

export function clearImgProfile() {
  localStorage.removeItem("ProfileImg");
}

// Login and Register functions
export async function loginRequest({ username, password }) {
  const { data } = await api.post("/auth/login", { username, password });

  clearRole();
  clearToken();
  clearImgProfile();

  if (data?.jwt) {
    setToken(data.jwt);
    setRole(data.role);
    setUser(username);
  }

  if (data?.img) {
    setImgProfile(data.img);
  }

  return data;
}

export async function registerRequest({ username, password }) {
  const { data } = await api.post("/auth/register", {
    username,
    password,
  });
  return data;
}
