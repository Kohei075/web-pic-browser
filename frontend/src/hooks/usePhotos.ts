import { useCallback } from 'react';
import { api } from '../api/client';
import { useAppStore } from '../stores/appStore';
import type { PhotoListResponse } from '../types';

export function usePhotos() {
  const {
    page, perPage, sortBy, sortOrder, selectedFolderPath, includeSubfolders,
    isLoadingPhotos, setPhotos, appendPhotos, setLoadingPhotos,
  } = useAppStore();

  const fetchPhotos = useCallback(async (pageNum: number = 1, append: boolean = false) => {
    setLoadingPhotos(true);
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        per_page: String(perPage),
        sort_by: sortBy,
        sort_order: sortOrder,
      });
      if (selectedFolderPath !== null) {
        params.set('folder_path', selectedFolderPath);
        params.set('include_subfolders', includeSubfolders ? 'true' : 'false');
      }
      const data = await api.get<PhotoListResponse>(`/photos?${params}`);
      if (append) {
        appendPhotos(data.items, data.total, data.page, data.total_pages);
      } else {
        setPhotos(data.items, data.total, data.page, data.per_page, data.total_pages);
      }
    } finally {
      setLoadingPhotos(false);
    }
  }, [perPage, sortBy, sortOrder, selectedFolderPath, includeSubfolders, setPhotos, appendPhotos, setLoadingPhotos]);

  const loadMore = useCallback(() => {
    if (!isLoadingPhotos) {
      fetchPhotos(page + 1, true);
    }
  }, [fetchPhotos, page, isLoadingPhotos]);

  return { fetchPhotos, loadMore };
}
