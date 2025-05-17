import React, { useState, useEffect, useMemo } from 'react';
import RulesCompliance from '@/components/rules/RulesCompliance';
import Navigation from '@/components/layout/Navigation';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { SidebarInset } from '@/components/ui/sidebar';
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/lib/supabase";

// Define the Rule interface
interface Rule {
  id: string;
  name: string;
  followedCount: number;
  notFollowedCount: number;
  impact: number;
  is_active: boolean;
  category: string;
}

const Rules = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('trading_rules')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setRules(data || []);
    } catch (error: any) {
      console.error('Error fetching rules:', error.message);
      toast({
        title: "Error",
        description: "Failed to load trading rules.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Memoize rule statistics calculation
  const ruleStats = useMemo(() => {
    return rules.reduce((acc, rule) => {
      acc.totalRules++;
      if (rule.is_active) acc.activeRules++;
      if (rule.category === 'entry') acc.entryRules++;
      if (rule.category === 'exit') acc.exitRules++;
      if (rule.category === 'risk') acc.riskRules++;
      return acc;
    }, {
      totalRules: 0,
      activeRules: 0,
      entryRules: 0,
      exitRules: 0,
      riskRules: 0
    });
  }, [rules]);

  // Memoize rule categories calculation
  const ruleCategories = useMemo(() => {
    return rules.reduce((acc, rule) => {
      if (!acc[rule.category]) {
        acc[rule.category] = 0;
      }
      acc[rule.category]++;
      return acc;
    }, {} as Record<string, number>);
  }, [rules]);

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
    <div className="flex min-h-screen bg-background text-foreground">
      <Navigation />
      <SidebarInset>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-6">Trading Rules</h1>
          <div className="flex items-center justify-between mb-6">
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
      </SidebarInset>
      
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
    </div>
  );
};

export default Rules;
