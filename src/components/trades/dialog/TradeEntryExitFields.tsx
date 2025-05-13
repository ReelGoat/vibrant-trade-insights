
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TradeEntryExitFieldsProps {
  direction: 'long' | 'short';
  setDirection: (value: 'long' | 'short') => void;
  quantity: string;
  setQuantity: (value: string) => void;
  profitLoss: string;
  setProfitLoss: (value: string) => void;
  entryPrice: string;
  setEntryPrice: (value: string) => void;
  exitPrice: string;
  setExitPrice: (value: string) => void;
}

const TradeEntryExitFields: React.FC<TradeEntryExitFieldsProps> = ({
  direction,
  setDirection,
  quantity,
  setQuantity,
  profitLoss,
  setProfitLoss,
  entryPrice,
  setEntryPrice,
  exitPrice,
  setExitPrice
}) => {
  return (
    <>
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
    </>
  );
};

export default TradeEntryExitFields;
