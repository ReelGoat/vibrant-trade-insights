
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
  const [rulesFollowed, setRulesFollowed] = useState('');
  const [rulesViolated, setRulesViolated] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
      setRulesFollowed(trade.rules_followed ? trade.rules_followed.join(', ') : '');
      setRulesViolated(trade.rules_violated ? trade.rules_violated.join(', ') : '');
    } else {
      resetForm();
    }
  }, [trade, open]);

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
    setRulesFollowed('');
    setRulesViolated('');
  };

  const parseArrayField = (value: string): string[] | null => {
    if (!value.trim()) return null;
    return value.split(',').map(item => item.trim()).filter(item => item !== '');
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
        rules_followed: parseArrayField(rulesFollowed),
        rules_violated: parseArrayField(rulesViolated),
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
              <Select value={setupId || undefined} onValueChange={setSetupId}>
                <SelectTrigger id="setup">
                  <SelectValue placeholder="Select setup" />
                </SelectTrigger>
                <SelectContent>
                  {/* Fixed: Use "none" instead of empty string for the value */}
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rulesFollowed">Rules Followed (comma-separated)</Label>
              <Textarea 
                id="rulesFollowed" 
                value={rulesFollowed} 
                onChange={(e) => setRulesFollowed(e.target.value)}
                placeholder="e.g., Waited for confirmation, Used proper position size"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="rulesViolated">Rules Violated (comma-separated)</Label>
              <Textarea 
                id="rulesViolated" 
                value={rulesViolated} 
                onChange={(e) => setRulesViolated(e.target.value)}
                placeholder="e.g., Moved stop loss, Averaged down"
                rows={2}
              />
            </div>
          </div>

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
