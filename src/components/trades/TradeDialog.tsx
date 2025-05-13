
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Trade } from './TradesList';
import type { TradingSetup } from '../setups/SetupsList';

interface Rule {
  id: string;
  name: string;
  followedCount: number;
  notFollowedCount: number;
  impact: number;
}

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

  const formatDateForInput = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol *</Label>
              <Input 
                id="symbol" 
                value={symbol} 
                onChange={(e) => setSymbol(e.target.value)}
                placeholder="e.g., AAPL"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="setup">Trading Setup</Label>
              <Select 
                value={setupId || ""} 
                onValueChange={(value) => setSetupId(value === "none" ? null : value)}
              >
                <SelectTrigger id="setup">
                  <SelectValue placeholder="Select setup" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {setups.map((setup) => (
                    <SelectItem key={setup.id} value={setup.id}>
                      {setup.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entryDate">Entry Date *</Label>
              <Input 
                id="entryDate" 
                type="date" 
                value={entryDate} 
                onChange={(e) => setEntryDate(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="exitDate">Exit Date</Label>
              <Input 
                id="exitDate" 
                type="date" 
                value={exitDate} 
                onChange={(e) => setExitDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="direction">Direction *</Label>
              <Select value={direction} onValueChange={(value: 'long' | 'short') => setDirection(value)}>
                <SelectTrigger id="direction">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="long">Long</SelectItem>
                  <SelectItem value="short">Short</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input 
                id="quantity" 
                type="number"
                min="1"
                step="1"
                value={quantity} 
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g., 100"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="profitLoss">P&L ($)</Label>
              <Input 
                id="profitLoss" 
                type="number" 
                step="0.01"
                value={profitLoss} 
                onChange={(e) => setProfitLoss(e.target.value)}
                placeholder="Auto-calculated if blank"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entryPrice">Entry Price *</Label>
              <Input 
                id="entryPrice" 
                type="number"
                step="0.01"
                value={entryPrice} 
                onChange={(e) => setEntryPrice(e.target.value)}
                placeholder="e.g., 150.75"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="exitPrice">Exit Price</Label>
              <Input 
                id="exitPrice" 
                type="number" 
                step="0.01"
                value={exitPrice} 
                onChange={(e) => setExitPrice(e.target.value)}
                placeholder="e.g., 155.50"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What did you learn from this trade?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="screenshotUrl">Screenshot URL</Label>
            <Input 
              id="screenshotUrl" 
              value={screenshotUrl} 
              onChange={(e) => setScreenshotUrl(e.target.value)}
              placeholder="URL to your trade screenshot"
            />
          </div>

          {/* Rules Followed Section */}
          {rules.length > 0 && (
            <div className="space-y-2 border rounded-lg p-4">
              <h3 className="font-medium mb-2">Trading Rules</h3>
              <div className="grid grid-cols-1 gap-3">
                {rules.map(rule => (
                  <div key={rule.id} className="flex flex-col space-y-1">
                    <div className="text-sm font-medium">{rule.name}</div>
                    <div className="flex space-x-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id={`followed-${rule.id}`} 
                          checked={followedRuleIds.includes(rule.id)}
                          onCheckedChange={() => toggleRuleFollowed(rule.id)}
                        />
                        <label 
                          htmlFor={`followed-${rule.id}`}
                          className="text-sm text-muted-foreground"
                        >
                          Followed
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id={`violated-${rule.id}`}
                          checked={violatedRuleIds.includes(rule.id)}
                          onCheckedChange={() => toggleRuleViolated(rule.id)}
                        />
                        <label 
                          htmlFor={`violated-${rule.id}`}
                          className="text-sm text-muted-foreground"
                        >
                          Violated
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
