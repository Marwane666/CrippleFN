
import React from 'react';
import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  aiScore: number;
  crowdScore: number;
  className?: string;
}

const ScoreBadge = ({ aiScore, crowdScore, className }: ScoreBadgeProps) => {
  // Calculate combined score weighted average (60% AI, 40% crowd)
  const combinedScore = aiScore * 0.6 + crowdScore * 0.4;
  
  // Determine color based on score
  let colorClass = 'bg-orange';
  if (combinedScore >= 75) {
    colorClass = 'bg-red-500';
  } else if (combinedScore >= 50) {
    colorClass = 'bg-orange';
  } else if (combinedScore >= 25) {
    colorClass = 'bg-yellow-500';
  } else {
    colorClass = 'bg-green-500';
  }

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      <div className={cn("px-2 py-1 rounded-md text-xs font-medium", colorClass)}>
        {Math.round(combinedScore)}%
      </div>
      <div className="flex flex-col text-xs">
        <span>AI: {aiScore}%</span>
        <span>Crowd: {crowdScore}%</span>
      </div>
    </div>
  );
};

export default ScoreBadge;
