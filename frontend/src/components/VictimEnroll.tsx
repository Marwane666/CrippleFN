
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
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload } from 'lucide-react';

const VictimEnroll = () => {
  const { victimEnroll, closeVictimEnroll } = useUIStore();
  const { toast } = useToast();
  const [statement, setStatement] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!victimEnroll.newsId || !statement.trim() || !file) return;
    
    try {
      setIsSubmitting(true);
      
      // Mock implementation - this would normally call the API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Victim enrollment submitted",
        description: "Your claim has been recorded and is being processed securely.",
      });
      
      closeVictimEnroll();
    } catch (error) {
      console.error("Error submitting victim claim:", error);
      toast({
        title: "Failed to submit claim",
        description: "There was an error processing your enrollment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={victimEnroll.isOpen} onOpenChange={(open) => !open && closeVictimEnroll()}>
      <DialogContent className="sm:max-w-md bg-navy-light border-orange">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-white">
            Enroll as Victim
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Submit evidence that you were directly harmed by this fake news. Your identity will be encrypted.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="id-document" className="text-sm font-medium text-white">
              Upload ID document
            </Label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="id-document"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-navy border-muted hover:bg-navy-light"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg className="w-8 h-8 mb-4 text-muted-foreground" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                  </svg>
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF, PNG, JPG or ID file (MAX. 10MB)
                  </p>
                </div>
                <Input 
                  id="id-document" 
                  type="file" 
                  accept=".pdf,.png,.jpg,.jpeg" 
                  className="hidden" 
                  onChange={handleFileChange}
                />
              </label>
            </div>
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected file: {file.name}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="statement" className="text-sm font-medium text-white">
              Describe how you were harmed
            </Label>
            <Textarea 
              id="statement"
              placeholder="Explain how this news item directly affected you..."
              className="min-h-[150px] bg-navy border-muted"
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
            />
          </div>
          
          <div className="rounded-md bg-navy p-4">
            <h3 className="font-medium text-sm text-white">Privacy Notice</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Your ID document will be encrypted and only accessible to verified legal authorities if the case proceeds to court.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={closeVictimEnroll}
          >
            Cancel
          </Button>
          <Button 
            className="bg-orange hover:bg-orange-light"
            onClick={handleSubmit}
            disabled={!statement.trim() || !file || isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Claim"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VictimEnroll;
