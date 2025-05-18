import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();
  const user = localStorage.getItem('cripplefn_user');

  const handleVerifyClick = () => {
    if (!user) {
      navigate('/login', { state: { from: '/', message: "You must be logged in to verify content." } });
    } else {
      navigate('/verify');
    }
  };

  return (
    <div className="home-page">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Fight disinformation with CrippleFN</h1>
            <p className="hero-subtitle">
              The first platform using multimodal AI and blockchain to verify content authenticity and combat fake news.
            </p>
            <div className="hero-buttons">
              <button onClick={handleVerifyClick} className="btn btn-primary">Verify content</button>
              <Link to="/about" className="btn btn-secondary">Learn more</Link>
            </div>
          </div>
          <div className="hero-image">
            <img src="/assets/hero-image.svg" alt="CrippleFN in action" />
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Main Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <img src="/assets/text-analysis.svg" alt="Text analysis" />
              </div>
              <h3>Text Analysis</h3>
              <p>Advanced detection of fake news and disinformation in articles and posts.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <img src="/assets/image-analysis.svg" alt="Image analysis" />
              </div>
              <h3>Image Analysis</h3>
              <p>Detection of deepfakes and manipulated images with exceptional accuracy.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <img src="/assets/blockchain.svg" alt="Blockchain" />
              </div>
              <h3>Blockchain Traceability</h3>
              <p>Certification of verifications on the blockchain for total transparency.</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <img src="/assets/community.svg" alt="Community" />
              </div>
              <h3>Community Verification</h3>
              <p>Incentive system to encourage participation in fact-checking.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">How does it work?</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Submit your content</h3>
              <p>Upload a text, image, or URL you want to verify.</p>
            </div>
            
            <div className="step">
              <div className="step-number">2</div>
              <h3>Multimodal AI Analysis</h3>
              <p>Our AI agents analyze the content from different angles and contexts.</p>
            </div>
            
            <div className="step">
              <div className="step-number">3</div>
              <h3>Detailed Results</h3>
              <p>Receive a complete analysis with a reliability score and explanations.</p>
            </div>
            
            <div className="step">
              <div className="step-number">4</div>
              <h3>Blockchain Certification</h3>
              <p>The result is permanently and transparently recorded on the blockchain.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <h2>Ready to fight disinformation?</h2>
          <p>Join our community and contribute to a more trustworthy digital ecosystem.</p>
          <Link to="/verify" className="btn btn-primary">Get started now</Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
