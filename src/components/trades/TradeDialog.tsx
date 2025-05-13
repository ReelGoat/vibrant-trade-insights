
import React, { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

import TradeBasicInfoFields from './dialog/TradeBasicInfoFields';
import TradeEntryExitFields from './dialog/TradeEntryExitFields';
import TradeNotesFields from './dialog/TradeNotesFields';
import TradeRulesSection, { Rule } from './dialog/TradeRulesSection';
import { formatDateForInput } from './dialog/TradeFormUtils';

import type { Trade } from './TradesList';
import type { TradingSetup } from '../setups/SetupsList';

interface TradeDialogProps {
  open: boolean;
  onClose: (refresh?: boolean) => void;
  trade: Trade | null;
  setups: TradingSetup[];
}

const TradeDialog: React.FC<TradeDialogProps> = ({ open, onClose, trade, setups }) => {
  const [symbol, setSymbol] = useState('');
  const [setupId, setSetupId] = useState<string | null>(null);
  const [entryDate, setEntryDate] = useState('');
  const [exitDate, setExitDate] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [direction, setDirection] = useState<'long' | 'short'>('long');
  const [profitLoss, setProfitLoss] = useState('');
  const [notes, setNotes] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  
  // Rules management
  const [rules, setRules] = useState<Rule[]>([]);
  const [followedRuleIds, setFollowedRuleIds] = useState<string[]>([]);
  const [violatedRuleIds, setViolatedRuleIds] = useState<string[]>([]);
  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Fetch rules from Supabase
  useEffect(() => {
    const fetchRules = async () => {
      try {
        // For now, we'll load rules from local storage as a fallback
        // In a real app, this would come from the Supabase database
        const storedRules = localStorage.getItem('tradingRules');
        if (storedRules) {
          setRules(JSON.parse(storedRules));
        }
      } catch (error) {
        console.error('Error fetching rules:', error);
      }
    };
    
    fetchRules();
  }, [open]);

  useEffect(() => {
    if (trade) {
      setSymbol(trade.symbol);
      setSetupId(trade.setup_id);
      setEntryDate(formatDateForInput(trade.entry_date));
      setExitDate(trade.exit_date ? formatDateForInput(trade.exit_date) : '');
      setEntryPrice(trade.entry_price.toString());
      setExitPrice(trade.exit_price ? trade.exit_price.toString() : '');
      setQuantity(trade.quantity.toString());
      setDirection(trade.direction);
      setProfitLoss(trade.profit_loss ? trade.profit_loss.toString() : '');
      setNotes(trade.notes || '');
      setScreenshotUrl(trade.screenshot_url || '');
      
      // Set followed and violated rules based on the trade data
      setFollowedRuleIds(trade.rules_followed?.map(name => {
        const rule = rules.find(r => r.name === name);
        return rule ? rule.id : '';
      }).filter(Boolean) || []);
      
      setViolatedRuleIds(trade.rules_violated?.map(name => {
        const rule = rules.find(r => r.name === name);
        return rule ? rule.id : '';
      }).filter(Boolean) || []);
      
    } else {
      resetForm();
    }
  }, [trade, open, rules]);

  const resetForm = () => {
    setSymbol('');
    setSetupId(null);
    setEntryDate(new Date().toISOString().split('T')[0]);
    setExitDate('');
    setEntryPrice('');
    setExitPrice('');
    setQuantity('');
    setDirection('long');
    setProfitLoss('');
    setNotes('');
    setScreenshotUrl('');
    setFollowedRuleIds([]);
    setViolatedRuleIds([]);
  };

  const toggleRuleFollowed = (ruleId: string) => {
    setFollowedRuleIds(current => {
      if (current.includes(ruleId)) {
        return current.filter(id => id !== ruleId);
      } else {
        // Remove from violated if now followed
        setViolatedRuleIds(prev => prev.filter(id => id !== ruleId));
        return [...current, ruleId];
      }
    });
  };

  const toggleRuleViolated = (ruleId: string) => {
    setViolatedRuleIds(current => {
      if (current.includes(ruleId)) {
        return current.filter(id => id !== ruleId);
      } else {
        // Remove from followed if now violated
        setFollowedRuleIds(prev => prev.filter(id => id !== ruleId));
        return [...current, ruleId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symbol.trim() || !entryDate || !entryPrice || !quantity) {
      toast({
        title: "Required Fields",
        description: "Symbol, Entry Date, Entry Price, and Quantity are required.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      // Calculate P&L if not provided but we have exit price
      let calculatedPL = profitLoss;
      if (!calculatedPL && exitPrice && entryPrice) {
        const entryPriceNum = parseFloat(entryPrice);
        const exitPriceNum = parseFloat(exitPrice);
        const quantityNum = parseInt(quantity);
        
        if (direction === 'long') {
          calculatedPL = ((exitPriceNum - entryPriceNum) * quantityNum).toString();
        } else {
          calculatedPL = ((entryPriceNum - exitPriceNum) * quantityNum).toString();
        }
      }
      
      // Convert rule IDs to rule names for storage
      const followedRules = followedRuleIds.map(id => {
        const rule = rules.find(r => r.id === id);
        return rule ? rule.name : '';
      }).filter(Boolean);
      
      const violatedRules = violatedRuleIds.map(id => {
        const rule = rules.find(r => r.id === id);
        return rule ? rule.name : '';
      }).filter(Boolean);
      
      // Update rules statistics (in a real app this would be done in a transaction or backend)
      const updatedRules = rules.map(rule => {
        if (followedRuleIds.includes(rule.id)) {
          return { ...rule, followedCount: rule.followedCount + 1 };
        }
        if (violatedRuleIds.includes(rule.id)) {
          return { ...rule, notFollowedCount: rule.notFollowedCount + 1 };
        }
        return rule;
      });
      
      // Save updated rules to local storage (would be DB in real app)
      localStorage.setItem('tradingRules', JSON.stringify(updatedRules));
      
      const tradeData = {
        symbol: symbol.toUpperCase(),
        setup_id: setupId,
        entry_date: new Date(entryDate).toISOString(),
        exit_date: exitDate ? new Date(exitDate).toISOString() : null,
        entry_price: parseFloat(entryPrice),
        exit_price: exitPrice ? parseFloat(exitPrice) : null,
        quantity: parseInt(quantity),
        direction: direction,
        profit_loss: calculatedPL ? parseFloat(calculatedPL) : null,
        notes: notes || null,
        screenshot_url: screenshotUrl || null,
        rules_followed: followedRules.length > 0 ? followedRules : null,
        rules_violated: violatedRules.length > 0 ? violatedRules : null,
        updated_at: new Date().toISOString()
      };

      let result;
      
      if (trade) {
        // Update existing trade
        result = await supabase
          .from('trades')
          .update(tradeData)
          .eq('id', trade.id);
      } else {
        // Create new trade
        result = await supabase
          .from('trades')
          .insert([tradeData]);
      }
      
      if (result.error) throw result.error;
      
      toast({
        title: "Success",
        description: trade ? "Trade updated successfully." : "New trade logged successfully."
      });
      
      onClose(true);
    } catch (error: any) {
      console.error('Error saving trade:', error.message);
      toast({
        title: "Error",
        description: "Failed to save trade.",
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
          <DialogTitle>{trade ? 'Edit Trade' : 'Log New Trade'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <TradeBasicInfoFields 
            symbol={symbol}
            setSymbol={setSymbol}
            setupId={setupId}
            setSetupId={setSetupId}
            entryDate={entryDate}
            setEntryDate={setEntryDate}
            exitDate={exitDate}
            setExitDate={setExitDate}
            setups={setups}
          />
          
          <TradeEntryExitFields 
            direction={direction}
            setDirection={setDirection}
            quantity={quantity}
            setQuantity={setQuantity}
            profitLoss={profitLoss}
            setProfitLoss={setProfitLoss}
            entryPrice={entryPrice}
            setEntryPrice={setEntryPrice}
            exitPrice={exitPrice}
            setExitPrice={setExitPrice}
          />
          
          <TradeNotesFields 
            notes={notes}
            setNotes={setNotes}
            screenshotUrl={screenshotUrl}
            setScreenshotUrl={setScreenshotUrl}
          />

          <TradeRulesSection 
            rules={rules}
            followedRuleIds={followedRuleIds}
            violatedRuleIds={violatedRuleIds}
            toggleRuleFollowed={toggleRuleFollowed}
            toggleRuleViolated={toggleRuleViolated}
          />

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onClose()} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : trade ? 'Update Trade' : 'Log Trade'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TradeDialog;
