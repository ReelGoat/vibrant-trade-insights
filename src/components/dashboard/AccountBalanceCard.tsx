
import React from 'react';
import { Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AccountBalanceCardProps {
  currentBalance: number;
  initialDeposit: number;
}

const AccountBalanceCard: React.FC<AccountBalanceCardProps> = ({
  currentBalance,
  initialDeposit,
}) => {
  const percentageChange = ((currentBalance - initialDeposit) / initialDeposit) * 100;
  const isProfit = percentageChange >= 0;
  
  return (
    <Card className="animate-fade-in glass-card">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
        <Button variant="ghost" size="icon" className="h-8 w-8">
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
  );
};

export default AccountBalanceCard;
