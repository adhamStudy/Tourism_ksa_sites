import "../styles/login.css";
import loginImage from "../assets/imgs/f3.jpg";
import { Link, useNavigate, useLocation } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { config } from "../config";

export default function LoginPage() {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const message = location.state?.toast;
    if (message) {
      showToast(message);
    }
  }, [location.state]);

  const togglePassword = () => {
    setPasswordVisible((prev) => !prev);
  };

  const showToast = (text) => {
    const toast = document.createElement("div");
    toast.className = "toast show";
    toast.textContent = text;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const email = e.target.email.value.trim();
    const password = e.target.password.value;

    if (!email || !password) {
      setError("❌ Please fill in all fields.");
      return;
    }

    try {
      const res = await fetch(`${config.apiBaseUrl}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": "Murshid999.GIS.AI333",
        },
        body: JSON.stringify({ email, password }),
      });

      let data = null;

      try {
        data = await res.json();
      } catch {
        // حتى لو الرد مو JSON → طبع User not found
        setError("❌ User not found");
        return;
      }

      if (res.ok && data.access_token) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("userEmail", email);

        showToast("✅ Logged in successfully!");
        navigate("/");
      } else {
        const message =
          data?.detail || data?.message || data?.error || "User not found";
        setError(`❌ ${message}`);
      }
    } catch (err) {
      console.error("Network error:", err);
      // فشل الاتصال بالسيرفر → برضو نطبع User not found
      setError("❌ User not found");
    }
  };

  return (
    <div className="page-wrapper">
      <div
        className="background-image"
        style={{
          backgroundImage: `url(${loginImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      />
      <div className="overlay"></div>
      <div className="container">
        <div className="login-box">
          <h2>Log in</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-container">
              <input
                type="text"
                name="email"
                placeholder="Email address"
                required
              />
            </div>

            <div className="input-container">
              <input
                type={passwordVisible ? "text" : "password"}
                name="password"
                placeholder="Password"
                required
              />
              <i
                className={`fas ${
                  passwordVisible ? "fa-eye-slash" : "fa-eye"
                } toggle-password`}
                onClick={togglePassword}
              ></i>
            </div>

            {error && (
              <p
                className="error-msg"
                style={{
                  color: "red",
                  marginBottom: "10px",
                  textAlign: "left",
                }}
              >
                {error}
              </p>
            )}

            <button type="submit">Log in</button>
          </form>

          <Link to="/forgot-password" className="forgot-link">
            Forgot your password?
          </Link>

          <p className="signup-text">
            Don’t have an account?{" "}
            <Link to="/signup" className="signup-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
