import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './VerificationPage.css';

const VerificationPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('text');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // States for the different forms
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [files, setFiles] = useState([]);

  // User authentication check
  useEffect(() => {
    const user = localStorage.getItem('cripplefn_user');
    if (!user) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: '/verify', message: "You must be logged in to verify content." } });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Check if data is entered
    if (activeTab === 'text' && !textInput.trim()) {
      setError('Please enter text to verify.');
      return;
    }

    if (activeTab === 'url' && !urlInput.trim()) {
      setError('Please enter a URL to verify.');
      return;
    }

    if (activeTab === 'file' && files.length === 0) {
      setError('Please select at least one file to verify.');
      return;
    }

    setIsLoading(true);

    try {
      // Prepare data to send
      const formData = new FormData();
      let newNews = null;
      const now = new Date();
      const dateStr = now.toLocaleDateString('en-US');
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
          title: files[0]?.name || 'File',
          description: files.map(f => f.name).join(', '),
          date: dateStr,
          status: 'pending',
          link: '',
          imageUrl: '/assets/fake-news-example.jpg',
          sources: [],
        };
      }
      // Add to localStorage (pendingNews)
      if (newNews) {
        const pending = JSON.parse(window.localStorage.getItem('pendingNews') || '[]');
        pending.push(newNews);
        window.localStorage.setItem('pendingNews', JSON.stringify(pending));
      }

      // Simulate API call (replace with real call)
      setTimeout(() => {
        // Simulate a response with a verification ID
        const verificationId = 'ver_' + Math.random().toString(36).substr(2, 9);
        // Redirect to dashboard to process the news
        navigate(`/dashboard`);
        setIsLoading(false);
      }, 2000);
      // Real API call (uncomment to use)
      /*
      const response = await fetch('http://localhost:8000/verification', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Error submitting verification');
      }
      const data = await response.json();
      navigate(`/results/${data.id}`);
      */
    } catch (err) {
      setError(err.message || 'An error occurred. Please try again.');
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
          <h1>Verify Content</h1>
          <p className="verification-description">
            Submit text, a URL, or a file to verify its authenticity and detect possible manipulations.
          </p>

          <div className="verification-tabs">
            <button 
              className={`tab ${activeTab === 'text' ? 'active' : ''}`}
              onClick={() => setActiveTab('text')}
            >
              Text
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
              File
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
                <label htmlFor="text-input">Text to verify</label>
                <textarea
                  id="text-input"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Paste here the text you want to verify..."
                  rows={10}
                  required
                />
              </div>
            )}

            {activeTab === 'url' && (
              <div className="form-group">
                <label htmlFor="url-input">URL to verify</label>
                <input
                  type="url"
                  id="url-input"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/article"
                  required
                />
                <div className="form-hint">
                  Enter the URL of an article, image, or video to verify.
                </div>
              </div>
            )}

            {activeTab === 'file' && (
              <div className="form-group">
                <label htmlFor="file-input">File(s) to verify</label>
                <div className="file-upload-container">
                  <input
                    type="file"
                    id="file-input"
                    onChange={handleFileChange}
                    multiple
                    accept="image/*,video/*,application/pdf"
                  />
                  <div className="file-upload-label">
                    <span>Drop your files here or click to browse</span>
                    <small>Accepted formats: images, videos, PDF</small>
                  </div>
                </div>
                {files.length > 0 && (
                  <div className="selected-files">
                    <h4>Selected files:</h4>
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
                {isLoading ? 'Verifying...' : 'Verify now'}
              </button>
            </div>
          </form>

          <div className="verification-info">
            <h3>How does our verification system work?</h3>
            <p>
              Our platform uses multimodal artificial intelligence agents to analyze content from different perspectives:
            </p>
            <ul>
              <li>
                <strong>Text analysis:</strong> Detects inconsistencies, biases, and non-factual claims
              </li>
              <li>
                <strong>Visual analysis:</strong> Identifies image manipulations and deepfakes
              </li>
              <li>
                <strong>Contextual analysis:</strong> Assesses the reliability of sources and the general context
              </li>
            </ul>
            <p>
              The results of the analysis are certified on the blockchain to ensure their transparency and immutability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
