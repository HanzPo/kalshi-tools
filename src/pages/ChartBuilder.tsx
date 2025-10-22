import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MarketConfig, DataPoint } from '../types';
import { ControlPanel } from '../components/ControlPanel';
import { ChartPreview } from '../components/ChartPreview';
import { ImageCropper } from '../components/ImageCropper';
import { TrendDrawer } from '../components/TrendDrawer';
import { generateMarketData, generateVolume, getDateRangeForTimeHorizon } from '../utils/dataGenerator';
import { decodeConfigFromUrl } from '../utils/urlEncoder';
import { getOutcomeColor } from '../utils/colorGenerator';
import { captureElementAsPng, copyDataUrlToClipboard, downloadDataUrl } from '../utils/imageExport';
import '../App.css';

const CHART_PREVIEW_ID = 'chart-preview';

function getDefaultStartDate(): Date {
  const date = new Date();
  date.setMonth(date.getMonth() - 3);
  return date;
}

function createFileName(title: string): string {
  const safeName = title.slice(0, 50).replace(/[^a-z0-9]/gi, '-') || 'kalshi-chart';
  return `${safeName}.png`;
}

function generateDefaultTrend(targetOdds: number): number[] {
  const defaultTrend: number[] = [];
  let currentValue = 40 + Math.random() * 20;

  for (let i = 0; i < 100; i++) {
    const drift = ((targetOdds - currentValue) / (100 - i)) * 0.2;
    const randomStep = (Math.random() - 0.5) * 8;
    currentValue += drift + randomStep;
    currentValue = Math.max(0, Math.min(100, currentValue));
    defaultTrend.push(currentValue);
  }

  defaultTrend[99] = targetOdds;
  return defaultTrend;
}

export default function ChartBuilder() {
  const navigate = useNavigate();
  const location = useLocation();

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
    timeHorizon: 'ALL',
    showWatermark: true,
  });

  const [data, setData] = useState<DataPoint[]>([]);
  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [showTrendDrawer, setShowTrendDrawer] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const configRef = useRef(config);

  function updateConfig(updater: (prev: MarketConfig) => MarketConfig) {
    setConfig((prev) => {
      const next = updater(prev);
      configRef.current = next;
      return next;
    });
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const sharedConfig = urlParams.get('c');

    if (sharedConfig) {
      decodeConfigFromUrl(sharedConfig)
        .then((decodedConfig) => {
          updateConfig((prev) => ({ ...prev, ...decodedConfig }));
        })
        .catch((error) => {
          console.error('Failed to decode shared config:', error);
        });
    }
  }, [location.search]);

  useEffect(() => {
    regenerateData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    regenerateData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.marketType, config.timeHorizon, config.startDate, config.endDate]);

  useEffect(() => {
    if (config.marketType === 'multi') {
      regenerateData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.outcomes.length]);

  function regenerateData(sourceConfig: MarketConfig = configRef.current) {
    const current = sourceConfig;
    // Get date range based on time horizon
    const { startDate, endDate } = current.timeHorizon === 'ALL' 
      ? { startDate: current.startDate, endDate: current.endDate }
      : getDateRangeForTimeHorizon(current.timeHorizon, current.endDate);

    if (current.marketType === 'binary') {
      if (!current.customTrendData) {
        const defaultTrend = generateDefaultTrend(current.currentOdds);
        const newData = generateMarketData(current.currentOdds, current.volatility, defaultTrend, startDate, endDate, current.timeHorizon);
        setData(newData);
      } else {
        const newData = generateMarketData(current.currentOdds, current.volatility, current.customTrendData, startDate, endDate, current.timeHorizon);
        setData(newData);
      }
    } else {
      const baseData = generateMarketData(50, current.volatility, generateDefaultTrend(50), startDate, endDate, current.timeHorizon);

      current.outcomes.forEach((outcome) => {
        const trend = outcome.customTrendData || generateDefaultTrend(outcome.currentOdds);
        const outcomeData = generateMarketData(outcome.currentOdds, current.volatility, trend, startDate, endDate, current.timeHorizon);

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
    updateConfig((prev) => ({ ...prev, ...updates }));
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
    updateConfig((prev) => ({ ...prev, image: croppedImage }));
    setCropperImage(null);
  }

  function handleCropCancel() {
    setCropperImage(null);
  }

  function handleOpenTrendDrawer() {
    setShowTrendDrawer(true);
  }

  function handleTrendDrawComplete(trendData: number[]) {
    const finalOdds = Math.round(trendData[trendData.length - 1]);

    updateConfig((prev) => {
      const updated = {
        ...prev,
        customTrendData: trendData,
        currentOdds: finalOdds,
      };

      const { startDate, endDate } = updated.timeHorizon === 'ALL' 
        ? { startDate: updated.startDate, endDate: updated.endDate }
        : getDateRangeForTimeHorizon(updated.timeHorizon, updated.endDate);
      const newData = generateMarketData(finalOdds, updated.volatility, trendData, startDate, endDate, updated.timeHorizon);
      setData(newData);

      return updated;
    });

    setShowTrendDrawer(false);
  }

  function handleTrendDrawCancel() {
    setShowTrendDrawer(false);
  }

  function showToast(message: string) {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  }

  async function handleExport() {
    const element = document.getElementById(CHART_PREVIEW_ID);
    if (!element) return;

    try {
      const dataUrl = await captureElementAsPng(element);
      downloadDataUrl(dataUrl, createFileName(config.title));
    } catch (error) {
      console.error('Error exporting image:', error);
      alert('Failed to export image. Please try again.');
    }
  }

  async function handleCopyToClipboard() {
    const element = document.getElementById(CHART_PREVIEW_ID);
    if (!element) return;

    try {
      const dataUrl = await captureElementAsPng(element);
      await copyDataUrlToClipboard(dataUrl);
      showToast('Chart copied to clipboard!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showToast('Failed to copy to clipboard');
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
          onCopyToClipboard={handleCopyToClipboard}
          onBack={() => navigate('/')}
        />
        <div className="preview-section">
          <ChartPreview 
            config={config} 
            data={data} 
            onTimeHorizonChange={(timeHorizon) => {
              handleConfigChange({ timeHorizon: timeHorizon as any });
              regenerateData();
            }}
          />
          <div className="attribution">
            <p>
              Built by{' '}
              <a href="https://x.com/hanznathanpo" target="_blank" rel="noopener noreferrer">
                Hanz Po
              </a>{' '}
              &bull;{' '}
              <a href="https://kalshi.com/?utm_source=kalshitools" target="_blank" rel="noopener noreferrer">
                Visit Kalshi
              </a>{' '}
              &bull; © 2025
            </p>
          </div>
        </div>
      </div>

      {cropperImage && (
        <ImageCropper imageSrc={cropperImage} onCropComplete={handleCropComplete} onCancel={handleCropCancel} />
      )}

      {showTrendDrawer && <TrendDrawer onComplete={handleTrendDrawComplete} onCancel={handleTrendDrawCancel} />}

      {toastMessage && <div className="toast">{toastMessage}</div>}
    </div>
  );
}

