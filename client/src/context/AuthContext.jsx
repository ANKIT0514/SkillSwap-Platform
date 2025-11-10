import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      getCurrentUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const getCurrentUser = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`
        }
      };
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/auth/me`,
        config
      );
      // Ensure we have an id field
      setUser({ ...data.user, id: data.user._id || data.user.id });
    } catch (error) {
      console.error('Error getting current user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/register`,
        userData
      );
      localStorage.setItem('token', data.token);
      setToken(data.token);
      // Ensure we have an id field
      setUser({ ...data.user, id: data.user.id || data.user._id });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  const login = async (credentials) => {
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        credentials
      );
      localStorage.setItem('token', data.token);
      setToken(data.token);
      // Ensure we have an id field
      setUser({ ...data.user, id: data.user.id || data.user._id });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const value = {
  user,
  token,
  loading,
  register,
  login,
  logout,
  setUser: (userData) => {
    // Always ensure id field exists
    if (userData) {
      setUser({ ...userData, id: userData.id || userData._id });
    } else {
      setUser(null);
    }
  }
};

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;