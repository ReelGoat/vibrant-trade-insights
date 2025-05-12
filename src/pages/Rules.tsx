
import React, { useState } from 'react';
import RulesCompliance from '@/components/rules/RulesCompliance';
import Navigation from '@/components/layout/Navigation';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

// Mock data for initial rules
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

const Rules = () => {
  const [rules, setRules] = useState(initialRules);

  const clearAll = () => {
    if (confirm('Are you sure you want to clear all rules?')) {
      setRules([]);
      toast({
        title: "Rules cleared",
        description: "All trading rules have been removed."
      });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Trading Rules</h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={clearAll}
          >
            Clear All
          </Button>
        </div>
        
        <div className="max-w-3xl mx-auto">
          <RulesCompliance rules={rules} />
          
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Rules Impact</h2>
            <p className="text-sm text-muted-foreground mb-8">
              Following your trading rules consistently has resulted in a
              <span className="text-profit font-medium"> 68% increase</span> in your win rate and a
              <span className="text-profit font-medium"> 42% increase</span> in your average profit per trade.
            </p>
          </div>
        </div>
      </div>
      
      <Navigation />
    </div>
  );
};

export default Rules;
