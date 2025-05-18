
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format XRPL address for display
export function formatAddress(address: string, start: number = 6, end: number = 4): string {
  if (!address) return '';
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

// Convert drops to XRP
export function dropsToXrp(drops: number): string {
  return (drops / 1000000).toFixed(6);
}

// Generate XRPL explorer link for a transaction
export function getXrplExplorerLink(txHash: string): string {
  return `https://livenet.xrpl.org/transactions/${txHash}`;
}

// Get mock data for testing and development
export function getMockNews(count = 10) {
  return Array.from({ length: count }).map((_, i) => ({
    id: `news-${i + 1}`,
    title: `Suspected Fake News Article ${i + 1}`,
    url: `https://example-${i + 1}.com/article`,
    submittedBy: {
      name: `User${i + 1}`,
      reputation: Math.floor(Math.random() * 100)
    },
    aiScore: Math.floor(Math.random() * 100),
    crowdScore: Math.floor(Math.random() * 100),
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 10) * 24 * 60 * 60 * 1000)
  }));
}
