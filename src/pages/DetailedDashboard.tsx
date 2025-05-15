
import React from 'react';
import Navigation from '@/components/layout/Navigation';
import DetailedDashboardLayout from '@/components/dashboard/DetailedDashboardLayout';

const DetailedDashboard = () => {
  return (
    <div className="min-h-screen bg-background text-foreground pb-16">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Detailed Analytics</h1>
        <DetailedDashboardLayout />
      </div>
      <Navigation />
    </div>
  );
};

export default DetailedDashboard;
