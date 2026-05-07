import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api } from '../../api/client';
import { useAppStore } from '../../stores/appStore';
import { useTranslation } from '../../i18n/useTranslation';
import type { FolderTreeResponse, SearchResponse, FolderNode } from '../../types';

function FolderTreeItem({ node, depth, onSelect, expandToPath, collapseKey }: {
  node: FolderNode; depth: number; onSelect: (path: string | null) => void; expandToPath: string | null; collapseKey: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const { selectedFolderPath } = useAppStore();
  const isSelected = selectedFolderPath === node.path;
  const hasChildren = node.children.length > 0;

  // Collapse all when collapseKey changes
  useEffect(() => {
    if (collapseKey > 0) setIsOpen(false);
  }, [collapseKey]);

  // Auto-expand when this node is an ancestor of expandToPath
  useEffect(() => {
    if (expandToPath && hasChildren) {
      const normExpand = expandToPath.replace(/\\/g, '/');
      const normNode = node.path.replace(/\\/g, '/');
      if (normExpand.startsWith(normNode + '/') || normExpand === normNode) {
        setIsOpen(true);
      }
    }
  }, [expandToPath, node.path, hasChildren]);

  return (
    <div>
      <div
        className={`folder-tree-item ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onSelect(isSelected ? null : node.path)}
      >
        {hasChildren ? (
          <button
            className="folder-tree-toggle"
            onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
          >
            {isOpen ? '\u25BE' : '\u25B8'}
          </button>
        ) : (
          <span className="folder-tree-spacer" />
        )}
        <span className="folder-tree-icon">{isOpen && hasChildren ? '\uD83D\uDCC2' : '\uD83D\uDCC1'}</span>
        <span className="folder-tree-name" title={node.path}>{node.name}</span>
      </div>
      {isOpen && hasChildren && (
        <div>
          {node.children.map((child) => (
            <FolderTreeItem key={child.path} node={child} depth={depth + 1} onSelect={onSelect} expandToPath={expandToPath} collapseKey={collapseKey} />
          ))}
        </div>
      )}
    </div>
  );
}

const SIDEBAR_WIDTH_KEY = 'sidebar-width';
const SIDEBAR_MIN = 180;
const SIDEBAR_MAX = 480;
const SIDEBAR_DEFAULT = 260;

function getSavedWidth(): number {
  try {
    const v = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    if (v) {
      const n = Number(v);
      if (n >= SIDEBAR_MIN && n <= SIDEBAR_MAX) return n;
    }
  } catch { /* ignore */ }
  return SIDEBAR_DEFAULT;
}

export function FolderSidebar() {
  const { folderTree, folderRoot, setFolderTree, selectedFolderPath, setSelectedFolderPath, includeSubfolders, setIncludeSubfolders, isSidebarOpen, setIsSidebarOpen } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResponse['results']>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandToPath, setExpandToPath] = useState<string | null>(null);
  const [collapseKey, setCollapseKey] = useState(0);
  const [sidebarWidth, setSidebarWidth] = useState(getSavedWidth);
  const [isDragging, setIsDragging] = useState(false);
  const draggingRef = useRef(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    setIsDragging(true);
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    const onMouseMove = (ev: MouseEvent) => {
      if (!draggingRef.current) return;
      const newWidth = Math.min(SIDEBAR_MAX, Math.max(SIDEBAR_MIN, ev.clientX));
      setSidebarWidth(newWidth);
    };

    const onMouseUp = () => {
      draggingRef.current = false;
      setIsDragging(false);
      document.body.style.userSelect = '';
      document.body.style.cursor = '';
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      setSidebarWidth((w) => {
        try { localStorage.setItem(SIDEBAR_WIDTH_KEY, String(w)); } catch { /* ignore */ }
        return w;
      });
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, []);

  const handleFolderSelect = useCallback((path: string | null) => {
    setSelectedFolderPath(path);
    if (location.pathname.startsWith('/viewer')) {
      navigate('/');
    }
  }, [setSelectedFolderPath, location.pathname, navigate]);

  // Fetch folder tree on mount
  useEffect(() => {
    api.get<FolderTreeResponse>('/folders').then((data) => {
      setFolderTree(data.root, data.folders);
    }).catch(() => {});
  }, [setFolderTree]);

  // Debounced search
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const data = await api.get<SearchResponse>(`/folders/search?q=${encodeURIComponent(q)}`);
      setSearchResults(data.results);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, doSearch]);

  const handleResultClick = (result: SearchResponse['results'][0]) => {
    if (result.type === 'folder') {
      handleFolderSelect(result.path);
      setSearchQuery('');
      setSearchResults([]);
    } else if (result.photo_id) {
      // Extract the folder path from the file path and expand the tree to it
      const lastSep = Math.max(result.path.lastIndexOf('\\'), result.path.lastIndexOf('/'));
      if (lastSep > 0) {
        setExpandToPath(result.path.substring(0, lastSep));
      }
      setSearchQuery('');
      setSearchResults([]);
      navigate(`/viewer/${result.photo_id}`);
    }
  };

  if (!isSidebarOpen) {
    return (
      <button className="sidebar-toggle-btn" onClick={() => setIsSidebarOpen(true)} title="Show sidebar">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="2" width="14" height="12" rx="2" /><line x1="6" y1="2" x2="6" y2="14" /></svg>
      </button>
    );
  }

  return (
    <aside className="folder-sidebar" style={{ width: sidebarWidth }}>
      <div className="sidebar-header">
        <button className="sidebar-close-btn" onClick={() => setIsSidebarOpen(false)} title="Hide sidebar">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><rect x="1" y="2" width="14" height="12" rx="2" /><line x1="6" y1="2" x2="6" y2="14" /><line x1="10" y1="6.5" x2="8" y2="8" /><line x1="8" y1="8" x2="10" y2="9.5" /></svg>
        </button>
      </div>

      <div className="sidebar-search">
        <input
          type="text"
          placeholder={t('sidebar.searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="sidebar-search-input"
        />
      </div>

      {searchQuery.trim() ? (
        <div className="sidebar-search-results">
          {isSearching && <div className="sidebar-loading">{t('sidebar.searching')}</div>}
          {!isSearching && searchResults.length === 0 && searchQuery.trim() && (
            <div className="sidebar-empty">{t('sidebar.noResults')}</div>
          )}
          {searchResults.map((result, i) => (
            <div
              key={`${result.type}-${result.path}-${i}`}
              className="search-result-item"
              onClick={() => handleResultClick(result)}
            >
              <span className="search-result-icon">
                {result.type === 'folder' ? '\uD83D\uDCC1' : '\uD83D\uDDBC\uFE0F'}
              </span>
              <div className="search-result-info">
                <span className="search-result-name">{result.name}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="sidebar-tree">
          <button className="sidebar-clear-btn" onClick={() => handleFolderSelect(null)} disabled={!selectedFolderPath}>
            {t('sidebar.allPhotos')}
          </button>
          <label className="sidebar-include-subfolders">
            <input
              type="checkbox"
              checked={includeSubfolders}
              onChange={(e) => setIncludeSubfolders(e.target.checked)}
            />
            <span>{t('sidebar.includeSubfolders')}</span>
          </label>
          {folderRoot && (
            <div className="folder-tree-root" title={folderRoot}>
              {folderRoot.split(/[/\\]/).pop() || folderRoot}
            </div>
          )}
          <div className="sidebar-tree-actions">
            <button
              className="sidebar-collapse-btn"
              onClick={() => setCollapseKey((k) => k + 1)}
              title={t('sidebar.collapseAll')}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 5.5L7 9.5L11 5.5" /></svg>
              {t('sidebar.collapseAll')}
            </button>
          </div>
          {folderTree.map((node) => (
            <FolderTreeItem key={node.path} node={node} depth={0} onSelect={handleFolderSelect} expandToPath={expandToPath} collapseKey={collapseKey} />
          ))}
          {folderTree.length === 0 && (
            <div className="sidebar-empty">{t('sidebar.noFolders')}</div>
          )}
        </div>
      )}
      <div
        className={`sidebar-resize-handle${isDragging ? ' active' : ''}`}
        onMouseDown={handleResizeStart}
      />
    </aside>
  );
}
