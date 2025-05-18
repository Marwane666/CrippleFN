
// News and report types for the Trust platform

export interface User {
  id: string;
  name: string;
  avatarUrl?: string;
  reputation: number;
  role?: 'victim' | 'contributor' | 'forecaster' | 'lawyer';
}

export interface NewsSource {
  url: string;
  title: string;
  publisher?: string;
  publishDate?: Date;
  imageUrl?: string;
}

export interface Contribution {
  id: string;
  userId: string;
  userName: string;
  userReputation: number;
  content: string;
  sourceUrl?: string;
  createdAt: Date;
  upvotes: number;
}

export interface Forecast {
  id: string;
  userId: string;
  userName: string;
  userReputation: number;
  prediction: 'true' | 'false';
  confidence: number; // 0-100
  stakeAmount: number; // XRP amount
  createdAt: Date;
}

export interface Victim {
  id: string;
  userId: string;
  userName: string;
  claim: string;
  evidence?: string;
  stakeAmount: number; // XRP amount
  verified: boolean;
  createdAt: Date;
}

export interface AIReport {
  trustScore: number; // 0-100
  summary: string;
  keyFindings: string[];
  contradictions: string[];
  sources: {
    url: string;
    relevance: number; // 0-100
    trustworthiness: number; // 0-100
  }[];
  generatedAt: Date;
  pdfUrl?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  source: NewsSource;
  submittedBy: User;
  submittedAt: Date;
  status: 'pending' | 'verified' | 'disputed' | 'litigated';
  trustScore: number; // 0-100
  aiReport?: AIReport;
  contributions: Contribution[];
  forecasts: Forecast[];
  victims: Victim[];
  followers: number;
  cashPool: number; // Total XRP in the case
  caseEndDate?: Date;
}
