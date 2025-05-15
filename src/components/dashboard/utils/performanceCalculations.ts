
import { Trade } from '@/components/trades/types/TradeTypes';

// Calculate performance by day
export const calculateDayPerformance = (tradesData: Trade[] | undefined) => {
  if (!tradesData || tradesData.length === 0) {
    return [
      { name: 'Mon', profit: 0, winRate: 0 },
      { name: 'Tue', profit: 0, winRate: 0 },
      { name: 'Wed', profit: 0, winRate: 0 },
      { name: 'Thu', profit: 0, winRate: 0 },
      { name: 'Fri', profit: 0, winRate: 0 },
    ];
  }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayStats: { [key: string]: { profit: number, wins: number, total: number } } = {};
  
  // Initialize all days
  days.forEach(day => {
    dayStats[day] = { profit: 0, wins: 0, total: 0 };
  });
  
  // Collect stats by day
  tradesData.forEach(trade => {
    if (!trade.entry_date) return;
    
    const date = new Date(trade.entry_date);
    const day = days[date.getDay()];
    
    dayStats[day].profit += (trade.profit_loss || 0);
    if ((trade.profit_loss || 0) > 0) dayStats[day].wins++;
    dayStats[day].total++;
  });
  
  // Format data for chart
  return Object.keys(dayStats)
    .filter(day => day !== 'Sun' && day !== 'Sat') // Filter out weekend days
    .map(day => ({
      name: day,
      profit: Math.round(dayStats[day].total > 0 ? dayStats[day].profit / dayStats[day].total : 0),
      winRate: Math.round(dayStats[day].total > 0 ? (dayStats[day].wins / dayStats[day].total) * 100 : 0)
    }));
};

// Calculate performance by time of day
export const calculateTimePerformance = (tradesData: Trade[] | undefined) => {
  if (!tradesData || tradesData.length === 0) {
    return [
      { name: '6AM', profit: 0, winRate: 0 },
      { name: '9AM', profit: 0, winRate: 0 },
      { name: '12PM', profit: 0, winRate: 0 },
      { name: '3PM', profit: 0, winRate: 0 },
      { name: '6PM', profit: 0, winRate: 0 },
    ];
  }

  const timeSlots = ['6AM', '9AM', '12PM', '3PM', '6PM'];
  const timeStats: { [key: string]: { profit: number, wins: number, total: number } } = {};
  
  // Initialize all time slots
  timeSlots.forEach(slot => {
    timeStats[slot] = { profit: 0, wins: 0, total: 0 };
  });
  
  // Map hours to time slots
  const getTimeSlot = (hour: number): string => {
    if (hour < 7) return '6AM';
    if (hour < 10) return '9AM';
    if (hour < 13) return '12PM';
    if (hour < 16) return '3PM';
    return '6PM';
  };
  
  // Collect stats by time
  tradesData.forEach(trade => {
    if (!trade.entry_date) return;
    
    const date = new Date(trade.entry_date);
    const slot = getTimeSlot(date.getHours());
    
    timeStats[slot].profit += (trade.profit_loss || 0);
    if ((trade.profit_loss || 0) > 0) timeStats[slot].wins++;
    timeStats[slot].total++;
  });
  
  // Format data for chart
  return timeSlots.map(slot => ({
    name: slot,
    profit: Math.round(timeStats[slot].total > 0 ? timeStats[slot].profit / timeStats[slot].total : 0),
    winRate: Math.round(timeStats[slot].total > 0 ? (timeStats[slot].wins / timeStats[slot].total) * 100 : 0)
  }));
};

// Calculate top performing setups
export const calculateTopSetups = (tradesData: Trade[] | undefined) => {
  if (!tradesData || tradesData.length === 0) {
    return [
      { name: 'No Data', value: 0 },
    ];
  }

  const setupStats: { [key: string]: { total: number, profit: number } } = {};
  
  // Collect stats by setup
  tradesData.forEach(trade => {
    const setupName = trade.setup?.name || 'Undefined';
    
    if (!setupStats[setupName]) {
      setupStats[setupName] = { total: 0, profit: 0 };
    }
    
    setupStats[setupName].profit += (trade.profit_loss || 0);
    setupStats[setupName].total++;
  });
  
  // Format and sort data for chart
  return Object.entries(setupStats)
    .map(([name, stats]) => ({
      name,
      value: Math.round(stats.profit)
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4); // Take top 4
};

// Calculate top performing symbols
export const calculateTopSymbols = (tradesData: Trade[] | undefined) => {
  if (!tradesData || tradesData.length === 0) {
    return [
      { name: 'No Data', value: 0 },
    ];
  }

  const symbolStats: { [key: string]: number } = {};
  
  // Collect profits by symbol
  tradesData.forEach(trade => {
    const symbol = trade.symbol;
    
    if (!symbolStats[symbol]) {
      symbolStats[symbol] = 0;
    }
    
    symbolStats[symbol] += (trade.profit_loss || 0);
  });
  
  // Format and sort data for chart
  return Object.entries(symbolStats)
    .map(([name, value]) => ({
      name,
      value: Math.round(value)
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4); // Take top 4
};
