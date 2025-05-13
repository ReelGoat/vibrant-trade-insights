
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
              <div className="text-sm font-medium mb-2">{rule.name}</div>
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
