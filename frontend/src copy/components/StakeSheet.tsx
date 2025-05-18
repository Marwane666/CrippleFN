
import React, { useState } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUIStore } from '@/store/ui';
import { useStake, PredictionType } from '@/hooks/useStake';
import { Separator } from '@/components/ui/separator';

const StakeSheet = () => {
  const { stakeModal, closeStakeModal } = useUIStore();
  const { submitStake, isLoading } = useStake();
  const [amount, setAmount] = useState<string>('');
  const [selectedPrediction, setSelectedPrediction] = useState<PredictionType | null>(null);

  const handleStake = async () => {
    if (!stakeModal.newsId || !selectedPrediction || !amount || isNaN(Number(amount))) {
      return;
    }
    
    const result = await submitStake(
      stakeModal.newsId, 
      selectedPrediction, 
      Number(amount)
    );
    
    if (result) {
      closeStakeModal();
    }
  };

  return (
    <Sheet open={stakeModal.isOpen} onOpenChange={(open) => !open && closeStakeModal()}>
      <SheetContent className="bg-navy-light border-orange sm:max-w-lg animate-slide-up">
        <SheetHeader>
          <SheetTitle className="text-xl font-bold text-white">
            Stake XRP on Outcome
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Stake XRP on whether the author will be legally condemned for fake news.
          </SheetDescription>
        </SheetHeader>
        
        <div className="my-6 space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Select your prediction</h3>
            <div className="flex space-x-2">
              <Button 
                variant={selectedPrediction === 'TRUE' ? 'default' : 'outline'}
                className={selectedPrediction === 'TRUE' ? 'bg-orange hover:bg-orange-light' : ''}
                onClick={() => setSelectedPrediction('TRUE')}
              >
                TRUE - Will be condemned
              </Button>
              <Button 
                variant={selectedPrediction === 'FALSE' ? 'default' : 'outline'}
                className={selectedPrediction === 'FALSE' ? 'bg-orange hover:bg-orange-light' : ''}
                onClick={() => setSelectedPrediction('FALSE')}
              >
                FALSE - Won't be condemned
              </Button>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Stake amount (XRP)</h3>
            <Input
              type="number"
              min="1"
              placeholder="Amount in XRP"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-navy border-muted"
            />
            <p className="text-xs text-muted-foreground">
              Minimum stake: 1 XRP. Funds will be locked until case resolution.
            </p>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-4">
            <div className="rounded-md bg-navy p-4">
              <h3 className="font-medium">Potential reward</h3>
              <p className="text-sm text-muted-foreground mt-1">
                If your prediction is correct, you'll receive proportional rewards from the opposing side's stakes.
              </p>
            </div>
            
            <Button
              className="w-full bg-orange hover:bg-orange-light"
              disabled={!selectedPrediction || !amount || isNaN(Number(amount)) || isLoading}
              onClick={handleStake}
            >
              {isLoading ? "Processing..." : "Confirm Stake"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default StakeSheet;
