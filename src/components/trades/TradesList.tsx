import React, { useState, useEffect } from 'react';
import { Plus, FileEdit, Trash2, ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import TradeDialog from './TradeDialog';
import type { TradingSetup } from '../setups/SetupsList';

export interface Trade {
  id: string;
  symbol: string;
  setup_id: string | null;
  entry_date: string;
  exit_date: string | null;
  entry_price: number;
  exit_price: number | null;
  quantity: number;
  direction: 'long' | 'short';
  profit_loss: number | null;
  notes: string | null;
  screenshot_url: string | null;
  rules_followed: string[] | null;
  rules_violated: string[] | null;
  created_at: string;
  updated_at: string;
  setup?: TradingSetup;
}

const TradesList = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [setups, setSetups] = useState<TradingSetup[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentTrade, setCurrentTrade] = useState<Trade | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTradesAndSetups();
  }, []);

  const fetchTradesAndSetups = async () => {
    try {
      setLoading(true);
      
      // Fetch setups first
      const { data: setupsData, error: setupsError } = await supabase
        .from('trading_setups')
        .select('*')
        .order('name');
      
      if (setupsError) throw setupsError;
      setSetups(setupsData || []);
      
      // Fetch trades
      const { data: tradesData, error: tradesError } = await supabase
        .from('trades')
        .select('*')
        .order('entry_date', { ascending: false });
      
      if (tradesError) throw tradesError;
      
      // Map setup details to trades and properly cast the direction
      const tradesWithSetups = tradesData?.map(trade => {
        const setup = setupsData?.find(s => s.id === trade.setup_id) || null;
        return {
          ...trade,
          // Ensure direction is typed correctly
          direction: trade.direction as 'long' | 'short',
          setup: setup
        };
      }) || [];
      
      setTrades(tradesWithSetups as Trade[]);
    } catch (error: any) {
      console.error('Error fetching data:', error.message);
      toast({
        title: "Error",
        description: "Failed to load trades data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (trade: Trade | null = null) => {
    setCurrentTrade(trade);
    setDialogOpen(true);
  };

  const handleCloseDialog = (refresh: boolean = false) => {
    setDialogOpen(false);
    if (refresh) {
      fetchTradesAndSetups();
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this trade?')) {
      try {
        const { error } = await supabase
          .from('trades')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Trade deleted successfully."
        });
        
        fetchTradesAndSetups();
      } catch (error: any) {
        console.error('Error deleting trade:', error.message);
        toast({
          title: "Error",
          description: "Failed to delete trade.",
          variant: "destructive"
        });
      }
    }
  };
  
  const calculateTotalPL = (): number => {
    return trades.reduce((sum, trade) => {
      return sum + (trade.profit_loss || 0);
    }, 0);
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Trading Journal</h2>
        <Button onClick={() => handleOpenDialog()} className="flex items-center gap-1">
          <Plus size={16} />
          <span>New Trade</span>
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-4 mb-4">
        <Card className="p-4 w-full sm:w-auto flex-1">
          <div className="text-sm text-muted-foreground">Total Trades</div>
          <div className="text-2xl font-bold">{trades.length}</div>
        </Card>
        <Card className="p-4 w-full sm:w-auto flex-1">
          <div className="text-sm text-muted-foreground">Total P&L</div>
          <div className={`text-2xl font-bold ${calculateTotalPL() >= 0 ? 'text-profit' : 'text-loss'}`}>
            {calculateTotalPL() >= 0 ? '+' : '-'}${Math.abs(calculateTotalPL()).toFixed(2)}
          </div>
        </Card>
        <Card className="p-4 w-full sm:w-auto flex-1">
          <div className="text-sm text-muted-foreground">Win Rate</div>
          <div className="text-2xl font-bold">
            {trades.length > 0 
              ? `${((trades.filter(t => (t.profit_loss || 0) > 0).length / trades.length) * 100).toFixed(1)}%` 
              : '0%'}
          </div>
        </Card>
      </div>

      {loading ? (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">Loading trades...</p>
        </div>
      ) : trades.length === 0 ? (
        <Card>
          <div className="py-16 text-center">
            <p className="text-muted-foreground mb-4">You haven't logged any trades yet.</p>
            <Button onClick={() => handleOpenDialog()}>Log Your First Trade</Button>
          </div>
        </Card>
      ) : (
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
                <TableHead>Rules</TableHead>
                <TableHead className="text-right">Actions</TableHead>
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
                  <TableCell>{trade.setup?.name || '-'}</TableCell>
                  <TableCell>
                    <div>${trade.entry_price}</div>
                    {trade.exit_price && (
                      <div className="text-xs text-muted-foreground">${trade.exit_price}</div>
                    )}
                  </TableCell>
                  <TableCell>{trade.quantity}</TableCell>
                  <TableCell>{renderProfitLoss(trade.profit_loss)}</TableCell>
                  <TableCell>
                    {/* Rules followed/violated count */}
                    <div className="text-xs">
                      {trade.rules_followed?.length ? (
                        <span className="text-profit block">
                          {trade.rules_followed.length} followed
                        </span>
                      ) : null}
                      {trade.rules_violated?.length ? (
                        <span className="text-loss block">
                          {trade.rules_violated.length} violated
                        </span>
                      ) : null}
                      {(!trade.rules_followed?.length && !trade.rules_violated?.length) ? '-' : null}
                    </div>
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    {trade.screenshot_url && (
                      <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                        <a href={trade.screenshot_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink size={16} />
                        </a>
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleOpenDialog(trade)}
                    >
                      <FileEdit size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive/80" 
                      onClick={() => handleDelete(trade.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <TradeDialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        trade={currentTrade} 
        setups={setups}
      />
    </div>
  );
};

export default TradesList;
