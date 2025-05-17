import React, { useState } from 'react';
import './DashboardPage.css';

/**
 * Composant modulaire pour la fenêtre modale de report
 */
function ReportModal({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">Report</h3>
        <div className="modal-message">
          <p>
            Ce rapport signale cette news comme potentiellement fausse ou problématique. Merci de contribuer à la fiabilité de la plateforme.
          </p>
        </div>
        <button className="btn btn-exit" onClick={onClose}>Exit</button>
      </div>
    </div>
  );
}

// --- Community Survey Modal ---
const surveyQuestions = [
  'Do you think this information is reliable?',
  'Have you seen this information elsewhere?',
  'Does this information impact your opinion?',
  // The last question will be handled separately for the graph
];

// Example graph component for the last question
function ExampleGraph() {
  return (
    <div className="survey-graph">
      <div className="bar-yes" style={{width: '70%'}}>Yes: 70%</div>
      <div className="bar-no" style={{width: '30%'}}>No: 30%</div>
    </div>
  );
}

function CommunitySurveyModal({ onClose, onFinish }) {
  const questions = [
    'Do you think this information is reliable?',
    'Have you seen this information elsewhere?',
    'Does this information impact your opinion?',
    'Do you really think that it is a fake news?'
  ];
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState(null);
  const [finished, setFinished] = useState(false);
  const handleSelect = (v) => setSelected(v);
  const handleNext = () => { setStep(step+1); setSelected(null); };
  if (finished) {
    // Score après la dernière question
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2 style={{textAlign:'center'}}>Community Survey</h2>
          <div style={{margin:'32px 0',textAlign:'center'}}>
            <span className="report-stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={i < 3 ? 'star filled' : 'star'}>★</span>
              ))}
              <span className="score-text">3/5</span>
            </span>
          </div>
          <button className="btn btn-exit" onClick={onClose}>Exit</button>
        </div>
      </div>
    );
  }
  if (step < 3) {
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2 style={{textAlign:'center'}}>Community Survey</h2>
          <div className="survey-question" style={{margin:'32px 0'}}>{questions[step]}</div>
          <div className="survey-options" style={{marginBottom:24}}>
            <label className="survey-option">
              <input type="checkbox" checked={selected==='yes'} onChange={()=>handleSelect('yes')} /> <span>Yes</span>
            </label>
            <label className="survey-option">
              <input type="checkbox" checked={selected==='no'} onChange={()=>handleSelect('no')} /> <span>No</span>
            </label>
          </div>
          <div className="survey-actions">
            <button className="btn btn-primary" disabled={!selected} onClick={handleNext}>Next</button>
            <button className="btn btn-exit" onClick={onClose} style={{marginLeft:12}}>Exit</button>
          </div>
        </div>
      </div>
    );
  }
  // Dernière question avec graph placeholder et bouton Finish
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 style={{textAlign:'center'}}>Community Survey</h2>
        <div style={{height:60,background:'#f1f1f1',borderRadius:8,marginBottom:16,display:'flex',alignItems:'center',justifyContent:'center',color:'#888'}}>[Graphique à venir]</div>
        <div className="survey-question" style={{margin:'24px 0'}}>{questions[3]}</div>
        <div className="survey-options" style={{marginBottom:24}}>
          <label className="survey-option">
            <input type="checkbox" checked={selected==='yes'} onChange={()=>handleSelect('yes')} /> <span>Yes</span>
          </label>
          <label className="survey-option">
            <input type="checkbox" checked={selected==='no'} onChange={()=>handleSelect('no')} /> <span>No</span>
          </label>
        </div>
        <div className="survey-actions">
          <button className="btn btn-primary" disabled={!selected} onClick={()=>{setFinished(true); onFinish();}}>Finish</button>
          <button className="btn btn-exit" onClick={onClose} style={{marginLeft:12}}>Exit</button>
        </div>
      </div>
    </div>
  );
}

/**
 * Bloc d'information central : description tronquée, lien, sources et date
 */
const NewsInfoBlock = ({ description, link, sources, date }) => (
  <div className="news-info-block">
    {/* Description tronquée avec trois points si trop longue */}
    <p className="news-description" title={description}>{description}</p>
    {/* Lien de la fake news */}
    <a href={link} target="_blank" rel="noopener noreferrer" className="news-link">{link}</a>
    {/* Sources et date */}
    <div className="news-sources">
      {sources.map((src, idx) => (
        <div key={idx} className="news-source-item">
          <span className="news-date">{date}</span>
          <a href={src} target="_blank" rel="noopener noreferrer" className="news-source-link">{src}</a>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Composant pour afficher une note sous forme d'étoiles
 */
function StarScore({ score, maxScore = 5 }) {
  return (
    <span className="star-score">
      {Array.from({ length: maxScore }).map((_, i) => (
        <span key={i} className={i < score ? 'star filled' : 'star'}>★</span>
      ))}
      <span className="score-text">{score}/{maxScore}</span>
    </span>
  );
}

/**
 * Bloc boutons verticaux, gère l'ouverture de la modale Report et l'affichage dynamique de la note
 */
const NewsActions = ({
  onReport,
  onCommunitySurvey,
  onTargetReport,
  onLastWordsAuthor,
  reportScore,
  showReportScore,
  communityScore,
  showCommunityScore,
  targetScore,
  showTargetScore,
  lastWordsScore,
  showLastWordsScore
}) => (
  <div className="news-actions">
    <div className="action-row">
      <button className="btn btn-report" onClick={onReport}>Report</button>
      {showReportScore && <StarScore score={reportScore} />}
    </div>
    <div className="action-row">
      <button className="btn btn-community" onClick={onCommunitySurvey}>Community Survey</button>
      {showCommunityScore && <StarScore score={communityScore} />}
    </div>
    <div className="action-row">
      <button className="btn btn-victim" onClick={onTargetReport}>Target Report</button>
      {showTargetScore && <StarScore score={targetScore} />}
    </div>
    <div className="action-row">
      <button className="btn btn-lastwords" onClick={onLastWordsAuthor}>Last Words Author</button>
      {showLastWordsScore && <StarScore score={lastWordsScore} />}
    </div>
    {/* Final grade only if all scores are revealed */}
    {(showReportScore && showCommunityScore && showTargetScore && showLastWordsScore) && (
      <div className="action-row">
        <button className="btn btn-finalgrade" disabled>Final grade</button>
        <StarScore
          score={(() => {
            const scores = [reportScore, communityScore, targetScore, lastWordsScore];
            const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
            return Math.round(avg);
          })()}
        />
      </div>
    )}
  </div>
);

// Utilitaire pour charger les news à traiter depuis localStorage
function getPendingNews() {
  return JSON.parse(window.localStorage.getItem('pendingNews') || '[]');
}
// Utilitaire pour archiver une news
function archiveNews(news, status) {
  const archive = JSON.parse(window.localStorage.getItem('archiveNews') || '[]');
  archive.push({ ...news, status });
  window.localStorage.setItem('archiveNews', JSON.stringify(archive));
}

// --- NewsCard modulaire ---
function usePersistentScores(newsId) {
  const key = `news-scores-${newsId}`;
  const [scores, setScores] = useState(() => {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) : {
      showReportScore: false,
      showCommunityScore: false,
      showTargetScore: false,
      showLastWordsScore: false
    };
  });
  React.useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(scores));
  }, [scores]);
  return [scores, setScores];
}

function NewsCard({ imageUrl, title, onArchive, onDelete }) {
  // State pour chaque modale
  const [showReport, setShowReport] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [showTarget, setShowTarget] = useState(false);
  const [showAuthor, setShowAuthor] = useState(false);
  // State pour chaque score
  const [scores, setScores] = usePersistentScores(title);
  // Scores (ici fixes pour la démo, à rendre dynamiques si besoin)
  const reportScore = 4;
  const communityScore = 3;
  const targetScore = 5;
  const lastWordsScore = 2;
  const allScores = [reportScore, communityScore, targetScore, lastWordsScore];
  const finalGrade = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
  // Exemple de description vraisemblable
  const description = "Selon plusieurs publications sur les réseaux sociaux, une nouvelle technologie permettrait de recharger son smartphone en 10 secondes grâce à une onde spéciale. Cette information a été massivement relayée sans preuve scientifique.";
  // Exemple de fausses sources et dates
  const sources = [
    'https://www.fauxmedia.com/article-recharge-10s',
    'https://www.rumeurtech.net/onde-miracle',
  ];
  const date = '15/05/2025';
  // Affichage
  return (
    <div className="news-card" style={{display:'flex',alignItems:'flex-start',gap:24,marginBottom:32}}>
      {/* Image à gauche */}
      <img src={imageUrl} alt="news" className="news-image" style={{width:140,height:140,objectFit:'cover',borderRadius:8}} />
      {/* Bloc central : description, sources, dates */}
      <div style={{flex:2,display:'flex',flexDirection:'column',justifyContent:'space-between',height:140}}>
        <div>
          <h3 style={{margin:'0 0 8px 0'}}>{title}</h3>
          <p className="news-description" style={{margin:'0 0 12px 0'}}>{description}</p>
        </div>
        <div className="news-sources" style={{marginTop:'auto'}}>
          {sources.map((src, idx) => (
            <div key={idx} className="news-source-item" style={{fontSize:'0.95em',marginBottom:2}}>
              <span className="news-date" style={{color:'#888',marginRight:8}}>{date}</span>
              <a href={src} target="_blank" rel="noopener noreferrer" className="news-source-link">{src}</a>
            </div>
          ))}
        </div>
      </div>
      {/* Boutons verticaux à droite */}
      <div className="news-actions" style={{display:'flex',flexDirection:'column',gap:12,alignItems:'stretch',flex:1,minWidth:180, height:'100%'}}>
        <div className="action-row" style={{display:'flex',flexDirection:'column',alignItems:'stretch',gap:8}}>
          <button className="btn btn-report" onClick={() => setShowReport(true)}>Report</button>
          {scores.showReportScore && <StarScore score={reportScore} />}
        </div>
        <div className="action-row" style={{display:'flex',flexDirection:'column',alignItems:'stretch',gap:8}}>
          <button className="btn btn-community" onClick={() => setShowSurvey(true)}>Community Survey</button>
          {scores.showCommunityScore && <StarScore score={communityScore} />}
        </div>
        <div className="action-row" style={{display:'flex',flexDirection:'column',alignItems:'stretch',gap:8}}>
          <button className="btn btn-victim" onClick={() => setShowTarget(true)}>Target Report</button>
          {scores.showTargetScore && <StarScore score={targetScore} />}
        </div>
        <div className="action-row" style={{display:'flex',flexDirection:'column',alignItems:'stretch',gap:8}}>
          <button className="btn btn-lastwords" onClick={() => setShowAuthor(true)}>Last Words Author</button>
          {scores.showLastWordsScore && <StarScore score={lastWordsScore} />}
        </div>
        {(scores.showReportScore && scores.showCommunityScore && scores.showTargetScore && scores.showLastWordsScore) && (
          <div className="action-row" style={{display:'flex',flexDirection:'column',alignItems:'stretch',gap:8,marginTop:8, background:'#f8f9fa',padding:'12px',borderRadius:'8px',boxSizing:'border-box'}}>
            <div style={{display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
              <button className="btn btn-finalgrade" disabled>Final grade</button>
              <StarScore score={finalGrade} />
            </div>
            <button className="btn btn-archive" onClick={onArchive}>Archiver la news</button>
          </div>
        )}
        <button className="btn btn-delete" style={{marginTop:8, background:'#e74c3c', color:'#fff'}} onClick={onDelete}>Supprimer</button>
      </div>
      {/* Modales */}
      {showReport && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{textAlign:'center'}}>Report</h2>
            <div style={{margin:'24px 0'}}>
              <textarea
                className="report-textarea"
                value={"Ce contenu présente des signaux de désinformation détectés par l'IA. Merci de contribuer à la fiabilité de la plateforme."}
                readOnly
                rows={5}
                style={{width:'100%'}}
              />
            </div>
            <button className="btn btn-exit" onClick={() => { setShowReport(false); setScores(s => ({...s, showReportScore:true})); }}>Exit</button>
          </div>
        </div>
      )}
      {showSurvey && (
        <CommunitySurveyModal onClose={() => setShowSurvey(false)} onFinish={() => setScores(s => ({...s, showCommunityScore:true}))} />
      )}
      {showTarget && (
        <div className="modal-overlay">
          <div className="modal-content victim-modal">
            <h2 style={{textAlign:'center'}}>Target Report</h2>
            <div style={{display:'flex',alignItems:'center',gap:24}}>
              <div style={{flex:1}}>
                <div style={{marginBottom:12}}>
                  "Je tiens à clarifier que les informations diffusées à mon sujet sont totalement fausses. J'ai pris la parole publiquement pour rétablir la vérité et je remercie tous ceux qui m'ont soutenu durant cette période difficile."
                </div>
              </div>
              <div style={{flex:1}}>
                <img src="/assets/victim-interview.jpg" alt="Victim public statement" style={{maxWidth:'100%',borderRadius:8}} />
              </div>
            </div>
            <button className="btn btn-exit" onClick={() => { setShowTarget(false); setScores(s => ({...s, showTargetScore:true})); }}>Exit</button>
          </div>
        </div>
      )}
      {showAuthor && (
        <div className="modal-overlay">
          <div className="modal-content author-modal">
            <h2 style={{textAlign:'center'}}>Last Words Author</h2>
            <div style={{display:'flex',alignItems:'center',gap:24}}>
              <div style={{flex:1}}>
                <div style={{marginBottom:12}}>
                  "Nous avons publié cette information sans vérifier sa véracité. Nous regrettons l'impact que cela a pu avoir et présentons nos excuses à la personne concernée."
                </div>
              </div>
              <div style={{flex:1}}>
                <img src="/assets/author-statement.jpg" alt="Author public statement" style={{maxWidth:'100%',borderRadius:8}} />
              </div>
            </div>
            <button className="btn btn-exit" onClick={() => { setShowAuthor(false); setScores(s => ({...s, showLastWordsScore:true})); }}>Exit</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Page Tableau de bord : affiche une news fake
export default function DashboardPage() {
  // State pour la liste des news à traiter
  const [pendingNews, setPendingNews] = useState(getPendingNews());
  // Effet pour garder la liste à jour
  React.useEffect(() => {
    setPendingNews(getPendingNews());
  }, []);
  // Fonction pour archiver et retirer la news du dashboard
  function handleArchive(news) {
    archiveNews(news, Math.round((2+4+3+1)/4) < 3 ? 'fake' : 'real');
    const updated = getPendingNews().filter(n => n.id !== news.id);
    window.localStorage.setItem('pendingNews', JSON.stringify(updated));
    setPendingNews(updated);
  }
  // Fonction pour supprimer une news
  function handleDelete(news) {
    const updated = getPendingNews().filter(n => n.id !== news.id);
    window.localStorage.setItem('pendingNews', JSON.stringify(updated));
    setPendingNews(updated);
    // Supprime aussi les scores persistés
    window.localStorage.removeItem(`news-scores-${news.title}`);
  }
  return (
    <div className="dashboard-page">
      <h2>Tableau de bord</h2>
      {pendingNews.length === 0 ? (
        <div style={{padding:'32px',textAlign:'center',color:'#888',fontSize:'1.1em'}}>Aucune news à analyser pour le moment.</div>
      ) : (
        pendingNews.map(news => (
          <NewsCard key={news.id} {...news} onArchive={() => handleArchive(news)} onDelete={() => handleDelete(news)} />
        ))
      )}
    </div>
  );
}

// --- Victim Report Modal ---
function VictimReportModal({ onClose }) {
  // Exemple de texte d'interview et vidéo/screenshot
  const interviewText = `
    "Je tiens à clarifier que les informations diffusées à mon sujet sont totalement fausses. J'ai pris la parole publiquement pour rétablir la vérité et je remercie tous ceux qui m'ont soutenu durant cette période difficile."
  `;
  const victimMedia = '/assets/victim-interview.jpg'; // Remplacer par une vidéo ou une image réelle si besoin

  return (
    <div className="modal-overlay">
      <div className="modal-content victim-modal">
        <h3 className="modal-title">Victim Report</h3>
        <div className="victim-modal-body">
          <div className="victim-interview-text">
            {interviewText}
          </div>
          <div className="victim-media">
            <img src={victimMedia} alt="Victim public statement" />
          </div>
        </div>
        <button className="btn btn-exit" onClick={onClose}>Exit</button>
      </div>
    </div>
  );
}

// --- Last Words Author Modal ---
function LastWordsAuthorModal({ onClose }) {
  // Exemple de texte et image de l'auteur de la fake news
  const authorText = `
    "Nous avons publié cette information sans vérifier sa véracité. Nous regrettons l'impact que cela a pu avoir et présentons nos excuses à la personne concernée."
  `;
  const authorMedia = '/assets/author-statement.jpg'; // Remplacer par une image réelle si besoin

  return (
    <div className="modal-overlay">
      <div className="modal-content author-modal">
        <h3 className="modal-title">Last Words Author</h3>
        <div className="author-modal-body">
          <div className="author-text">
            {authorText}
          </div>
          <div className="author-media">
            <img src={authorMedia} alt="Author public statement" />
          </div>
        </div>
        <button className="btn btn-exit" onClick={onClose}>Exit</button>
      </div>
    </div>
  );
}
