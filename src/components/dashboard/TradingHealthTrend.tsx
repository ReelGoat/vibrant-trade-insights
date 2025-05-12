
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TradingHealthDataPoint {
  date: string;
  value: number;
}

interface TradingHealthTrendProps {
  data: TradingHealthDataPoint[];
  thresholds: {
    outperforming: number;
    good: number;
    caution: number;
  };
}

const TradingHealthTrend: React.FC<TradingHealthTrendProps> = ({
  data,
  thresholds,
}) => {
  return (
    <Card className="animate-fade-in glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Trading Health Trend</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 10,
                left: 0,
                bottom: 5,
              }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => value.split(' ')[0]}
              />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: "#1A1F2C", border: "1px solid #333", borderRadius: "8px" }}
              />
              <ReferenceLine y={thresholds.outperforming} strokeDasharray="3 3" stroke="#22c55e" />
              <ReferenceLine y={thresholds.good} strokeDasharray="3 3" stroke="#84cc16" />
              <ReferenceLine y={thresholds.caution} strokeDasharray="3 3" stroke="#eab308" />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 4, fill: "#22c55e" }}
                activeDot={{ r: 6 }}
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between text-xs mt-2">
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-chart-outperforming mr-1"></span>
            Outperforming
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-chart-good mr-1"></span>
            Good
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-chart-caution mr-1"></span>
            Caution
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-chart-reassess mr-1"></span>
            Reassess
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TradingHealthTrend;
