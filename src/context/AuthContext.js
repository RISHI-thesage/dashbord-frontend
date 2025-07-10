import React, { createContext, useContext, useState, useEffect } from 'react';
import { authHelpers } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On mount, check localStorage
    const token = authHelpers.getAuthToken();
    const role = authHelpers.getUserRole();
    const id = authHelpers.getUserId();
    setIsAuthenticated(!!token);
    setUserRole(role);
    setUserId(id);
    setLoading(false);

    // Listen for storage changes (multi-tab)
    const handleStorage = () => {
      setIsAuthenticated(!!authHelpers.getAuthToken());
      setUserRole(authHelpers.getUserRole());
      setUserId(authHelpers.getUserId());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const login = (token, role, id) => {
    authHelpers.setAuthToken(token);
    authHelpers.setUserRole(role);
    authHelpers.setUserId(id);
    setIsAuthenticated(true);
    setUserRole(role);
    setUserId(id);
  };

  const logout = () => {
    authHelpers.removeAuthToken();
    setIsAuthenticated(false);
    setUserRole(null);
    setUserId(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, userId, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 