import { useState, useRef, useCallback } from 'react';
import ReactCrop, {
  Crop,
  PixelCrop,
  centerCrop,
  convertToPixelCrop,
  makeAspectCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import './ImageCropper.css';

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

export function ImageCropper({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop | undefined>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleImageLoad = useCallback((event: React.SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 100,
        },
        1,
        naturalWidth,
        naturalHeight
      ),
      naturalWidth,
      naturalHeight
    );

    setCrop(initialCrop);
    setCompletedCrop(convertToPixelCrop(initialCrop, naturalWidth, naturalHeight));
  }, []);

  const getCroppedImg = useCallback((): string | null => {
    const image = imgRef.current;
    if (!image) {
      return null;
    }

    const pixelCrop =
      completedCrop ??
      (crop
        ? convertToPixelCrop(crop, image.naturalWidth, image.naturalHeight)
        : null);

    if (!pixelCrop || !pixelCrop.width || !pixelCrop.height) {
      return null;
    }

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.drawImage(
      image,
      pixelCrop.x * scaleX,
      pixelCrop.y * scaleY,
      pixelCrop.width * scaleX,
      pixelCrop.height * scaleY,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return canvas.toDataURL('image/jpeg');
  }, [completedCrop, crop]);

  const handleComplete = useCallback(() => {
    const croppedImage = getCroppedImg();
    if (croppedImage) {
      onCropComplete(croppedImage);
    }
  }, [getCroppedImg, onCropComplete]);

  return (
    <div className="cropper-modal">
      <div className="cropper-content">
        <h3>Crop Image (Square)</h3>
        <div className="cropper-container">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(pixelCrop) => setCompletedCrop(pixelCrop)}
            aspect={1}
            circularCrop={false}
            ruleOfThirds
          >
            <img
              ref={imgRef}
              src={imageSrc}
              alt="Crop preview"
              onLoad={handleImageLoad}
              style={{ maxWidth: '100%', maxHeight: '60vh', display: 'block' }}
            />
          </ReactCrop>
        </div>
        <div className="cropper-actions">
          <button onClick={onCancel} className="button-secondary">
            Cancel
          </button>
          <button onClick={handleComplete} className="button-primary">
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
}

