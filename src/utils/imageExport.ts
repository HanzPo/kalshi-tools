import { toPng } from 'html-to-image';

/**
 * Convert a DOM element into a PNG data URL using html-to-image.
 */
export async function captureElementAsPng(element: HTMLElement): Promise<string> {
  return toPng(element, {
    quality: 1,
    pixelRatio: 2,
  });
}

/**
 * Trigger a browser download for a given data URL.
 */
export function downloadDataUrl(dataUrl: string, fileName: string): void {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  link.click();
}

/**
 * Copy a PNG data URL to the clipboard.
 */
export async function copyDataUrlToClipboard(dataUrl: string): Promise<void> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();

  await navigator.clipboard.write([
    new ClipboardItem({
      [blob.type]: blob,
    }),
  ]);
}

