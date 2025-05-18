
import ky from 'ky';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://api.fakenews-litigation.com';

// Create API client
export const api = ky.create({
  prefixUrl: BACKEND_URL,
  timeout: 30000,
  hooks: {
    beforeRequest: [
      request => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`);
        }
      }
    ]
  }
});

// API Types
export interface NewsItem {
  id: string;
  title: string;
  url: string;
  submittedBy: {
    name: string;
    address: string;
    reputation: number;
  };
  aiScore: number;
  crowdScore: number;
  createdAt: string;
  content?: {
    summary: string;
    evidenceLinks: string[];
  };
}

export interface WitnessStatement {
  id: string;
  newsId: string;
  statement: string;
  witnessAddress: string;
  witnessName: string;
  reputation: number;
  createdAt: string;
}

export interface Stake {
  id: string;
  newsId: string;
  amount: number;
  prediction: 'TRUE' | 'FALSE';
  stakerAddress: string;
  txHash: string;
  createdAt: string;
}

export interface XrplScore {
  newsId: string;
  trueStakes: number;
  falseStakes: number;
  transactions: {
    txHash: string;
    amount: number;
    prediction: 'TRUE' | 'FALSE';
    timestamp: string;
  }[];
}

// API functions
export async function fetchNewsItems(page = 1, limit = 10) {
  try {
    return await api.get(`api/news?page=${page}&limit=${limit}`).json<NewsItem[]>();
  } catch (error) {
    console.error('Error fetching news items:', error);
    throw error;
  }
}

export async function fetchNewsById(id: string) {
  try {
    return await api.get(`api/news/${id}`).json<NewsItem>();
  } catch (error) {
    console.error(`Error fetching news with id ${id}:`, error);
    throw error;
  }
}

export async function submitNews(data: { url: string; title: string; comment?: string }) {
  try {
    return await api.post('api/news', { json: data }).json<{ id: string }>();
  } catch (error) {
    console.error('Error submitting news:', error);
    throw error;
  }
}

export async function submitWitnessStatement(data: { 
  newsId: string; 
  statement: string; 
}) {
  try {
    return await api.post('api/witness', { json: data }).json<{ id: string }>();
  } catch (error) {
    console.error('Error submitting witness statement:', error);
    throw error;
  }
}

export async function submitVictimClaim(data: { 
  newsId: string; 
  idFile: File;
  statement: string;
}) {
  try {
    const formData = new FormData();
    formData.append('newsId', data.newsId);
    formData.append('idFile', data.idFile);
    formData.append('statement', data.statement);
    
    return await api.post('api/victim', { body: formData }).json<{ id: string }>();
  } catch (error) {
    console.error('Error submitting victim claim:', error);
    throw error;
  }
}

export async function fetchXrplScores(newsId: string) {
  try {
    return await api.get(`api/xrpl_scores?news_id=${newsId}`).json<XrplScore>();
  } catch (error) {
    console.error(`Error fetching XRPL scores for news ${newsId}:`, error);
    throw error;
  }
}

export async function fetchWitnesses(newsId: string) {
  try {
    return await api.get(`api/witness?news_id=${newsId}`).json<WitnessStatement[]>();
  } catch (error) {
    console.error(`Error fetching witnesses for news ${newsId}:`, error);
    throw error;
  }
}
