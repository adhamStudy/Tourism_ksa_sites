import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/forgotpassword.css';
import backgroundImage from '../assets/imgs/alu3.jpg';
import { config } from '../config'; // رابط FastAPI

export default function ForgetPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleReset = async () => {
    setError('');

    if (!email) {
      setError("❌ Please enter your email address.");
      return;
    }

    try {
      const res = await fetch(`${config.apiBaseUrl}/send_verification_code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await res.json();

      if (res.ok) {
        // ✅ نحفظ الإيميل وننتقل
        localStorage.setItem("resetEmail", email);
        navigate('/verify-code');
      } else {
        setError(data.detail || "❌ Failed to send verification code.");
      }
    } catch (err) {
      setError("❌ Server error. Please try again later.");
    }
  };

  return (
    <div className="page-wrapper">
      <div
        className="background-image"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'absolute',
          inset: 0,
          zIndex: 0,
        }}
      />
      <div className="overlay"></div>

      <div className="container">
        <div className="login-box">
          <h2>Forget Password</h2>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="input-container">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {error && <p className="error-msg" style={{ color: '#ff9999', fontSize: '14px', textAlign: 'left' }}>{error}</p>}

            <div className="buttons">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => navigate('/login')}
              >
                Cancel
              </button>

              <button type="button" onClick={handleReset}>
                Verify Email
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

