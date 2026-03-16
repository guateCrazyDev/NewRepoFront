import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { registerRequest, loginRequest } from '../service/AuthService'
import './Register.css'

export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)

  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    try {
      await registerRequest({ username, password })
      try {
        await loginRequest({ username, password })
        navigate('/home', { replace: true })
        return
      } catch {
        navigate('/login', { replace: true })
        return
      }
    } catch (err) {
      const msg = err?.response?.data || 'Registration failed'
      setError(typeof msg === 'string' ? msg : 'Could not register')
    }
  }

  return (
    <div className="RegisterPage-Container">
      <form onSubmit={onSubmit}>
        <div id="image-container">
          <img id="icon" src="../public/images/SkyRoute.ico" alt="" />
        </div>
        <h1>Create account</h1>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          autoComplete="username"
          required
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="new-password"
          required
        />

        {error && <div className="error">{error}</div>}
        <button type="submit">Register</button>
        <Link id="Login" to="/login">
          Already have an account?
        </Link>
      </form>
    </div>
  )
}
