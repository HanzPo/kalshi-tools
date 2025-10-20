import { ChangeEvent, useState, DragEvent } from 'react';
import { BetSlipConfig } from '../types';
import '../components/ControlPanel.css';

interface BetSlipMakerProps {
  config: BetSlipConfig;
  onConfigChange: (config: Partial<BetSlipConfig>) => void;
  onImageUpload: (file: File) => void;
  onExport: () => void;
  onCopyToClipboard: () => void;
  onBack: () => void;
}

export function BetSlipMaker({
  config,
  onConfigChange,
  onImageUpload,
  onExport,
  onCopyToClipboard,
  onBack,
}: BetSlipMakerProps) {
  const [isDragging, setIsDragging] = useState(false);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        onImageUpload(file);
      }
    }
  }

  const calculatePayout = (wager: number, odds: number): number => {
    if (odds <= 0 || odds >= 100) return 0;
    return Math.round((wager / (odds / 100)) * 100) / 100;
  };

  const payout = calculatePayout(config.wager, config.odds);

  return (
    <div className="control-panel">
      <button onClick={onBack} className="back-button-control-panel">
        <span aria-hidden="true">&larr;</span>
        Back
      </button>
      <h1 className="panel-title">Bet Slip Maker</h1>
      <p className="panel-subtitle">
        Create Kalshi-style bet slips
      </p>

      <div className="control-group">
        <label htmlFor="bet-title">Question</label>
        <input
          id="bet-title"
          type="text"
          className="text-input"
          placeholder="e.g., Will Democrats win the 2024 Presidential Election?"
          value={config.title}
          onChange={(e) => onConfigChange({ title: e.target.value })}
        />
      </div>

      <div className="control-group">
        <label htmlFor="bet-answer">Answer</label>
        <input
          id="bet-answer"
          type="text"
          className="text-input"
          placeholder="e.g., yes"
          value={config.answer}
          onChange={(e) => onConfigChange({ answer: e.target.value })}
        />
      </div>

      <div className="control-group">
        <label htmlFor="bet-image">Image (Optional)</label>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${isDragging ? '#09C285' : '#d1d5db'}`,
            borderRadius: '8px',
            padding: '12px',
            textAlign: 'center',
            backgroundColor: isDragging ? '#ecfdf5' : '#f9fafb',
            transition: 'all 0.2s',
            cursor: 'pointer',
            marginBottom: '8px'
          }}
        >
          <input
            id="bet-image"
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleImageChange}
            className="file-input"
            style={{ display: 'none' }}
          />
          <label
            htmlFor="bet-image"
            style={{
              cursor: 'pointer',
              display: 'block',
              color: isDragging ? '#09C285' : '#6b7280',
              fontWeight: '500',
              fontSize: '14px',
              lineHeight: '1.5'
            }}
          >
            {isDragging ? (
              <>
                <span style={{ verticalAlign: 'middle', marginRight: '6px' }}>📥</span>
                <span style={{ display: 'inline-block', verticalAlign: 'middle', transform: 'translateY(4px)' }}>Drop image here</span>
              </>
            ) : (
              <>
                <span style={{ verticalAlign: 'middle', marginRight: '6px' }}>📷</span>
                <span style={{ display: 'inline-block', verticalAlign: 'middle', transform: 'translateY(2px)' }}>Click to upload or drag & drop</span>
              </>
            )}
          </label>
        </div>
        <p className="help-text">Supports JPG, PNG formats</p>
      </div>

      <div className="control-group">
        <label htmlFor="bet-wager">Wager Amount ($)</label>
        <input
          id="bet-wager"
          type="number"
          className="text-input"
          placeholder="e.g., 1000"
          value={config.wager}
          onChange={(e) => onConfigChange({ wager: parseFloat(e.target.value) || 0 })}
          min="0"
          step="100"
        />
      </div>

      <div className="control-group">
        <label htmlFor="bet-odds">Odds (%)</label>
        <input
          id="bet-odds"
          type="number"
          className="text-input"
          placeholder="e.g., 50"
          value={config.odds}
          onChange={(e) => onConfigChange({ odds: parseFloat(e.target.value) || 0 })}
          min="1"
          max="99"
          step="1"
        />
        <p className="help-text">Expected payout: ${payout.toLocaleString()}</p>
      </div>

      <div className="control-group" style={{ marginBottom: 0 }}>
        <label htmlFor="show-watermark-bet" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input
            id="show-watermark-bet"
            type="checkbox"
            checked={config.showWatermark}
            onChange={(e) => onConfigChange({ showWatermark: e.target.checked })}
            style={{
              width: '18px',
              height: '18px',
              cursor: 'pointer',
              accentColor: '#09C285',
            }}
          />
          <span>Show Watermark</span>
        </label>
        <p className="help-text">Display watermark on bet slip</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
        <button 
          onClick={onExport} 
          className="button-export"
          style={{ flex: 1 }}
        >
          📥 Export as PNG
        </button>
        <button 
          onClick={onCopyToClipboard} 
          className="button-export"
          style={{ flex: 1 }}
        >
          📋 Copy
        </button>
      </div>
    </div>
  );
}


