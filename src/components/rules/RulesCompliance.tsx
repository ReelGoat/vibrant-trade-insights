
import React, { useState } from 'react';
import { Check, X, Trash, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

interface Rule {
  id: string;
  name: string;
  followedCount: number;
  notFollowedCount: number;
  impact: number;
}

interface RulesComplianceProps {
  rules: Rule[];
  onRulesChange: React.Dispatch<React.SetStateAction<Rule[]>>;
}

const RulesCompliance: React.FC<RulesComplianceProps> = ({ rules, onRulesChange }) => {
  const [newRuleName, setNewRuleName] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const addRule = () => {
    if (!newRuleName.trim()) {
      toast({
        title: "Rule name required",
        description: "Please enter a name for your rule.",
        variant: "destructive"
      });
      return;
    }
    
    const newRule: Rule = {
      id: Date.now().toString(),
      name: newRuleName,
      followedCount: 0,
      notFollowedCount: 0,
      impact: 0,
    };
    
    onRulesChange(prevRules => [...prevRules, newRule]);
    setNewRuleName('');
    setDialogOpen(false);
    
    toast({
      title: "Rule added",
      description: `"${newRuleName}" has been added to your trading rules.`
    });
  };

  const deleteRule = (id: string) => {
    const ruleToDelete = rules.find(rule => rule.id === id);
    onRulesChange(prevRules => prevRules.filter(rule => rule.id !== id));
    
    if (ruleToDelete) {
      toast({
        title: "Rule deleted",
        description: `"${ruleToDelete.name}" has been removed from your trading rules.`
      });
    }
  };

  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">Rules Compliance</CardTitle>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 px-2 text-xs">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Rule</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Input
                  id="name"
                  placeholder="Rule Name (e.g., Respect Stop Loss)"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button onClick={addRule}>Add Rule</Button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rules.map((rule) => (
            <div key={rule.id} className="flex items-center justify-between p-2 hover:bg-secondary/20 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-sm">{rule.name}</p>
                <div className="flex gap-4 mt-1 text-xs">
                  <div className="flex items-center">
                    <div className="flex items-center text-profit mr-2">
                      <Check className="h-3.5 w-3.5 mr-1" />
                      <span>{rule.followedCount}</span>
                    </div>
                    <span className="text-muted-foreground">followed</span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex items-center text-loss mr-2">
                      <X className="h-3.5 w-3.5 mr-1" />
                      <span>{rule.notFollowedCount}</span>
                    </div>
                    <span className="text-muted-foreground">violated</span>
                  </div>
                </div>
                <div className="mt-1">
                  <span className={`text-xs font-medium ${rule.impact >= 0 ? 'text-profit' : 'text-loss'}`}>
                    Impact: {rule.impact >= 0 ? '+' : ''}${Math.abs(rule.impact).toLocaleString()}
                  </span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-muted-foreground hover:text-loss"
                onClick={() => deleteRule(rule.id)}
              >
                <Trash className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          {rules.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-4">
              No rules yet. Add your first rule!
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RulesCompliance;
