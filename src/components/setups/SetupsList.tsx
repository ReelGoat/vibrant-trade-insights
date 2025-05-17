import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import SetupDialog from './SetupDialog';

export interface TradingSetup {
  id: string;
  name: string;
  description: string | null;
  criteria: string | null;
  entry_rules: string | null;
  exit_rules: string | null;
  risk_management: string | null;
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const SetupsList = () => {
  const [setups, setSetups] = useState<TradingSetup[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentSetup, setCurrentSetup] = useState<TradingSetup | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSetups();
  }, []);

  const fetchSetups = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('trading_setups')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setSetups(data || []);
    } catch (error: any) {
      console.error('Error fetching setups:', error.message);
      toast({
        title: "Error",
        description: "Failed to load trading setups.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (setup: TradingSetup | null = null) => {
    setCurrentSetup(setup);
    setDialogOpen(true);
  };

  const handleCloseDialog = (refresh: boolean = false) => {
    setDialogOpen(false);
    if (refresh) {
      fetchSetups();
    }
  };

  const handleDelete = async (id: string) => {
    // Check if setup is being used in any trades
    const { data: trades, error: tradesError } = await supabase
      .from('trades')
      .select('id')
      .eq('setup_id', id)
      .limit(1);
    
    if (tradesError) {
      toast({
        title: "Error",
        description: "Failed to check if setup is in use.",
        variant: "destructive"
      });
      return;
    }
    
    if (trades && trades.length > 0) {
      toast({
        title: "Cannot Delete",
        description: "This setup is being used in existing trades.",
        variant: "destructive"
      });
      return;
    }

    if (confirm('Are you sure you want to delete this trading setup?')) {
      try {
        const { error } = await supabase
          .from('trading_setups')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Trading setup deleted successfully."
        });
        
        fetchSetups();
      } catch (error: any) {
        console.error('Error deleting setup:', error.message);
        toast({
          title: "Error",
          description: "Failed to delete trading setup.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Trading Setups</h2>
        <Button onClick={() => handleOpenDialog()} className="flex items-center gap-1">
          <Plus size={16} />
          <span>New Setup</span>
        </Button>
      </div>

      {loading ? (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">Loading setups...</p>
        </div>
      ) : setups.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground mb-4">You haven't created any trading setups yet.</p>
            <Button onClick={() => handleOpenDialog()}>Create Your First Setup</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {setups.map((setup) => (
            <Card key={setup.id} className="hover:bg-secondary/10 transition-colors">
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{setup.name}</h3>
                    {!setup.is_active && (
                      <span className="text-xs text-muted-foreground">(Inactive)</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => handleOpenDialog(setup)}
                    >
                      <Pencil size={16} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-destructive hover:text-destructive/80" 
                      onClick={() => handleDelete(setup.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
                
                {setup.description && (
                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                    {setup.description}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-2">
                  <div className="text-xs bg-secondary/30 px-2 py-1 rounded-full">
                    {setup.category.charAt(0).toUpperCase() + setup.category.slice(1)}
                  </div>
                  {setup.criteria && <div className="text-xs bg-secondary/30 px-2 py-1 rounded-full">Has Criteria</div>}
                  {setup.entry_rules && <div className="text-xs bg-secondary/30 px-2 py-1 rounded-full">Entry Rules</div>}
                  {setup.exit_rules && <div className="text-xs bg-secondary/30 px-2 py-1 rounded-full">Exit Rules</div>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <SetupDialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        setup={currentSetup}
      />
    </div>
  );
};

export default SetupsList;
