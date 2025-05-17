import React, { useState } from 'react';
import './ArchivePage.css';

// Fake data for demonstration
const initialArchive = [
  {
    id: '1',
    title: "Vaccin COVID : la 5G active la puce !",
    date: '2025-05-17',
    status: 'fake',
    link: 'https://www.example.com/fake-news-1',
  },
  {
    id: '2',
    title: "Le chat domestique descend du tigre",
    date: '2025-05-16',
    status: 'real',
    link: 'https://www.example.com/real-news-2',
  },
  {
    id: '3',
    title: "La Terre est plate selon une nouvelle étude",
    date: '2025-05-15',
    status: 'fake',
    link: 'https://www.example.com/fake-news-3',
  },
];

const statusLabel = {
  fake: 'Fausse',
  real: 'Vraie',
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
        <h1>Archive des vérifications</h1>
        <p>Retrouvez ici toutes les news déjà vérifiées, avec leur statut.</p>
        {archive.length === 0 ? (
          <div style={{padding:'32px',textAlign:'center',color:'#888',fontSize:'1.1em'}}>Aucune news archivée pour le moment.</div>
        ) : (
        <table className="archive-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Date</th>
              <th>Statut</th>
              <th>Lien</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {archive.map((item) => (
              <tr key={item.id}>
                <td>{item.title}</td>
                <td>{item.date}</td>
                <td><span className={`archive-status ${statusColor[item.status]}`}>{statusLabel[item.status]}</span></td>
                <td><a href={item.link} target="_blank" rel="noopener noreferrer">Voir</a></td>
                <td><button className="btn btn-delete" style={{background:'#e74c3c',color:'#fff'}} onClick={() => handleDelete(item.id)}>Supprimer</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        )}
      </div>
    </div>
  );
}
