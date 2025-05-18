
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Search, Bell, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import WalletButton from '@/components/WalletButton';

interface HeaderProps {
  walletAddress?: string;
  onConnectWallet: () => void;
}

const Header = ({ walletAddress, onConnectWallet }: HeaderProps) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border bg-background-dark py-3">
      <div className="container mx-auto flex items-center justify-between px-4">
        {/* Logo and brand */}
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-main">
            <span className="text-lg font-bold text-white">T</span>
          </div>
          <span className="text-xl font-bold text-text-primary">Trust</span>
        </Link>

        {/* Search bar - only on desktop */}
        <div className="hidden md:block md:w-1/3 lg:w-2/5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <Input
              type="text"
              placeholder="Search news or cases..."
              className="bg-background-light pl-9 text-text-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" className="hidden sm:flex">
            <Link to="/explore">Explore</Link>
          </Button>
          <Button asChild variant="ghost" className="hidden sm:flex">
            <Link to="/cases">Cases</Link>
          </Button>
          
          {/* Report button */}
          <Button asChild variant="default" className="bg-primary-main hover:bg-primary-dark">
            <Link to="/report">Report News</Link>
          </Button>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center p-0">3</Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between p-2">
                <p className="font-medium">Notifications</p>
                <Button variant="link" size="sm">Mark all as read</Button>
              </div>
              <DropdownMenuSeparator />
              <div className="max-h-72 overflow-y-auto">
                {/* Sample notifications */}
                <DropdownMenuItem className="cursor-pointer flex flex-col items-start gap-1">
                  <div className="flex w-full justify-between">
                    <span className="font-medium">News Update</span>
                    <span className="text-xs text-text-muted">2h ago</span>
                  </div>
                  <p className="text-sm text-text-secondary">A case you're following has new evidence</p>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer flex flex-col items-start gap-1">
                  <div className="flex w-full justify-between">
                    <span className="font-medium">Forecast Won</span>
                    <span className="text-xs text-text-muted">1d ago</span>
                  </div>
                  <p className="text-sm text-text-secondary">Your forecast was correct! You won 25 XRP</p>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild className="cursor-pointer">
                <Link to="/notifications" className="flex w-full justify-center py-1 text-sm">
                  View all notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild><Link to="/profile">Profile</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link to="/dashboard">Dashboard</Link></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild><Link to="/settings">Settings</Link></DropdownMenuItem>
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Wallet button */}
          <WalletButton address={walletAddress} onConnect={onConnectWallet} />
        </div>
      </div>
    </header>
  );
};

export default Header;
