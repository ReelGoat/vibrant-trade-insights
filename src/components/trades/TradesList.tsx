
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTradesData } from './hooks/useTradesData';
import TradeDialog from './TradeDialog';
import TradeStats from './components/TradeStats';
import TradeTable from './components/TradeTable';
import EmptyTradesState from './components/EmptyTradesState';
import type { Trade } from './types/TradeTypes';

const TradesList = () => {
  const { trades, setups, loading, fetchTradesAndSetups, handleDelete } = useTradesData();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentTrade, setCurrentTrade] = useState<Trade | null>(null);

  const handleOpenDialog = (trade: Trade | null = null) => {
    setCurrentTrade(trade);
    setDialogOpen(true);
  };

  const handleCloseDialog = (refresh: boolean = false) => {
    setDialogOpen(false);
    if (refresh) {
      fetchTradesAndSetups();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Trading Journal</h2>
        <Button onClick={() => handleOpenDialog()} className="flex items-center gap-1">
          <Plus size={16} />
          <span>New Trade</span>
        </Button>
      </div>
      
      {/* Stats Cards */}
      {!loading && trades.length > 0 && (
        <TradeStats trades={trades} />
      )}

      {/* Content */}
      {loading ? (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">Loading trades...</p>
        </div>
      ) : trades.length === 0 ? (
        <EmptyTradesState onAddNew={() => handleOpenDialog()} />
      ) : (
        <TradeTable 
          trades={trades} 
          onEdit={handleOpenDialog} 
          onDelete={handleDelete} 
        />
      )}

      <TradeDialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        trade={currentTrade} 
        setups={setups}
      />
    </div>
  );
};

export default TradesList;
