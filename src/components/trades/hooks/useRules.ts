
import { useState, useEffect } from 'react';
import type { Rule } from '../dialog/TradeRulesSection';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/integrations/supabase/client';

export const useRules = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(false);

  // Sample default rules to initialize if no rules exist
  const defaultRules: Omit<Rule, 'id'>[] = [
    { 
      name: "Only trade with trend", 
      followedCount: 0, 
      notFollowedCount: 0, 
      impact: 5 
    },
    { 
      name: "Use proper position sizing (1-2%)", 
      followedCount: 0, 
      notFollowedCount: 0, 
      impact: 5 
    },
    { 
      name: "Wait for confirmation before entry", 
      followedCount: 0, 
      notFollowedCount: 0, 
      impact: 4 
    },
    { 
      name: "Have clear stop loss", 
      followedCount: 0, 
      notFollowedCount: 0, 
      impact: 5 
    },
    { 
      name: "Follow trade plan", 
      followedCount: 0, 
      notFollowedCount: 0, 
      impact: 4 
    }
  ];

  useEffect(() => {
    const fetchRules = async () => {
      setLoading(true);
      try {
        // In a future implementation, this would come from the database
        // For now, we'll use local storage
        const storedRules = localStorage.getItem('tradingRules');
        
        if (storedRules) {
          setRules(JSON.parse(storedRules));
        } else {
          // Initialize with default rules
          const initializedRules = defaultRules.map(rule => ({
            ...rule,
            id: uuidv4()
          }));
          localStorage.setItem('tradingRules', JSON.stringify(initializedRules));
          setRules(initializedRules);
        }
      } catch (error) {
        console.error('Error fetching rules:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRules();
  }, []);

  const updateRules = (updatedRules: Rule[]) => {
    localStorage.setItem('tradingRules', JSON.stringify(updatedRules));
    setRules(updatedRules);
  };

  return {
    rules,
    setRules: updateRules,
    loading
  };
};
