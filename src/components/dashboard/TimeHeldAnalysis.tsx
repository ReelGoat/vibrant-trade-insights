
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TimeCategory {
  name: string;
  count: number;
  winRate: number;
  netProfit: number;
}

interface TimeHeldAnalysisProps {
  categories: TimeCategory[];
}

const TimeHeldAnalysis: React.FC<TimeHeldAnalysisProps> = ({ categories }) => {
  return (
    <Card className="animate-fade-in glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Time Held Analysis</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category.name} className="bg-secondary/30 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">{category.name}</span>
                <span className="text-sm bg-secondary px-2 py-0.5 rounded-full">
                  {category.count} trades
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <p className="text-xs text-muted-foreground">Win Rate</p>
                  <p className="text-sm font-semibold">{category.winRate}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Net Profit</p>
                  <p className={`text-sm font-semibold ${category.netProfit >= 0 ? 'text-profit' : 'text-loss'}`}>
                    ${Math.abs(category.netProfit).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeHeldAnalysis;
