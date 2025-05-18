import React, { useState } from 'react';
import './DashboardPage.css';

/**
 * Modular component for the report modal window
 */
function ReportModal({ onClose }) {
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3 className="modal-title">Report</h3>
        <div className="modal-message">
          <p>
            This report flags this news as potentially false or problematic. Thank you for contributing to the reliability of the platform.
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
    // Score after the last question
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
  // Last question with graph placeholder and Finish button
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2 style={{textAlign:'center'}}>Community Survey</h2>
        <div style={{height:60,background:'#f1f1f1',borderRadius:8,marginBottom:16,display:'flex',alignItems:'center',justifyContent:'center',color:'#888'}}>[Graph coming soon]</div>
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
 * Central information block: truncated description, link, sources and date
 */
const NewsInfoBlock = ({ description, link, sources, date }) => (
  <div className="news-info-block">
    {/* Truncated description with ellipsis if too long */}
    <p className="news-description" title={description}>{description}</p>
    {/* Link to the fake news */}
    <a href={link} target="_blank" rel="noopener noreferrer" className="news-link">{link}</a>
    {/* Sources and date */}
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
 * Component to display a score as stars
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
 * Vertical button block, handles opening the Report modal and dynamic score display
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

// Utility to load pending news from localStorage
function getPendingNews() {
  return JSON.parse(window.localStorage.getItem('pendingNews') || '[]');
}
// Utility to archive a news
function archiveNews(news, status) {
  const archive = JSON.parse(window.localStorage.getItem('archiveNews') || '[]');
  archive.push({ ...news, status });
  window.localStorage.setItem('archiveNews', JSON.stringify(archive));
}

// --- Modular NewsCard ---
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

function NewsCard({ title, onArchive, onDelete }) {
  // State for each modal
  const [showReport, setShowReport] = useState(false);
  const [showSurvey, setShowSurvey] = useState(false);
  const [showTarget, setShowTarget] = useState(false);
  const [showAuthor, setShowAuthor] = useState(false);
  // State for each score
  const [scores, setScores] = usePersistentScores(title);
  // Scores (fixed for demo, make dynamic if needed)
  const reportScore = 4;
  const communityScore = 3;
  const targetScore = 5;
  const lastWordsScore = 2;
  const allScores = [reportScore, communityScore, targetScore, lastWordsScore];
  const finalGrade = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
  // Example plausible description
  const description = "According to several social media posts, a new technology would allow you to recharge your smartphone in 10 seconds using a special wave. This information was widely shared without scientific proof.";
  // Example fake sources and dates
  const sources = [
    'https://www.fauxmedia.com/article-recharge-10s',
    'https://www.rumeurtech.net/onde-miracle',
  ];
  const date = '05/15/2025';
  // Display
  return (
    <div className="news-card" style={{display:'flex',alignItems:'flex-start',gap:24,marginBottom:32}}>
      {/* Main block on the left: title, description, sources, date */}
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
      {/* Vertical buttons on the right */}
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
            <button className="btn btn-archive" onClick={onArchive}>Archive news</button>
          </div>
        )}
        <button className="btn btn-delete" style={{marginTop:8, background:'#e74c3c', color:'#fff'}} onClick={onDelete}>Delete</button>
      </div>
      {/* Modals */}
      {showReport && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{textAlign:'center'}}>Report</h2>
            <div style={{margin:'24px 0'}}>
              <textarea
                className="report-textarea"
                value={"This content shows signs of misinformation detected by AI. Thank you for contributing to the reliability of the platform."}
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
            <div style={{flex:1}}>
              <div style={{marginBottom:12}}>
                "I want to clarify that the information spread about me is completely false. I spoke out publicly to set the record straight and thank everyone who supported me during this difficult time."
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
            <div style={{flex:1}}>
              <div style={{marginBottom:12}}>
                "We published this information without verifying its accuracy. We regret the impact this may have had and apologize to the person concerned."
              </div>
            </div>
            <button className="btn btn-exit" onClick={() => { setShowAuthor(false); setScores(s => ({...s, showLastWordsScore:true})); }}>Exit</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Dashboard page: displays a fake news item
export default function DashboardPage() {
  // State for the list of news to process
  const [pendingNews, setPendingNews] = useState(getPendingNews());
  // Effect to keep the list up to date
  React.useEffect(() => {
    setPendingNews(getPendingNews());
  }, []);
  // Function to archive and remove the news from the dashboard
  function handleArchive(news) {
    archiveNews(news, Math.round((2+4+3+1)/4) < 3 ? 'fake' : 'real');
    const updated = getPendingNews().filter(n => n.id !== news.id);
    window.localStorage.setItem('pendingNews', JSON.stringify(updated));
    setPendingNews(updated);
  }
  // Function to delete a news
  function handleDelete(news) {
    const updated = getPendingNews().filter(n => n.id !== news.id);
    window.localStorage.setItem('pendingNews', JSON.stringify(updated));
    setPendingNews(updated);
    // Also remove persisted scores
    window.localStorage.removeItem(`news-scores-${news.title}`);
  }
  return (
    <div className="dashboard-page">
      <h2>Dashboard</h2>
      {pendingNews.length === 0 ? (
        <div style={{padding:'32px',textAlign:'center',color:'#888',fontSize:'1.1em'}}>No news to analyze at the moment.</div>
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
  // Example interview text and video/screenshot
  const interviewText = `
    "I want to clarify that the information spread about me is completely false. I spoke out publicly to set the record straight and thank everyone who supported me during this difficult time."
  `;
  const victimMedia = '/assets/victim-interview.jpg'; // Replace with a real video or image if needed

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
  // Example text and image of the fake news author
  const authorText = `
    "We published this information without verifying its accuracy. We regret the impact this may have had and apologize to the person concerned."
  `;
  const authorMedia = '/assets/author-statement.jpg'; // Replace with a real image if needed

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
