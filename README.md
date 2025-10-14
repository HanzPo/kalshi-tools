# Kalshi Tools

Professional tools for Kalshi prediction markets. Create custom prediction market charts for analysis, content creation, and visualization.

## Features

- **Simple Interface**: Single-page app with easy-to-use controls
- **Professional Design**: High-quality Kalshi-style charts
- **Full Customization**:
  - Custom market title
  - Image upload with square cropping
  - Binary and multi-outcome markets
  - Draw custom trend lines
  - Adjustable final odds (1-99%)
  - Customizable volume display
  - Date range selection
- **Advanced Features**: 
  - Interactive trend drawing
  - URL sharing for collaboration
  - Copy to clipboard
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
3. **Select Market Type**: Choose between binary or multi-outcome markets
4. **Draw Custom Trends**: Use the trend drawer to create custom price movements
5. **Set Current Odds**: Use the slider to set the final probability
6. **Adjust Volume**: Customize the volume display
7. **Set Date Range**: Choose start and end dates for your chart
8. **Export**: Download your chart as a PNG image or copy to clipboard
9. **Share**: Share your configuration via URL

## Technology Stack

- React 18
- TypeScript
- Vite
- Recharts (for chart rendering)
- react-image-crop (for image cropping)
- html-to-image (for PNG export)

## Disclaimer

This tool is for visualization and content creation purposes. Charts should be clearly labeled as custom-generated content.

## License

MIT
