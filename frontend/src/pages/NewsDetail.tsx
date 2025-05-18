
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Share, Star, MessageSquare, Download, ChartBar, FileText, Eye, ArrowUp, ArrowDown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import { useUIStore } from '@/store/ui';
import { getMockNews } from '@/lib/utils';

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [news, setNews] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('details');
  const [isFollowing, setIsFollowing] = useState(false);
  const { openStakeModal, openWitnessModal, openVictimEnroll } = useUIStore();
  
  // Mock connecting wallet
  const handleConnectWallet = () => {
    const mockAddress = 'rNa3BKePPaKxCFhaCRTRzXKGh4XkTYvATT';
    setWalletAddress(mockAddress);
    toast({
      title: 'Wallet connected',
      description: 'Your wallet has been connected successfully.',
    });
  };

  // Toggle follow status
  const handleToggleFollow = () => {
    setIsFollowing(!isFollowing);
    toast({
      title: isFollowing ? 'Unfollowed' : 'Following',
      description: isFollowing 
        ? 'You will no longer receive updates about this case' 
        : 'You will now receive updates about this case',
    });
  };

  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setIsLoading(true);
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get mock news data
        const mockNews = getMockNews(15);
        const foundNews = mockNews.find(item => item.id === id);
        
        if (foundNews) {
          // Add additional details for the detail page
          setNews({
            ...foundNews,
            content: {
              summary: "This article contains misleading claims about economic statistics that are not supported by official data sources. The author makes several assertions that contradict reports from the Bureau of Economic Analysis.",
              evidenceLinks: [
                "https://example.com/official-report",
                "https://example.com/fact-check"
              ]
            },
            witnesses: Array.from({ length: 3 }).map((_, i) => ({
              id: `witness-${i+1}`,
              name: `Witness${i+1}`,
              reputation: Math.floor(Math.random() * 100),
              statement: "I can confirm that the data presented in this article contradicts official records that I have access to through my professional role.",
              createdAt: new Date(Date.now() - Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000)
            })),
            victims: Array.from({ length: 2 }).map((_, i) => ({
              id: `victim-${i+1}`,
              name: `Victim${i+1}`,
              claim: "This news directly impacted my business as clients cancelled orders based on this false information.",
              stakeAmount: 500 * (i + 1),
              createdAt: new Date(Date.now() - Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000)
            })),
            forecasts: Array.from({ length: 5 }).map((_, i) => ({
              id: `forecast-${i+1}`,
              userName: `Forecaster${i+1}`,
              prediction: i % 2 === 0 ? 'true' : 'false',
              confidence: 50 + Math.floor(Math.random() * 50),
              stakeAmount: 100 * (i + 1),
              createdAt: new Date(Date.now() - Math.floor(Math.random() * 5) * 24 * 60 * 60 * 1000)
            })),
            status: ['pending', 'verified', 'disputed', 'litigated'][Math.floor(Math.random() * 4)],
            cashPool: Math.floor(Math.random() * 10000) + 1000,
            followers: Math.floor(Math.random() * 300) + 50,
            aiReport: {
              trustScore: foundNews.aiScore,
              summary: "Our analysis indicates this news contains significant factual errors and misleading statements.",
              keyFindings: [
                "Economic growth figures cited in the article are inconsistent with official Bureau of Economic Analysis data.",
                "The employment statistics have been selectively presented, omitting context necessary for proper interpretation.",
                "Expert quotes have been taken out of context or misattributed.",
                "The article's conclusions are not supported by the full dataset."
              ],
              contradictions: [
                "Claims 5.2% growth vs actual 2.7% reported by official sources",
                "Article states 'record job losses' when official data shows job growth",
                "Article attributes quotes to experts who have publicly denied making those statements"
              ],
              generatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
              pdfUrl: "#"
            }
          });
        } else {
          // Handle not found
          toast({
            title: "News not found",
            description: "The requested news item could not be found.",
            variant: "destructive",
          });
          navigate("/");
        }
      } catch (error) {
        console.error("Error fetching news details:", error);
        toast({
          title: "Error loading news",
          description: "Failed to load the news details.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchNewsDetail();
    }
  }, [id, navigate, toast]);

  // Function to format XRP amounts
  const formatXrp = (amount: number) => {
    return amount.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-dark">
        <Header walletAddress={walletAddress} onConnectWallet={handleConnectWallet} />
        <main className="container mx-auto flex-1 animate-pulse px-4 py-8">
          <div className="mx-auto max-w-4xl">
            <div className="h-8 w-3/4 rounded bg-background-medium" />
            <div className="mt-2 h-4 w-1/2 rounded bg-background-medium" />
            <div className="mt-8 h-64 w-full rounded bg-background-medium" />
          </div>
        </main>
      </div>
    );
  }

  if (!news) {
    return null;
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-text-muted',
    verified: 'bg-secondary-main',
    disputed: 'bg-alert-warning text-background-dark',
    litigated: 'bg-primary-main'
  };

  return (
    <div className="min-h-screen bg-background-dark text-text-primary">
      <Header walletAddress={walletAddress} onConnectWallet={handleConnectWallet} />
      
      <main className="container mx-auto flex-1 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')} 
            className="mb-6 hover:text-primary-light"
          >
            &larr; Back to Home
          </Button>
          
          {/* News Header */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Badge className={`${statusColors[news.status] || 'bg-text-muted'}`}>
                    {news.status.charAt(0).toUpperCase() + news.status.slice(1)}
                  </Badge>
                  <span className="text-sm text-text-secondary">
                    Reported {formatDistanceToNow(news.createdAt)} ago
                  </span>
                </div>
                
                <h1 className="mt-2 text-2xl font-bold text-text-primary sm:text-3xl">
                  {news.title}
                </h1>
                
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-1 text-sm text-text-secondary">
                    <span>By: {news.submittedBy.name}</span>
                    <Badge variant="outline" className="border-primary-light text-primary-light">
                      Rep: {news.submittedBy.reputation}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-1 text-sm text-text-secondary">
                    <Star className="h-4 w-4" />
                    <span>{news.followers} followers</span>
                  </div>
                  
                  {news.cashPool && (
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="border-secondary-main text-secondary-main">
                        {formatXrp(news.cashPool)} XRP Pool
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Trust Score */}
              <div className="flex flex-col items-center rounded-lg bg-background-medium p-3 text-center">
                <span className="text-sm text-text-secondary">Trust Score</span>
                <div className={`mt-1 flex h-16 w-16 items-center justify-center rounded-full ${
                  news.aiReport?.trustScore < 30 ? 'bg-alert-error' : 
                  news.aiReport?.trustScore < 70 ? 'bg-alert-warning' : 
                  'bg-secondary-main'
                }`}>
                  <span className="text-2xl font-bold text-white">
                    {news.aiReport?.trustScore || 0}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Source link */}
            <div className="flex items-center gap-2">
              <span className="font-medium">Source:</span>
              <a 
                href={news.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="break-all text-primary-light hover:underline"
              >
                {news.url}
              </a>
            </div>
            
            {/* Action buttons */}
            <div className="flex flex-wrap gap-3">
              <Button 
                className="bg-primary-main hover:bg-primary-dark"
                onClick={() => openVictimEnroll(news.id)}
              >
                Register as Victim
              </Button>
              
              <Button 
                variant="default"
                className="bg-secondary-main hover:bg-secondary-dark"
                onClick={() => openWitnessModal(news.id)}
              >
                Contribute Evidence
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => openStakeModal(news.id)}
              >
                Forecast Outcome
              </Button>
              
              <Button 
                variant="ghost"
                className={isFollowing ? 'bg-background-light' : ''}
                onClick={handleToggleFollow}
              >
                {isFollowing ? 'Following ✓' : 'Follow Case'}
              </Button>
              
              <Button variant="ghost" size="icon">
                <Share className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Main content */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="evidence">Evidence</TabsTrigger>
              <TabsTrigger value="forecasts">Forecasts</TabsTrigger>
              <TabsTrigger value="victims">Victims</TabsTrigger>
            </TabsList>
            
            {/* Details Tab */}
            <TabsContent value="details" className="space-y-6">
              <Card className="border-border bg-background-medium">
                <CardContent className="pt-6">
                  <h3 className="mb-4 text-lg font-semibold">Summary</h3>
                  <p className="text-text-secondary">{news.content.summary}</p>
                  
                  {/* AI analysis section */}
                  {news.aiReport && (
                    <div className="mt-8">
                      <div className="flex items-center gap-3">
                        <ChartBar className="h-5 w-5 text-primary-main" />
                        <h3 className="text-lg font-semibold">AI Analysis</h3>
                      </div>
                      
                      <div className="mt-4 space-y-4">
                        <p className="text-text-secondary">{news.aiReport.summary}</p>
                        
                        <div>
                          <h4 className="font-medium text-text-primary">Key Findings:</h4>
                          <ul className="mt-2 list-inside list-disc space-y-1 text-text-secondary">
                            {news.aiReport.keyFindings.map((finding: string, index: number) => (
                              <li key={index}>{finding}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-text-primary">Contradictions Found:</h4>
                          <ul className="mt-2 list-inside list-disc space-y-1 text-text-secondary">
                            {news.aiReport.contradictions.map((contradiction: string, index: number) => (
                              <li key={index}>{contradiction}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-text-secondary">
                            Generated {formatDistanceToNow(news.aiReport.generatedAt)} ago
                          </span>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-1">
                              <FileText className="h-4 w-4" />
                              <span>View Full Report</span>
                            </Button>
                            <Button variant="outline" size="sm" className="gap-1">
                              <Download className="h-4 w-4" />
                              <span>Download PDF</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Case Status */}
              {news.status === 'litigated' && (
                <Card className="border-border bg-background-medium">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-primary-main py-1">Litigation Status</Badge>
                    </div>
                    
                    <div className="mt-4 space-y-4">
                      <Alert className="border-primary-light">
                        <AlertTitle>Case is currently under legal review</AlertTitle>
                        <AlertDescription>
                          This news item is being evaluated for legal action. The evidence collected 
                          on this platform may be used in court.
                        </AlertDescription>
                      </Alert>
                      
                      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div>
                          <dt className="text-sm text-text-secondary">Case Opened</dt>
                          <dd className="font-medium">May 10, 2025</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-text-secondary">Expected Resolution</dt>
                          <dd className="font-medium">August 15, 2025</dd>
                        </div>
                        <div>
                          <dt className="text-sm text-text-secondary">Jurisdiction</dt>
                          <dd className="font-medium">California, USA</dd>
                        </div>
                      </dl>
                      
                      <div className="flex justify-end">
                        <Button asChild className="bg-primary-main hover:bg-primary-dark">
                          <Link to={`/legal/${id}`}>View Legal Details</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            {/* Evidence Tab */}
            <TabsContent value="evidence" className="space-y-6">
              <Card className="border-border bg-background-medium">
                <CardContent className="pt-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Witness Testimony & Evidence</h3>
                    <Button 
                      className="bg-secondary-main hover:bg-secondary-dark"
                      onClick={() => openWitnessModal(news.id)}
                    >
                      Add Contribution
                    </Button>
                  </div>
                  
                  <div className="space-y-5">
                    {news.witnesses && news.witnesses.length > 0 ? (
                      news.witnesses.map((witness: any) => (
                        <div 
                          key={witness.id} 
                          className="rounded-lg border border-border bg-background-light p-4"
                        >
                          <div className="mb-2 flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{witness.name}</span>
                              <Badge variant="outline" className="border-primary-light text-primary-light">
                                Rep: {witness.reputation}
                              </Badge>
                            </div>
                            <span className="text-xs text-text-muted">
                              {formatDistanceToNow(witness.createdAt)} ago
                            </span>
                          </div>
                          <p className="text-sm text-text-secondary">{witness.statement}</p>
                          
                          <div className="mt-3 flex items-center justify-end gap-2 text-xs text-text-muted">
                            <Button variant="ghost" size="sm" className="h-7 gap-1">
                              <ArrowUp className="h-3 w-3" />
                              <span>Helpful</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-7 gap-1">
                              <ArrowDown className="h-3 w-3" />
                              <span>Not Helpful</span>
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center">
                        <MessageSquare className="h-10 w-10 text-text-muted" />
                        <h3 className="mt-4 text-lg font-medium">No contributions yet</h3>
                        <p className="mt-2 text-text-secondary">Be the first to contribute evidence or testimony</p>
                        <Button 
                          className="mt-4 bg-secondary-main hover:bg-secondary-dark"
                          onClick={() => openWitnessModal(news.id)}
                        >
                          Add Contribution
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-border bg-background-medium">
                <CardContent className="pt-6">
                  <h3 className="mb-4 text-lg font-semibold">Supporting Evidence</h3>
                  
                  <div className="mb-4 space-y-2">
                    <h4 className="font-medium">Official Sources:</h4>
                    <ul className="list-inside list-disc space-y-1 text-text-secondary">
                      {news.content.evidenceLinks.map((link: string, index: number) => (
                        <li key={index}>
                          <a 
                            href={link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary-light hover:underline"
                          >
                            {link}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div>
                    <h4 className="font-medium">External Fact-checks:</h4>
                    <div className="mt-2 rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">FactCheck.org</span>
                        <Badge variant="outline" className="border-alert-error text-alert-error">
                          False
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-text-secondary">
                        This claim has been rated false by independent fact-checkers.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Forecasts Tab */}
            <TabsContent value="forecasts" className="space-y-6">
              <Card className="border-border bg-background-medium">
                <CardContent className="pt-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Outcome Forecasts</h3>
                    <Button variant="outline" onClick={() => openStakeModal(news.id)}>
                      Make Forecast
                    </Button>
                  </div>
                  
                  <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-lg bg-background-light p-4 text-center">
                      <h4 className="mb-2 text-sm font-medium text-text-secondary">Condemnation Likely</h4>
                      <div className="flex items-baseline justify-center">
                        <span className="text-3xl font-bold text-secondary-main">65%</span>
                        <span className="ml-1 text-sm text-text-secondary">
                          ({formatXrp(news.cashPool * 0.65)} XRP)
                        </span>
                      </div>
                    </div>
                    <div className="rounded-lg bg-background-light p-4 text-center">
                      <h4 className="mb-2 text-sm font-medium text-text-secondary">Condemnation Unlikely</h4>
                      <div className="flex items-baseline justify-center">
                        <span className="text-3xl font-bold text-alert-error">35%</span>
                        <span className="ml-1 text-sm text-text-secondary">
                          ({formatXrp(news.cashPool * 0.35)} XRP)
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <h4 className="mb-3 font-medium">Recent Forecasts:</h4>
                  <div className="space-y-3">
                    {news.forecasts && news.forecasts.length > 0 ? (
                      news.forecasts.map((forecast: any) => (
                        <div 
                          key={forecast.id} 
                          className="flex items-center justify-between rounded-lg border border-border bg-background-light p-3"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline" 
                                className={forecast.prediction === 'true' ? 
                                  'border-secondary-main text-secondary-main' : 
                                  'border-alert-error text-alert-error'
                                }
                              >
                                {forecast.prediction === 'true' ? 'Will be condemned' : 'Won\'t be condemned'}
                              </Badge>
                              <span className="text-sm font-medium">{forecast.userName}</span>
                            </div>
                            <p className="mt-1 text-xs text-text-muted">
                              {formatDistanceToNow(forecast.createdAt)} ago • 
                              Confidence: {forecast.confidence}%
                            </p>
                          </div>
                          <Badge className="bg-background-dark">
                            {formatXrp(forecast.stakeAmount)} XRP
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center">
                        <h3 className="mt-2 text-lg font-medium">No forecasts yet</h3>
                        <p className="mt-2 text-text-secondary">
                          Be the first to forecast the outcome of this case
                        </p>
                        <Button 
                          variant="outline" 
                          className="mt-4"
                          onClick={() => openStakeModal(news.id)}
                        >
                          Make Forecast
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-border bg-background-medium">
                <CardContent className="pt-6">
                  <h3 className="mb-4 text-lg font-semibold">How Forecasting Works</h3>
                  <p className="text-text-secondary">
                    Forecasting allows users to stake XRP on whether this news will be legally 
                    condemned as fake. If your forecast is correct, you'll receive proportional 
                    rewards from the opposing side's stakes when the case concludes.
                  </p>
                  
                  <div className="mt-4 rounded-lg bg-background-light p-4">
                    <h4 className="font-medium">Forecasting Rules:</h4>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-text-secondary">
                      <li>Minimum stake: 10 XRP</li>
                      <li>Stakes are locked until case resolution</li>
                      <li>Rewards are proportional to your stake amount</li>
                      <li>Accurate forecasts improve your reputation score</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Victims Tab */}
            <TabsContent value="victims" className="space-y-6">
              <Card className="border-border bg-background-medium">
                <CardContent className="pt-6">
                  <div className="mb-6 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Registered Victims</h3>
                    <Button 
                      className="bg-primary-main hover:bg-primary-dark"
                      onClick={() => openVictimEnroll(news.id)}
                    >
                      Register as Victim
                    </Button>
                  </div>
                  
                  {news.victims && news.victims.length > 0 ? (
                    <div className="space-y-4">
                      {news.victims.map((victim: any) => (
                        <div 
                          key={victim.id}
                          className="rounded-lg border border-border bg-background-light p-4"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <span className="font-medium">{victim.name}</span>
                            <Badge className="bg-primary-main">
                              {formatXrp(victim.stakeAmount)} XRP staked
                            </Badge>
                          </div>
                          <p className="text-sm text-text-secondary">{victim.claim}</p>
                          <p className="mt-2 text-xs text-text-muted">
                            Registered {formatDistanceToNow(victim.createdAt)} ago
                          </p>
                        </div>
                      ))}
                      
                      <div className="flex items-center justify-between rounded-lg border border-dashed border-border bg-background-medium p-4">
                        <div>
                          <span className="font-medium">Total Victim Pool:</span>
                          <span className="ml-2 text-secondary-main">
                            {formatXrp(news.victims.reduce((sum: number, v: any) => sum + v.stakeAmount, 0))} XRP
                          </span>
                        </div>
                        <Badge variant="outline">
                          {news.victims.length} registered victims
                        </Badge>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-8 text-center">
                      <Eye className="h-10 w-10 text-text-muted" />
                      <h3 className="mt-4 text-lg font-medium">No victims registered yet</h3>
                      <p className="mt-2 text-text-secondary">
                        If you were directly affected by this news, you can register as a victim
                      </p>
                      <Button 
                        className="mt-4 bg-primary-main hover:bg-primary-dark"
                        onClick={() => openVictimEnroll(news.id)}
                      >
                        Register as Victim
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="border-border bg-background-medium">
                <CardContent className="pt-6">
                  <h3 className="mb-4 text-lg font-semibold">About Victim Registration</h3>
                  <p className="text-text-secondary">
                    If you've been directly harmed by this news item, you can register as a victim
                    to participate in potential legal proceedings and compensation if the case
                    is successfully litigated.
                  </p>
                  
                  <div className="mt-4 rounded-lg bg-background-light p-4">
                    <h4 className="font-medium">Registration Requirements:</h4>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-text-secondary">
                      <li>Proof of identity (secure and encrypted)</li>
                      <li>Description of how you were harmed</li>
                      <li>Minimum stake of 100 XRP to join the victim pool</li>
                      <li>Victims receive proportional compensation from settlements</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
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

export default NewsDetail;
