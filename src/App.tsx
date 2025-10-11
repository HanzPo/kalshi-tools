import { useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { MarketConfig, DataPoint } from './types';
import { ControlPanel } from './components/ControlPanel';
import { ChartPreview } from './components/ChartPreview';
import { ImageCropper } from './components/ImageCropper';
import { TrendDrawer } from './components/TrendDrawer';
import { generateMarketData, generateVolume } from './utils/dataGenerator';
import './App.css';

function App() {
  // Calculate default dates: 3 months ago and today
  const getDefaultStartDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    return date;
  };

  const [config, setConfig] = useState<MarketConfig>({
    title: 'Will Taylor Swift occupy all Top 12 spots on the Billboard Hot 100 chart for Oct 18th?',
    image: null,
    marketType: 'binary',
    currentOdds: 92,
    volume: generateVolume(),
    volatility: 1.5,
    customTrendData: null,
    outcomes: [
      { id: '1', name: 'Outcome 1', color: '#09C285', currentOdds: 60, customTrendData: null },
      { id: '2', name: 'Outcome 2', color: '#3B82F6', currentOdds: 40, customTrendData: null },
    ],
    startDate: getDefaultStartDate(),
    endDate: new Date(),
  });

  const [data, setData] = useState<DataPoint[]>([]);
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [showTrendDrawer, setShowTrendDrawer] = useState(false);

  useEffect(() => {
    regenerateData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Regenerate data when market type changes
  useEffect(() => {
    regenerateData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.marketType]);

  // Regenerate data when outcomes change (added/removed)
  useEffect(() => {
    if (config.marketType === 'multi') {
      regenerateData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.outcomes.length]);

  function generateDefaultTrend(targetOdds: number): number[] {
    const defaultTrend: number[] = [];
    let currentValue = 40 + Math.random() * 20; // Start between 40-60%
    
    for (let i = 0; i < 100; i++) {
      // Random walk with drift toward target
      const drift = (targetOdds - currentValue) / (100 - i) * 0.2;
      const randomStep = (Math.random() - 0.5) * 8;
      currentValue += drift + randomStep;
      currentValue = Math.max(0, Math.min(100, currentValue));
      defaultTrend.push(currentValue);
    }
    
    // Ensure it ends near target
    defaultTrend[99] = targetOdds;
    return defaultTrend;
  }

  function regenerateData() {
    if (config.marketType === 'binary') {
      // Binary market - single line
      if (!config.customTrendData) {
        const defaultTrend = generateDefaultTrend(config.currentOdds);
        const newData = generateMarketData(config.currentOdds, config.volatility, defaultTrend, config.startDate, config.endDate);
        setData(newData);
      } else {
        const newData = generateMarketData(config.currentOdds, config.volatility, config.customTrendData, config.startDate, config.endDate);
        setData(newData);
      }
    } else {
      // Multi-outcome market - multiple lines
      const baseData = generateMarketData(50, config.volatility, generateDefaultTrend(50), config.startDate, config.endDate);
      
      // Generate data for each outcome
      config.outcomes.forEach((outcome) => {
        const trend = outcome.customTrendData || generateDefaultTrend(outcome.currentOdds);
        const outcomeData = generateMarketData(outcome.currentOdds, config.volatility, trend, config.startDate, config.endDate);
        
        // Merge outcome data into base data
        outcomeData.forEach((point, index) => {
          if (baseData[index]) {
            baseData[index][`value_${outcome.id}`] = point.value;
          }
        });
      });
      
      setData(baseData);
    }
  }

  function handleConfigChange(updates: Partial<MarketConfig>) {
    setConfig((prev) => ({ ...prev, ...updates }));
  }

  function handleImageUpload(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCropperImage(result);
    };
    reader.readAsDataURL(file);
  }

  function handleCropComplete(croppedImage: string) {
    setConfig((prev) => ({ ...prev, image: croppedImage }));
    setCropperImage(null);
  }

  function handleCropCancel() {
    setCropperImage(null);
  }

  function handleOpenTrendDrawer() {
    setShowTrendDrawer(true);
  }

  function handleTrendDrawComplete(trendData: number[]) {
    // Get the final odds from the drawn trend
    const finalOdds = Math.round(trendData[trendData.length - 1]);
    
    setConfig((prev) => ({ 
      ...prev, 
      customTrendData: trendData,
      currentOdds: finalOdds
    }));
    
    setShowTrendDrawer(false);
    
    // Regenerate data with new custom trend
    setTimeout(() => {
      const newData = generateMarketData(finalOdds, config.volatility, trendData, config.startDate, config.endDate);
      setData(newData);
    }, 0);
  }

  function handleTrendDrawCancel() {
    setShowTrendDrawer(false);
  }

  async function handleExport() {
    const element = document.getElementById('chart-preview');
    if (!element) return;

    try {
      const dataUrl = await toPng(element, {
        quality: 1,
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      link.download = `${config.title.slice(0, 50).replace(/[^a-z0-9]/gi, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('Failed to export image. Please try again.');
    }
  }

  return (
    <div className="app">
      <div className="app-container">
        <ControlPanel
          config={config}
          onConfigChange={handleConfigChange}
          onImageUpload={handleImageUpload}
          onExport={handleExport}
          onRegenerateData={regenerateData}
          onOpenTrendDrawer={handleOpenTrendDrawer}
        />
        <div className="preview-section">
          <ChartPreview config={config} data={data} />
        </div>
      </div>

      {cropperImage && (
        <ImageCropper
          imageSrc={cropperImage}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}

      {showTrendDrawer && (
        <TrendDrawer
          onComplete={handleTrendDrawComplete}
          onCancel={handleTrendDrawCancel}
        />
      )}
    </div>
  );
}

export default App;
