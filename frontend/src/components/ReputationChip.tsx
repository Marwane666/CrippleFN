
import React from 'react';
import { cn } from '@/lib/utils';

interface ReputationChipProps {
  score: number;
  className?: string;
}

const ReputationChip = ({ score, className }: ReputationChipProps) => {
  // Calculate color based on reputation score
  const getColorClass = () => {
    if (score >= 80) return 'bg-green-600 text-white';
    if (score >= 60) return 'bg-green-500 text-white';
    if (score >= 40) return 'bg-yellow-500 text-black';
    if (score >= 20) return 'bg-orange text-white';
    return 'bg-red-500 text-white';
  };

  // Get reputation level text
  const getReputationLevel = () => {
    if (score >= 80) return 'Expert';
    if (score >= 60) return 'Trusted';
    if (score >= 40) return 'Verified';
    if (score >= 20) return 'New';
    return 'Unverified';
  };

  return (
    <div className={cn(
      "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
      getColorClass(),
      className
    )}>
      <span className="mr-1">{getReputationLevel()}</span>
      <span className="opacity-75">{score}</span>
    </div>
  );
};

export default ReputationChip;
