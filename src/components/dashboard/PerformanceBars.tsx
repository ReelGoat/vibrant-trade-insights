
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PerformanceData {
  name: string;
  profit: number;
  winRate: number;
}

interface PerformanceBarsProps {
  title: string;
  data: PerformanceData[];
  dataKey: string;
}

const PerformanceBars: React.FC<PerformanceBarsProps> = ({ title, data, dataKey }) => {
  return (
    <Card className="animate-fade-in glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 5,
                right: 20,
                left: 0,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
              <XAxis 
                dataKey={dataKey} 
                tickLine={false} 
                axisLine={false}
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                yAxisId="left" 
                orientation="left" 
                stroke="#22c55e" 
                tickLine={false} 
                axisLine={false}
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `$${value}`}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#eab308"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#1A1F2C", border: "1px solid #333", borderRadius: "8px" }}
                formatter={(value, name) => {
                  if (name === "profit") return [`$${value}`, "Avg. Profit"];
                  return [`${value}%`, "Win Rate"];
                }}
              />
              <Legend wrapperStyle={{ fontSize: "10px" }} />
              <Bar yAxisId="left" dataKey="profit" name="Avg. Profit" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar yAxisId="right" dataKey="winRate" name="Win Rate" fill="#eab308" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceBars;
