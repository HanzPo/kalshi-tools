import { ChangeEvent } from 'react';
import { MarketConfig } from '../types';
import './ControlPanel.css';

interface ControlPanelProps {
  config: MarketConfig;
  onConfigChange: (config: Partial<MarketConfig>) => void;
  onImageUpload: (file: File) => void;
  onExport: () => void;
  onRegenerateData: () => void;
  onOpenTrendDrawer: () => void;
}

export function ControlPanel({
  config,
  onConfigChange,
  onImageUpload,
  onExport,
  onRegenerateData,
  onOpenTrendDrawer,
}: ControlPanelProps) {
  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  }

  return (
    <div className="control-panel">
      <h1 className="panel-title">Market Maker</h1>
      <p className="panel-subtitle">
        Create realistic prediction market charts
      </p>

      <div className="control-group">
        <label htmlFor="market-title">Market Title</label>
        <input
          id="market-title"
          type="text"
          className="text-input"
          placeholder="e.g., Hanz getting a job"
          value={config.title}
          onChange={(e) => onConfigChange({ title: e.target.value })}
        />
      </div>

      <div className="control-group">
        <label htmlFor="market-image">Market Image (Optional)</label>
        <input
          id="market-image"
          type="file"
          accept="image/jpeg,image/png,image/jpg"
          onChange={handleImageChange}
          className="file-input"
        />
        <p className="help-text">Upload an image for your market</p>
      </div>

      <div className="control-group">
        <label>Market Trend (Optional)</label>
        <button onClick={onOpenTrendDrawer} className="button-draw">
          ✏️ {config.customTrendData ? 'Redraw Trend' : 'Draw Custom Trend'}
        </button>
        {config.customTrendData ? (
          <p className="help-text" style={{ color: '#09C285', fontWeight: 600 }}>
            ✓ Using your custom drawn trend
          </p>
        ) : (
          <p className="help-text">
            Using random walk default • Draw your own trend line
          </p>
        )}
      </div>

      <div className="control-group">
        <label htmlFor="current-odds">
          Current Odds: {config.currentOdds}%
        </label>
        <input
          id="current-odds"
          type="range"
          min="0"
          max="100"
          value={config.currentOdds}
          onChange={(e) => {
            onConfigChange({ currentOdds: parseInt(e.target.value), customTrendData: null });
            onRegenerateData();
          }}
          className="slider-input"
        />
        <div className="slider-labels">
          <span>0%</span>
          <span>100%</span>
        </div>
        {config.customTrendData && (
          <p className="help-text" style={{ color: '#ef4444', marginTop: '8px' }}>
            ⚠️ Adjusting odds will reset your custom trend
          </p>
        )}
      </div>

      <div className="control-group">
        <label htmlFor="volatility">
          Volatility: {config.volatility}x
        </label>
        <input
          id="volatility"
          type="range"
          min="0.2"
          max="3"
          step="0.2"
          value={config.volatility}
          onChange={(e) => {
            onConfigChange({ volatility: parseFloat(e.target.value) });
            onRegenerateData();
          }}
          className="slider-input"
        />
        <div className="slider-labels">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>

      <div className="control-group">
        <label htmlFor="volume">Volume</label>
        <input
          id="volume"
          type="number"
          className="text-input"
          placeholder="e.g., 528110"
          value={config.volume}
          onChange={(e) => {
            const value = parseInt(e.target.value) || 0;
            onConfigChange({ volume: value });
          }}
          min="0"
          step="1000"
        />
        <p className="help-text">Enter amount (e.g., 528110)</p>
      </div>

      <button onClick={onRegenerateData} className="button-regenerate">
        🎲 Regenerate Data
      </button>

      <button onClick={onExport} className="button-export">
        📥 Export as PNG
      </button>

      <footer className="panel-footer">
        <p>Made by <a href="https://hanzpo.com" target="_blank" rel="noopener noreferrer">Hanz Po</a></p>
      </footer>
    </div>
  );
}

