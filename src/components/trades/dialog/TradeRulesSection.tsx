
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { InfoIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Rule {
  id: string;
  name: string;
  followedCount: number;
  notFollowedCount: number;
  impact: number;
}

interface TradeRulesSectionProps {
  rules: Rule[];
  followedRuleIds: string[];
  violatedRuleIds: string[];
  toggleRuleFollowed: (ruleId: string) => void;
  toggleRuleViolated: (ruleId: string) => void;
}

const TradeRulesSection: React.FC<TradeRulesSectionProps> = ({
  rules,
  followedRuleIds,
  violatedRuleIds,
  toggleRuleFollowed,
  toggleRuleViolated
}) => {
  if (rules.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Trading Rules</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-1 gap-3">
          {rules.map(rule => (
            <div key={rule.id} className="bg-muted/30 rounded-md p-3">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium">{rule.name}</div>
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="flex items-center text-muted-foreground hover:text-foreground">
                      <InfoIcon className="h-4 w-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-4" align="end">
                    <div className="space-y-2">
                      <h4 className="font-medium">{rule.name}</h4>
                      <div className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Followed:</span>
                          <span className="text-profit">{rule.followedCount} times</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Violated:</span>
                          <span className="text-loss">{rule.notFollowedCount} times</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Impact:</span>
                          <span className={cn(
                            "font-medium",
                            rule.impact >= 0 ? "text-profit" : "text-loss"
                          )}>
                            {rule.impact >= 0 ? '+' : '-'}${Math.abs(rule.impact).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id={`followed-${rule.id}`} 
                    checked={followedRuleIds.includes(rule.id)}
                    onCheckedChange={() => toggleRuleFollowed(rule.id)}
                  />
                  <label 
                    htmlFor={`followed-${rule.id}`}
                    className="text-sm text-muted-foreground cursor-pointer"
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
                    className="text-sm text-muted-foreground cursor-pointer"
                  >
                    Violated
                  </label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TradeRulesSection;
