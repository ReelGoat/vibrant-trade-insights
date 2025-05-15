
import React from 'react';
import CircularChart from '@/components/dashboard/CircularCharts';
import TradingHealthTrend from '@/components/dashboard/TradingHealthTrend';
import PerformanceBars from '@/components/dashboard/PerformanceBars';
import TopPerforming from '@/components/dashboard/TopPerforming';
import TimeHeldAnalysis from '@/components/dashboard/TimeHeldAnalysis';
import { useDashboardData } from './hooks/useDashboardData';

const DetailedDashboardLayout = () => {
  const {
    isLoading,
    circularData,
    healthData,
    dayPerformance,
    timePerformance,
    topSetups,
    topSymbols,
    timeHeldCategories
  } = useDashboardData();

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading trade data...</p>
      </div>
    );
  }

  return (
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
  );
};

export default DetailedDashboardLayout;
