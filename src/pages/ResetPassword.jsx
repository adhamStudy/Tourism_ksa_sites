import React, { useState } from 'react';
import backgroundImage from '../assets/imgs/m3.jpg';
import { useNavigate } from 'react-router-dom';
import '../styles/resetpass.css';

export default function ResetPassword() {
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPass !== confirmPass) {
      setErrorMsg('Passwords do not match');
      return;
    }

    const email = localStorage.getItem('resetEmail');
    const resetCode = localStorage.getItem('resetCode');

    if (!email || !resetCode) {
      setErrorMsg('Missing verification info. Please restart the process.');
      return;
    }

    try {
      const response = await fetch('https://murshidgis.duckdns.org/reset_password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, reset_code: resetCode, new_password: newPass })
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.removeItem('resetCode');
        localStorage.removeItem('resetEmail');
        alert(result.message || 'Password reset successfully!');
        navigate('/login');
      } else {
        setErrorMsg(result.detail || 'Reset failed. Please try again.');
      }
    } catch (err) {
      console.error('RESET ERROR:', err);
      setErrorMsg('An error occurred. Please try again later.');
    }
  };

  return (
    <div className="reset-wrapper" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="container">
        <div className="login-box">
          <h2>Enter new password</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-container">
              <input
                className="input-field"
                type={showNewPass ? 'text' : 'password'}
                placeholder="New Password"
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                required
              />
              <i
                className={`fas ${showNewPass ? 'fa-eye-slash' : 'fa-eye'} toggle-password`}
                onClick={() => setShowNewPass(!showNewPass)}
              ></i>
            </div>

            <div className="input-container">
              <input
                className="input-field"
                type={showConfirmPass ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                required
              />
              <i
                className={`fas ${showConfirmPass ? 'fa-eye-slash' : 'fa-eye'} toggle-password`}
                onClick={() => setShowConfirmPass(!showConfirmPass)}
              ></i>
            </div>

            <p className="error-msg">{errorMsg}</p>
            <button type="submit">Done</button>
          </form>
        </div>
      </div>
    </div>
  );
}