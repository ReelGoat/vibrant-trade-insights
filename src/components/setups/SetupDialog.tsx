
import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { TradingSetup } from './SetupsList';

interface SetupDialogProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  setup: TradingSetup | null;
}

const SetupDialog: React.FC<SetupDialogProps> = ({ open, onClose, setup }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [criteria, setCriteria] = useState('');
  const [entryRules, setEntryRules] = useState('');
  const [exitRules, setExitRules] = useState('');
  const [riskManagement, setRiskManagement] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (setup) {
      setName(setup.name);
      setDescription(setup.description || '');
      setCriteria(setup.criteria || '');
      setEntryRules(setup.entry_rules || '');
      setExitRules(setup.exit_rules || '');
      setRiskManagement(setup.risk_management || '');
    } else {
      resetForm();
    }
  }, [setup, open]);

  const resetForm = () => {
    setName('');
    setDescription('');
    setCriteria('');
    setEntryRules('');
    setExitRules('');
    setRiskManagement('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: "Required Field",
        description: "Setup name is required.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const setupData = {
        name,
        description: description || null,
        criteria: criteria || null,
        entry_rules: entryRules || null,
        exit_rules: exitRules || null,
        risk_management: riskManagement || null,
        updated_at: new Date().toISOString()
      };

      let result;
      
      if (setup) {
        // Update existing setup
        result = await supabase
          .from('trading_setups')
          .update(setupData)
          .eq('id', setup.id);
      } else {
        // Create new setup
        result = await supabase
          .from('trading_setups')
          .insert([setupData]);
      }
      
      if (result.error) throw result.error;
      
      toast({
        title: "Success",
        description: setup ? "Trading setup updated successfully." : "New trading setup created."
      });
      
      onClose(true);
    } catch (error: any) {
      console.error('Error saving setup:', error.message);
      toast({
        title: "Error",
        description: "Failed to save trading setup.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{setup ? 'Edit Trading Setup' : 'Create New Trading Setup'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="name">Setup Name *</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Breakout Setup"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this trading setup"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="criteria">Setup Criteria</Label>
            <Textarea 
              id="criteria" 
              value={criteria} 
              onChange={(e) => setCriteria(e.target.value)}
              placeholder="What conditions need to be present for this setup?"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entryRules">Entry Rules</Label>
              <Textarea 
                id="entryRules" 
                value={entryRules} 
                onChange={(e) => setEntryRules(e.target.value)}
                placeholder="When to enter the trade"
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="exitRules">Exit Rules</Label>
              <Textarea 
                id="exitRules" 
                value={exitRules} 
                onChange={(e) => setExitRules(e.target.value)}
                placeholder="When to exit the trade"
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="riskManagement">Risk Management</Label>
            <Textarea 
              id="riskManagement" 
              value={riskManagement} 
              onChange={(e) => setRiskManagement(e.target.value)}
              placeholder="Position sizing, stop loss, take profit guidelines"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose()} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : setup ? 'Update Setup' : 'Create Setup'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SetupDialog;
