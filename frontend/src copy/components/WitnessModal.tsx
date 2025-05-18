
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useUIStore } from '@/store/ui';
import { useToast } from '@/hooks/use-toast';
import { submitWitnessStatement } from '@/lib/api';

const WitnessModal = () => {
  const { witnessModal, closeWitnessModal } = useUIStore();
  const { toast } = useToast();
  const [statement, setStatement] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!witnessModal.newsId || !statement.trim()) return;
    
    try {
      setIsSubmitting(true);
      
      await submitWitnessStatement({
        newsId: witnessModal.newsId,
        statement: statement.trim()
      });
      
      toast({
        title: "Witness statement submitted",
        description: "Your testimony has been recorded. Thank you for contributing.",
      });
      
      closeWitnessModal();
    } catch (error) {
      console.error("Error submitting witness statement:", error);
      toast({
        title: "Failed to submit statement",
        description: "There was an error processing your testimony. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={witnessModal.isOpen} onOpenChange={(open) => !open && closeWitnessModal()}>
      <DialogContent className="sm:max-w-md bg-navy-light border-orange">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Submit Witness Testimony
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Share your firsthand knowledge about this news item. Your testimony will be recorded on the blockchain.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-white">Your statement</h3>
            <Textarea 
              placeholder="Describe what you know about this news item..."
              className="min-h-[150px] bg-navy border-muted"
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Only submit factual information that you can personally verify. False testimony may affect your reputation score.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={closeWitnessModal}
          >
            Cancel
          </Button>
          <Button 
            className="bg-orange hover:bg-orange-light"
            onClick={handleSubmit}
            disabled={!statement.trim() || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Testimony"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WitnessModal;
