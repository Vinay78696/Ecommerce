import React, { useState } from 'react';
import "./CSS/Login.css";
function AdminAuth() {
async function handleAdminLogin(email, password) {
  try {
    const response = await fetch(`${BACKEND_URL}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Login Successful:", data);
      // Store the token in localStorage
      localStorage.setItem('adminToken', data.token);
      alert("Login successful!");
      window.location.replace("/admin/");
    }
    else {
      console.error("Login Failed:", data.error);
      alert(data.error || "Login failed. Please try again.");
    }
  } 
  catch (error) {
    console.error("Error during admin login:", error);
    alert("An error occurred. Please try again.");
  }
}

async function handleAdminSignup(name, email, password) {
  try {
    const response = await fetch(`${BACKEND_URL}/admin/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("Signup Successful:", data);
      // Store the token in localStorage
      localStorage.setItem('adminToken', data.token);
      alert("Signup successful! Please log in.");
    } 
    else {
      console.error("Signup Failed:", data.error);
      alert(data.error || "Signup failed. Please try again.");
    }
  }
  catch (error) {
    console.error("Error during admin signup:", error);
    alert("An error occurred. Please try again.");
  }
}


  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password } = formData;

    if (isLogin) {
      // Call Login Function
      await handleAdminLogin(email, password);
    } 
    else {
      // Call Signup Function
      await handleAdminSignup(name, email, password);
    }
  };

  return (
    <div className="form-container">
      {isLogin ? (
        <div className="form-box">
          <h2>Admin Login</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn">Login</button>
          </form>
          <p>
            Don't have an account? <a href="#" onClick={() => setIsLogin(false)}>Sign Up</a>
          </p>
        </div>
      ) : (
        <div className="form-box">
          <h2>Admin Signup</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="btn">Sign Up</button>
          </form>
          <p>
            Already have an account? <a href="#" onClick={() => setIsLogin(true)}>Login</a>
          </p>
        </div>
      )}
    </div>
  );
}

export default AdminAuth;
