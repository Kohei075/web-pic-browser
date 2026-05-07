import { create } from 'zustand';
import type { Photo, SortBy, SortOrder, ScanStatus, FolderNode } from '../types';

interface AppState {
  // Photos
  photos: Photo[];
  totalPhotos: number;
  page: number;
  perPage: number;
  totalPages: number;
  isLoadingPhotos: boolean;

  // Sort / Filter
  sortBy: SortBy;
  sortOrder: SortOrder;
  randomKey: number;
  gridColumns: number;

  // Viewer
  currentPhotoId: number | null;

  // Photo selection (up to 4)
  selectedPhotoIds: number[];
  selectedPhotos: Photo[];

  // Scan
  scanStatus: ScanStatus | null;

  // Folder sidebar
  folderTree: FolderNode[];
  folderRoot: string;
  selectedFolderPath: string | null;
  includeSubfolders: boolean;
  isSidebarOpen: boolean;

  // Actions
  setPhotos: (photos: Photo[], total: number, page: number, perPage: number, totalPages: number) => void;
  appendPhotos: (photos: Photo[], total: number, page: number, totalPages: number) => void;
  setLoadingPhotos: (loading: boolean) => void;
  setSortBy: (sortBy: SortBy) => void;
  setSortOrder: (sortOrder: SortOrder) => void;
  setCurrentPhotoId: (id: number | null) => void;
  setScanStatus: (status: ScanStatus | null) => void;
  updatePhoto: (photo: Photo) => void;
  setGridColumns: (columns: number) => void;
  refreshRandom: () => void;
  resetFilters: () => void;
  setFolderTree: (root: string, folders: FolderNode[]) => void;
  setSelectedFolderPath: (path: string | null) => void;
  setIncludeSubfolders: (include: boolean) => void;
  setIsSidebarOpen: (open: boolean) => void;
  togglePhotoSelection: (photo: Photo) => void;
  clearPhotoSelection: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  photos: [],
  totalPhotos: 0,
  page: 1,
  perPage: 50,
  totalPages: 0,
  isLoadingPhotos: false,

  sortBy: 'modified_at',
  sortOrder: 'desc',
  randomKey: 0,
  gridColumns: Number(localStorage.getItem('grid_columns')) || 4,

  currentPhotoId: null,

  selectedPhotoIds: [],
  selectedPhotos: [],

  scanStatus: null,

  folderTree: [],
  folderRoot: '',
  selectedFolderPath: null,
  includeSubfolders: localStorage.getItem('include_subfolders') !== '0',
  isSidebarOpen: true,

  setPhotos: (photos, total, page, perPage, totalPages) =>
    set({ photos, totalPhotos: total, page, perPage, totalPages }),
  appendPhotos: (photos, total, page, totalPages) =>
    set((state) => ({
      photos: [...state.photos, ...photos],
      totalPhotos: total,
      page,
      totalPages,
    })),
  setLoadingPhotos: (isLoadingPhotos) => set({ isLoadingPhotos }),
  setSortBy: (sortBy) => set({ sortBy, sortOrder: sortBy === 'file_name' ? 'asc' : 'desc', photos: [], page: 1 }),
  setSortOrder: (sortOrder) => set({ sortOrder, photos: [], page: 1 }),
  setCurrentPhotoId: (currentPhotoId) => set({ currentPhotoId }),
  setScanStatus: (scanStatus) => set({ scanStatus }),
  updatePhoto: (photo) =>
    set((state) => ({
      photos: state.photos.map((p) => (p.id === photo.id ? photo : p)),
    })),
  setGridColumns: (gridColumns) => { localStorage.setItem('grid_columns', String(gridColumns)); set({ gridColumns }); },
  refreshRandom: () => set((state) => ({ randomKey: state.randomKey + 1, photos: [], page: 1 })),
  resetFilters: () => set({ selectedFolderPath: null, photos: [], page: 1 }),
  setFolderTree: (folderRoot, folderTree) => set({ folderRoot, folderTree }),
  setSelectedFolderPath: (selectedFolderPath) => set({ selectedFolderPath, photos: [], page: 1 }),
  setIncludeSubfolders: (includeSubfolders) => {
    localStorage.setItem('include_subfolders', includeSubfolders ? '1' : '0');
    set({ includeSubfolders, photos: [], page: 1 });
  },
  setIsSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
  togglePhotoSelection: (photo) =>
    set((state) => {
      if (state.selectedPhotoIds.includes(photo.id)) {
        return {
          selectedPhotoIds: state.selectedPhotoIds.filter((pid) => pid !== photo.id),
          selectedPhotos: state.selectedPhotos.filter((p) => p.id !== photo.id),
        };
      }
      if (state.selectedPhotoIds.length >= 4) return state;
      return {
        selectedPhotoIds: [...state.selectedPhotoIds, photo.id],
        selectedPhotos: [...state.selectedPhotos, photo],
      };
    }),
  clearPhotoSelection: () => set({ selectedPhotoIds: [], selectedPhotos: [] }),
}));
