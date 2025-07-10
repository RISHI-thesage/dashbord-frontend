import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = ({ onSectionChange }) => {
  const { isAuthenticated, userRole, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) return null;
  if (!isAuthenticated || !userRole) return null;

  const userName = userRole ? `${userRole.charAt(0).toUpperCase() + userRole.slice(1)} User` : '';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderNavLinks = () => {
    switch (userRole) {
      case 'student':
        return (
          <>
            <li className="nav-item">
              <Link className="nav-link" to="/dashboard">Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/profile">Profile</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/sessions">Sessions</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/my-work">My Work</Link>
            </li>
          </>
        );
      case 'mentor':
        return (
          <>
            <li className="nav-item">
              <Link className="nav-link" to="/mentor" onClick={() => onSectionChange && onSectionChange('students')}>Students</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/mentor" onClick={() => onSectionChange && onSectionChange('submissions')}>Submissions</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/mentor" onClick={() => onSectionChange && onSectionChange('sessions')}>Sessions</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/profile">Profile</Link>
            </li>
          </>
        );
      case 'admin':
        return (
          <>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/dashboard">Dashboard</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/admin/submissions">Submissions</Link>
            </li>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <nav className="navbar navbar-expand-lg" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000 }}>
      <div className="container">
        <Link className="navbar-brand" to={userRole === 'admin' ? '/admin/dashboard' : userRole === 'mentor' ? '/mentor' : '/dashboard'}>
          <img src="/logo.png" alt="IgniteU Logo" height="40" className="me-2" />
        </Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {renderNavLinks()}
          </ul>
          <ul className="navbar-nav">
            <li className="nav-item dropdown">
              <button 
                className="nav-link dropdown-toggle btn btn-link" 
                id="navbarDropdown" 
                data-bs-toggle="dropdown" 
                aria-expanded="false"
                style={{ border: 'none', background: 'none', color: 'inherit' }}
              >
                {userName} ({userRole})
              </button>
              <ul className="dropdown-menu" aria-labelledby="navbarDropdown">
                <li><Link className="dropdown-item" to="/profile">Profile</Link></li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item" onClick={handleLogout}>
                    Logout
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
