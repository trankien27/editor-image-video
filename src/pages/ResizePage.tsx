import React, { useRef, useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import '../style/ResizePage.css';

// Minimal type definition for JSZip to handle CDN usage
declare module 'jszip' {
  interface JSZipObject {
    name: string;
    dir: boolean;
    async(type: 'blob'): Promise<Blob>;
  }
  interface JSZip {
    files: { [key: string]: JSZipObject };
    loadAsync(file: File): Promise<JSZip>;
  }
}

interface ResizedImage {
  name: string;
  src: string;
  width: number;
  height: number;
  isCustom: boolean;
  customWidth: number;
  customHeight: number;
  originalSrc: string;
}

const sizeMap: Record<string, [number, number]> = {
  "158A": [1080, 1720], "158B": [1080, 1720], "158C": [1080, 1720],
  "158D": [1720, 1080], "158E": [1720, 1080],
  "264A": [1020, 3040], "264B": [1020, 3040], "264C": [3040, 1020],
  "264D": [3040, 1020], "264E": [2040, 3040],
  "461A": [2040, 3040], "461B": [3040, 2040],
  "463A": [2040, 3040], "463B": [3040, 2040],
  "464A": [2040, 3040], "464B": [3040, 2040],
  "466A": [2040, 3040], "466B": [3040, 2040],
  "468A": [2040, 3040], "468B": [3040, 2040],
  "620A": [3060, 10200], "620B": [10200, 3060], "620C": [10200, 3060],
};

const ResizePage: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<ResizedImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = '#007bff';
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.currentTarget.style.borderColor = '#ccc';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.style.borderColor = '#ccc';
    handleFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const showLoading = () => {
    setIsLoading(true);
  };

  const hideLoading = () => {
    setIsLoading(false);
  };

  const handleFiles = async (files: FileList) => {
    showLoading();
    try {
      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (ext === "zip") {
          const zip = new JSZip();
          const loaded = await zip.loadAsync(file);
          for (const [filename, entry] of Object.entries(loaded.files) as [string, JSZip.JSZipObject][]) {
            if (!entry.dir && /\.(png|jpg|jpeg|webp)$/i.test(filename)) {
              const blob = await entry.async("blob");
              const newFile = new File([blob], filename, { type: blob.type });
              await handleImageFile(newFile);
            }
          }
        } else if (/image\/(png|jpeg|jpg|webp)/.test(file.type)) {
          await handleImageFile(file);
        }
      }
    } catch (error) {
      console.error('Error processing files:', error);
    } finally {
      hideLoading();
    }
  };

  const handleImageFile = async (file: File): Promise<void> => {
    return new Promise((resolve) => {
      const fileName = file.name.split(".")[0];
      const code = Object.keys(sizeMap).find((k) => fileName.toUpperCase().includes(k));
      const [targetW, targetH] = sizeMap[code ?? ""] ?? [null, null];

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) return resolve();
          const ctx = canvas.getContext('2d');
          if (!ctx) return resolve();

          const w = targetW ?? img.width;
          const h = targetH ?? img.height;

          canvas.width = w;
          canvas.height = h;
          ctx.drawImage(img, 0, 0, w, h);
          const dataURL = canvas.toDataURL("image/png");

          setImages((prev) => [
            ...prev,
            {
              name: `${code ?? fileName}.png`,
              src: dataURL,
              width: w,
              height: h,
              isCustom: !code,
              customWidth: w,
              customHeight: h,
              originalSrc: e.target?.result as string,
            },
          ]);
          resolve();
        };
        img.onerror = () => resolve();
      };
      reader.onerror = () => resolve();
      reader.readAsDataURL(file);
    });
  };

  const updateImageSize = (index: number, dimension: 'width' | 'height', value: string) => {
    const numValue = parseInt(value);
    if (numValue > 0) {
      setImages((prev) => {
        const newImages = [...prev];
        if (dimension === 'width') {
          newImages[index].customWidth = numValue;
        } else {
          newImages[index].customHeight = numValue;
        }

        const img = newImages[index];
        const image = new Image();
        image.src = img.originalSrc;
        image.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          canvas.width = img.customWidth;
          canvas.height = img.customHeight;
          ctx.drawImage(image, 0, 0, img.customWidth, img.customHeight);
          newImages[index].src = canvas.toDataURL("image/png");
          setImages([...newImages]);
        };
        return newImages;
      });
    }
  };

  const downloadImage = (index: number) => {
    const img = images[index];
    const link = document.createElement('a');
    link.download = img.name;
    link.href = img.src;
    link.click();
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllImages = () => {
    if (window.confirm('Bạn có chắc muốn xóa tất cả ảnh?')) {
      setImages([]);
    }
  };

  const downloadAll = async () => {
    showLoading();
    try {
      const zip = new JSZip();
      for (const img of images) {
        const image = new Image();
        image.src = img.originalSrc;
        await new Promise<void>((resolve) => {
          image.onload = () => {
            const canvas = canvasRef.current;
            if (!canvas) return resolve();
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve();

            const w = img.isCustom ? img.customWidth : img.width;
            const h = img.isCustom ? img.customHeight : img.height;

            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(image, 0, 0, w, h);

            canvas.toBlob((blob) => {
              if (blob) zip.file(img.name, blob);
              resolve();
            }, "image/png");
          };
          image.onerror = () => resolve();
        });
      }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, "exported-images.zip");
    } catch (error) {
      console.error('Error downloading all images:', error);
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="resize-page">
      <h2>📐 Resize ảnh theo khung</h2>
      <div
        className="dropzone"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <p>📂 Click hoặc kéo & thả ảnh / file .zip vào đây</p>
        <input
          id="fileInput"
          type="file"
          accept=".zip,image/*"
          multiple
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileInputChange}
        />
      </div>
      {images.length > 0 && (
        <div id="imageHeader" className="image-header">
          <div className="image-count">
            📋 Danh sách ảnh (<span id="imageCount">{images.length}</span>)
          </div>
          <div className="header-buttons">
            <button className="btn btn-primary" onClick={downloadAll}>
              📦 Tải tất cả (.zip)
            </button>
            <button className="btn btn-danger" onClick={clearAllImages}>
              🗑️ Xóa tất cả
            </button>
          </div>
        </div>
      )}
      <div id="imageGrid" className="image-grid">
        {images.map((img, index) => (
          <div key={index} className="image-item fade-in">
            <div className="image-preview">
              <img src={img.src} alt={img.name} />
            </div>
            <div className="image-name">{img.name}</div>
            <div className="image-size">
              {img.isCustom ? (
                <span className="custom-size">{`${img.customWidth} × ${img.customHeight}`}</span>
              ) : (
                <span className="fixed-size">{`${img.width} × ${img.height}`}</span>
              )}
            </div>
            {img.isCustom && (
              <div className="size-inputs">
                <div className="size-input-group">
                  <div className="size-label">Width</div>
                  <input
                    type="number"
                    className="size-input"
                    value={img.customWidth}
                    onChange={(e) => updateImageSize(index, 'width', e.target.value)}
                    min="1"
                  />
                </div>
                <div className="size-input-group">
                  <div className="size-label">Height</div>
                  <input
                    type="number"
                    className="size-input"
                    value={img.customHeight}
                    onChange={(e) => updateImageSize(index, 'height', e.target.value)}
                    min="1"
                  />
                </div>
              </div>
            )}
            <div className="image-actions">
              <button className="btn btn-success btn-sm" onClick={() => downloadImage(index)}>
                📥 Tải
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => removeImage(index)}>
                ❌ Xóa
              </button>
            </div>
          </div>
        ))}
      </div>
      <canvas id="canvas" className="hidden" ref={canvasRef} />
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default ResizePage;