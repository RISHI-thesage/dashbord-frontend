import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI, authHelpers } from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false); // <-- Add this line
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already authenticated
    if (authHelpers.isAuthenticated()) {
      const userRole = authHelpers.getUserRole();
      switch (userRole) {
        case 'student':
          navigate('/dashboard');
          break;
        case 'mentor':
          navigate('/mentor');
          break;
        case 'admin':
          navigate('/admin/dashboard');
          break;
        default:
          break;
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authAPI.login(formData);
      const { token, user } = response.data.data;
      authHelpers.setAuthToken(token);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userId', user._id);
      // Redirect to dashboard based on role
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'mentor') {
        navigate('/mentor');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <h1>IgniteU</h1>
          <p className="text-muted">Digital Mentorship Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <div className="input-group">
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-control"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <button type="button" className="btn btn-link position-absolute end-0 top-50 translate-middle-y" tabIndex="-1" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Signing In...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="text-center">
          <div className="mb-3">
            <small className="text-muted">
              For administrative access, use the{' '}
              <Link to="/admin" className="text-primary">Admin Portal</Link>
            </small>
          </div>
          
          <div className="mt-4 pt-3 border-top">
            <small className="text-muted">
              Need help? Contact your coordinator for login credentials.
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

// Admin Login Component (separate for security)
export const AdminLogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already authenticated as admin
    if (authHelpers.isAuthenticated() && authHelpers.getUserRole() === 'admin') {
      navigate('/admin/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authAPI.adminLogin(formData);
      const { token, user } = response.data.data;
      authHelpers.setAuthToken(token);
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userId', user._id);
      // Redirect to admin dashboard
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-logo">
          <h1>IgniteU</h1>
          <p className="text-primary fw-bold">Administrator Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email" className="form-label">Admin Email</label>
            <input
              type="email"
              className="form-control"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter admin email"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Admin Password</label>
            <input
              type="password"
              className="form-control"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter admin password"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 mb-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Authenticating...
              </>
            ) : (
              'Admin Sign In'
            )}
          </button>
        </form>

        <div className="text-center">
          <Link to="/login" className="text-muted">
            ← Back to Student/Mentor Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
