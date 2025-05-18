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

  // If not logged in, show only Home and Login
  if (!user) {
    return (
      <header className="header">
        <div className="container header-container">
          <div className="logo">
            <a href="/">
              <h1>CrippleFN</h1>
              <span className="logo-subtitle">Defending against disinformation</span>
            </a>
          </div>
          <nav className="main-nav">
            <ul className="nav-links">
              <li>
                <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
              </li>
            </ul>
          </nav>
          <div className="user-actions">
            <button className="btn-connect" onClick={() => navigate('/login')}>Login</button>
          </div>
        </div>
      </header>
    );
  }

  // Logged in: full menu
  return (
    <header className="header">
      <div className="container header-container">
        <div className="logo">
          <Link to="/">
            <h1>CrippleFN</h1>
            <span className="logo-subtitle">Defending against disinformation</span>
          </Link>
        </div>
        <nav className="main-nav">
          <ul className="nav-links">
            <li>
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
            </li>
            <li>
              <Link to="/verify" className={location.pathname === '/verify' ? 'active' : ''}>Verify</Link>
            </li>
            <li>
              <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>Dashboard</Link>
            </li>
            <li>
              <Link to="/archive" className={location.pathname === '/archive' ? 'active' : ''}>Archive</Link>
            </li>
            <li>
              <Link to="/about" className={location.pathname === '/about' ? 'active' : ''}>About</Link>
            </li>
          </ul>
        </nav>
        <div className="user-actions">
          <span style={{ marginRight: 12 }}>Hello, {user.firstName || user.email}</span>
          <button className="btn-connect" onClick={() => navigate('/profile')}>Profile</button>
          <button className="btn-connect" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </header>
  );
};

export default Header;
