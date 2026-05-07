import { useState, useEffect, useRef } from 'react';
import { api } from '../../api/client';
import { useAppStore } from '../../stores/appStore';
import { usePhotos } from '../../hooks/usePhotos';
import { useTranslation } from '../../i18n/useTranslation';
import type { PhotoListResponse } from '../../types';

interface ScanButtonProps {
  rootFolder: string;
  onStartScan: () => Promise<void>;
  onPollStatus: () => Promise<{ is_scanning: boolean }>;
  onReset: () => Promise<void>;
}

export function ScanButton({ rootFolder, onStartScan, onPollStatus, onReset }: ScanButtonProps) {
  const { scanStatus } = useAppStore();
  const [scanning, setScanning] = useState(false);
  const [photoCount, setPhotoCount] = useState<number | null>(null);
  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const pollRef = useRef<number | null>(null);
  const { fetchPhotos } = usePhotos();
  const { t } = useTranslation();

  const fetchPhotoCount = async () => {
    try {
      const data = await api.get<PhotoListResponse>('/photos?per_page=1');
      setPhotoCount(data.total);
    } catch {
      setPhotoCount(null);
    }
  };

  useEffect(() => {
    fetchPhotoCount();
  }, []);

  const handleScan = async () => {
    await onStartScan();
    setScanning(true);
  };

  const handleReset = async () => {
    if (!confirm(t('settings.resetConfirm'))) return;
    setResetting(true);
    setResetDone(false);
    try {
      await onReset();
      setPhotoCount(0);
      setResetDone(true);
      setTimeout(() => setResetDone(false), 3000);
    } catch { /* ignore */ }
    setResetting(false);
  };

  useEffect(() => {
    if (scanning) {
      pollRef.current = window.setInterval(async () => {
        const status = await onPollStatus();
        if (!status.is_scanning) {
          setScanning(false);
          if (pollRef.current) clearInterval(pollRef.current);
          fetchPhotoCount();
          fetchPhotos(1, false);
        }
      }, 1000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [scanning, onPollStatus]);

  const isScanning = scanning || scanStatus?.is_scanning;

  return (
    <div className="setting-section">
      <h3>{t('settings.scan')}</h3>

      <div className="scan-info">
        {photoCount !== null && photoCount > 0 ? (
          <>
            <p className="scan-info-text">{t('settings.scanInfo', { count: photoCount })}</p>
            {rootFolder && <p className="scan-info-text">{t('settings.scanFolder', { path: rootFolder })}</p>}
          </>
        ) : (
          <p className="scan-info-text">{t('settings.scanNoData')}</p>
        )}
      </div>

      <div className="setting-row" style={{ marginBottom: 0 }}>
        <button
          className="btn btn-primary"
          onClick={handleScan}
          disabled={!!isScanning || resetting}
        >
          {isScanning ? t('settings.scanning') : t('settings.startScan')}
        </button>
        <button
          className="btn btn-danger"
          onClick={handleReset}
          disabled={!!isScanning || resetting}
        >
          {resetting ? t('settings.resettingData') : t('settings.resetData')}
        </button>
        {resetDone && <span className="success-text">{t('settings.resetDone')}</span>}
      </div>

      {isScanning && scanStatus && (
        <div className="scan-progress">
          <div className="scan-progress-bar">
            <div
              className="scan-progress-fill"
              style={{
                width: scanStatus.total > 0
                  ? `${(scanStatus.processed / scanStatus.total) * 100}%`
                  : '0%',
              }}
            />
          </div>
          <p className="scan-progress-text">
            {t('settings.filesProcessed', { processed: scanStatus.processed, total: scanStatus.total })}
          </p>
          {scanStatus.current_file && (
            <p className="scan-current-file">{scanStatus.current_file}</p>
          )}
        </div>
      )}

      {scanStatus?.error && (
        <p className="error-text">{scanStatus.error}</p>
      )}

      {!isScanning && scanStatus && !scanStatus.error && scanStatus.total > 0 && (
        <p className="success-text">
          {t('settings.scanComplete', { count: scanStatus.total })}
        </p>
      )}
    </div>
  );
}
