import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.scss';

const Sidebar = ({ onToggle }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Determine active item based on current path
  const getActiveItem = (path) => {
    if (path === '/dashboard') return 'dashboard';
    if (path === '/book') return 'book';
    if (path === '/my-bookings') return 'my-bookings';
    if (path === '/all-bookings') return 'all-bookings';
    if (path === '/tournaments') return 'tournaments';
    if (path === '/find-players') return 'find-players';
    if (path === '/leaderboard') return 'leaderboard';
    if (path === '/settings') return 'settings';
    return 'dashboard'; // default
  };
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeItem, setActiveItem] = useState(getActiveItem(currentPath));

  const toggleSidebar = () => {
    const newState = !isExpanded;
    setIsExpanded(newState);
    if (onToggle) {
      onToggle(newState);
    }
  };

  useEffect(() => {
    if (onToggle) {
      onToggle(isExpanded);
    }
  }, []);

  useEffect(() => {
    setActiveItem(getActiveItem(currentPath));
  }, [currentPath]);

  const navigationItems = [
    { id: 'dashboard', path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'book', path: '/book', label: 'Book Table', icon: '📅' },
    { id: 'my-bookings', path: '/my-bookings', label: 'My Bookings', icon: '👤' },
    { id: 'all-bookings', path: '/all-bookings', label: 'All Bookings', icon: '📋' },
    { id: 'tournaments', path: '/tournaments', label: 'Tournaments', icon: '🏆' },
    { id: 'find-players', path: '/find-players', label: 'Find Players', icon: '👥' },
    // { id: 'leaderboard', path: '/leaderboard', label: 'Leaderboard', icon: '📈' },
    { id: 'settings', path: '/settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <aside className={`sidebar ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {navigationItems.map((item) => (
            <li key={item.id} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${activeItem === item.id ? 'active' : ''}`}
                onClick={() => setActiveItem(item.id)}
                title={!isExpanded ? item.label : ''}
              >
                <span className="nav-icon">{item.icon}</span>
                {isExpanded && <span className="nav-title">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button 
          className="sidebar-toggle footer-toggle"
          onClick={toggleSidebar}
        >
          <span className={`toggle-icon ${isExpanded ? 'expanded' : ''}`}>
            <img 
              src="https://cdn.ucraft.com/fs/user_files/15696/media/images/sketch-based-layouts-icon.webp" 
              alt="Toggle sidebar" 
              className="toggle-icon-img"
            />
          </span>
          {isExpanded && <span className="toggle-title">Collapse</span>}
        </button>
        
        <div className="footer-item">
          <span className="footer-icon">
            <img 
              src="https://cdn-icons-png.flaticon.com/512/1/1475.png" 
              alt="Settings" 
              className="footer-icon-img"
            />
          </span>
          {isExpanded && <span className="footer-title">Settings</span>}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
