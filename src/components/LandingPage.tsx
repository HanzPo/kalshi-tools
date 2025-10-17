import './LandingPage.css';

interface LandingPageProps {
  onSelectChart: () => void;
  onSelectBetSlip: () => void;
}

export function LandingPage({ onSelectChart, onSelectBetSlip }: LandingPageProps) {
  return (
    <div className="landing-page">
      <div className="landing-header">
        <h1>Kalshi Tools</h1>
        <p>Create realistic market charts and bet slips</p>
      </div>
      
      <div className="landing-options">
        <button className="landing-option" onClick={onSelectChart}>
          <div className="option-image chart-example">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M3 3v18h18"/>
              <path d="M18.5 8.5l-5 5-4-4-3 3"/>
            </svg>
          </div>
          <div className="option-content">
            <span className="option-subtitle">Create a...</span>
            <span className="option-title">Chart</span>
          </div>
        </button>

        <button className="landing-option" onClick={onSelectBetSlip}>
          <div className="option-image betslip-example">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="4" width="18" height="16" rx="2"/>
              <path d="M7 8h10"/>
              <path d="M7 12h10"/>
              <path d="M7 16h4"/>
            </svg>
          </div>
          <div className="option-content">
            <span className="option-subtitle">Create a...</span>
            <span className="option-title">Bet Slip</span>
          </div>
        </button>
      </div>

      <div className="landing-footer">
        <p>Built by <a href="https://x.com/hanznathanpo" target="_blank" rel="noopener noreferrer">Hanz Po</a> • <a href="https://kalshi.com/?utm_source=kalshitools" target="_blank" rel="noopener noreferrer">Visit Kalshi</a> • © 2025</p>
      </div>
    </div>
  );
}