# Market Maker

A web-based tool for generating realistic-looking (but fake) prediction market charts for entertainment, social media content, and memes.

## Features

- **Simple Interface**: Single-page app with easy-to-use controls
- **Authentic Design**: Mimics popular platforms like Kalshi and Polymarket
- **Full Customization**:
  - Custom market title
  - Image upload with square cropping
  - Platform style selection (Kalshi or Polymarket)
  - Data trend patterns (increasing, decreasing, volatile, etc.)
  - Adjustable final odds (1-99%)
  - Customizable volume display
- **Monte Carlo Simulation**: Generates realistic-looking chart data
- **Export to PNG**: Download your creation as a high-quality image

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to the URL shown in the terminal (usually http://localhost:5173)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

1. **Enter a Market Title**: Type your prediction market question
2. **Upload an Image** (optional): Choose an image and crop it to square
3. **Select Platform Style**: Choose between Kalshi or Polymarket theme
4. **Choose Data Trend**: Select how the chart should look (increasing, volatile, etc.)
5. **Set Current Odds**: Use the slider to set the final probability
6. **Adjust Volume**: Customize the volume display
7. **Regenerate**: Click the dice button to generate new random data
8. **Export**: Download your chart as a PNG image

## Data Trends

- **Steadily Increasing**: Clear upward trend with minor fluctuations
- **Steadily Decreasing**: Clear downward trend with minor fluctuations
- **Highly Volatile**: Sharp peaks and troughs
- **Random Walk**: No discernible long-term trend
- **Sudden Spike**: Mostly stable, then sharp increase
- **Sudden Crash**: Mostly stable, then sharp decrease

## Technology Stack

- React 18
- TypeScript
- Vite
- Recharts (for chart rendering)
- react-image-crop (for image cropping)
- html-to-image (for PNG export)

## Disclaimer

This tool is for entertainment purposes only. All generated charts are fake and should not be used for any financial decisions or misrepresented as real data.

## License

MIT
