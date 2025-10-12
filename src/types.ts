export type MarketType = 'binary' | 'multi';

export interface Outcome {
  id: string;
  name: string;
  color: string;
  currentOdds: number;
  customTrendData: number[] | null;
}

export interface MarketConfig {
  title: string;
  image: string | null;
  marketType: MarketType;
  currentOdds: number;
  volume: number;
  volatility: number;
  customTrendData: number[] | null;
  outcomes: Outcome[];
  startDate: Date;
  endDate: Date;
  showWatermark: boolean;
}

export interface DataPoint {
  time: string;
  value: number;
  [key: string]: string | number; // Allow dynamic outcome keys like value_outcome1, value_outcome2
}

