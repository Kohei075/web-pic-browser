import { useEffect, useRef, useCallback } from 'react';
import { useAppStore } from '../../stores/appStore';
import { usePhotos } from '../../hooks/usePhotos';
import { PhotoCard } from './PhotoCard';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { useTranslation } from '../../i18n/useTranslation';

export function PhotoGrid() {
  const { photos, page, totalPages, isLoadingPhotos } = useAppStore();
  const { fetchPhotos, loadMore } = usePhotos();
  const observerRef = useRef<HTMLDivElement>(null);
  const initialFetchDone = useRef(false);

  const { sortBy, sortOrder, selectedFolderPath, includeSubfolders, randomKey, gridColumns } = useAppStore();
  const { t } = useTranslation();

  useEffect(() => {
    initialFetchDone.current = false;
  }, [sortBy, sortOrder, selectedFolderPath, includeSubfolders, randomKey]);

  useEffect(() => {
    if (!initialFetchDone.current) {
      // If photos already exist in the store (e.g. navigating back), skip re-fetch
      if (photos.length > 0) {
        initialFetchDone.current = true;
        return;
      }
      initialFetchDone.current = true;
      fetchPhotos(1);
    }
  }, [fetchPhotos, sortBy, sortOrder, selectedFolderPath, includeSubfolders, randomKey, photos.length]);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && page < totalPages && !isLoadingPhotos) {
        loadMore();
      }
    },
    [page, totalPages, isLoadingPhotos, loadMore]
  );

  useEffect(() => {
    const node = observerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(handleIntersect, { threshold: 0.1 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [handleIntersect]);

  if (photos.length === 0 && isLoadingPhotos) {
    return <LoadingSpinner message={t('grid.loading')} />;
  }

  if (photos.length === 0 && !isLoadingPhotos) {
    return (
      <div className="empty-state">
        <p>{t('grid.empty')}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="photo-grid" style={{ '--grid-columns': gridColumns } as React.CSSProperties}>
        {photos.map((photo) => (
          <PhotoCard key={photo.id} photo={photo} />
        ))}
      </div>
      <div ref={observerRef} className="scroll-sentinel">
        {isLoadingPhotos && <LoadingSpinner />}
      </div>
    </div>
  );
}
