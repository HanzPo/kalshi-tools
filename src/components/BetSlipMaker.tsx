import { ChangeEvent, useState, DragEvent } from 'react';
import { BetSlipConfig, BetSlipMode, ParlayLeg } from '../types';
import '../components/ControlPanel.css';

interface BetSlipMakerProps {
  config: BetSlipConfig;
  onConfigChange: (config: Partial<BetSlipConfig>) => void;
  onImageUpload: (file: File) => void;
  onExport: () => void;
  onCopyToClipboard: () => void;
  onBack: () => void;
}

function createLeg(): ParlayLeg {
  return {
    id: `leg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    question: '',
    answer: 'Yes',
    image: null,
  };
}

function calculateSinglePayout(wager: number, odds: number): number {
  if (odds <= 0 || odds >= 100) return 0;
  return Math.round((wager / (odds / 100)) * 100) / 100;
}

function calculateAmericanPayout(wager: number, odds: number): number {
  if (!Number.isFinite(odds) || odds === 0) {
    return 0;
  }

  const fractionalReturn =
    odds > 0 ? odds / 100 : 100 / Math.abs(odds);

  return Math.round((wager * (1 + fractionalReturn)) * 100) / 100;
}

const BRAND_GREEN = '#09C285';

export function BetSlipMaker({
  config,
  onConfigChange,
  onImageUpload,
  onExport,
  onCopyToClipboard,
  onBack,
}: BetSlipMakerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const isSingleMode = config.mode === 'single';
  const payout = isSingleMode
    ? calculateSinglePayout(config.wager, config.odds)
    : calculateAmericanPayout(config.wager, config.parlayOdds);

  function handleModeChange(mode: BetSlipMode) {
    if (mode === config.mode) return;

    if (mode === 'parlay' && config.parlayLegs.length === 0) {
      onConfigChange({ mode, parlayLegs: [createLeg(), createLeg()] });
    } else {
      onConfigChange({ mode });
    }
  }

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      onImageUpload(file);
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    if (!isSingleMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    if (!isSingleMode) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    if (!isSingleMode) return;
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

  function handleLegChange(legId: string, updates: Partial<ParlayLeg>) {
    const updatedLegs = config.parlayLegs.map((leg) =>
      leg.id === legId ? { ...leg, ...updates } : leg
    );
    onConfigChange({ parlayLegs: updatedLegs });
  }

  function handleLegImageInput(
    legId: string,
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        handleLegChange(legId, { image: result });
      }
    };
    reader.readAsDataURL(file);
  }

  function handleAddLeg() {
    onConfigChange({ parlayLegs: [...config.parlayLegs, createLeg()] });
  }

  function handleRemoveLeg(legId: string) {
    if (config.parlayLegs.length <= 1) return;
    onConfigChange({
      parlayLegs: config.parlayLegs.filter((leg) => leg.id !== legId),
    });
  }

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
        <label>Bet Slip Type</label>
        <div className="segmented-control">
          <button
            type="button"
            className={`segmented-option${isSingleMode ? ' active' : ''}`}
            onClick={() => handleModeChange('single')}
            aria-pressed={isSingleMode}
          >
            Single
          </button>
          <button
            type="button"
            className={`segmented-option${config.mode === 'parlay' ? ' active' : ''}`}
            onClick={() => handleModeChange('parlay')}
            aria-pressed={config.mode === 'parlay'}
          >
            Parlay
          </button>
        </div>
      </div>

      {isSingleMode ? (
        <>
          <div className="control-group">
            <label htmlFor="bet-market-name">Market Name</label>
            <input
              id="bet-market-name"
              type="text"
              className="text-input"
              placeholder="e.g., Bitcoin price today at 6pm EDT?"
              value={config.marketName}
              onChange={(e) => onConfigChange({ marketName: e.target.value })}
            />
          </div>

          <div className="control-group">
            <label htmlFor="bet-outcome">Outcome</label>
            <input
              id="bet-outcome"
              type="text"
              className="text-input"
              placeholder="e.g., $111,000 or above"
              value={config.outcome}
              onChange={(e) => onConfigChange({ outcome: e.target.value })}
            />
          </div>

          <div className="control-group">
            <label>Trade Side</label>
            <div className="segmented-control">
              {(['Yes', 'No'] as const).map((side) => {
                const sideColor = side === 'Yes' ? '#0f9b6c' : '#d91616';
                return (
                  <button
                    key={side}
                    type="button"
                    className={`segmented-option${config.tradeSide === side ? ' active' : ''}`}
                    onClick={() => onConfigChange({ tradeSide: side })}
                    aria-pressed={config.tradeSide === side}
                    style={{
                      color: sideColor,
                      fontWeight: config.tradeSide === side ? 600 : 500,
                    }}
                  >
                    {side}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="control-group">
            <label htmlFor="bet-image">Image (Optional)</label>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                border: `2px dashed ${isDragging ? BRAND_GREEN : '#d1d5db'}`,
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
                  color: isDragging ? BRAND_GREEN : '#6b7280',
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
            <p className="help-text">Supports JPG, PNG formats. Or press Ctrl+V to paste.</p>
          </div>
        </>
      ) : (
        <div className="control-group">
          <label htmlFor="bet-title">Slip Title</label>
          <input
            id="bet-title"
            type="text"
            className="text-input"
            placeholder="e.g., Sunday Night Parlay"
            value={config.title}
            onChange={(e) => onConfigChange({ title: e.target.value })}
          />
        </div>
      )}

      {!isSingleMode && (
        <div className="control-group">
          <label aria-hidden="true">Parlay Legs</label>
          <div className="parlay-legs">
            {config.parlayLegs.map((leg, index) => (
              <div key={leg.id} className="parlay-leg">
                <div className="parlay-leg-header">
                  <span className="parlay-leg-title">Leg {index + 1}</span>
                  <button
                    type="button"
                    className="parlay-leg-remove"
                    onClick={() => handleRemoveLeg(leg.id)}
                    disabled={config.parlayLegs.length <= 1}
                  >
                    Remove
                  </button>
                </div>
                <div className="parlay-leg-body">
                  <label className="parlay-leg-label" htmlFor={`parlay-question-${leg.id}`}>
                    Question
                  </label>
                  <input
                    id={`parlay-question-${leg.id}`}
                    type="text"
                    className="text-input"
                    placeholder="e.g., New York Giants to win?"
                    value={leg.question}
                    onChange={(e) => handleLegChange(leg.id, { question: e.target.value })}
                  />
                  <div className="parlay-leg-controls">
                    <div className="parlay-leg-control">
                      <span className="parlay-leg-label">Answer</span>
                      <div className="segmented-control parlay-answer-toggle">
                        {(['Yes', 'No'] as ParlayLeg['answer'][]).map((answer) => (
                          <button
                            key={answer}
                            type="button"
                            className={`segmented-option${leg.answer === answer ? ' active' : ''}`}
                            onClick={() => handleLegChange(leg.id, { answer })}
                            aria-pressed={leg.answer === answer}
                          >
                            {answer}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="parlay-leg-control">
                      <span className="parlay-leg-label">Image</span>
                      <div className="parlay-image-upload">
                        {leg.image ? (
                          <>
                            <img src={leg.image} alt="" className="parlay-leg-image" />
                            <button
                              type="button"
                              className="parlay-image-clear"
                              onClick={() => handleLegChange(leg.id, { image: null })}
                            >
                              Remove
                            </button>
                          </>
                        ) : (
                          <>
                            <label htmlFor={`parlay-image-${leg.id}`} className="parlay-image-placeholder">
                              Upload
                            </label>
                            <input
                              id={`parlay-image-${leg.id}`}
                              type="file"
                              accept="image/jpeg,image/png,image/jpg"
                              onChange={(e) => handleLegImageInput(leg.id, e)}
                              className="file-input"
                              style={{ display: 'none' }}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button type="button" className="parlay-leg-add" onClick={handleAddLeg}>
              + Add Leg
            </button>
          </div>
        </div>
      )}

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

      {isSingleMode ? (
        <div className="control-group">
          <label htmlFor="bet-odds">Odds (%)</label>
          <div className="slider-wrapper">
            <input
              id="bet-odds"
              type="range"
              className="slider-input"
              value={config.odds}
              onChange={(e) => onConfigChange({ odds: Number(e.target.value) })}
              min="1"
              max="99"
              step="1"
            />
            <div className="slider-value">{config.odds}% chance</div>
          </div>
          <p className="help-text">Expected payout: ${payout.toLocaleString()}</p>
        </div>
      ) : (
        <div className="control-group">
          <label htmlFor="parlay-odds">American Odds</label>
          <input
            id="parlay-odds"
            type="number"
            className="text-input"
            value={config.parlayOdds}
            onChange={(e) =>
              onConfigChange({ parlayOdds: Number(e.target.value) || 0 })
            }
            placeholder="+500"
            step="10"
          />
          <p className="help-text">
            Enter positive or negative odds (e.g., -110 or +250). Potential payout: ${payout.toLocaleString()}
          </p>
        </div>
      )}

      <div className="control-group" style={{ marginBottom: 0 }}>
        <label
          htmlFor="show-watermark-bet"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
        >
          <input
            id="show-watermark-bet"
            type="checkbox"
            checked={config.showWatermark}
            onChange={(e) => onConfigChange({ showWatermark: e.target.checked })}
            style={{
              width: '18px',
              height: '18px',
              cursor: 'pointer',
              accentColor: BRAND_GREEN,
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


