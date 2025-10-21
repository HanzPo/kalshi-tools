import { useRef } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { MarketConfig, DataPoint } from '../types';
import { generateChange, formatVolume } from '../utils/dataGenerator';
import './ChartPreview.css';

interface ChartPreviewProps {
  config: MarketConfig;
  data: DataPoint[];
  onTimeHorizonChange?: (timeHorizon: string) => void;
}

export function ChartPreview({ config, data, onTimeHorizonChange }: ChartPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  
  const change = generateChange(data);
  const changeValue = parseFloat(change);
  const isPositive = changeValue >= 0;
  
  const chartColor = isPositive ? '#09C285' : '#D91616';
  const bgColor = '#ffffff';
  const textColor = '#000000';
  const secondaryTextColor = '#6b7280';
  const gridColor = '#e5e7eb';
  
  // Get unique dates for X-axis ticks (should be 6)
  const uniqueDates = Array.from(new Set(data.map(d => d.time)));
  
  return (
    <div
      ref={previewRef}
      id="chart-preview"
      className="chart-preview"
      style={{
        backgroundColor: bgColor,
        color: textColor,
      }}
    >
      {/* Header */}
      <div className="chart-header">
        <div className="chart-title-section">
          {config.image && (
            <img
              src={config.image}
              alt="Market"
              className="chart-image"
            />
          )}
          <h2 className="chart-title">{config.title || 'Untitled Market'}</h2>
        </div>
        <div className="chart-icons">
          <button className="icon-button" style={{ color: secondaryTextColor }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          </button>
          <button className="icon-button" style={{ color: secondaryTextColor }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Odds Display */}
      <div className="odds-section">
        {config.marketType === 'binary' ? (
          <>
            <div className="odds-main">
              <div className="odds-group">
                <span
                  className="odds-value"
                  style={{
                    color: config.currentOdds === 0 ? '#cccccc' : textColor
                  }}
                >
                  {config.currentOdds === 0 ? '<1' : Math.min(config.currentOdds, 99)}%
                </span>
                <span className="odds-label">chance</span>
              </div>
              <span
                className="odds-change"
                style={{
                  color: isPositive ? chartColor : '#D91616',
                }}
              >
                {isPositive ? '▲' : '▼'} {Math.abs(changeValue).toFixed(1)}
              </span>
            </div>
            <div className="platform-logo">
              <a href="https://kalshi.com/?utm_source=kalshitools" target="_blank" rel="noopener noreferrer">
                <svg width="63" height="16" viewBox="0 0 78 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#09C285' }}>
                  <path d="M40.1043 0H36.0332V19.9986H40.1043V0Z" fill="currentColor" fillOpacity="0.9"></path>
                  <path d="M0.416887 0.0221237H4.73849V8.99348L12.818 0.0221237H18.0582L10.6468 8.24586L18.5384 20H13.3608L7.59868 11.5686L4.73849 14.7459V20H0.416887V0.0221237Z" fill="currentColor"></path>
                  <path fillRule="evenodd" clipRule="evenodd" d="M34.4675 19.8117H32.4007C30.5426 19.8117 29.624 19.0017 29.6658 17.4027C29.1229 18.2334 28.4549 18.8771 27.6824 19.3132C26.8891 19.7494 25.9496 19.9778 24.8222 19.9778C23.1729 19.9778 21.8368 19.604 20.8138 18.8564C19.8117 18.088 19.3106 17.0289 19.3106 15.6582C19.3106 14.1007 19.8952 12.8962 21.0434 12.0656C22.2126 11.2141 23.9036 10.778 26.1166 10.778H29.0603V10.0719C29.0603 9.40737 28.8098 8.8882 28.3087 8.49362C27.8077 8.09905 27.1396 7.89138 26.2836 7.89138C25.532 7.89138 24.9266 8.05752 24.4464 8.36902C23.9662 8.70129 23.674 9.1374 23.5905 9.67734H19.6446C19.7699 8.18212 20.4589 7.01916 21.6697 6.18848C22.8806 5.3578 24.4882 4.92169 26.4924 4.92169C28.5801 4.92169 30.2086 5.37857 31.3359 6.29232C32.4842 7.20607 33.0688 8.53516 33.0688 10.2588V15.4298C33.0688 15.7828 33.1523 16.0321 33.2984 16.1774C33.4445 16.302 33.6951 16.3851 34.0291 16.3851H34.4675V19.8117ZM26.0749 13.4569C25.2398 13.4569 24.5717 13.6231 24.0915 13.9761C23.6322 14.3084 23.4026 14.7653 23.4026 15.3675C23.4026 15.8867 23.5905 16.2813 23.9871 16.5928C24.3838 16.9043 24.9266 17.0496 25.5947 17.0496C26.6594 17.0496 27.4945 16.7589 28.1 16.1567C28.7054 15.5544 29.0394 14.7445 29.0603 13.7269V13.4569H26.0749Z" fill="currentColor"></path>
                  <path d="M45.5115 14.9314C45.5741 15.5752 45.8873 16.0944 46.4718 16.5097C47.0564 16.9043 47.7871 17.112 48.6848 17.112C49.5408 17.112 50.2297 16.9874 50.7308 16.7174C51.2318 16.4266 51.4824 16.0321 51.4824 15.5129C51.4824 15.1391 51.3571 14.8483 51.1275 14.6614C50.8978 14.4745 50.5638 14.3292 50.1462 14.2669C49.7287 14.163 49.0397 14.0592 48.0794 13.9554C46.7641 13.7892 45.6785 13.5608 44.8225 13.2908C43.9665 13.0208 43.2567 12.6055 42.7557 12.024C42.2337 11.4426 41.9832 10.6949 41.9832 9.73966C41.9832 8.78438 42.2337 7.9537 42.7557 7.22685C43.2985 6.47924 44.0501 5.91853 45.0104 5.50319C45.9708 5.10861 47.0773 4.90094 48.3299 4.90094C50.355 4.92171 51.9625 5.35782 53.1943 6.1885C54.4469 7.01918 55.115 8.18213 55.2194 9.67736H51.3571C51.2945 9.11665 51.0022 8.68054 50.4594 8.3275C49.9374 7.97446 49.2694 7.78756 48.4343 7.78756C47.6618 7.78756 47.0355 7.93293 46.5553 8.22367C46.096 8.5144 45.8664 8.88821 45.8664 9.36585C45.8664 9.71889 45.9916 9.9681 46.2422 10.1342C46.4927 10.3004 46.8267 10.425 47.2234 10.508C47.6201 10.5911 48.309 10.6742 49.2485 10.7572C51.2527 10.9857 52.7768 11.4218 53.8206 12.0448C54.9062 12.647 55.4282 13.7062 55.4282 15.2222C55.4282 16.1774 55.1359 17.0081 54.5722 17.735C54.0085 18.4618 53.2361 19.0225 52.2131 19.4171C51.211 19.7909 50.0418 19.9986 48.7266 19.9986C46.6806 19.9986 44.9895 19.5417 43.716 18.6487C42.4216 17.735 41.7535 16.4889 41.67 14.9314H45.5115Z" fill="currentColor"></path>
                  <path d="M69.7503 6.72852C68.623 5.6694 67.2033 5.12946 65.4496 5.12946C63.6333 5.12946 62.1719 5.794 61.0654 7.12309V0H56.9943V19.9986H61.0654V12.4602C61.0654 11.1934 61.3368 10.2174 61.9213 9.5113C62.5059 8.80522 63.3201 8.45218 64.364 8.45218C65.3661 8.45218 66.1177 8.78445 66.6187 9.42823C67.1198 10.0512 67.3703 10.965 67.3703 12.1902V19.9986H71.4414V12.0241C71.4414 9.55283 70.8777 7.78763 69.7503 6.72852Z" fill="currentColor"></path>
                  <path d="M73.0068 5.29551H77.0779V19.9778H73.0068V5.29551Z" fill="currentColor" fillOpacity="0.9"></path>
                  <path d="M76.473 0.581477C76.0972 0.20767 75.617 0 75.0324 0C74.4688 0 73.9677 0.20767 73.571 0.581477C73.1952 0.955283 72.9865 1.41216 72.9865 1.97287C72.9865 2.53358 73.1952 3.01122 73.571 3.38503C73.9677 3.75883 74.4688 3.9665 75.0324 3.9665C75.5961 3.9665 76.0972 3.7796 76.473 3.38503C76.8488 2.99045 77.0575 2.53358 77.0575 1.97287C77.0575 1.41216 76.8488 0.934516 76.473 0.581477Z" fill="currentColor"></path>
                </svg>
              </a>
            </div>
          </>
        ) : (
          <>
            <div className="odds-main" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              {config.outcomes.map((outcome) => (
                <div key={outcome.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: outcome.color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: '14px', fontWeight: '500', color: secondaryTextColor }}>
                    {outcome.name}
                  </span>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: textColor }}>
                    {outcome.currentOdds === 0 ? '1' : Math.min(outcome.currentOdds, 99)}%
                  </span>
                </div>
              ))}
            </div>
            <div className="platform-logo">
              <a href="https://kalshi.com/?utm_source=kalshitools" target="_blank" rel="noopener noreferrer">
                <svg width="63" height="16" viewBox="0 0 78 20" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ color: '#09C285' }}>
                  <path d="M40.1043 0H36.0332V19.9986H40.1043V0Z" fill="currentColor" fillOpacity="0.9"></path>
                  <path d="M0.416887 0.0221237H4.73849V8.99348L12.818 0.0221237H18.0582L10.6468 8.24586L18.5384 20H13.3608L7.59868 11.5686L4.73849 14.7459V20H0.416887V0.0221237Z" fill="currentColor"></path>
                  <path fillRule="evenodd" clipRule="evenodd" d="M34.4675 19.8117H32.4007C30.5426 19.8117 29.624 19.0017 29.6658 17.4027C29.1229 18.2334 28.4549 18.8771 27.6824 19.3132C26.8891 19.7494 25.9496 19.9778 24.8222 19.9778C23.1729 19.9778 21.8368 19.604 20.8138 18.8564C19.8117 18.088 19.3106 17.0289 19.3106 15.6582C19.3106 14.1007 19.8952 12.8962 21.0434 12.0656C22.2126 11.2141 23.9036 10.778 26.1166 10.778H29.0603V10.0719C29.0603 9.40737 28.8098 8.8882 28.3087 8.49362C27.8077 8.09905 27.1396 7.89138 26.2836 7.89138C25.532 7.89138 24.9266 8.05752 24.4464 8.36902C23.9662 8.70129 23.674 9.1374 23.5905 9.67734H19.6446C19.7699 8.18212 20.4589 7.01916 21.6697 6.18848C22.8806 5.3578 24.4882 4.92169 26.4924 4.92169C28.5801 4.92169 30.2086 5.37857 31.3359 6.29232C32.4842 7.20607 33.0688 8.53516 33.0688 10.2588V15.4298C33.0688 15.7828 33.1523 16.0321 33.2984 16.1774C33.4445 16.302 33.6951 16.3851 34.0291 16.3851H34.4675V19.8117ZM26.0749 13.4569C25.2398 13.4569 24.5717 13.6231 24.0915 13.9761C23.6322 14.3084 23.4026 14.7653 23.4026 15.3675C23.4026 15.8867 23.5905 16.2813 23.9871 16.5928C24.3838 16.9043 24.9266 17.0496 25.5947 17.0496C26.6594 17.0496 27.4945 16.7589 28.1 16.1567C28.7054 15.5544 29.0394 14.7445 29.0603 13.7269V13.4569H26.0749Z" fill="currentColor"></path>
                  <path d="M45.5115 14.9314C45.5741 15.5752 45.8873 16.0944 46.4718 16.5097C47.0564 16.9043 47.7871 17.112 48.6848 17.112C49.5408 17.112 50.2297 16.9874 50.7308 16.7174C51.2318 16.4266 51.4824 16.0321 51.4824 15.5129C51.4824 15.1391 51.3571 14.8483 51.1275 14.6614C50.8978 14.4745 50.5638 14.3292 50.1462 14.2669C49.7287 14.163 49.0397 14.0592 48.0794 13.9554C46.7641 13.7892 45.6785 13.5608 44.8225 13.2908C43.9665 13.0208 43.2567 12.6055 42.7557 12.024C42.2337 11.4426 41.9832 10.6949 41.9832 9.73966C41.9832 8.78438 42.2337 7.9537 42.7557 7.22685C43.2985 6.47924 44.0501 5.91853 45.0104 5.50319C45.9708 5.10861 47.0773 4.90094 48.3299 4.90094C50.355 4.92171 51.9625 5.35782 53.1943 6.1885C54.4469 7.01918 55.115 8.18213 55.2194 9.67736H51.3571C51.2945 9.11665 51.0022 8.68054 50.4594 8.3275C49.9374 7.97446 49.2694 7.78756 48.4343 7.78756C47.6618 7.78756 47.0355 7.93293 46.5553 8.22367C46.096 8.5144 45.8664 8.88821 45.8664 9.36585C45.8664 9.71889 45.9916 9.9681 46.2422 10.1342C46.4927 10.3004 46.8267 10.425 47.2234 10.508C47.6201 10.5911 48.309 10.6742 49.2485 10.7572C51.2527 10.9857 52.7768 11.4218 53.8206 12.0448C54.9062 12.647 55.4282 13.7062 55.4282 15.2222C55.4282 16.1774 55.1359 17.0081 54.5722 17.735C54.0085 18.4618 53.2361 19.0225 52.2131 19.4171C51.211 19.7909 50.0418 19.9986 48.7266 19.9986C46.6806 19.9986 44.9895 19.5417 43.716 18.6487C42.4216 17.735 41.7535 16.4889 41.67 14.9314H45.5115Z" fill="currentColor"></path>
                  <path d="M69.7503 6.72852C68.623 5.6694 67.2033 5.12946 65.4496 5.12946C63.6333 5.12946 62.1719 5.794 61.0654 7.12309V0H56.9943V19.9986H61.0654V12.4602C61.0654 11.1934 61.3368 10.2174 61.9213 9.5113C62.5059 8.80522 63.3201 8.45218 64.364 8.45218C65.3661 8.45218 66.1177 8.78445 66.6187 9.42823C67.1198 10.0512 67.3703 10.965 67.3703 12.1902V19.9986H71.4414V12.0241C71.4414 9.55283 70.8777 7.78763 69.7503 6.72852Z" fill="currentColor"></path>
                  <path d="M73.0068 5.29551H77.0779V19.9778H73.0068V5.29551Z" fill="currentColor" fillOpacity="0.9"></path>
                  <path d="M76.473 0.581477C76.0972 0.20767 75.617 0 75.0324 0C74.4688 0 73.9677 0.20767 73.571 0.581477C73.1952 0.955283 72.9865 1.41216 72.9865 1.97287C72.9865 2.53358 73.1952 3.01122 73.571 3.38503C73.9677 3.75883 74.4688 3.9665 75.0324 3.9665C75.5961 3.9665 76.0972 3.7796 76.473 3.38503C76.8488 2.99045 77.0575 2.53358 77.0575 1.97287C77.0575 1.41216 76.8488 0.934516 76.473 0.581477Z" fill="currentColor"></path>
                </svg>
              </a>
            </div>
          </>
        )}
      </div>

      {/* Chart */}
      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 25, bottom: config.marketType === 'multi' ? 10 : 5 }}>
            <CartesianGrid
              strokeDasharray="1 4"
              stroke={gridColor}
              horizontal={true}
              vertical={false}
              strokeWidth={1}
            />
            <XAxis
              dataKey="time"
              stroke="transparent"
              tick={{ fill: secondaryTextColor, fontSize: 13, dx: 20 }}
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              ticks={uniqueDates}
              interval={0}
            />
            <YAxis
              orientation="right"
              stroke="transparent"
              tick={{ fill: secondaryTextColor, fontSize: 13 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              ticks={[0, 20, 40, 60, 80, 100]}
              tickFormatter={(value) => `${value}%`}
              tickMargin={15}
            />
            {config.marketType === 'binary' ? (
              <Line
                type="linear"
                dataKey="value"
                stroke={chartColor}
                strokeWidth={2.5}
                dot={(props: any) => {
                  // Only show dot on the last point
                  const isLast = props.index === data.length - 1;
                  if (!isLast) return <circle r={0} />;
                  return (
                    <circle
                      cx={props.cx}
                      cy={props.cy}
                      r={5}
                      fill={chartColor}
                      stroke={chartColor}
                      strokeWidth={3}
                    />
                  );
                }}
                activeDot={{ r: 5, fill: chartColor }}
                animationDuration={300}
              />
            ) : (
              <>
                {config.outcomes.map((outcome) => (
                  <Line
                    key={outcome.id}
                    type="linear"
                    dataKey={`value_${outcome.id}`}
                    name={outcome.name}
                    stroke={outcome.color}
                    strokeWidth={2.5}
                    dot={(props: any) => {
                      // Only show dot on the last point
                      const isLast = props.index === data.length - 1;
                      if (!isLast) return <circle r={0} />;
                      return (
                        <circle
                          cx={props.cx}
                          cy={props.cy}
                          r={5}
                          fill={outcome.color}
                          stroke={outcome.color}
                          strokeWidth={3}
                        />
                      );
                    }}
                    activeDot={{ r: 5, fill: outcome.color }}
                    animationDuration={300}
                  />
                ))}
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Volume and Timeframes */}
      <div className="chart-footer">
        <div className="volume" style={{ color: secondaryTextColor }}>
          {formatVolume(config.volume)}
        </div>
        <div className="timeframes">
          {['6H', '1D', '1W', '1M', 'ALL'].map((tf) => (
            <button
              key={tf}
              className="timeframe-button"
              onClick={() => onTimeHorizonChange?.(tf)}
              style={{
                color: config.timeHorizon === tf ? textColor : secondaryTextColor,
                backgroundColor: config.timeHorizon === tf ? '#f3f4f6' : 'transparent',
                fontWeight: config.timeHorizon === tf ? '600' : '500',
              }}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Watermark */}
      {config.showWatermark && (
        <div 
          style={{
            textAlign: 'center',
            padding: '8px 0 12px 0',
            fontSize: '11px',
            color: '#9ca3af',
            fontWeight: '400',
            letterSpacing: '0.025em',
          }}
        >
          kalshi.tools
        </div>
      )}
    </div>
  );
}
