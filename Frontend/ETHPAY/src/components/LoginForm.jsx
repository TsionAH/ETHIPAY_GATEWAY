import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, register } from "../service/authService";
import "./LoginForm.css";

function LoginForm() {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(false);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    companyName: "",
  });
  const [registerData, setRegisterData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
    companyName: "",
    role: "endUser",
  });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    try {
      const result = await login(
        loginData.email,
        loginData.password,
        loginData.companyName
      );
      const destination =
        result?.role === "merchant" ? "/merchant-dashboard" : "/dashboard";
      navigate(destination);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Login failed. Please try again."
      );
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    try {
      await register(registerData);
      setInfo("Registration successful. Please login.");
      setIsActive(false);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.message ||
          "Registration failed. Please try again."
      );
    }
  };

  const containerClassName = `container${isActive ? " active" : ""}`;
  const registerFormClassName = `form-box register${isActive ? " active" : ""}`;
  const toggleLeftClassName = `toggle-pannel toggle-left${
    isActive ? " active" : ""
  }`;
  const toggleRightClassName = `toggle-pannel toggle-right${
    isActive ? " active" : ""
  }`;

  return (
    <div className="auth-shell">
      <div className={containerClassName}>
        <div className="form-box login">
          <form onSubmit={handleLogin}>
            <h1>Login</h1>
            {error && !isActive && (
              <p className="text-red-500 text-sm mb-3">{error}</p>
            )}
            {info && !isActive && (
              <p className="text-green-600 text-sm mb-3">{info}</p>
            )}
            <div className="input-box">
              <input
                type="email"
                placeholder="Email"
                required
                value={loginData.email}
                onChange={(e) =>
                  setLoginData({ ...loginData, email: e.target.value })
                }
              />
              <i className="fa-solid fa-user"></i>
            </div>
            <div className="input-box">
              <input
                type="password"
                placeholder="Password"
                required
                value={loginData.password}
                onChange={(e) =>
                  setLoginData({ ...loginData, password: e.target.value })
                }
              />
              <i className="fa-solid fa-lock"></i>
            </div>
            <div className="input-box">
              <input
                type="text"
                placeholder="Company (merchants only)"
                value={loginData.companyName}
                onChange={(e) =>
                  setLoginData({ ...loginData, companyName: e.target.value })
                }
              />
              <i className="fa-solid fa-building"></i>
            </div>
            <button type="submit" className="button">
              Login
            </button>
            <p>or login with social platforms</p>
            <div className="social-icons">
              <a href="#">
                <i className="fa-brands fa-google"></i>
              </a>
              <a href="#">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#">
                <i className="fa-brands fa-github"></i>
              </a>
              <a href="#">
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
            </div>
          </form>
        </div>
        <div className={registerFormClassName}>
          <form onSubmit={handleRegister}>
            <h1>Registration</h1>
            {error && isActive && (
              <p className="text-red-500 text-sm mb-3">{error}</p>
            )}
            {info && isActive && (
              <p className="text-green-600 text-sm mb-3">{info}</p>
            )}
            <div className="input-box">
              <input
                type="text"
                placeholder="Full name"
                required
                value={registerData.fullName}
                onChange={(e) =>
                  setRegisterData({ ...registerData, fullName: e.target.value })
                }
              />
              <i className="fa-solid fa-user"></i>
            </div>
            <div className="input-box">
              <input
                type="tel"
                placeholder="Phone number"
                required
                value={registerData.phoneNumber}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    phoneNumber: e.target.value,
                  })
                }
              />
              <i className="fa-solid fa-phone"></i>
            </div>
            <div className="input-box">
              <input
                type="email"
                placeholder="Email"
                required
                value={registerData.email}
                onChange={(e) =>
                  setRegisterData({ ...registerData, email: e.target.value })
                }
              />
              <i className="fa-solid fa-envelope"></i>
            </div>
            <div className="input-box">
              <input
                type="password"
                placeholder="Password"
                required
                value={registerData.password}
                onChange={(e) =>
                  setRegisterData({ ...registerData, password: e.target.value })
                }
              />
              <i className="fa-solid fa-lock"></i>
            </div>
            <div className="input-box">
              <input
                type="text"
                placeholder="Company (merchants only)"
                value={registerData.companyName}
                onChange={(e) =>
                  setRegisterData({
                    ...registerData,
                    companyName: e.target.value,
                    role: e.target.value ? "merchant" : "endUser",
                  })
                }
              />
              <i className="fa-solid fa-building"></i>
            </div>
            <button type="submit" className="button">
              Register
            </button>
            <p>or register with social platforms</p>
            <div className="social-icons">
              <a href="#">
                <i className="fa-brands fa-google"></i>
              </a>
              <a href="#">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#">
                <i className="fa-brands fa-github"></i>
              </a>
              <a href="#">
                <i className="fa-brands fa-linkedin-in"></i>
              </a>
            </div>
          </form>
        </div>
        <div className="toggle-box">
          <div className={toggleLeftClassName}>
            <h1>Hello, Welcome!</h1>
            <p>Don't have an account?</p>
            <button
              className="button register-button"
              onClick={() => setIsActive(true)}
            >
              Register
            </button>
          </div>
          <div className={toggleRightClassName}>
            <h1>Welcome Back!</h1>
            <p>Already have an account?</p>
            <button
              className="button login-button"
              onClick={() => setIsActive(false)}
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;
