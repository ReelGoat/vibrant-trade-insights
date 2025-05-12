
import React from 'react';
import Navigation from '@/components/layout/Navigation';
import TradesList from '@/components/trades/TradesList';

const Trades = () => {
  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Trade Journal</h1>
        
        <TradesList />
      </div>
      
      <Navigation />
    </div>
  );
};

export default Trades;
