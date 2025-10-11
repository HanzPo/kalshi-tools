import { ChangeEvent } from 'react';
import { MarketConfig, MarketType, Outcome } from '../types';
import './ControlPanel.css';

interface ControlPanelProps {
  config: MarketConfig;
  onConfigChange: (config: Partial<MarketConfig>) => void;
  onImageUpload: (file: File) => void;
  onExport: () => void;
  onRegenerateData: () => void;
  onOpenTrendDrawer: () => void;
}

const OUTCOME_COLORS = ['#09C285', '#4662f5', '#191919'];

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

  function handleMarketTypeChange(marketType: MarketType) {
    if (marketType === 'multi' && config.outcomes.length === 0) {
      // Initialize with 2 default outcomes that sum to 100
      onConfigChange({
        marketType,
        outcomes: [
          { id: '1', name: 'Outcome 1', color: OUTCOME_COLORS[0], currentOdds: 60, customTrendData: null },
          { id: '2', name: 'Outcome 2', color: OUTCOME_COLORS[1], currentOdds: 40, customTrendData: null },
        ],
      });
    } else {
      onConfigChange({ marketType });
    }
  }

  function handleAddOutcome() {
    if (config.outcomes.length < 3) {
      // Calculate fair distribution for new outcome
      const numOutcomes = config.outcomes.length + 1;
      const targetPerOutcome = Math.floor(100 / numOutcomes);
      
      // Redistribute odds among all outcomes including new one
      const updatedOutcomes = config.outcomes.map((outcome) => ({
        ...outcome,
        currentOdds: targetPerOutcome,
        customTrendData: null
      }));
      
      const newOutcome: Outcome = {
        id: String(config.outcomes.length + 1),
        name: `Outcome ${config.outcomes.length + 1}`,
        color: OUTCOME_COLORS[config.outcomes.length % OUTCOME_COLORS.length],
        currentOdds: targetPerOutcome,
        customTrendData: null,
      };
      
      const allOutcomes = [...updatedOutcomes, newOutcome];
      
      // Handle rounding to ensure sum is 100
      const currentSum = allOutcomes.reduce((sum, o) => sum + o.currentOdds, 0);
      if (currentSum !== 100 && allOutcomes.length > 0) {
        allOutcomes[0] = {
          ...allOutcomes[0],
          currentOdds: allOutcomes[0].currentOdds + (100 - currentSum)
        };
      }
      
      onConfigChange({ outcomes: allOutcomes });
      onRegenerateData();
    }
  }

  function handleRemoveOutcome(outcomeId: string) {
    if (config.outcomes.length > 2) {
      const filteredOutcomes = config.outcomes.filter(o => o.id !== outcomeId);
      
      // Redistribute odds proportionally among remaining outcomes
      const currentTotal = filteredOutcomes.reduce((sum, o) => sum + o.currentOdds, 0);
      
      if (currentTotal > 0) {
        const normalizedOutcomes = filteredOutcomes.map(outcome => ({
          ...outcome,
          currentOdds: Math.round((outcome.currentOdds / currentTotal) * 100),
          customTrendData: null
        }));
        
        // Handle rounding errors
        const currentSum = normalizedOutcomes.reduce((sum, o) => sum + o.currentOdds, 0);
        if (currentSum !== 100 && normalizedOutcomes.length > 0) {
          normalizedOutcomes[0] = {
            ...normalizedOutcomes[0],
            currentOdds: normalizedOutcomes[0].currentOdds + (100 - currentSum)
          };
        }
        
        onConfigChange({ outcomes: normalizedOutcomes });
      } else {
        // If all are 0, distribute evenly
        const perOutcome = Math.floor(100 / filteredOutcomes.length);
        const normalizedOutcomes = filteredOutcomes.map((outcome, i) => ({
          ...outcome,
          currentOdds: perOutcome + (i === 0 ? 100 - (perOutcome * filteredOutcomes.length) : 0),
          customTrendData: null
        }));
        onConfigChange({ outcomes: normalizedOutcomes });
      }
      
      onRegenerateData();
    }
  }

  function handleOutcomeChange(outcomeId: string, updates: Partial<Outcome>) {
    const updatedOutcomes = config.outcomes.map(o =>
      o.id === outcomeId ? { ...o, ...updates } : o
    );
    onConfigChange({ outcomes: updatedOutcomes });
  }

  function handleOutcomeOddsChange(outcomeId: string, odds: number) {
    // Normalize odds so they sum to 100
    const updatedOutcomes = [...config.outcomes];
    const targetIndex = updatedOutcomes.findIndex(o => o.id === outcomeId);
    
    if (targetIndex === -1) return;
    
    // Set the new odds for the target outcome
    updatedOutcomes[targetIndex] = { 
      ...updatedOutcomes[targetIndex], 
      currentOdds: odds,
      customTrendData: null 
    };
    
    // Calculate remaining percentage to distribute
    const remaining = 100 - odds;
    
    // Get other outcomes
    const otherOutcomes = updatedOutcomes.filter((_, i) => i !== targetIndex);
    
    // Calculate current total of other outcomes
    const otherTotal = otherOutcomes.reduce((sum, o) => sum + o.currentOdds, 0);
    
    // Redistribute remaining percentage proportionally
    if (otherTotal > 0 && remaining > 0) {
      updatedOutcomes.forEach((outcome, i) => {
        if (i !== targetIndex) {
          const proportion = outcome.currentOdds / otherTotal;
          updatedOutcomes[i] = {
            ...outcome,
            currentOdds: Math.max(0, Math.round(remaining * proportion)),
            customTrendData: null // Reset custom trends when odds change
          };
        }
      });
      
      // Handle rounding errors - adjust the first other outcome
      const currentSum = updatedOutcomes.reduce((sum, o) => sum + o.currentOdds, 0);
      if (currentSum !== 100) {
        const firstOtherIndex = updatedOutcomes.findIndex((_, i) => i !== targetIndex);
        if (firstOtherIndex !== -1) {
          updatedOutcomes[firstOtherIndex] = {
            ...updatedOutcomes[firstOtherIndex],
            currentOdds: Math.max(0, updatedOutcomes[firstOtherIndex].currentOdds + (100 - currentSum))
          };
        }
      }
    } else if (remaining > 0) {
      // Distribute evenly if all others are 0
      const perOutcome = Math.floor(remaining / otherOutcomes.length);
      let remainder = remaining - (perOutcome * otherOutcomes.length);
      
      updatedOutcomes.forEach((outcome, i) => {
        if (i !== targetIndex) {
          updatedOutcomes[i] = {
            ...outcome,
            currentOdds: perOutcome + (remainder > 0 ? 1 : 0),
            customTrendData: null
          };
          remainder--;
        }
      });
    } else {
      // If remaining is 0 or negative, set all others to 0
      updatedOutcomes.forEach((outcome, i) => {
        if (i !== targetIndex) {
          updatedOutcomes[i] = {
            ...outcome,
            currentOdds: 0,
            customTrendData: null
          };
        }
      });
    }
    
    onConfigChange({ outcomes: updatedOutcomes });
    onRegenerateData();
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
        <label htmlFor="market-type">Market Type</label>
        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
          <button
            onClick={() => handleMarketTypeChange('binary')}
            className={config.marketType === 'binary' ? 'button-market-type-active' : 'button-market-type'}
            style={{
              flex: 1,
              padding: '10px',
              border: '2px solid',
              borderColor: config.marketType === 'binary' ? '#09C285' : '#e5e7eb',
              backgroundColor: config.marketType === 'binary' ? '#ecfdf5' : 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: config.marketType === 'binary' ? '600' : '500',
              color: config.marketType === 'binary' ? '#09C285' : '#6b7280',
              transition: 'all 0.2s',
            }}
          >
            Binary (Yes/No)
          </button>
          <button
            onClick={() => handleMarketTypeChange('multi')}
            className={config.marketType === 'multi' ? 'button-market-type-active' : 'button-market-type'}
            style={{
              flex: 1,
              padding: '10px',
              border: '2px solid',
              borderColor: config.marketType === 'multi' ? '#09C285' : '#e5e7eb',
              backgroundColor: config.marketType === 'multi' ? '#ecfdf5' : 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: config.marketType === 'multi' ? '600' : '500',
              color: config.marketType === 'multi' ? '#09C285' : '#6b7280',
              transition: 'all 0.2s',
            }}
          >
            Multi-Outcome
          </button>
        </div>
        <p className="help-text">
          {config.marketType === 'binary' 
            ? 'Single yes/no outcome market' 
            : 'Multiple bracket/outcome market'}
        </p>
      </div>

      {config.marketType === 'multi' && (
        <div className="control-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label>Outcomes</label>
            <span style={{ 
              fontSize: '13px', 
              fontWeight: '600',
              color: '#09C285',
              backgroundColor: '#ecfdf5',
              padding: '4px 12px',
              borderRadius: '6px'
            }}>
              Total: {config.outcomes.reduce((sum, o) => sum + o.currentOdds, 0)}%
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '8px' }}>
            {config.outcomes.map((outcome, index) => (
              <div
                key={outcome.id}
                style={{
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '12px',
                  backgroundColor: '#f9fafb',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      backgroundColor: outcome.color,
                      flexShrink: 0,
                    }}
                  />
                  <input
                    type="text"
                    value={outcome.name}
                    onChange={(e) => handleOutcomeChange(outcome.id, { name: e.target.value })}
                    placeholder={`Outcome ${index + 1}`}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      fontSize: '14px',
                    }}
                  />
                  {config.outcomes.length > 2 && (
                    <button
                      onClick={() => handleRemoveOutcome(outcome.id)}
                      style={{
                        padding: '6px 10px',
                        border: 'none',
                        backgroundColor: '#fee2e2',
                        color: '#dc2626',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '600',
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div>
                  <label style={{ fontSize: '13px', color: '#6b7280', display: 'block', marginBottom: '4px' }}>
                    Odds: {outcome.currentOdds}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={outcome.currentOdds}
                    onChange={(e) => handleOutcomeOddsChange(outcome.id, parseInt(e.target.value))}
                    className="slider-input"
                  />
                </div>
              </div>
            ))}
          </div>
          {config.outcomes.length < 3 && (
            <button
              onClick={handleAddOutcome}
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '12px',
                border: '2px dashed #d1d5db',
                backgroundColor: 'white',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                color: '#6b7280',
              }}
            >
              + Add Outcome
            </button>
          )}
        </div>
      )}

      {config.marketType === 'binary' && (
        <>
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
              <p className="help-text" style={{ color: '#D91616', marginTop: '8px' }}>
                ⚠️ Adjusting odds will reset your custom trend
              </p>
            )}
          </div>
        </>
      )}

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

      <div className="control-group">
        <label htmlFor="start-date">Start Date</label>
        <input
          id="start-date"
          type="date"
          className="text-input"
          value={config.startDate.toISOString().split('T')[0]}
          onChange={(e) => {
            const newDate = new Date(e.target.value);
            onConfigChange({ startDate: newDate });
            onRegenerateData();
          }}
          max={config.endDate.toISOString().split('T')[0]}
        />
        <p className="help-text">Chart start date (default: 3 months ago)</p>
      </div>

      <div className="control-group">
        <label htmlFor="end-date">End Date</label>
        <input
          id="end-date"
          type="date"
          className="text-input"
          value={config.endDate.toISOString().split('T')[0]}
          onChange={(e) => {
            const newDate = new Date(e.target.value);
            onConfigChange({ endDate: newDate });
            onRegenerateData();
          }}
          min={config.startDate.toISOString().split('T')[0]}
        />
        <p className="help-text">Chart end date (default: today)</p>
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

