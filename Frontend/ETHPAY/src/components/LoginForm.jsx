import React, { useState } from 'react';
import '../App.css';

function LoginForm() {
const [isActive, setIsActive] = useState(false);
function register() {
    setIsActive(true);
  }
  function login() {
    setIsActive(false);
  }
  let containerClassName = 'container';
  if (isActive){
    containerClassName = containerClassName + ' active';
  }
  let registerFormClassName = 'form-box register';
  if (isActive){
    registerFormClassName = registerFormClassName + ' active';
  }
  let toggleLeftClassName = 'toggle-pannel toggle-left';
  let toggleRightClassName = 'toggle-pannel toggle-right';
  if (isActive){
    toggleLeftClassName = toggleLeftClassName + ' active';
    toggleRightClassName = toggleRightClassName + ' active';
  }
  return (
    <div className="login-form-wrapper">
      <div className={containerClassName}>
      <div className="form-box login">
        <form action="#">
          <h1>Login</h1>
          <div className="input-box">
            <input type="text" placeholder="username" required />
            <i className="fa-solid fa-user"></i>
          </div>
          <div className="input-box">
            <input type="password" placeholder="password" required />
            <i className="fa-solid fa-lock"></i>
          </div>
          <div className="forgot-link">
            <a href="#">Forgot password?</a>
          </div>
          <button type="submit" className="button">Login</button>
          <p>or login with social platforms</p>
          <div className="social-icons">
            <a href="#"><i className="fa-brands fa-google"></i></a>
            <a href="#"><i className="fa-brands fa-facebook-f"></i></a>
            <a href="#"><i className="fa-brands fa-github"></i></a>
            <a href="#"><i className="fa-brands fa-linkedin-in"></i></a>
          </div>
        </form>
      </div>
      <div className={registerFormClassName}>
        <form action="#">
          <h1>Registration</h1>
          <div className="input-box">
            <input type="text" placeholder="username" required />
            <i className="fa-solid fa-user"></i>
          </div>
          <div className="input-box">
            <input type="email" placeholder="Email" required />
            <i className="fa-solid fa-envelope"></i>
          </div>
          <div className="input-box">
            <input type="password" placeholder="password" required />
            <i className="fa-solid fa-lock"></i>
          </div>
          <button type="submit" className="button">Register</button>
          <p>or register with social platforms</p>
          <div className="social-icons">
            <a href="#"><i className="fa-brands fa-google"></i></a>
            <a href="#"><i className="fa-brands fa-facebook-f"></i></a>
            <a href="#"><i className="fa-brands fa-github"></i></a>
            <a href="#"><i className="fa-brands fa-linkedin-in"></i></a>
          </div>
        </form>
      </div>
      <div className="toggle-box">
        <div className={toggleLeftClassName}>
          <h1>Hello, Welcome!</h1>
          <p>Don't have an account?</p>
          <button className="button register-button" onClick={register}>
            Register
          </button>
        </div>
        <div className={toggleRightClassName}>
          <h1>Welcome Back!</h1>
          <p>Already have an account?</p>
          <button className="button login-button" onClick={login}>
            Login
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}
export default LoginForm;