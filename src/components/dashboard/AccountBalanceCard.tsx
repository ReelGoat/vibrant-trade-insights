
import React, { useState } from 'react';
import { Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface AccountBalanceCardProps {
  currentBalance: number;
  initialDeposit: number;
}

const AccountBalanceCard: React.FC<AccountBalanceCardProps> = ({
  currentBalance: initialCurrentBalance,
  initialDeposit: initialInitialDeposit,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [currentBalance, setCurrentBalance] = useState(initialCurrentBalance);
  const [initialDeposit, setInitialDeposit] = useState(initialInitialDeposit);
  const [tempCurrentBalance, setTempCurrentBalance] = useState(initialCurrentBalance.toString());
  const [tempInitialDeposit, setTempInitialDeposit] = useState(initialInitialDeposit.toString());

  const percentageChange = ((currentBalance - initialDeposit) / initialDeposit) * 100;
  const isProfit = percentageChange >= 0;
  
  const handleSaveSettings = () => {
    const newBalance = parseFloat(tempCurrentBalance);
    const newDeposit = parseFloat(tempInitialDeposit);
    
    if (isNaN(newBalance) || isNaN(newDeposit)) {
      toast({
        title: "Invalid values",
        description: "Please enter valid numbers for both fields.",
        variant: "destructive"
      });
      return;
    }
    
    if (newDeposit <= 0) {
      toast({
        title: "Invalid initial deposit",
        description: "Initial deposit must be greater than zero.",
        variant: "destructive"
      });
      return;
    }
    
    setCurrentBalance(newBalance);
    setInitialDeposit(newDeposit);
    setShowSettings(false);
    
    toast({
      title: "Settings updated",
      description: "Account balance settings have been updated.",
    });
  };
  
  return (
    <>
      <Card className="animate-fade-in glass-card">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowSettings(true)}>
            <Settings className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${currentBalance.toLocaleString()}</div>
          <div className="flex justify-between items-center mt-1 text-sm">
            <span className="text-muted-foreground">Initial: ${initialDeposit.toLocaleString()}</span>
            <span className={`font-medium ${isProfit ? 'text-profit' : 'text-loss'}`}>
              {isProfit ? '+' : ''}{percentageChange.toFixed(2)}%
            </span>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Account Balance Settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="current-balance" className="text-right">Current Balance</Label>
              <Input
                id="current-balance"
                className="col-span-3"
                value={tempCurrentBalance}
                onChange={(e) => setTempCurrentBalance(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="initial-deposit" className="text-right">Initial Deposit</Label>
              <Input
                id="initial-deposit"
                className="col-span-3"
                value={tempInitialDeposit}
                onChange={(e) => setTempInitialDeposit(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleSaveSettings}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AccountBalanceCard;
