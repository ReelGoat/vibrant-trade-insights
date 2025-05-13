
import React from 'react';
import { Checkbox } from "@/components/ui/checkbox";

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
    <div className="space-y-2 border rounded-lg p-4">
      <h3 className="font-medium mb-2">Trading Rules</h3>
      <div className="grid grid-cols-1 gap-3">
        {rules.map(rule => (
          <div key={rule.id} className="flex flex-col space-y-1">
            <div className="text-sm font-medium">{rule.name}</div>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id={`followed-${rule.id}`} 
                  checked={followedRuleIds.includes(rule.id)}
                  onCheckedChange={() => toggleRuleFollowed(rule.id)}
                />
                <label 
                  htmlFor={`followed-${rule.id}`}
                  className="text-sm text-muted-foreground"
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
                  className="text-sm text-muted-foreground"
                >
                  Violated
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TradeRulesSection;
