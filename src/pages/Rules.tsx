
import React, { useState, useEffect } from 'react';
import RulesCompliance from '@/components/rules/RulesCompliance';
import Navigation from '@/components/layout/Navigation';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

// Define the Rule interface
interface Rule {
  id: string;
  name: string;
  followedCount: number;
  notFollowedCount: number;
  impact: number;
}

const Rules = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load rules from localStorage on mount
  useEffect(() => {
    const loadRules = () => {
      const savedRules = localStorage.getItem('tradingRules');
      if (savedRules) {
        try {
          setRules(JSON.parse(savedRules));
        } catch (error) {
          console.error('Error parsing saved rules:', error);
          setRules([]);
        }
      } else {
        // Initialize with sample rules if none exist
        const initialRules = [
          {
            id: '1',
            name: 'Respect Stop Loss',
            followedCount: 42,
            notFollowedCount: 5,
            impact: -1200,
          },
          {
            id: '2',
            name: 'Only Trade With Trend',
            followedCount: 38,
            notFollowedCount: 9,
            impact: 2500,
          },
          {
            id: '3',
            name: 'No Trading First 30min',
            followedCount: 35,
            notFollowedCount: 12,
            impact: 1800,
          },
          {
            id: '4',
            name: 'Max 2% Risk Per Trade',
            followedCount: 47,
            notFollowedCount: 0,
            impact: 3200,
          },
        ];
        setRules(initialRules);
        localStorage.setItem('tradingRules', JSON.stringify(initialRules));
      }
      setIsLoading(false);
    };

    loadRules();
  }, []);

  // Save rules to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('tradingRules', JSON.stringify(rules));
    }
  }, [rules, isLoading]);

  const openConfirmDialog = () => {
    setConfirmDialogOpen(true);
  };

  const clearAll = () => {
    setRules([]);
    setConfirmDialogOpen(false);
    toast({
      title: "Rules cleared",
      description: "All trading rules have been removed."
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Trading Rules</h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={openConfirmDialog}
          >
            Clear All
          </Button>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <RulesCompliance rules={rules} onRulesChange={setRules} />
          
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Rules Impact</h2>
            {rules.length > 0 ? (
              <p className="text-sm text-muted-foreground mb-8">
                Following your trading rules consistently has resulted in a
                <span className="text-profit font-medium"> 68% increase</span> in your win rate and a
                <span className="text-profit font-medium"> 42% increase</span> in your average profit per trade.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground mb-8">
                Add some trading rules to track their impact on your performance.
              </p>
            )}
          </div>
        </div>
      </div>
      
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Clear All Rules</DialogTitle>
            <DialogDescription>
              This will remove all your trading rules. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={clearAll}>Clear All</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Navigation />
    </div>
  );
};

export default Rules;
