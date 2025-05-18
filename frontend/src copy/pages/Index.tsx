
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import NewsCard from '@/components/NewsCard';
import WalletButton from '@/components/WalletButton';
import { getMockNews } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import StakeSheet from '@/components/StakeSheet';
import WitnessModal from '@/components/WitnessModal';
import VictimEnroll from '@/components/VictimEnroll';

const Index = () => {
  const [news, setNews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  // Mock connecting wallet
  const handleConnectWallet = () => {
    // Simulate wallet connection
    const mockAddress = 'rNa3BKePPaKxCFhaCRTRzXKGh4XkTYvATT';
    setWalletAddress(mockAddress);
    toast({
      title: 'Wallet connected',
      description: 'Your wallet has been connected successfully.',
    });
  };

  // Load mock news data
  useEffect(() => {
    const loadNews = async () => {
      try {
        setIsLoading(true);
        // Simulate API fetch delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        const mockData = getMockNews(8);
        setNews(mockData);
      } catch (error) {
        console.error('Error fetching news:', error);
        toast({
          title: 'Error loading news',
          description: 'Failed to load the latest news items.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadNews();
  }, [toast]);

  return (
    <div className="flex flex-col min-h-screen bg-navy">
      {/* Header */}
      <header className="py-6 px-6 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">FakeNews <span className="text-orange">Litigation</span></h1>
          <p className="text-sm text-muted-foreground">Social platform for fake news accountability</p>
        </div>
        <div className="flex items-center gap-4">
          <Button asChild variant="outline" className="border-orange text-orange hover:bg-navy-light">
            <Link to="/report">Report Fake News</Link>
          </Button>
          <WalletButton address={walletAddress} onConnect={handleConnectWallet} />
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 py-8 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Recent Reports</h2>
            <Button variant="ghost" className="text-muted-foreground">
              Latest
            </Button>
          </div>

          {/* News feed */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-border rounded-lg p-6 w-full">
                  <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                  <div className="h-4 bg-muted rounded w-1/2 mb-3" />
                  <div className="h-4 bg-muted rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {news.map((item) => (
                <NewsCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  url={item.url}
                  submittedBy={item.submittedBy}
                  aiScore={item.aiScore}
                  crowdScore={item.crowdScore}
                  createdAt={item.createdAt}
                />
              ))}
            </div>
          )}

          {/* Load more button */}
          {!isLoading && (
            <div className="mt-8 flex justify-center">
              <Button variant="outline" className="border-muted text-muted-foreground">
                Load More
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-6 border-t border-border">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2025 FakeNews Litigation Platform. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link to="#" className="text-sm text-muted-foreground hover:text-white">Terms</Link>
            <Link to="#" className="text-sm text-muted-foreground hover:text-white">Privacy</Link>
            <Link to="#" className="text-sm text-muted-foreground hover:text-white">About</Link>
          </div>
        </div>
      </footer>

      {/* Modals and sheets */}
      <StakeSheet />
      <WitnessModal />
      <VictimEnroll />
    </div>
  );
};

export default Index;
