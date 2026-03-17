import { useState } from 'react';
import { getUser } from '../storage/StorageService';
import { changePassword } from '../service/UserService';
import './ProfilePassword.css';

function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const [message, setMessage] = useState('')
  const [isError, setIsError] = useState(false)

  const handleChangePassword = async (e) => {
    e.preventDefault()

    try {
      const username = getUser()

      await changePassword(username, oldPassword, newPassword)

      setOldPassword('')
      setNewPassword('')

      setMessage('Password changed successfully')
      setIsError(false)
    } catch (error) {
      console.error(error)

      setMessage('Error changing password')
      setIsError(true)
    }
  }

  return (
    <div className="change-password-container">
      <div className="change-password-card">
        <h2 className="change-password-title">Change Password</h2>

        {message && (
          <p
            className={
              isError ? 'change-password-error' : 'change-password-success'
            }
          >
            {message}
          </p>
        )}

        <form onSubmit={handleChangePassword}>
          <div className="change-password-input-group">
            <label>Current password</label>

            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>

          <div className="change-password-input-group">
            <label>New password</label>

            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <button className="change-password-button">Change Password</button>
        </form>
      </div>
    </div>
  )
}

export default ChangePassword
