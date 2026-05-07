import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { api } from '../api/client';
import { useAppStore } from '../stores/appStore';
import { PhotoViewer } from '../components/viewer/PhotoViewer';
import type { PhotoViewerHandle } from '../components/viewer/PhotoViewer';
import { RandomPicksPanel } from '../components/viewer/RandomPicksPanel';
import type { RandomPicksPanelHandle } from '../components/viewer/RandomPicksPanel';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { useTranslation } from '../i18n/useTranslation';
import type { Photo, NeighborsResponse, PhotoListResponse } from '../types';

export function ViewerPage() {
  const { photoId } = useParams<{ photoId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { sortBy, sortOrder, selectedFolderPath, includeSubfolders, folderRoot, setSelectedFolderPath } = useAppStore();
  const { t } = useTranslation();

  const [photo, setPhoto] = useState<Photo | null>(null);
  const [neighbors, setNeighbors] = useState<NeighborsResponse>({ prev_id: null, next_id: null });
  const [loading, setLoading] = useState(true);
  const [randomPicks, setRandomPicks] = useState<Photo[]>([]);
  const [showRandomPicks, setShowRandomPicks] = useState(false);

  const handleRandomPicksRef = useRef<() => Promise<void>>(undefined);
  const photoViewerRef = useRef<PhotoViewerHandle>(null);
  const randomPicksRef = useRef<RandomPicksPanelHandle>(null);

  const fetchPhoto = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const photoData = await api.get<Photo>(`/photos/${id}`);
      setPhoto(photoData);

      if (sortBy === 'random') {
        // In random mode, compute neighbors from the gallery's loaded photo list
        const list = useAppStore.getState().photos;
        const idx = list.findIndex(p => p.id === Number(id));
        setNeighbors({
          prev_id: idx > 0 ? list[idx - 1].id : null,
          next_id: idx >= 0 && idx < list.length - 1 ? list[idx + 1].id : null,
        });
      } else {
        const neighborParams = new URLSearchParams({
          sort_by: sortBy,
          sort_order: sortOrder,
        });
        if (selectedFolderPath !== null) {
          neighborParams.set('folder_path', selectedFolderPath);
          neighborParams.set('include_subfolders', includeSubfolders ? 'true' : 'false');
        }
        const neighborsData = await api.get<NeighborsResponse>(`/photos/${id}/neighbors?${neighborParams}`);
        setNeighbors(neighborsData);
      }
    } catch {
      navigate('/');
    } finally {
      setLoading(false);
    }
  }, [sortBy, sortOrder, selectedFolderPath, includeSubfolders, navigate]);

  // Fetch photo data
  useEffect(() => {
    if (photoId) fetchPhoto(photoId);
  }, [photoId, fetchPhoto]);

  // Consume location.state randomPicks from gallery
  useEffect(() => {
    const state = location.state as { randomPicks?: Photo[] } | null;
    if (state?.randomPicks && state.randomPicks.length > 0) {
      setRandomPicks(state.randomPicks);
      setShowRandomPicks(true);
      window.history.replaceState({}, '');
    } else {
      setShowRandomPicks(false);
      setRandomPicks([]);
    }
  }, [location.key]);

  const goTo = useCallback((id: number | null) => {
    if (id !== null) navigate(`/viewer/${id}`);
  }, [navigate]);

  const handleRandom = useCallback(async () => {
    const params = new URLSearchParams();
    if (selectedFolderPath !== null) params.set('folder_path', selectedFolderPath);
    try {
      const randomPhoto = await api.get<Photo>(`/photos/random?${params}`);
      navigate(`/viewer/${randomPhoto.id}`);
    } catch { /* no photos */ }
  }, [selectedFolderPath, navigate]);

  const handleRandomPicks = useCallback(async () => {
    if (!photo) return;
    const params = new URLSearchParams({
      sort_by: 'random',
      per_page: '5',
    });
    if (selectedFolderPath !== null) params.set('folder_path', selectedFolderPath);
    try {
      const res = await api.get<PhotoListResponse>(`/photos?${params}`);
      const picks = res.items.filter((p) => p.id !== photo.id).slice(0, 4);
      setRandomPicks(picks);
      setShowRandomPicks(true);
    } catch { /* ignore */ }
  }, [photo, selectedFolderPath]);

  handleRandomPicksRef.current = handleRandomPicks;

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (showRandomPicks) {
            handleRandomPicksRef.current?.();
          } else {
            goTo(neighbors.prev_id);
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (showRandomPicks) {
            handleRandomPicksRef.current?.();
          } else {
            goTo(neighbors.next_id);
          }
          break;
        case ' ':
          e.preventDefault();
          if (showRandomPicks) {
            randomPicksRef.current?.toggleFullscreen();
          } else {
            photoViewerRef.current?.toggleFullscreen();
          }
          break;
        case 'Escape':
          navigate('/');
          break;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [showRandomPicks, neighbors, goTo, navigate]);

  if (!photo) return <LoadingSpinner message="Loading photo..." />;

  return (
    <div className="viewer-page">
      <div className="viewer-top-bar">
        <button className="btn" onClick={() => navigate('/')}>
          &#8592; {t('viewer.backToGallery')}
        </button>
        {!showRandomPicks && (
          <span className="viewer-filename" title={photo.file_path}>
            {(() => {
              const sep = photo.file_path.includes('/') ? '/' : '\\';
              const dir = photo.file_path.substring(0, photo.file_path.lastIndexOf(sep));
              const dirSegments = dir.split(/[\\/]/);
              const root = folderRoot ? folderRoot.replace(/[\\/]+$/, '') : '';
              const rootSegments = root ? root.split(/[\\/]/) : [];
              const startIdx = root && dir.startsWith(root) ? rootSegments.length : 0;
              const displayParts = dirSegments.slice(startIdx);
              return displayParts.map((part, i) => {
                const absPath = dirSegments.slice(0, startIdx + i + 1).join(sep);
                return (
                  <span key={i}>
                    {i > 0 && <span className="breadcrumb-sep">/</span>}
                    <a
                      className="breadcrumb-link"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedFolderPath(absPath);
                        navigate('/');
                      }}
                    >
                      {part}
                    </a>
                  </span>
                );
              });
            })()}
          </span>
        )}
        {!showRandomPicks && (
          <>
            <button
              className="btn btn-sm"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(photo.file_path);
                  alert(t('viewer.copyPathSuccess'));
                } catch {
                  alert(t('viewer.copyPathFailed'));
                }
              }}
            >
              {t('viewer.copyPath')}
            </button>
            <button
              className="btn btn-sm"
              onClick={async () => {
                try { await api.post(`/images/${photo.id}/reveal`); } catch { /* ignore */ }
              }}
            >
              {t('viewer.openInExplorer')}
            </button>
          </>
        )}
      </div>

      {showRandomPicks ? (
        <RandomPicksPanel
          ref={randomPicksRef}
          photos={randomPicks}
          onSelect={(id) => navigate(`/viewer/${id}`)}
          onClose={() => setShowRandomPicks(false)}
          onShuffle={handleRandomPicks}
        />
      ) : (
        <PhotoViewer ref={photoViewerRef} photo={photo} />
      )}

      <div className="viewer-bottom-bar">
        <div className="viewer-info">
          {photo.width && photo.height && <span>{photo.width}x{photo.height}</span>}
          <span>{(photo.file_size / 1024 / 1024).toFixed(1)} MB</span>
          {photo.taken_at && <span>Taken: {new Date(photo.taken_at).toLocaleDateString()}</span>}
        </div>
      </div>
    </div>
  );
}
