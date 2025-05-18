import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-section">
          <h3>CrippleFN</h3>
          <p>Innovative solution to fight disinformation using multimodal AI and blockchain.</p>
        </div>
        
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/verify">Verify</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/archive">Archive</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Resources</h3>
          <ul className="footer-links">
            <li><Link to="/docs/api">API Documentation</Link></li>
            <li><Link to="/docs/blockchain">Blockchain Integration</Link></li>
            <li><a href="https://github.com/Marwane666/CrippleFN" target="_blank" rel="noopener noreferrer">GitHub</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Contact</h3>
          <ul className="footer-links">
            <li><a href="mailto:contact@cripplefn.com">contact@cripplefn.com</a></li>
            <li><a href="https://twitter.com/cripplefn" target="_blank" rel="noopener noreferrer">Twitter</a></li>
            <li><a href="https://discord.gg/cripplefn" target="_blank" rel="noopener noreferrer">Discord</a></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {currentYear} CrippleFN. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
