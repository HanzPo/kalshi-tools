import { useRef, useState, useEffect } from 'react';
import './TrendDrawer.css';

interface TrendDrawerProps {
  onComplete: (trendData: number[]) => void;
  onCancel: () => void;
}

export function TrendDrawer({ onComplete, onCancel }: TrendDrawerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Horizontal lines
    for (let i = 0; i <= 10; i++) {
      const y = (i / 10) * canvas.height;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Vertical lines
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * canvas.width;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // Draw percentage labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 10; i++) {
      const y = (i / 10) * canvas.height;
      const percentage = 100 - (i * 10);
      ctx.fillText(`${percentage}%`, canvas.width - 5, y + 4);
    }

    // Draw points
    if (points.length > 1) {
      ctx.strokeStyle = '#09C285';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
    }
  }, [points]);

  function getCanvasCoordinates(
    e: React.MouseEvent<HTMLCanvasElement> | React.Touch,
    canvas: HTMLCanvasElement
  ): { x: number; y: number } {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const clientX = 'clientX' in e ? e.clientX : e.clientX;
    const clientY = 'clientY' in e ? e.clientY : e.clientY;
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    return {
      x: Math.max(0, Math.min(canvas.width, x)),
      y: Math.max(0, Math.min(canvas.height, y))
    };
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const coords = getCanvasCoordinates(e, canvas);
    setPoints([coords]);
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const coords = getCanvasCoordinates(e, canvas);
    setPoints((prev) => [...prev, coords]);
  }

  function handleMouseUp() {
    setIsDrawing(false);
  }

  function handleTouchStart(e: React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault();
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const touch = e.touches[0];
    const coords = getCanvasCoordinates(touch, canvas);
    setPoints([coords]);
  }

  function handleTouchMove(e: React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault();
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const touch = e.touches[0];
    const coords = getCanvasCoordinates(touch, canvas);
    setPoints((prev) => [...prev, coords]);
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLCanvasElement>) {
    e.preventDefault();
    setIsDrawing(false);
  }

  function handleClear() {
    setPoints([]);
  }

  function handleApply() {
    const canvas = canvasRef.current;
    if (!canvas || points.length < 2) {
      alert('Please draw a trend line first!');
      return;
    }

    // Convert points to percentage values (100 data points)
    const numPoints = 100;
    const trendData: number[] = [];
    
    // Sort points by x coordinate
    const sortedPoints = [...points].sort((a, b) => a.x - b.x);
    
    // Remove duplicate x coordinates, keep first occurrence
    const uniquePoints: { x: number; y: number }[] = [];
    let lastX = -1;
    for (const point of sortedPoints) {
      if (point.x !== lastX) {
        uniquePoints.push(point);
        lastX = point.x;
      }
    }
    
    for (let i = 0; i < numPoints; i++) {
      const targetX = (i / (numPoints - 1)) * canvas.width;
      
      // Find the two closest points for interpolation
      let p1 = uniquePoints[0];
      let p2 = uniquePoints[uniquePoints.length - 1];
      
      for (let j = 0; j < uniquePoints.length - 1; j++) {
        if (uniquePoints[j].x <= targetX && uniquePoints[j + 1].x >= targetX) {
          p1 = uniquePoints[j];
          p2 = uniquePoints[j + 1];
          break;
        }
      }
      
      // Interpolate between the two points
      let y: number;
      if (p1.x === p2.x || p2.x - p1.x === 0) {
        y = p1.y;
      } else {
        const t = (targetX - p1.x) / (p2.x - p1.x);
        y = p1.y + t * (p2.y - p1.y);
      }
      
      // Convert y coordinate to percentage (0-100)
      // Canvas y goes from 0 (top) to height (bottom)
      // We want 0% at bottom, 100% at top
      const percentage = ((canvas.height - y) / canvas.height) * 100;
      const clampedPercentage = Math.max(0, Math.min(100, percentage));
      trendData.push(clampedPercentage);
    }

    onComplete(trendData);
  }

  return (
    <div className="trend-drawer-modal">
      <div className="trend-drawer-content">
        <h3>Draw Your Trend</h3>
        <p className="drawer-instructions">
          Click and drag to draw a line from left to right showing your custom market trend
        </p>
        
        <div className="canvas-container">
          <canvas
            ref={canvasRef}
            width={600}
            height={300}
            className="drawing-canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          />
        </div>

        <div className="drawer-actions">
          <button onClick={handleClear} className="button-secondary">
            Clear
          </button>
          <div className="drawer-actions-right">
            <button onClick={onCancel} className="button-secondary">
              Cancel
            </button>
            <button onClick={handleApply} className="button-primary">
              Apply Trend
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
