
import { Trade } from '@/components/trades/types/TradeTypes';

// Calculate time held analysis
export const calculateTimeHeldAnalysis = (tradesData: Trade[] | undefined) => {
  if (!tradesData || tradesData.length === 0) {
    return [
      { name: 'Intraday', count: 0, winRate: 0, netProfit: 0 },
      { name: 'Several Days', count: 0, winRate: 0, netProfit: 0 },
      { name: 'Week+', count: 0, winRate: 0, netProfit: 0 },
    ];
  }

  const categories = {
    'Intraday': { count: 0, wins: 0, netProfit: 0 },
    'Several Days': { count: 0, wins: 0, netProfit: 0 },
    'Week+': { count: 0, wins: 0, netProfit: 0 },
  };
  
  // Categorize trades by duration
  tradesData.forEach(trade => {
    if (!trade.entry_date || !trade.exit_date) return;
    
    const entryDate = new Date(trade.entry_date);
    const exitDate = new Date(trade.exit_date);
    const durationHours = (exitDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60);
    
    let category;
    if (durationHours <= 24) {
      category = 'Intraday';
    } else if (durationHours <= 24 * 7) {
      category = 'Several Days';
    } else {
      category = 'Week+';
    }
    
    categories[category].count++;
    categories[category].netProfit += (trade.profit_loss || 0);
    if ((trade.profit_loss || 0) > 0) categories[category].wins++;
  });
  
  // Format data for chart
  return Object.entries(categories).map(([name, stats]) => ({
    name,
    count: stats.count,
    winRate: stats.count > 0 ? Math.round((stats.wins / stats.count) * 100) : 0,
    netProfit: stats.netProfit
  }));
};
