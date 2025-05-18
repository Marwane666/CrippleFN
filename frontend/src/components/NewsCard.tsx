
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share, Eye, MessageSquare, Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { NewsItem } from '@/types/news';

// Display a simplified version of the NewsItem
type NewsCardProps = {
  news: Partial<NewsItem>;
  showActions?: boolean;
};

const NewsCard = ({ news, showActions = true }: NewsCardProps) => {
  const {
    id,
    title,
    source,
    submittedAt,
    trustScore = 0,
    contributions = [],
    followers = 0,
    cashPool = 0,
    status = 'pending',
  } = news;

  // Get a color based on trust score
  const getTrustScoreColor = (score: number) => {
    if (score < 30) return 'bg-alert-error';
    if (score < 70) return 'bg-alert-warning';
    return 'bg-secondary-main';
  };

  // Format XRP amount
  const formatXRP = (amount: number) => {
    return `${amount.toLocaleString()} XRP`;
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-secondary-main text-white';
      case 'disputed':
        return 'bg-alert-warning text-black';
      case 'litigated':
        return 'bg-primary-main text-white';
      default:
        return 'bg-text-muted text-white';
    }
  };

  // Get the domain from URL
  const getDomain = (url?: string) => {
    if (!url) return '';
    try {
      const domain = new URL(url).hostname;
      return domain.startsWith('www.') ? domain.substring(4) : domain;
    } catch {
      return url;
    }
  };

  return (
    <Card className="overflow-hidden border-border bg-background-medium transition-all hover:border-primary-light">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold text-text-primary">
              <Link to={`/news/${id}`} className="hover:text-primary-light">
                {title || 'Untitled News'}
              </Link>
            </CardTitle>
            {source?.url && (
              <p className="mt-1 text-sm text-text-secondary">{getDomain(source.url)}</p>
            )}
          </div>
          
          {/* Trust score badge */}
          <div className="ml-4 flex flex-col items-end">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${getTrustScoreColor(trustScore)}`}>
              <span className="text-sm font-bold text-white">{trustScore}</span>
            </div>
            <Badge className={`mt-1 ${getStatusColor(status)}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex flex-wrap items-center gap-3 text-sm text-text-muted">
          <div className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4" />
            <span>{contributions.length} contributions</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4" />
            <span>{followers} followers</span>
          </div>
          {cashPool > 0 && (
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="border-secondary-main text-secondary-main">
                {formatXRP(cashPool)}
              </Badge>
            </div>
          )}
          {submittedAt && (
            <span className="ml-auto text-xs">
              {formatDistanceToNow(submittedAt)} ago
            </span>
          )}
        </div>
      </CardContent>
      
      {showActions && (
        <CardFooter className="flex justify-between pt-2">
          <Button asChild variant="default" size="sm" className="bg-primary-main hover:bg-primary-dark">
            <Link to={`/news/${id}`}>View Details</Link>
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Eye className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

export default NewsCard;
