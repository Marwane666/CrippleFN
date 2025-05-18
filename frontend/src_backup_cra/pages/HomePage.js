import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Luttez contre la désinformation avec CrippleFN</h1>
            <p className="hero-subtitle">
              La première plateforme utilisant l'IA multimodale et la blockchain pour vérifier 
              l'authenticité des contenus et combattre les fake news.
            </p>
            <div className="hero-buttons">
              <Link to="/verify" className="btn btn-primary">Vérifier un contenu</Link>
              <Link to="/about" className="btn btn-secondary">En savoir plus</Link>
            </div>
          </div>
          <div className="hero-image">
            <img src="/assets/hero-image.svg" alt="CrippleFN en action" />
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Fonctionnalités principales</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <img src="/assets/text-analysis.svg" alt="Analyse de texte" />
              </div>
              <h3>Analyse de texte</h3>
              <p>Détection avancée des fake news et de la désinformation dans les articles et les posts.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <img src="/assets/image-analysis.svg" alt="Analyse d'images" />
              </div>
              <h3>Analyse d'images</h3>
              <p>Détection de deepfakes et d'images manipulées avec une précision exceptionnelle.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <img src="/assets/blockchain.svg" alt="Blockchain" />
              </div>
              <h3>Traçabilité blockchain</h3>
              <p>Certification des vérifications sur la blockchain pour une transparence totale.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <img src="/assets/community.svg" alt="Communauté" />
              </div>
              <h3>Vérification communautaire</h3>
              <p>Système d'incitation pour encourager la participation à la vérification des faits.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">Comment ça marche ?</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Soumettez votre contenu</h3>
              <p>Téléchargez un texte, une image ou une URL que vous souhaitez vérifier.</p>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <h3>Analyse IA multimodale</h3>
              <p>Nos agents IA analysent le contenu sous différents angles et contextes.</p>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <h3>Résultats détaillés</h3>
              <p>Recevez une analyse complète avec un score de fiabilité et des explications.</p>
            </div>
            
            <div className="step">
              <div className="step-number">4</div>
              <h3>Certification blockchain</h3>
              <p>Le résultat est enregistré de manière permanente et transparent sur la blockchain.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Prêt à lutter contre la désinformation ?</h2>
          <p>Rejoignez notre communauté et contribuez à un écosystème numérique plus fiable.</p>
          <Link to="/verify" className="btn btn-primary">Commencer maintenant</Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
