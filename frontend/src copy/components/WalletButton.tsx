
import React from 'react';
import { Button } from '@/components/ui/button';
import { LinkIcon } from 'lucide-react';

interface WalletButtonProps {
  address?: string;
  onConnect: () => void;
  className?: string;
}

const WalletButton = ({ address, onConnect, className }: WalletButtonProps) => {
  return (
    <Button 
      onClick={onConnect}
      className={`bg-secondary-main hover:bg-secondary-dark transition-colors ${className || ''}`}
    >
      {address ? (
        <span className="flex items-center gap-2">
          <LinkIcon className="h-4 w-4" />
          {`${address.slice(0, 6)}...${address.slice(-4)}`}
        </span>
      ) : (
        "Connect Wallet"
      )}
    </Button>
  );
};

export default WalletButton;
