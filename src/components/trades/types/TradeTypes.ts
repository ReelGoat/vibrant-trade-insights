
import type { TradingSetup } from '@/components/setups/SetupsList';

export interface Trade {
  id: string;
  symbol: string;
  setup_id: string | null;
  entry_date: string;
  exit_date: string | null;
  entry_price: number;
  exit_price: number | null;
  quantity: number;
  direction: 'long' | 'short';
  profit_loss: number | null;
  notes: string | null;
  screenshot_url: string | null;
  rules_followed: string[] | null;
  rules_violated: string[] | null;
  created_at: string;
  updated_at: string;
  setup?: TradingSetup;
}
