import { DataPoint } from '../types';

const DATES_COUNT = 5;

function generateDates(): string[] {
  const dates: string[] = [];
  const now = new Date();
  const threeMonthsAgo = new Date(now);
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
  
  // Calculate total milliseconds in the range
  const totalMs = now.getTime() - threeMonthsAgo.getTime();
  
  for (let i = 0; i < DATES_COUNT; i++) {
    const date = new Date(threeMonthsAgo.getTime() + (totalMs * i / (DATES_COUNT - 1)));
    dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
  }
  
  return dates;
}

function normalRandom(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function applyMonteCarloToCustomTrend(
  customTrend: number[],
  targetOdds: number,
  volatility: number
): DataPoint[] {
  const data: number[] = [];
  
  // Scale the custom trend to end at targetOdds
  const lastValue = customTrend[customTrend.length - 1];
  const firstValue = customTrend[0];
  const scaleFactor = (targetOdds - firstValue) / (lastValue - firstValue);
  
  // Apply Monte Carlo noise to each point
  for (let i = 0; i < customTrend.length; i++) {
    let scaledValue: number;
    
    if (i === 0) {
      scaledValue = customTrend[0];
    } else if (i === customTrend.length - 1) {
      scaledValue = targetOdds;
    } else {
      scaledValue = firstValue + (customTrend[i] - firstValue) * scaleFactor;
    }
    
    // Add Monte Carlo noise
    const noise = normalRandom() * 1.5 * volatility;
    let noisyValue = scaledValue + noise;
    
    // Enforce boundaries
    noisyValue = Math.max(0, Math.min(100, noisyValue));
    data.push(noisyValue);
  }
  
  // Ensure last value is exactly targetOdds
  data[data.length - 1] = targetOdds;
  
  // Convert to DataPoint format
  const dates = generateDates();
  const dataPoints: DataPoint[] = data.map((value, i) => {
    const dateIndex = Math.floor((i / data.length) * (DATES_COUNT - 1));
    return {
      time: dates[Math.min(dateIndex, dates.length - 1)],
      value: Math.round(value * 10) / 10,
    };
  });
  
  return dataPoints;
}

export function generateMarketData(
  targetOdds: number,
  volatility: number = 1.5,
  customTrendData: number[] | null = null
): DataPoint[] {
  // Always use custom trend (or default if none provided)
  if (customTrendData && customTrendData.length > 0) {
    return applyMonteCarloToCustomTrend(customTrendData, targetOdds, volatility);
  }
  
  // If no custom data, return empty data (should not happen in normal flow)
  return [];
}

export function generateVolume(): number {
  const min = 100000;
  const max = 10000000;
  return Math.floor(Math.random() * (max - min) + min);
}

export function formatVolume(volume: number): string {
  return `$${volume.toLocaleString()} vol`;
}

export function generateChange(data: DataPoint[]): string {
  if (data.length < 2) return '+0';
  
  const first = data[0].value;
  const last = data[data.length - 1].value;
  const change = last - first;
  const sign = change >= 0 ? '+' : '';
  
  return `${sign}${change.toFixed(1)}`;
}
