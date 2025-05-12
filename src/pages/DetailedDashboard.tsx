
import React from 'react';
import Navigation from '@/components/layout/Navigation';
import CircularChart from '@/components/dashboard/CircularCharts';
import TradingHealthTrend from '@/components/dashboard/TradingHealthTrend';
import PerformanceBars from '@/components/dashboard/PerformanceBars';
import TopPerforming from '@/components/dashboard/TopPerforming';
import TimeHeldAnalysis from '@/components/dashboard/TimeHeldAnalysis';

// Mock data (same as Index.tsx for consistency)
const mockCircularData = {
  profits: { title: 'Total Profits', value: 15000, total: 20000, suffix: '%', colors: { positive: '#22c55e', negative: '#333333' } },
  winRate: { title: 'Win Rate', value: 67, total: 100, suffix: '%', colors: { positive: '#22c55e', negative: '#333333' } },
  rulesFollowed: { title: 'Rules Followed', value: 85, total: 100, suffix: '%', colors: { positive: '#22c55e', negative: '#333333' } },
  profitFactor: { title: 'Profit Factor', value: 2.4, total: 3, suffix: '', colors: { positive: '#22c55e', negative: '#333333' } },
};

const mockHealthData = [
  { date: 'May 1', value: 1.2 },
  { date: 'May 5', value: 1.8 },
  { date: 'May 10', value: 1.5 },
  { date: 'May 15', value: 2.2 },
  { date: 'May 20', value: 1.9 },
  { date: 'May 25', value: 2.5 },
  { date: 'May 30', value: 3.0 },
];

const mockDayPerformance = [
  { name: 'Mon', profit: 450, winRate: 65 },
  { name: 'Tue', profit: 320, winRate: 58 },
  { name: 'Wed', profit: 580, winRate: 72 },
  { name: 'Thu', profit: 410, winRate: 63 },
  { name: 'Fri', profit: 490, winRate: 68 },
];

const mockTimePerformance = [
  { name: '6AM', profit: 180, winRate: 55 },
  { name: '9AM', profit: 420, winRate: 68 },
  { name: '12PM', profit: 350, winRate: 62 },
  { name: '3PM', profit: 290, winRate: 57 },
  { name: '6PM', profit: 210, winRate: 52 },
];

const mockTopSetups = [
  { name: 'Order Block', value: 4200 },
  { name: 'Breakout', value: 3500 },
  { name: 'Reversal', value: 2800 },
  { name: 'Pullback', value: 1900 },
];

const mockTopSymbols = [
  { name: 'SPY', value: 3800 },
  { name: 'AAPL', value: 3200 },
  { name: 'MSFT', value: 2600 },
  { name: 'TSLA', value: 1900 },
];

const mockTimeHeld = [
  { name: 'Intraday', count: 45, winRate: 72, netProfit: 8500 },
  { name: 'Several Days', count: 28, winRate: 64, netProfit: 5200 },
  { name: 'Week+', count: 12, winRate: 58, netProfit: -1250 },
];

const DetailedDashboard = () => {
  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Detailed Analytics</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <CircularChart data={mockCircularData.profits} />
          <CircularChart data={mockCircularData.winRate} />
          <CircularChart data={mockCircularData.rulesFollowed} />
          <CircularChart data={mockCircularData.profitFactor} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <TradingHealthTrend 
            data={mockHealthData} 
            thresholds={{ outperforming: 2.5, good: 2.0, caution: 1.5 }} 
          />
          <PerformanceBars 
            title="Performance by Day" 
            data={mockDayPerformance} 
            dataKey="name" 
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <PerformanceBars 
            title="Performance by Time" 
            data={mockTimePerformance} 
            dataKey="name" 
          />
          <div className="grid grid-cols-1 gap-6">
            <TopPerforming title="Top Performing Setups" data={mockTopSetups} />
            <TopPerforming title="Top Performing Symbols" data={mockTopSymbols} />
          </div>
        </div>
        
        <div className="mb-8">
          <TimeHeldAnalysis categories={mockTimeHeld} />
        </div>
      </div>
      
      <Navigation />
    </div>
  );
};

export default DetailedDashboard;
