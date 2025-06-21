'use client';

import type React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <div className="logo">
            <div className="logo-icon">
              <span>?</span>
            </div>
            &nbsp;
            <span className="logo-text">What To Eat?</span>
          </div>
          <nav className="nav">
            <Link to="/" className="nav-link active">
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/create-poll" className="nav-link">
                  Create Poll
                </Link>
                <Link to="/my-polls" className="nav-link">
                  My Polls
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="header-right">
          {isAuthenticated ? (
            <>
              <button className="notification-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
              </button>
              <div className="user-menu">
                <button onClick={logout} className="logout-btn">
                  로그아웃
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className="auth-btn">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
