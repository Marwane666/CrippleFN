import React from 'react';
import { useNavigate } from 'react-router-dom';
import './NewsThreadPage.css';

const demoNews = [
  {
    id: 1,
    title: 'Breakthrough: AI Predicts Earthquakes Before They Happen',
    image: '/assets/news-earthquake.jpg',
    summary: 'A new AI model claims to predict earthquakes hours in advance, raising both hope and skepticism among scientists.'
  },
  {
    id: 2,
    title: 'Scientists Discover Water on Mars',
    image: '/assets/news-mars.jpg',
    summary: 'NASA confirms the presence of liquid water on Mars, opening new possibilities for future missions.'
  },
  {
    id: 3,
    title: 'Global Internet Outage: What Really Happened?',
    image: '/assets/news-internet.jpg',
    summary: 'A massive outage left millions offline. Experts debate the cause and the risk of future incidents.'
  },
  {
    id: 4,
    title: 'New Battery Charges Phones in 10 Seconds',
    image: '/assets/news-battery.jpg',
    summary: 'A startup unveils a battery that can fully charge a smartphone in just 10 seconds. Is it too good to be true?'
  },
];

export default function NewsThreadPage() {
  const navigate = useNavigate();

  const handleVerify = (news) => {
    // Add news to dashboard (pendingNews in localStorage)
    const pending = JSON.parse(window.localStorage.getItem('pendingNews') || '[]');
    // Avoid duplicates by title
    if (!pending.some(n => n.title === news.title)) {
      pending.push({
        id: 'thread_' + news.id,
        title: news.title,
        description: news.summary,
        date: new Date().toLocaleDateString('en-US'),
        status: 'pending',
        link: '',
        imageUrl: news.image,
        sources: [],
      });
      window.localStorage.setItem('pendingNews', JSON.stringify(pending));
    }
    // Go to dashboard to start the process
    navigate('/dashboard');
  };

  return (
    <div className="news-thread-page">
      <h1 style={{textAlign:'center',margin:'32px 0 24px'}}>News Thread</h1>
      <div className="news-thread-grid">
        {demoNews.map(news => (
          <div className="news-thread-widget" key={news.id} style={{backgroundImage:`url(${news.image})`}}>
            <div className="news-thread-overlay">
              <h2 className="news-thread-title">{news.title}</h2>
              <p className="news-thread-summary">{news.summary}</p>
              <button className="btn btn-primary" onClick={() => handleVerify(news)}>
                Verify
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
