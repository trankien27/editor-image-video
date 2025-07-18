// src/App.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './style/App.css';

const App = ({ children }: { children: React.ReactNode }) => {
  const [darkMode, setDarkMode] = useState(false);
  const location = useLocation();

  const isActive = (path: string) =>
    location.pathname === path || (path === '/resize' && location.pathname === '/');

  return (
    <div className={darkMode ? 'app dark' : 'app'}>
      <div className="taskbar">
        <div className="taskbar-left">
          <nav className="menu">
            <Link to="/compress" className={isActive('/compress') ? 'active' : ''}>Compress</Link>
            <Link to="/resize" className={isActive('/resize') ? 'active' : ''}>Resize</Link>
            <Link to="/crop" className={isActive('/crop') ? 'active' : ''}>Crop</Link>
            <Link to="/convert" className={isActive('/convert') ? 'active' : ''}>Convert</Link>
            <Link to="/more" className={isActive('/more') ? 'active' : ''}>More</Link>
          </nav>
        </div>
        <div className="taskbar-right">
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '🌞 Light' : '🌙 Dark'}
          </button>
          <button className="login-btn">Đăng nhập</button>
        </div>
      </div>
      <div className="container">{children}</div>
    </div>
  );
};

export default App;