export type MarketType = 'binary' | 'multi';
export type BetSlipMode = 'single' | 'parlay';
export type TimeHorizon = '6H' | '1D' | '1W' | '1M' | 'ALL';

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
  timeHorizon: TimeHorizon;
  showWatermark: boolean;
}

export interface DataPoint {
  time: string;
  value: number;
  [key: string]: string | number; // Allow dynamic outcome keys like value_outcome1, value_outcome2
}

export interface ParlayLeg {
  id: string;
  question: string;
  answer: 'Yes' | 'No';
  image: string | null;
}

export interface BetSlipConfig {
  mode: BetSlipMode;
  title: string;
  image: string | null;
  wager: number;
  odds: number;
  answer: string;
  answerColor: 'green' | 'red';
  showWatermark: boolean;
  parlayOdds: number;
  parlayLegs: ParlayLeg[];
}
