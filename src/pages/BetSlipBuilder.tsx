import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BetSlipConfig } from '../types';
import { BetSlipMaker } from '../components/BetSlipMaker';
import { BetSlipPreview } from '../components/BetSlipPreview';
import { ImageCropper } from '../components/ImageCropper';
import { captureElementAsPng, copyDataUrlToClipboard, downloadDataUrl } from '../utils/imageExport';
import '../App.css';

const BET_SLIP_PREVIEW_ID = 'bet-slip-preview';

function createFileName(title: string): string {
  const safeName = title.slice(0, 50).replace(/[^a-z0-9]/gi, '-') || 'kalshi-bet-slip';
  return `${safeName}.png`;
}

export default function BetSlipBuilder() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<BetSlipConfig>({
    mode: 'single',
    title: '',
    image: null,
    wager: 1000,
    odds: 65,
    answer: 'Yes',
    answerColor: 'green',
    showWatermark: true,
    parlayOdds: 400,
    parlayLegs: [
      { id: 'leg-1', question: '', answer: 'Yes', image: null },
      { id: 'leg-2', question: '', answer: 'Yes', image: null },
    ],
  });

  const [cropperImage, setCropperImage] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function handleConfigChange(updates: Partial<BetSlipConfig>) {
    setConfig((prev) => ({ ...prev, ...updates }));
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
    setConfig((prev) => ({ ...prev, image: croppedImage }));
    setCropperImage(null);
  }

  function handleCropCancel() {
    setCropperImage(null);
  }

  function showToast(message: string) {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  }

  async function handleExport() {
    const element = document.getElementById(BET_SLIP_PREVIEW_ID);
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
    const element = document.getElementById(BET_SLIP_PREVIEW_ID);
    if (!element) return;

    try {
      const dataUrl = await captureElementAsPng(element);
      await copyDataUrlToClipboard(dataUrl);
      showToast('Bet slip copied to clipboard!');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      showToast('Failed to copy to clipboard');
    }
  }

  return (
    <div className="app">
      <div className="app-container">
        <BetSlipMaker
          config={config}
          onConfigChange={handleConfigChange}
          onImageUpload={handleImageUpload}
          onExport={handleExport}
          onCopyToClipboard={handleCopyToClipboard}
          onBack={() => navigate('/')}
        />
        <div className="preview-section">
          <BetSlipPreview config={config} />
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

      {toastMessage && <div className="toast">{toastMessage}</div>}
    </div>
  );
}

