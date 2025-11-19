import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';

function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/admin/login', {
        email,
        password
      });

      // Store token
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userType', 'admin');
      localStorage.setItem('adminName', response.data.admin.name);

      // Redirect to admin dashboard
      window.location.href = '/admin/dashboard';
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <h1>🏥 SmartHealth</h1>
          <h2>Admin Login</h2>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@smarthealth.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login as Admin'}
          </button>
        </form>

        <div className="login-footer">
          <p>Default credentials:</p>
          <p><strong>Email:</strong> admin@smarthealth.com</p>
          <p><strong>Password:</strong> admin123</p>
          <hr />
          <a href="/login">Login as Doctor →</a>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
