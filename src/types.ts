export interface MarketConfig {
  title: string;
  image: string | null;
  currentOdds: number;
  volume: number;
  volatility: number;
  customTrendData: number[] | null;
}

export interface DataPoint {
  time: string;
  value: number;
}

