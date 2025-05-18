
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { submitNews } from '@/lib/api';
import WalletButton from '@/components/WalletButton';

const Report = () => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Mock connecting wallet
  const handleConnectWallet = () => {
    const mockAddress = 'rNa3BKePPaKxCFhaCRTRzXKGh4XkTYvATT';
    setWalletAddress(mockAddress);
    toast({
      title: 'Wallet connected',
      description: 'Your wallet has been connected successfully.',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!url || !title) {
      toast({
        title: 'Missing information',
        description: 'Please provide both a URL and title for the news item.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!walletAddress) {
      toast({
        title: 'Wallet not connected',
        description: 'Please connect your wallet to report fake news.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a mock news ID
      const newsId = `news-${Math.random().toString(36).substring(2, 10)}`;
      
      toast({
        title: 'Report submitted successfully',
        description: 'Your fake news report has been submitted for review.',
      });
      
      navigate(`/news/${newsId}`);
    } catch (error) {
      console.error('Error submitting news report:', error);
      toast({
        title: 'Failed to submit report',
        description: 'There was an error submitting your report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      {/* Header */}
      <header className="py-6 px-6 border-b border-border flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">FakeNews <span className="text-orange">Litigation</span></h1>
          <p className="text-sm text-muted-foreground">Social platform for fake news accountability</p>
        </div>
        <WalletButton address={walletAddress} onConnect={handleConnectWallet} />
      </header>
      
      {/* Main content */}
      <main className="flex-1 py-8 px-6">
        <div className="max-w-xl mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')} 
            className="mb-6 text-muted-foreground hover:text-white"
          >
            &larr; Back to Feed
          </Button>
          
          <Card className="bg-navy-light border-muted">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-white">Report Fake News</CardTitle>
              <CardDescription className="text-muted-foreground">
                Submit a news article you suspect contains false information or misleading content.
              </CardDescription>
            </CardHeader>
            
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-white">News Article URL</Label>
                  <Input
                    id="url"
                    placeholder="https://example.com/article"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="bg-navy border-muted"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">Article Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter the headline of the article"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-navy border-muted"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="comment" className="text-white">Why do you believe this is fake news?</Label>
                  <Textarea
                    id="comment"
                    placeholder="Provide details about why you believe this news is false or misleading..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[120px] bg-navy border-muted"
                  />
                </div>
                
                <div className="rounded-md bg-navy p-4">
                  <h3 className="font-medium text-sm text-white">Important Notice</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    By submitting this report, you confirm that you have reasonable grounds to believe this content is false or misleading. False reports may affect your reputation score.
                  </p>
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-orange hover:bg-orange-light"
                  disabled={!url || !title || isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Report;
