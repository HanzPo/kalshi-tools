import { useState, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { MarketConfig, DataPoint, BetSlipConfig } from './types';
import { ControlPanel } from './components/ControlPanel';
import { ChartPreview } from './components/ChartPreview';
import { ImageCropper } from './components/ImageCropper';
import { TrendDrawer } from './components/TrendDrawer';
import { LandingPage } from './components/LandingPage';
import { BetSlipMaker } from './components/BetSlipMaker';
import { BetSlipPreview } from './components/BetSlipPreview';
import { generateMarketData, generateVolume } from './utils/dataGenerator';
import { decodeConfigFromUrl } from './utils/urlEncoder';
import { getOutcomeColor } from './utils/colorGenerator';
import './App.css';

type ViewMode = 'landing' | 'chart' | 'betslip';

function App() {
  // Calculate default dates: 3 months ago and today
  const getDefaultStartDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3);
    return date;
  };

  const [viewMode, setViewMode] = useState<ViewMode>('landing');

  const [config, setConfig] = useState<MarketConfig>({
    title: '',
    image: null,
    marketType: 'binary',
    currentOdds: 92,
    volume: generateVolume(),
    volatility: 1.5,
    customTrendData: null,
    outcomes: [
      { id: '1', name: 'Outcome 1', color: getOutcomeColor(0), currentOdds: 60, customTrendData: null },
      { id: '2', name: 'Outcome 2', color: getOutcomeColor(1), currentOdds: 40, customTrendData: null },
    ],
    startDate: getDefaultStartDate(),
    endDate: new Date(),
    showWatermark: true,
  });

  const [betSlipConfig, setBetSlipConfig] = useState<BetSlipConfig>({
    title: 'Will Republicans control the Senate after 2024?',
    image: null,
    wager: 1000,
    odds: 65,
    answer: 'Yes',
    showWatermark: true,
  });

  const [data, setData] = useState<DataPoint[]>([]);
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [showTrendDrawer, setShowTrendDrawer] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(message: string) {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  }

  // Load config from URL if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedConfig = urlParams.get('c');
    
    if (sharedConfig) {
      decodeConfigFromUrl(sharedConfig)
        .then((decodedConfig) => {
          setConfig((prev) => ({ ...prev, ...decodedConfig }));
        })
        .catch((error) => {
          console.error('Failed to decode shared config:', error);
        });
    }
  }, []);

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

  function handleBetSlipConfigChange(updates: Partial<BetSlipConfig>) {
    setBetSlipConfig((prev) => ({ ...prev, ...updates }));
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
    if (viewMode === 'chart') {
      setConfig((prev) => ({ ...prev, image: croppedImage }));
    } else if (viewMode === 'betslip') {
      setBetSlipConfig((prev) => ({ ...prev, image: croppedImage }));
    }
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
    const elementId = viewMode === 'chart' ? 'chart-preview' : 'bet-slip-preview';
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
      const dataUrl = await toPng(element, {
        quality: 1,
        pixelRatio: 2,
      });

      const link = document.createElement('a');
      const title = viewMode === 'chart' ? config.title : betSlipConfig.title;
      link.download = `${title.slice(0, 50).replace(/[^a-z0-9]/gi, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('Failed to export image. Please try again.');
    }
  }

  async function handleCopyToClipboard() {
    const elementId = viewMode === 'chart' ? 'chart-preview' : 'bet-slip-preview';
    const element = document.getElementById(elementId);
    if (!element) return;

    try {
      const dataUrl = await toPng(element, {
        quality: 1,
        pixelRatio: 2,
      });

      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();

      // Copy to clipboard
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);

      const itemType = viewMode === 'chart' ? 'Chart' : 'Bet slip';
      showToast(`${itemType} copied to clipboard! 📋`);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showToast('Failed to copy to clipboard');
    }
  }

  const appClassName = `app${viewMode === 'landing' ? ' landing-active' : ''}`;

  return (
    <div className={appClassName}>
      {viewMode === 'landing' && (
        <LandingPage
          onSelectChart={() => setViewMode('chart')}
          onSelectBetSlip={() => setViewMode('betslip')}
        />
      )}

      {viewMode === 'chart' && (
        <div className="app-container">
          <ControlPanel
            config={config}
            onConfigChange={handleConfigChange}
            onImageUpload={handleImageUpload}
            onExport={handleExport}
            onRegenerateData={regenerateData}
            onOpenTrendDrawer={handleOpenTrendDrawer}
            onCopyToClipboard={handleCopyToClipboard}
            onBack={() => setViewMode('landing')}
          />
          <div className="preview-section">
            <ChartPreview config={config} data={data} />
            <div className="attribution">
              <p>Built by <a href="https://x.com/hanznathanpo" target="_blank" rel="noopener noreferrer">Hanz Po</a> • <a href="https://kalshi.com/?utm_source=kalshitools" target="_blank" rel="noopener noreferrer">Visit Kalshi</a> • © 2025</p>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'betslip' && (
        <div className="app-container">
          <BetSlipMaker
            config={betSlipConfig}
            onConfigChange={handleBetSlipConfigChange}
            onImageUpload={handleImageUpload}
            onExport={handleExport}
            onCopyToClipboard={handleCopyToClipboard}
            onBack={() => setViewMode('landing')}
          />
          <div className="preview-section">
            <BetSlipPreview config={betSlipConfig} />
            <div className="attribution">
              <p>Built by <a href="https://x.com/hanznathanpo" target="_blank" rel="noopener noreferrer">Hanz Po</a> • <a href="https://kalshi.com/?utm_source=kalshitools" target="_blank" rel="noopener noreferrer">Visit Kalshi</a> • © 2025</p>
            </div>
          </div>
        </div>
      )}

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

      {toastMessage && (
        <div className="toast">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

export default App;
