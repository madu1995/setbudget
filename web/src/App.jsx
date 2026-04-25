import React from 'react';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { theme } from './styles/theme';
import { BudgetProvider } from './context/BudgetContext';

// Layout & Pages
import MainLayout from './layouts/MainLayout';
import Home from './pages/Home';
import Events from './pages/Events';
import Summary from './pages/Summary';
import Profile from './pages/Profile';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <BudgetProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Home />} />
              <Route path="events" element={<Events />} />
              <Route path="summary" element={<Summary />} />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </BudgetProvider>
    </ThemeProvider>
  );
}
