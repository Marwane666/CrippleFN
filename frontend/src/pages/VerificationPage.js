import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './VerificationPage.css';

const VerificationPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('text');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // États pour les différents formulaires
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [files, setFiles] = useState([]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Vérifier si des données ont été saisies
    if (activeTab === 'text' && !textInput.trim()) {
      setError('Veuillez saisir un texte à vérifier');
      return;
    }
    
    if (activeTab === 'url' && !urlInput.trim()) {
      setError('Veuillez saisir une URL à vérifier');
      return;
    }
    
    if (activeTab === 'file' && files.length === 0) {
      setError('Veuillez sélectionner au moins un fichier à vérifier');
      return;
    }
    
    setIsLoading(true);

    try {
      // Préparer les données à envoyer
      const formData = new FormData();
      let newNews = null;
      const now = new Date();
      const dateStr = now.toLocaleDateString('fr-FR');
      if (activeTab === 'text') {
        formData.append('text', textInput);
        newNews = {
          id: 'n_' + Math.random().toString(36).substr(2, 9),
          title: textInput.slice(0, 60) + (textInput.length > 60 ? '...' : ''),
          description: textInput,
          date: dateStr,
          status: 'pending',
          link: '',
          imageUrl: '/assets/fake-news-example.jpg',
          sources: [],
        };
      } else if (activeTab === 'url') {
        formData.append('urls', urlInput);
        newNews = {
          id: 'n_' + Math.random().toString(36).substr(2, 9),
          title: urlInput,
          description: urlInput,
          date: dateStr,
          status: 'pending',
          link: urlInput,
          imageUrl: '/assets/fake-news-example.jpg',
          sources: [],
        };
      } else if (activeTab === 'file') {
        for (let i = 0; i < files.length; i++) {
          formData.append('files', files[i]);
        }
        newNews = {
          id: 'n_' + Math.random().toString(36).substr(2, 9),
          title: files[0]?.name || 'Fichier',
          description: files.map(f => f.name).join(', '),
          date: dateStr,
          status: 'pending',
          link: '',
          imageUrl: '/assets/fake-news-example.jpg',
          sources: [],
        };
      }
      // Ajout dans localStorage (pendingNews)
      if (newNews) {
        const pending = JSON.parse(window.localStorage.getItem('pendingNews') || '[]');
        pending.push(newNews);
        window.localStorage.setItem('pendingNews', JSON.stringify(pending));
      }
      
      // Simuler un appel API (à remplacer par l'appel réel)
      setTimeout(() => {
        // Simuler une réponse avec un ID de vérification
        const verificationId = 'ver_' + Math.random().toString(36).substr(2, 9);
        
        // Rediriger vers la page des résultats
        navigate(`/dashboard`); // Redirige vers dashboard pour traiter la news
        
        setIsLoading(false);
      }, 2000);
      
      // Appel API réel (à décommenter)
      /*
      const response = await fetch('http://localhost:8000/verification', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la soumission de la vérification');
      }
      
      const data = await response.json();
      navigate(`/results/${data.id}`);
      */
      
    } catch (err) {
      setError(err.message || 'Une erreur est survenue. Veuillez réessayer.');
      setIsLoading(false);
    }
  };
  
  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };
  
  return (
    <div className="verification-page">
      <div className="container">
        <div className="verification-container">
          <h1>Vérifier un contenu</h1>
          <p className="verification-description">
            Soumettez du texte, une URL ou un fichier pour vérifier son authenticité et détecter d'éventuelles manipulations.
          </p>
          
          <div className="verification-tabs">
            <button 
              className={`tab ${activeTab === 'text' ? 'active' : ''}`}
              onClick={() => setActiveTab('text')}
            >
              Texte
            </button>
            <button 
              className={`tab ${activeTab === 'url' ? 'active' : ''}`}
              onClick={() => setActiveTab('url')}
            >
              URL
            </button>
            <button 
              className={`tab ${activeTab === 'file' ? 'active' : ''}`}
              onClick={() => setActiveTab('file')}
            >
              Fichier
            </button>
          </div>
          
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {activeTab === 'text' && (
              <div className="form-group">
                <label htmlFor="text-input">Texte à vérifier</label>
                <textarea
                  id="text-input"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Collez ici le texte que vous souhaitez vérifier..."
                  rows={10}
                  required
                />
              </div>
            )}
            
            {activeTab === 'url' && (
              <div className="form-group">
                <label htmlFor="url-input">URL à vérifier</label>
                <input
                  type="url"
                  id="url-input"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://exemple.com/article"
                  required
                />
                <div className="form-hint">
                  Entrez l'URL d'un article, d'une image ou d'une vidéo à vérifier.
                </div>
              </div>
            )}
            
            {activeTab === 'file' && (
              <div className="form-group">
                <label htmlFor="file-input">Fichier(s) à vérifier</label>
                <div className="file-upload-container">
                  <input
                    type="file"
                    id="file-input"
                    onChange={handleFileChange}
                    multiple
                    accept="image/*,video/*,application/pdf"
                  />
                  <div className="file-upload-label">
                    <span>Déposez vos fichiers ici ou cliquez pour parcourir</span>
                    <small>Formats acceptés : images, vidéos, PDF</small>
                  </div>
                </div>
                
                {files.length > 0 && (
                  <div className="selected-files">
                    <h4>Fichiers sélectionnés :</h4>
                    <ul>
                      {files.map((file, index) => (
                        <li key={index}>
                          {file.name} <span>({(file.size / 1024 / 1024).toFixed(2)} MB)</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={isLoading}
              >
                {isLoading ? 'Vérification en cours...' : 'Vérifier maintenant'}
              </button>
            </div>
          </form>
          
          <div className="verification-info">
            <h3>Comment fonctionne notre système de vérification ?</h3>
            <p>
              Notre plateforme utilise des agents d'intelligence artificielle multimodaux pour analyser les contenus sous différents angles :
            </p>
            <ul>
              <li>
                <strong>Analyse de texte :</strong> Détecte les incohérences, les biais et les affirmations non factuelles
              </li>
              <li>
                <strong>Analyse visuelle :</strong> Identifie les manipulations d'images et les deepfakes
              </li>
              <li>
                <strong>Analyse contextuelle :</strong> Évalue la fiabilité des sources et le contexte général
              </li>
            </ul>
            <p>
              Les résultats de l'analyse sont certifiés sur la blockchain pour garantir leur transparence et leur immuabilité.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
