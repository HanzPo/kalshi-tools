import { DataPoint, TimeHorizon } from '../types';

const DATES_COUNT = 6;

function getDateRangeForTimeHorizon(timeHorizon: TimeHorizon): { startDate: Date; endDate: Date } {
  const now = new Date();
  let startDate: Date;
  
  switch (timeHorizon) {
    case '6H':
      startDate = new Date(now.getTime() - 6 * 60 * 60 * 1000); // 6 hours ago
      break;
    case '1D':
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
      break;
    case '1W':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 1 week ago
      break;
    case '1M':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 1 month ago
      break;
    case 'ALL':
    default:
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // 3 months ago
      break;
  }
  
  return { startDate, endDate: now };
}

function generateDates(startDate: Date, endDate: Date, timeHorizon: TimeHorizon): string[] {
  const dates: string[] = [];
  
  // Calculate total milliseconds in the range
  const totalMs = endDate.getTime() - startDate.getTime();
  
  for (let i = 0; i < DATES_COUNT; i++) {
    const date = new Date(startDate.getTime() + (totalMs * i / (DATES_COUNT - 1)));
    
    // Format dates based on time horizon
    let formattedDate: string;
    switch (timeHorizon) {
      case '6H':
        formattedDate = date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          hour12: true 
        });
        break;
      case '1D':
        formattedDate = date.toLocaleTimeString('en-US', { 
          hour: 'numeric', 
          minute: '2-digit',
          hour12: true 
        });
        break;
      case '1W':
        formattedDate = date.toLocaleDateString('en-US', { 
          weekday: 'short',
          day: 'numeric' 
        });
        break;
      case '1M':
        formattedDate = date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        break;
      case 'ALL':
      default:
        formattedDate = date.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric' 
        });
        break;
    }
    
    dates.push(formattedDate);
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
  volatility: number,
  startDate: Date,
  endDate: Date,
  timeHorizon: TimeHorizon
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
  const dates = generateDates(startDate, endDate, timeHorizon);
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
  customTrendData: number[] | null = null,
  startDate: Date = new Date(new Date().setMonth(new Date().getMonth() - 3)),
  endDate: Date = new Date(),
  timeHorizon: TimeHorizon = 'ALL'
): DataPoint[] {
  // Always use custom trend (or default if none provided)
  if (customTrendData && customTrendData.length > 0) {
    return applyMonteCarloToCustomTrend(customTrendData, targetOdds, volatility, startDate, endDate, timeHorizon);
  }
  
  // If no custom data, return empty data (should not happen in normal flow)
  return [];
}

export function generateVolume(): number {
  const min = 100000;
  const max = 10000000;
  return Math.floor(Math.random() * (max - min) + min);
}

export { getDateRangeForTimeHorizon };

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
