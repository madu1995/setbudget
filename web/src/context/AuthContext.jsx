import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsedUser = JSON.parse(userInfo);
      setUser(parsedUser);
      // Set default auth header for all axios requests
      axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
      fetchUserProfile(parsedUser.token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const { data } = await axios.get(`${API_URL}/auth/me`);
      setUser({ ...data, token });
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    const { data } = await axios.post(`${API_URL}/auth/login`, { username, password });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return data;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('userInfo');
    delete axios.defaults.headers.common['Authorization'];
  };

  const updatePassword = async (newPassword) => {
    const { data } = await axios.post(`${API_URL}/auth/update-password`, { newPassword });
    setUser(data);
    localStorage.setItem('userInfo', JSON.stringify(data));
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    return data;
  };

  const isAdmin = user?.role === 'admin';
  const isModerator = (event) => {
    if (!event || !user) return false;
    if (isAdmin) return true;
    return event.moderators && event.moderators.includes(user._id);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updatePassword, isAdmin, isModerator }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
