import React, { useState, useEffect } from 'react';
import Navigation from '@/components/layout/Navigation';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowUp, ArrowDown } from 'lucide-react';
import type { Trade } from '@/components/trades/types/TradeTypes';

const History = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchTradeHistory();
  }, []);

  const fetchTradeHistory = async () => {
    try {
      setLoading(true);
      
      // Fetch trades with setup information
      const { data, error } = await supabase
        .from('trades')
        .select(`
          *,
          setup:trading_setups(id, name)
        `)
        .order('entry_date', { ascending: false });
      
      if (error) throw error;
      
      // Process the data to ensure proper typing
      const typedTrades = (data || []).map(trade => ({
        ...trade,
        direction: trade.direction as 'long' | 'short'
      }));
      
      setTrades(typedTrades as Trade[]);
    } catch (error: any) {
      console.error('Error fetching trade history:', error.message);
      toast({
        title: "Error",
        description: "Failed to load trade history.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderProfitLoss = (value: number | null) => {
    if (value === null) return '-';
    
    const isProfit = value >= 0;
    const formattedValue = `$${Math.abs(value).toFixed(2)}`;
    
    return (
      <span className={isProfit ? 'text-profit' : 'text-loss'}>
        {isProfit ? '+' : '-'}{formattedValue}
      </span>
    );
  };

  // Calculate monthly performance data
  const monthlyPerformance = trades.reduce((acc, trade) => {
    const date = new Date(trade.entry_date);
    const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
    
    if (!acc[monthYear]) {
      acc[monthYear] = {
        profit: 0,
        tradesCount: 0,
        winCount: 0
      };
    }
    
    acc[monthYear].tradesCount += 1;
    acc[monthYear].profit += trade.profit_loss || 0;
    
    if ((trade.profit_loss || 0) > 0) {
      acc[monthYear].winCount += 1;
    }
    
    return acc;
  }, {} as Record<string, { profit: number; tradesCount: number; winCount: number }>);

  const sortedMonths = Object.keys(monthlyPerformance).sort((a, b) => {
    // Convert month names to date objects for proper sorting
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Trading History</h1>
        
        {loading ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Loading trade history...</p>
          </div>
        ) : trades.length === 0 ? (
          <Card>
            <div className="py-16 text-center">
              <p className="text-muted-foreground">No trade history found. Start logging trades to see your history.</p>
            </div>
          </Card>
        ) : (
          <>
            {/* Monthly Summary */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Monthly Performance</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Month</TableHead>
                      <TableHead>Net P&L</TableHead>
                      <TableHead>Trades</TableHead>
                      <TableHead>Win Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedMonths.map((month) => {
                      const data = monthlyPerformance[month];
                      const winRate = data.tradesCount > 0 
                        ? (data.winCount / data.tradesCount) * 100 
                        : 0;
                      
                      return (
                        <TableRow key={month}>
                          <TableCell className="font-medium">{month}</TableCell>
                          <TableCell className={data.profit >= 0 ? 'text-profit' : 'text-loss'}>
                            {data.profit >= 0 ? '+' : '-'}${Math.abs(data.profit).toFixed(2)}
                          </TableCell>
                          <TableCell>{data.tradesCount}</TableCell>
                          <TableCell>{winRate.toFixed(1)}%</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            {/* Trade History */}
            <h2 className="text-xl font-semibold mb-4">All Trades</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Direction</TableHead>
                    <TableHead>Setup</TableHead>
                    <TableHead>Entry/Exit</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>P&L</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell>
                        <div>{new Date(trade.entry_date).toLocaleDateString()}</div>
                        {trade.exit_date && (
                          <div className="text-xs text-muted-foreground">
                            to {new Date(trade.exit_date).toLocaleDateString()}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{trade.symbol}</TableCell>
                      <TableCell>
                        <span className={`flex items-center ${trade.direction === 'long' ? 'text-profit' : 'text-loss'}`}>
                          {trade.direction === 'long' ? (
                            <ArrowUp className="mr-1 h-4 w-4" />
                          ) : (
                            <ArrowDown className="mr-1 h-4 w-4" />
                          )}
                          {trade.direction.charAt(0).toUpperCase() + trade.direction.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        {trade.setup && 'name' in trade.setup ? trade.setup.name : '-'}
                      </TableCell>
                      <TableCell>
                        <div>${trade.entry_price}</div>
                        {trade.exit_price && (
                          <div className="text-xs text-muted-foreground">${trade.exit_price}</div>
                        )}
                      </TableCell>
                      <TableCell>{trade.quantity}</TableCell>
                      <TableCell>{renderProfitLoss(trade.profit_loss)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>
      
      <Navigation />
    </div>
  );
};

export default History;
