import '../styles/signup.css';
import signupImage from '../assets/imgs/jrd3.jpg';
import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import { config } from "../config";

export default function SignupPage() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const togglePassword = () => setPasswordVisible(prev => !prev);
  const toggleConfirm = () => setConfirmVisible(prev => !prev);

  // Validate email format
  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  // ✅ Strong password validation
  const validatePassword = (password) => {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&    // At least one uppercase letter
      /[a-z]/.test(password) &&    // At least one lowercase letter
      /\d/.test(password) &&       // At least one number
      /[^A-Za-z0-9]/.test(password) // At least one special character
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const email = e.target.email.value.trim();
    const password = e.target.password.value;
    const confirmPassword = e.target.confirmPassword.value;

    if (password !== confirmPassword) {
      setError("❌ Passwords do not match.");
      return;
    }

    if (!validateEmail(email)) {
      setError("❌ Please enter a valid email address.");
      return;
    }

    if (!validatePassword(password)) {
      setError("❌ Password must be at least 8 characters long, and include uppercase, lowercase, number, and special character.");
      return;
    }

    try {
      const res = await fetch(`${config.apiBaseUrl}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "Murshid999.GIS.AI333"
        },
        body: JSON.stringify({
          email,
          password,
          role: "user"
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("✅ Account created successfully. Please verify your email.");
        e.target.reset();
      } else {
        setError(data.detail || "❌ Registration failed.");
      }
    } catch (err) {
      setError("❌ Unable to connect to the server.");
    }
  };

  return (
    <div className="page-wrapper">
      <div
        className="background-image"
        style={{
          backgroundImage: `url(${signupImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'absolute',
          inset: 0,
          zIndex: 0,
        }}
      />

      <div className="container">
        <div className="login-box">
          <h2>Create Account</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-container">
              <input type="email" name="email" placeholder="Email address" required />
            </div>

            <div className="input-container">
              <input
                type={passwordVisible ? 'text' : 'password'}
                name="password"
                placeholder="Password"
                required
              />
              <i
                className={`fas ${passwordVisible ? 'fa-eye-slash' : 'fa-eye'} toggle-password`}
                onClick={togglePassword}
              ></i>
            </div>

            <div className="input-container">
              <input
                type={confirmVisible ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Confirm Password"
                required
              />
              <i
                className={`fas ${confirmVisible ? 'fa-eye-slash' : 'fa-eye'} toggle-password`}
                onClick={toggleConfirm}
              ></i>
            </div>

            {error && <p className="error-msg">{error}</p>}
            {success && <p className="success-message">{success}</p>}

            <button type="submit">Create Account</button>
          </form>

          <p className="signup-text">
            Already have an account? <Link to="/login" className="signup-link">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
