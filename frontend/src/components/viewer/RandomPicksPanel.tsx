import { useRef, useState, useEffect, useCallback, useImperativeHandle, forwardRef, type PointerEvent as ReactPointerEvent } from 'react';
import type { Photo } from '../../types';
import { useTranslation } from '../../i18n/useTranslation';

/** Per-image zoomable wrapper */
function ZoomableImage({ photo, onClick }: { photo: Photo; onClick: () => void }) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn = useCallback(() => {
    setScale((s) => Math.min(s * 1.3, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setScale((s) => {
      const next = s / 1.3;
      if (next <= 1) {
        setPosition({ x: 0, y: 0 });
        return 1;
      }
      return next;
    });
  }, []);

  // Native wheel listener with { passive: false }
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.deltaY < 0) handleZoomIn();
      else handleZoomOut();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [handleZoomIn, handleZoomOut]);

  const handlePointerDown = useCallback((e: ReactPointerEvent) => {
    if (scale > 1) {
      e.preventDefault();
      e.stopPropagation();
      setIsPanning(true);
      panStart.current = { x: e.clientX - position.x, y: e.clientY - position.y };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  }, [scale, position]);

  const handlePointerMove = useCallback((e: ReactPointerEvent) => {
    if (isPanning) {
      setPosition({
        x: e.clientX - panStart.current.x,
        y: e.clientY - panStart.current.y,
      });
    }
  }, [isPanning]);

  const handlePointerUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Don't navigate if zoomed — only navigate at scale 1
    if (scale > 1) {
      e.stopPropagation();
      return;
    }
    onClick();
  }, [scale, onClick]);

  // Reset zoom when photo changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [photo.id]);

  return (
    <div
      ref={containerRef}
      className="zoomable-image-container"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClick={handleClick}
      style={{ cursor: scale > 1 ? (isPanning ? 'grabbing' : 'grab') : 'pointer' }}
    >
      <img
        src={`/api/images/${photo.id}/full?v=${photo.modified_at}`}
        alt={photo.file_name}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transition: isPanning ? 'none' : 'transform 0.2s',
        }}
        draggable={false}
      />
    </div>
  );
}

interface RandomPicksPanelProps {
  photos: Photo[];
  onSelect: (id: number) => void;
  onClose: () => void;
  onShuffle: () => void;
}

export interface RandomPicksPanelHandle {
  toggleFullscreen: () => void;
}

export const RandomPicksPanel = forwardRef<RandomPicksPanelHandle, RandomPicksPanelProps>(function RandomPicksPanel({ photos: initialPhotos, onSelect, onClose, onShuffle }, ref) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [layout, setLayout] = useState<'horizontal' | 'vertical'>('horizontal');
  const [photos, setPhotos] = useState(initialPhotos);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const { t } = useTranslation();

  // Sync when parent photos change (e.g. shuffle)
  useEffect(() => {
    setPhotos(initialPhotos);
  }, [initialPhotos]);

  const toggleFullscreen = useCallback(async () => {
    if (!panelRef.current) return;
    if (!document.fullscreenElement) {
      await panelRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }, []);

  useImperativeHandle(ref, () => ({ toggleFullscreen }), [toggleFullscreen]);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Set a transparent drag image to use our custom styling instead
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setOverIndex(index);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    setPhotos((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(dropIndex, 0, moved);
      return next;
    });
    setDragIndex(null);
    setOverIndex(null);
  }, [dragIndex]);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setOverIndex(null);
  }, []);

  if (photos.length === 0) return null;

  return (
    <div className="random-picks-panel" ref={panelRef}>
      <div className="random-picks-header">
        <button
          className={`random-picks-layout-btn${layout === 'vertical' ? ' active' : ''}`}
          onClick={() => setLayout('vertical')}
          title={t('viewer.layoutVertical')}
        >
          &#9776;
        </button>
        <button
          className={`random-picks-layout-btn${layout === 'horizontal' ? ' active' : ''}`}
          onClick={() => setLayout('horizontal')}
          title={t('viewer.layoutHorizontal')}
        >
          &#9783;
        </button>
        <button
          className="random-picks-fullscreen-btn"
          onClick={toggleFullscreen}
          title={isFullscreen ? t('viewer.exitFullscreen') : t('viewer.fullscreen')}
        >
          {isFullscreen ? '\u2716' : '\u26F6'}
        </button>
        <button className="random-picks-close" onClick={onClose} title="Close">
          &times;
        </button>
      </div>
      <div className={`random-picks-grid random-picks-grid-${layout}`}>
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className={
              'random-picks-item'
              + (dragIndex === index ? ' dragging' : '')
              + (overIndex === index && dragIndex !== index ? ' drag-over' : '')
            }
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
          >
            <ZoomableImage photo={photo} onClick={() => onSelect(photo.id)} />
          </div>
        ))}
      </div>
    </div>
  );
});
