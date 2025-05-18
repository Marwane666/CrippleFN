import React, { useState } from 'react';
import './ArchivePage.css';

// Fake data for demonstration
const initialArchive = [
  {
    id: '1',
    title: "COVID Vaccine: 5G activates the chip!",
    date: '2025-05-17',
    status: 'fake',
    link: 'https://www.example.com/fake-news-1',
  },
  {
    id: '2',
    title: "The domestic cat descends from the tiger",
    date: '2025-05-16',
    status: 'real',
    link: 'https://www.example.com/real-news-2',
  },
  {
    id: '3',
    title: "The Earth is flat according to a new study",
    date: '2025-05-15',
    status: 'fake',
    link: 'https://www.example.com/fake-news-3',
  },
];

const statusLabel = {
  fake: 'Fake',
  real: 'Real',
};

const statusColor = {
  fake: 'archive-status-fake',
  real: 'archive-status-real',
};

function getStoredArchive() {
  const stored = window.localStorage.getItem('archiveNews');
  return stored ? JSON.parse(stored) : initialArchive;
}

export default function ArchivePage() {
  const [archive, setArchive] = useState(getStoredArchive());

  function handleDelete(id) {
    const updated = archive.filter(item => item.id !== id);
    setArchive(updated);
    window.localStorage.setItem('archiveNews', JSON.stringify(updated));
  }

  return (
    <div className="archive-page">
      <div className="container">
        <h1>Verification Archive</h1>
        <p>Find here all the news already verified, with their status.</p>
        {archive.length === 0 ? (
          <div style={{padding:'32px',textAlign:'center',color:'#888',fontSize:'1.1em'}}>No archived news at the moment.</div>
        ) : (
        <table className="archive-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Status</th>
              <th>Link</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {archive.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{item.date}</td>
                <td><span className={`archive-status ${statusColor[item.status]}`}>{statusLabel[item.status]}</span></td>
                <td><a href={item.link} target="_blank" rel="noopener noreferrer">View</a></td>
                <td><button className="btn btn-delete" style={{background:'#e74c3c',color:'#fff'}} onClick={() => handleDelete(item.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}
