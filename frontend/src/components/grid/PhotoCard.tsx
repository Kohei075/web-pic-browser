import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../../stores/appStore';
import type { Photo } from '../../types';

interface PhotoCardProps {
  photo: Photo;
}

export function PhotoCard({ photo }: PhotoCardProps) {
  const { selectedPhotoIds, togglePhotoSelection } = useAppStore();
  const isSelected = selectedPhotoIds.includes(photo.id);
  const isMaxed = selectedPhotoIds.length >= 4;
  const [failed, setFailed] = useState(false);

  const sep = photo.file_path.includes('/') ? '/' : '\\';
  const parts = photo.file_path.split(sep);
  const parentFolder = parts.length >= 2 ? parts[parts.length - 2] : '';
  const displayPath = parentFolder ? `${parentFolder}/${photo.file_name}` : photo.file_name;

  if (failed) return null;

  return (
    <Link to={`/viewer/${photo.id}`} className={`photo-card${isSelected ? ' photo-card-selected' : ''}`}>
      <div className="photo-card-image">
        <div
          className="photo-select-area"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isSelected && isMaxed) return;
            togglePhotoSelection(photo);
          }}
        >
          <input
            type="checkbox"
            className="photo-select-checkbox"
            checked={isSelected}
            disabled={!isSelected && isMaxed}
            readOnly
            tabIndex={-1}
          />
        </div>
        <img
          src={photo.thumbnail_url}
          alt={photo.file_name}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      </div>
      <div className="photo-card-info">
        <span className="photo-card-name" title={displayPath}>
          {parentFolder && <span className="photo-card-folder">{parentFolder}/</span>}
          <span className="photo-card-filename">{photo.file_name}</span>
        </span>
      </div>
    </Link>
  );
}
