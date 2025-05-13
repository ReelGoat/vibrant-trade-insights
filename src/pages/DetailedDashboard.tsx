
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Navigation from '@/components/layout/Navigation';
import CircularChart from '@/components/dashboard/CircularCharts';
import TradingHealthTrend from '@/components/dashboard/TradingHealthTrend';
import PerformanceBars from '@/components/dashboard/PerformanceBars';
import TopPerforming from '@/components/dashboard/TopPerforming';
import TimeHeldAnalysis from '@/components/dashboard/TimeHeldAnalysis';
import { Trade } from '@/components/trades/types/TradeTypes';
import { format, parseISO, startOfWeek } from 'date-fns';

const DetailedDashboard = () => {
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

  // Calculate circular chart data
  const calculateCircularData = () => {
    if (!tradesData || tradesData.length === 0) {
      return {
        profits: { title: 'Total Profits', value: 0, total: 1, suffix: '%', colors: { positive: '#22c55e', negative: '#333333' } },
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
    
    return {
      profits: { title: 'Total Profits', value: totalPL, total: Math.max(Math.abs(totalPL), 1000), suffix: '$', colors: { positive: '#22c55e', negative: '#333333' } },
      winRate: { title: 'Win Rate', value: winRate, total: 100, suffix: '%', colors: { positive: '#22c55e', negative: '#333333' } },
      rulesFollowed: { title: 'Rules Followed', value: rulesFollowedPercentage, total: 100, suffix: '%', colors: { positive: '#22c55e', negative: '#333333' } },
      profitFactor: { title: 'Profit Factor', value: Math.min(profitFactor, 3), total: 3, suffix: '', colors: { positive: '#22c55e', negative: '#333333' } },
    };
  };

  // Calculate trading health trend
  const calculateHealthTrend = () => {
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

  // Calculate performance by day
  const calculateDayPerformance = () => {
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
  const calculateTimePerformance = () => {
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
  const calculateTopSetups = () => {
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
  const calculateTopSymbols = () => {
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

  // Calculate time held analysis
  const calculateTimeHeldAnalysis = () => {
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
  
  const circularData = calculateCircularData();
  const healthData = calculateHealthTrend();
  const dayPerformance = calculateDayPerformance();
  const timePerformance = calculateTimePerformance();
  const topSetups = calculateTopSetups();
  const topSymbols = calculateTopSymbols();
  const timeHeldCategories = calculateTimeHeldAnalysis();

  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Detailed Analytics</h1>
        
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading trade data...</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <CircularChart data={circularData.profits} />
              <CircularChart data={circularData.winRate} />
              <CircularChart data={circularData.rulesFollowed} />
              <CircularChart data={circularData.profitFactor} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <TradingHealthTrend 
                data={healthData} 
                thresholds={{ outperforming: 2.5, good: 2.0, caution: 1.5 }} 
              />
              <PerformanceBars 
                title="Performance by Day" 
                data={dayPerformance} 
                dataKey="name" 
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <PerformanceBars 
                title="Performance by Time" 
                data={timePerformance} 
                dataKey="name" 
              />
              <div className="grid grid-cols-1 gap-6">
                <TopPerforming title="Top Performing Setups" data={topSetups} />
                <TopPerforming title="Top Performing Symbols" data={topSymbols} />
              </div>
            </div>
            
            <div className="mb-8">
              <TimeHeldAnalysis categories={timeHeldCategories} />
            </div>
          </>
        )}
      </div>
      
      <Navigation />
    </div>
  );
};

export default DetailedDashboard;
