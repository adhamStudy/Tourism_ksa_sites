import React, { useState, useRef, useEffect } from 'react';
import '../styles/verification.css';
import backgroundImage from '../assets/imgs/t2.jpg';
import { useNavigate } from 'react-router-dom';

export default function VerificationCode() {
  const [code, setCode] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const inputsRef = useRef([]);
  const navigate = useNavigate();

  // ✅ عند تحميل الصفحة مباشرة نطبع الكود في الكونسول
  useEffect(() => {
    const email = localStorage.getItem('resetEmail');
    if (!email) {
      console.warn("❗No email found in localStorage.");
      return;
    }

    fetch(`https://murshidgis.duckdns.org/get_reset_code?email=${email}`)
      .then(res => res.json())
      .then(data => {
        console.log("📩 Code from API:", data.reset_code);
        localStorage.setItem('resetCode', data.reset_code); //
      })
      .catch(err => {
        console.error("❌ Failed to fetch verification code:", err);
      });
  }, []);

  const handleChange = (index, value) => {
    if (!isNaN(value) && value.length <= 1) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      if (value && index < 3) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  const handleVerify = async () => {
    const enteredCode = code.join('').trim();
    const email = localStorage.getItem('resetEmail');

    if (!email) {
      setError('Email not found. Please go back and enter your email again.');
      return;
    }

    try {
      const res = await fetch(`https://murshidgis.duckdns.org/get_reset_code?email=${email}`);
      const data = await res.json();

      console.log("📩 Code from API:", data.reset_code);

      if (enteredCode === data.reset_code) {
        navigate('/reset-password');
      } else {
        setError('The code is incorrect. Please try again.');
      }
    } catch (err) {
      console.error("VERIFY ERROR:", err);
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="verification-wrapper" style={{ backgroundImage: `url(${backgroundImage})` }}>
      <div className="overlay"></div>
      <div className="container">
        <div className="login-box">
          <h2>Enter verification code</h2>
          <div className="otp-inputs">
            {code.map((digit, i) => (
              <input
                key={i}
                type="text"
                maxLength="1"
                placeholder="•"
                value={digit}
                ref={(el) => (inputsRef.current[i] = el)}
                onChange={(e) => handleChange(i, e.target.value)}
                className={`otp-box ${digit ? 'filled' : ''}`}
              />
            ))}
          </div>
          <p id="otp-error" className="error-msg">{error}</p>
          <button onClick={handleVerify}>Verify</button>
          <p className="resend">
            Didn’t get the code? <a href="#">Resend</a>
          </p>
        </div>
      </div>
    </div>
  );
}