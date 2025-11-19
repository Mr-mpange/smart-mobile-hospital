import React, { useState } from 'react';
import axios from 'axios';
import './AdminLogin.css';

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
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-background">
        <div className="gradient-circle circle-1"></div>
        <div className="gradient-circle circle-2"></div>
        <div className="gradient-circle circle-3"></div>
      </div>

      <div className="admin-login-box">
        <div className="admin-login-header">
          <div className="logo">
            <span className="logo-icon">🏥</span>
            <h1>SmartHealth</h1>
          </div>
          <h2>Admin Portal</h2>
          <p>Manage your healthcare system</p>
        </div>

        {error && (
          <div className="error-message">
            <span className="error-icon">⚠️</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-login-form">
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@smarthealth.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          <button type="submit" className="admin-login-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : (
              <>
                <span>Login to Dashboard</span>
                <span className="arrow">→</span>
              </>
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <div className="credentials-box">
            <p className="credentials-title">🔑 Default Credentials</p>
            <div className="credentials-info">
              <p><strong>Email:</strong> admin@smarthealth.com</p>
              <p><strong>Password:</strong> admin123</p>
            </div>
          </div>
          
          <div className="divider">
            <span>or</span>
          </div>
          
          <a href="/login" className="doctor-link">
            <span>Login as Doctor</span>
            <span className="arrow">→</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
