import React from 'react';
import Navigation from '@/components/layout/Navigation';
import { SidebarInset } from '@/components/ui/sidebar';
import SetupsList from '@/components/setups/SetupsList';

const Setups = () => {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Navigation />
      <SidebarInset>
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold mb-6">Trading Setups</h1>
          <SetupsList />
        </div>
      </SidebarInset>
    </div>
  );
};

export default Setups;
