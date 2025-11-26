import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import './UnifiedLogin.css';

function UnifiedLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setLoading(true);

    try {
      // Try unified login endpoint
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });

      const { token, user, role } = response.data;

      // Store token and user info
      localStorage.setItem('token', token);
      localStorage.setItem('userType', role);
      
      if (role === 'admin') {
        localStorage.setItem('adminName', user.name);
        toast.success('Welcome Admin!');
        navigate('/admin/dashboard');
      } else if (role === 'doctor') {
        localStorage.setItem('doctorId', user.id);
        localStorage.setItem('doctorName', user.name);
        toast.success('Welcome Doctor!');
        navigate('/dashboard');
      }

    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="unified-login-container">
      <div className="login-background">
        <div className="gradient-circle circle-1"></div>
        <div className="gradient-circle circle-2"></div>
        <div className="gradient-circle circle-3"></div>
      </div>

      <div className="login-box">
        <div className="login-header">
          <div className="logo">
            <span className="logo-icon">🏥</span>
            <h1>SmartHealth</h1>
          </div>
          <h2>Welcome Back</h2>
          <p>Sign in to access your dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@smarthealth.com"
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

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              <>
                <span>Sign In</span>
                <span className="arrow">→</span>
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <div className="demo-credentials">
            <p className="demo-title">🔑 Demo Credentials</p>
            
            <div className="credentials-grid">
              <div className="credential-card">
                <div className="credential-header">
                  <span className="role-badge admin">Admin</span>
                </div>
                <p><strong>Email:</strong> admin@smarthealth.com</p>
                <p><strong>Password:</strong> admin123</p>
              </div>

              <div className="credential-card">
                <div className="credential-header">
                  <span className="role-badge doctor">Doctor</span>
                </div>
                <p><strong>Email:</strong> john.kamau@smarthealth.com</p>
                <p><strong>Password:</strong> doctor123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UnifiedLogin;
