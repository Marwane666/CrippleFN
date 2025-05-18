import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = React.useState(() => {
    const u = localStorage.getItem('cripplefn_user');
    return u ? JSON.parse(u) : null;
  });

  React.useEffect(() => {
    const u = localStorage.getItem('cripplefn_user');
    setUser(u ? JSON.parse(u) : null);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('cripplefn_user');
    setUser(null);
    navigate('/');
  };

  // Si pas connecté, n'affiche que Accueil
  if (!user) {
    return (
      <header className="header">
        <div className="container header-container">
          <div className="logo">
            <a href="/">
              <h1>CrippleFN</h1>
              <span className="logo-subtitle">Défense contre la désinformation</span>
            </a>
          </div>
          <nav className="main-nav">
            <ul className="nav-links">
              <li>
                <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Accueil</Link>
              </li>
            </ul>
          </nav>
          <div className="user-actions">
            <button className="btn-connect" onClick={() => navigate('/login')}>Connexion</button>
          </div>
        </div>
      </header>
    );
  }

  // Utilisateur connecté : menu complet
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
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Accueil</Link>
            </li>
            <li>
              <Link to="/verify" className={location.pathname === '/verify' ? 'active' : ''}>Vérifier</Link>
            </li>
            <li>
              <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Tableau de bord</Link>
            </li>
            <li>
              <Link to="/archive" className={location.pathname === '/archive' ? 'active' : ''}>Archive</Link>
            </li>
            <li>
              <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>À propos</Link>
            </li>
          </ul>
        </nav>
        <div className="user-actions">
          <span style={{ marginRight: 12 }}>Bonjour, {user.firstName || user.email}</span>
          <button className="btn-connect" onClick={() => navigate('/profile')}>Profil</button>
          <button className="btn-connect" onClick={handleLogout}>Déconnexion</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
