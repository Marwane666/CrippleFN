import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();
  
  return (
    <header className="header">
      <div className="container header-container">
        <div className="logo">
          <Link to="/">
            <h1>CrippleFN</h1>
            <span className="logo-subtitle">Défense contre la désinformation</span>
          </Link>
        </div>
        
        <nav className="main-nav">
          <ul className="nav-links">
            <li>
              <Link 
                to="/" 
                className={location.pathname === '/' ? 'active' : ''}
              >
                Accueil
              </Link>
            </li>
            <li>
              <Link 
                to="/verify" 
                className={location.pathname === '/verify' ? 'active' : ''}
              >
                Vérifier
              </Link>
            </li>
            <li>
              <Link 
                to="/dashboard" 
                className={location.pathname === '/dashboard' ? 'active' : ''}
              >
                Tableau de bord
              </Link>
            </li>
            <li>
              <Link 
                to="/about" 
                className={location.pathname === '/about' ? 'active' : ''}
              >
                À propos
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="user-actions">
          <button className="btn-connect">Connexion</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
