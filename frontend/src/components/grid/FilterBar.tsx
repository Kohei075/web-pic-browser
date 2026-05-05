import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import { useTranslation } from '../../i18n/useTranslation';
import { api } from '../../api/client';
import type { PhotoListResponse } from '../../types';

export function FilterBar() {
  const { selectedFolderPath, selectedPhotoIds, selectedPhotos, togglePhotoSelection, clearPhotoSelection } = useAppStore();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleRandomPicks = useCallback(async () => {
    const params = new URLSearchParams({
      sort_by: 'random',
      per_page: '4',
    });
    if (selectedFolderPath !== null) params.set('folder_path', selectedFolderPath);
    try {
      const res = await api.get<PhotoListResponse>(`/photos?${params}`);
      if (res.items.length > 0) {
        navigate(`/viewer/${res.items[0].id}`, { state: { randomPicks: res.items } });
      }
    } catch { /* ignore */ }
  }, [selectedFolderPath, navigate]);

  const handleViewSelected = useCallback(() => {
    if (selectedPhotos.length > 0) {
      navigate(`/viewer/${selectedPhotos[0].id}`, { state: { randomPicks: selectedPhotos } });
    }
  }, [selectedPhotos, navigate]);

  return (
    <div className="filter-bar">
      <button className="btn btn-sm" onClick={handleRandomPicks}>
        {t('viewer.randomPicks')}
      </button>
      {selectedPhotoIds.length > 0 && (
        <>
          <button className="btn btn-sm btn-primary" onClick={handleViewSelected}>
            {t('grid.viewSelected', { count: selectedPhotoIds.length })}
          </button>
          <div className="selection-thumbnails">
            {selectedPhotos.map((photo) => (
              <button
                key={photo.id}
                className="selection-thumbnail-btn"
                onClick={() => togglePhotoSelection(photo)}
                title={photo.file_name}
              >
                <img
                  src={photo.thumbnail_url}
                  alt={photo.file_name}
                  className="selection-thumbnail"
                />
                <span className="selection-thumbnail-remove">x</span>
              </button>
            ))}
          </div>
          <button className="btn btn-sm" onClick={clearPhotoSelection}>
            {t('grid.clearSelection')}
          </button>
        </>
      )}
    </div>
  );
}
