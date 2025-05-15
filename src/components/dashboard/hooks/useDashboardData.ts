
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Trade } from '@/components/trades/types/TradeTypes';
import { calculateCircularData, calculateHealthTrend } from '../utils/metricsCalculations';
import { calculateDayPerformance, calculateTimePerformance, calculateTopSetups, calculateTopSymbols } from '../utils/performanceCalculations';
import { calculateTimeHeldAnalysis } from '../utils/timeAnalysisCalculations';

export const useDashboardData = () => {
  // Fetch trades data
  const { data: tradesData, isLoading } = useQuery({
    queryKey: ['trades'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trades')
        .select('*, setup:setup_id(*)')
        .order('entry_date', { ascending: false });
      
      if (error) throw error;
      
      return data as Trade[];
    },
  });

  // Process all the dashboard data
  const circularData = calculateCircularData(tradesData);
  const healthData = calculateHealthTrend(tradesData);
  const dayPerformance = calculateDayPerformance(tradesData);
  const timePerformance = calculateTimePerformance(tradesData);
  const topSetups = calculateTopSetups(tradesData);
  const topSymbols = calculateTopSymbols(tradesData);
  const timeHeldCategories = calculateTimeHeldAnalysis(tradesData);

  return {
    isLoading,
    circularData,
    healthData,
    dayPerformance,
    timePerformance,
    topSetups,
    topSymbols,
    timeHeldCategories
  };
};
