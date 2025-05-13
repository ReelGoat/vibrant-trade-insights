
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Trade } from '../types/TradeTypes';
import type { TradingSetup } from '@/components/setups/SetupsList';

export function useTradesData() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [setups, setSetups] = useState<TradingSetup[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

  useEffect(() => {
    fetchTradesAndSetups();
  }, []);

  return {
    trades,
    setups,
    loading,
    fetchTradesAndSetups,
    handleDelete
  };
}
