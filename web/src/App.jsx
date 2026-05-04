import React from 'react';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { theme } from './styles/theme';
import { BudgetProvider } from './context/BudgetContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout & Pages
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Events from './pages/Events';
import Summary from './pages/Summary';
import Profile from './pages/Profile';
import Login from './pages/Login';
import UserManagement from './pages/UserManagement';

const AuthGuard = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.requiresPasswordChange) return <Navigate to="/login" />;
  
  return children;
};

const AdminGuard = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user || !isAdmin) return <Navigate to="/" />;
  
  return children;
};

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <BudgetProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<AuthGuard><MainLayout /></AuthGuard>}>
                <Route index element={<Home />} />
                <Route path="events" element={<Events />} />
                <Route path="summary" element={<Summary />} />
                <Route path="profile" element={<Profile />} />
                <Route path="users" element={<AdminGuard><UserManagement /></AdminGuard>} />
              </Route>
            </Routes>
          </BrowserRouter>
        </BudgetProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
