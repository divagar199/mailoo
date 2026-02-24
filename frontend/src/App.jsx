import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import History from './pages/History';
import Settings from './pages/Settings';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const MainLayout = ({ children, theme, setTheme }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (isLoginPage) {
    return children;
  }

  return (
    <div className={`app-container ${theme}`}>
      <header className="mobile-header">
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="menu-btn">
          <Menu size={24} />
        </button>
        <h2 style={{ fontSize: '1.25rem', margin: 0, fontWeight: 500 }}>Mailoo</h2>
      </header>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div
          className={`sidebar-overlay ${isSidebarOpen ? 'open' : ''}`}
          onClick={() => setIsSidebarOpen(false)}
        ></div>
        <Sidebar theme={theme} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        <main className="main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

import axios from 'axios';

const App = () => {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const fetchTheme = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await axios.get('https://mailoo-5yjf.onrender.com/api/user/preferences', {
            headers: { 'x-auth-token': token }
          });
          if (res.data?.theme) {
            setTheme(res.data.theme);
            document.documentElement.setAttribute('data-theme', res.data.theme);
          }
        } catch (error) {
          console.error("Failed to fetch preferences", error);
        }
      }
    };
    fetchTheme();
  }, []);

  return (
    <Router>
      <MainLayout theme={theme} setTheme={setTheme}>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings theme={theme} setTheme={setTheme} />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </Router>
  );
};

export default App;
