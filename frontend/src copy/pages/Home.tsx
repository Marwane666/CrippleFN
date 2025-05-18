
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import NewsCard from '@/components/NewsCard';
import { getMockNews } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const Home = () => {
  const [newsItems, setNewsItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('recent');

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
        const mockData = getMockNews(12);
        setNewsItems(mockData);
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
    <div className="flex min-h-screen flex-col bg-background-dark text-text-primary">
      <Header walletAddress={walletAddress} onConnectWallet={handleConnectWallet} />
      
      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-8 text-3xl font-bold">Trust Platform</h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 w-full">
              <TabsTrigger value="recent" className="flex-1">Recent News</TabsTrigger>
              <TabsTrigger value="popular" className="flex-1">Popular</TabsTrigger>
              <TabsTrigger value="litigated" className="flex-1">Under Litigation</TabsTrigger>
              <TabsTrigger value="following" className="flex-1">Following</TabsTrigger>
            </TabsList>
            
            <TabsContent value="recent" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Latest Reports</h2>
                <Button variant="outline">Filter</Button>
              </div>
              
              {isLoading ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-48 animate-pulse rounded-lg border border-border bg-background-medium" />
                  ))}
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  {newsItems.slice(0, 8).map(item => (
                    <NewsCard key={item.id} news={{
                      id: item.id,
                      title: item.title,
                      source: { url: item.url },
                      submittedAt: item.createdAt,
                      trustScore: item.aiScore,
                      contributions: item.witnesses || [],
                      followers: Math.floor(Math.random() * 100),
                      cashPool: Math.floor(Math.random() * 1000),
                      status: ['pending', 'verified', 'disputed', 'litigated'][Math.floor(Math.random() * 4)],
                    }} />
                  ))}
                </div>
              )}
              
              {!isLoading && (
                <div className="mt-8 flex justify-center">
                  <Button variant="outline">Load More</Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="popular" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Popular Reports</h2>
                <Button variant="outline">Filter</Button>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                {!isLoading && newsItems
                  .sort((a, b) => b.crowdScore - a.crowdScore)
                  .slice(0, 6).map(item => (
                    <NewsCard key={item.id} news={{
                      id: item.id,
                      title: item.title,
                      source: { url: item.url },
                      submittedAt: item.createdAt,
                      trustScore: item.aiScore,
                      contributions: item.witnesses || [],
                      followers: Math.floor(Math.random() * 200) + 50, // Higher followers for popular
                      cashPool: Math.floor(Math.random() * 2000) + 500, // Higher cashpool for popular
                      status: ['verified', 'disputed', 'litigated'][Math.floor(Math.random() * 3)],
                    }} />
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="litigated" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Cases Under Litigation</h2>
                <Button variant="outline">Filter</Button>
              </div>
              
              <div className="grid gap-6 md:grid-cols-2">
                {!isLoading && newsItems
                  .filter((_, index) => index % 3 === 0) // Just to simulate some being litigated
                  .slice(0, 4).map(item => (
                    <NewsCard key={item.id} news={{
                      id: item.id,
                      title: item.title,
                      source: { url: item.url },
                      submittedAt: item.createdAt,
                      trustScore: item.aiScore,
                      contributions: item.witnesses || [],
                      followers: Math.floor(Math.random() * 300) + 100,
                      cashPool: Math.floor(Math.random() * 5000) + 1000,
                      status: 'litigated',
                    }} />
                  ))}
              </div>
            </TabsContent>
            
            <TabsContent value="following" className="space-y-6">
              {!walletAddress ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background-medium p-12 text-center">
                  <h3 className="text-lg font-medium">Connect your wallet to see followed cases</h3>
                  <p className="mt-2 text-text-secondary">You need to connect your wallet to track cases you're following</p>
                  <Button className="mt-4 bg-primary-main hover:bg-primary-dark" onClick={handleConnectWallet}>
                    Connect Wallet
                  </Button>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Cases You're Following</h2>
                    <Button variant="outline">Filter</Button>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    {!isLoading && newsItems
                      .filter((_, index) => index % 4 === 0) // Just to simulate some being followed
                      .slice(0, 2).map(item => (
                        <NewsCard key={item.id} news={{
                          id: item.id,
                          title: item.title,
                          source: { url: item.url },
                          submittedAt: item.createdAt,
                          trustScore: item.aiScore,
                          contributions: item.witnesses || [],
                          followers: Math.floor(Math.random() * 200) + 50,
                          cashPool: Math.floor(Math.random() * 3000) + 500,
                          status: ['verified', 'disputed', 'litigated'][Math.floor(Math.random() * 3)],
                        }} />
                      ))}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <footer className="border-t border-border bg-background-dark py-6">
        <div className="container mx-auto px-4 text-center text-sm text-text-secondary">
          <p>© 2025 Trust Platform. All rights reserved.</p>
          <div className="mt-2 flex justify-center space-x-6">
            <a href="#" className="hover:text-primary-light">Terms</a>
            <a href="#" className="hover:text-primary-light">Privacy</a>
            <a href="#" className="hover:text-primary-light">About</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
