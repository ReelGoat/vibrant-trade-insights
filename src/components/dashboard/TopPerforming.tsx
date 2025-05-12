
import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TopPerformingItem {
  name: string;
  value: number;
}

interface TopPerformingProps {
  title: string;
  data: TopPerformingItem[];
}

const TopPerforming: React.FC<TopPerformingProps> = ({ title, data }) => {
  // Sort data by value in descending order for horizontal bar chart
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  return (
    <Card className="animate-fade-in glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={sortedData}
              layout="vertical"
              margin={{
                top: 5,
                right: 20,
                left: 40, // Increased to accommodate labels
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
              <XAxis 
                type="number" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `$${value}`}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                tickLine={false} 
                axisLine={false} 
                tick={{ fontSize: 10 }}
                width={40}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#1A1F2C", border: "1px solid #333", borderRadius: "8px" }}
                formatter={(value) => [`$${value}`, "Profit"]}
              />
              <Bar dataKey="value" fill="#22c55e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopPerforming;
