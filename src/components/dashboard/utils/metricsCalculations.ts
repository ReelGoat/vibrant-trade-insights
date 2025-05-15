
import { Trade } from '@/components/trades/types/TradeTypes';
import { format, parseISO, startOfWeek } from 'date-fns';
import { formatCurrency } from '@/lib/utils';

// Calculate circular chart data
export const calculateCircularData = (tradesData: Trade[] | undefined) => {
  if (!tradesData || tradesData.length === 0) {
    return {
      profits: { title: 'Total Profits', value: 0, total: 1, suffix: '$', colors: { positive: '#22c55e', negative: '#ef4444' } },
      winRate: { title: 'Win Rate', value: 0, total: 100, suffix: '%', colors: { positive: '#22c55e', negative: '#333333' } },
      rulesFollowed: { title: 'Rules Followed', value: 0, total: 100, suffix: '%', colors: { positive: '#22c55e', negative: '#333333' } },
      profitFactor: { title: 'Profit Factor', value: 0, total: 3, suffix: '', colors: { positive: '#22c55e', negative: '#333333' } },
    };
  }

  const totalPL = tradesData.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0);
  const winCount = tradesData.filter(trade => (trade.profit_loss || 0) > 0).length;
  const winRate = tradesData.length > 0 ? Math.round((winCount / tradesData.length) * 100) : 0;
  
  // Calculate rules followed percentage
  const rulesFollowedCount = tradesData.reduce((sum, trade) => {
    const followedRules = trade.rules_followed?.length || 0;
    const violatedRules = trade.rules_violated?.length || 0;
    const totalRules = followedRules + violatedRules;
    return sum + (totalRules > 0 ? followedRules / totalRules : 0);
  }, 0);
  
  const rulesFollowedPercentage = tradesData.length > 0 
    ? Math.round((rulesFollowedCount / tradesData.length) * 100) 
    : 0;
  
  // Calculate profit factor
  const winningTrades = tradesData.filter(trade => (trade.profit_loss || 0) > 0);
  const losingTrades = tradesData.filter(trade => (trade.profit_loss || 0) < 0);
  const totalProfit = winningTrades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0);
  const totalLoss = Math.abs(losingTrades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0));
  const profitFactor = totalLoss > 0 ? Number((totalProfit / totalLoss).toFixed(2)) : totalProfit > 0 ? 3 : 0;
  
  const maxValue = Math.max(Math.abs(totalPL), 1000); // Ensure we have a reasonable scale

  return {
    profits: { 
      title: 'Total Profits', 
      value: totalPL, 
      total: maxValue, 
      suffix: '$', 
      colors: { 
        positive: '#22c55e', 
        negative: '#ef4444' // Using a red color for negative values
      } 
    },
    winRate: { title: 'Win Rate', value: winRate, total: 100, suffix: '%', colors: { positive: '#22c55e', negative: '#333333' } },
    rulesFollowed: { title: 'Rules Followed', value: rulesFollowedPercentage, total: 100, suffix: '%', colors: { positive: '#22c55e', negative: '#333333' } },
    profitFactor: { title: 'Profit Factor', value: Math.min(profitFactor, 3), total: 3, suffix: '', colors: { positive: '#22c55e', negative: '#333333' } },
  };
};

// Calculate trading health trend
export const calculateHealthTrend = (tradesData: Trade[] | undefined) => {
  if (!tradesData || tradesData.length === 0) {
    return Array(7).fill(0).map((_, i) => ({
      date: format(new Date(Date.now() - i * 5 * 24 * 60 * 60 * 1000), 'MMM d'),
      value: 0
    })).reverse();
  }

  // Group trades by week
  const weeks: { [key: string]: Trade[] } = {};
  
  tradesData.forEach(trade => {
    if (!trade.entry_date) return;
    
    const date = parseISO(trade.entry_date);
    const weekStartDate = startOfWeek(date);
    const weekKey = format(weekStartDate, 'yyyy-MM-dd');
    
    if (!weeks[weekKey]) {
      weeks[weekKey] = [];
    }
    
    weeks[weekKey].push(trade);
  });

  // Calculate health value for each week (based on win rate and profit factor)
  return Object.keys(weeks)
    .sort()
    .slice(-7)
    .map(weekKey => {
      const weekTrades = weeks[weekKey];
      const winRate = weekTrades.filter(t => (t.profit_loss || 0) > 0).length / weekTrades.length;
      
      const winningTrades = weekTrades.filter(t => (t.profit_loss || 0) > 0);
      const losingTrades = weekTrades.filter(t => (t.profit_loss || 0) < 0);
      
      const totalWins = winningTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
      const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0));
      
      const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 3 : 0;
      
      // Health value formula (adjust as needed)
      const healthValue = (winRate * 2 + Math.min(profitFactor, 3) / 3) / 3 * 3;
      
      return {
        date: format(parseISO(weekKey), 'MMM d'),
        value: parseFloat(healthValue.toFixed(1))
      };
    });
};
