
import React from 'react';
import { Card } from '@/components/ui/card';
import type { Trade } from '../types/TradeTypes';

interface TradeStatsProps {
  trades: Trade[];
}

const TradeStats: React.FC<TradeStatsProps> = ({ trades }) => {
  const calculateTotalPL = (): number => {
    return trades.reduce((sum, trade) => {
      return sum + (trade.profit_loss || 0);
    }, 0);
  };

  const formatCurrency = (value: number): string => {
    return Math.abs(value).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const totalPL = calculateTotalPL();
  const winningTrades = trades.filter(trade => (trade.profit_loss || 0) > 0);
  const winRate = trades.length > 0 
    ? ((winningTrades.length / trades.length) * 100) 
    : 0;

  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <Card className="p-4 w-full sm:w-auto flex-1">
        <div className="text-sm text-muted-foreground">Total Trades</div>
        <div className="text-2xl font-bold">{trades.length}</div>
      </Card>
      <Card className="p-4 w-full sm:w-auto flex-1">
        <div className="text-sm text-muted-foreground">Total P&L</div>
        <div className={`text-2xl font-bold ${totalPL >= 0 ? 'text-profit' : 'text-loss'}`}>
          {totalPL >= 0 ? '+' : '-'}${formatCurrency(totalPL)}
        </div>
      </Card>
      <Card className="p-4 w-full sm:w-auto flex-1">
        <div className="text-sm text-muted-foreground">Win Rate</div>
        <div className="text-2xl font-bold">
          {trades.length > 0 
            ? `${winRate.toFixed(1)}%` 
            : '0%'}
        </div>
      </Card>
    </div>
  );
};

export default TradeStats;
