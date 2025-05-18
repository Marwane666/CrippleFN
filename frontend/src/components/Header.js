import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = React.useMemo(() => {
    const u = localStorage.getItem("cripplefn_user");
    return u ? JSON.parse(u) : null;
  }, [localStorage.getItem("cripplefn_user")]);

  const handleLogout = () => {
    localStorage.removeItem("cripplefn_user");
    navigate("/login");
  };

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
            <li>
              <Link 
                to="/archive" 
                className={location.pathname === '/archive' ? 'active' : ''}
              >
                Archive
              </Link>
            </li>
          </ul>
        </nav>
        
        <div className="user-actions">
          {user ? (
            <>
              <span style={{ marginRight: 8 }}>
                Bonjour, <Link to="/profile" style={{ color: '#1976d2', textDecoration: 'underline' }}>{user.firstName}</Link>
              </span>
              <button className="btn-connect" onClick={handleLogout}>Déconnexion</button>
            </>
          ) : (
            <button className="btn-connect" onClick={() => navigate("/login")}>Connexion</button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
