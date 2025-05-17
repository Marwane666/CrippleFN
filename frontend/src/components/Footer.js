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
          <p>Solution innovante de lutte contre la désinformation utilisant l'IA multimodale et la blockchain.</p>
        </div>
        
        <div className="footer-section">
          <h3>Liens rapides</h3>
          <ul className="footer-links">
            <li><Link to="/">Accueil</Link></li>
            <li><Link to="/verify">Vérifier</Link></li>
            <li><Link to="/dashboard">Tableau de bord</Link></li>
            <li><Link to="/about">À propos</Link></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Ressources</h3>
          <ul className="footer-links">
            <li><Link to="/docs/api">Documentation API</Link></li>
            <li><Link to="/docs/blockchain">Intégration blockchain</Link></li>
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
          <p>&copy; {currentYear} CrippleFN. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
