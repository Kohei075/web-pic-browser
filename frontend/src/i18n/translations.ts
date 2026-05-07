export type Lang = 'ja' | 'en';

const translations = {
  // Header
  'nav.gallery': { ja: 'ギャラリー', en: 'Gallery' },
  'nav.settings': { ja: '設定', en: 'Settings' },

  // Grid
  'grid.photos': { ja: '枚', en: 'photos' },
  'grid.sortBy': { ja: 'ソート', en: 'Sort by' },
  'grid.sortCreated': { ja: '作成日', en: 'Created Date' },
  'grid.sortModified': { ja: '更新日', en: 'Modified Date' },
  'grid.sortTaken': { ja: '撮影日', en: 'Taken Date' },
  'grid.sortFileName': { ja: 'ファイル名', en: 'File Name' },
  'grid.sortRandom': { ja: 'ランダム', en: 'Random' },
  'grid.newestFirst': { ja: '新しい順', en: 'Newest First' },
  'grid.oldestFirst': { ja: '古い順', en: 'Oldest First' },
  'grid.azOrder': { ja: '昇順', en: 'A→Z' },
  'grid.zaOrder': { ja: '降順', en: 'Z→A' },
  'grid.refresh': { ja: '更新', en: 'Refresh' },
  'grid.empty': { ja: '写真がありません。設定画面でフォルダを指定してスキャンを実行してください。', en: 'No photos found. Go to Settings to set your photo folder and run a scan.' },
  'grid.loading': { ja: '写真を読み込み中...', en: 'Loading photos...' },
  'grid.viewSelected': { ja: '選択した写真を表示 ({count})', en: 'View Selected ({count})' },
  'grid.clearSelection': { ja: '選択解除', en: 'Clear' },

  // Sidebar
  'sidebar.folders': { ja: 'フォルダ', en: 'Folders' },
  'sidebar.searchPlaceholder': { ja: 'ファイル/フォルダを検索...', en: 'Search files/folders...' },
  'sidebar.searching': { ja: '検索中...', en: 'Searching...' },
  'sidebar.noResults': { ja: '結果なし', en: 'No results' },
  'sidebar.allPhotos': { ja: 'すべての写真', en: 'All Photos' },
  'sidebar.includeSubfolders': { ja: '配下フォルダの写真も表示', en: 'Include subfolders' },
  'sidebar.noFolders': { ja: 'スキャン済みフォルダなし', en: 'No folders scanned' },
  'sidebar.collapseAll': { ja: 'すべて閉じる', en: 'Collapse All' },

  // Viewer
  'viewer.prev': { ja: '前へ', en: 'Previous' },
  'viewer.next': { ja: '次へ', en: 'Next' },
  'viewer.random': { ja: 'ランダム', en: 'Random' },
  'viewer.fullscreen': { ja: '全画面表示', en: 'Fullscreen' },
  'viewer.exitFullscreen': { ja: '全画面解除', en: 'Exit Fullscreen' },
  'viewer.randomPicks': { ja: '4枚ランダム表示', en: '4 Random Photos' },
  'viewer.backToPhoto': { ja: '写真に戻る', en: 'Back to Photo' },
  'viewer.backToGallery': { ja: '戻る', en: 'Back to Gallery' },
  'viewer.copyPath': { ja: 'パスをコピー', en: 'Copy Path' },
  'viewer.copyPathSuccess': { ja: 'パスをコピーしました', en: 'Path copied' },
  'viewer.copyPathFailed': { ja: 'コピーに失敗しました', en: 'Failed to copy' },
  'viewer.openInExplorer': { ja: 'エクスプローラーで開く', en: 'Open in Explorer' },
  'viewer.layoutHorizontal': { ja: '横表示', en: 'Horizontal' },
  'viewer.layoutVertical': { ja: '縦表示', en: 'Vertical' },

  // Settings
  'settings.title': { ja: '設定', en: 'Settings' },
  'settings.photoFolder': { ja: '写真フォルダ', en: 'Photo Folder' },
  'settings.rootFolder': { ja: 'ルートフォルダ:', en: 'Root Folder Path:' },
  'settings.extensions': { ja: '拡張子:', en: 'File Extensions:' },
  'settings.save': { ja: '保存', en: 'Save Settings' },
  'settings.saved': { ja: '設定を保存しました', en: 'Settings saved successfully' },
  'settings.scan': { ja: 'スキャン', en: 'Scan Photos' },
  'settings.startScan': { ja: 'スキャン開始', en: 'Start Scan' },
  'settings.scanning': { ja: 'スキャン中...', en: 'Scanning...' },
  'settings.scanComplete': { ja: 'スキャン完了: {count}件処理しました', en: 'Scan complete: {count} files processed' },
  'settings.filesProcessed': { ja: '{processed} / {total} 件処理済み', en: '{processed} / {total} files processed' },
  'settings.scanInfo': { ja: 'スキャン済み: {count}件', en: 'Scanned: {count} photos' },
  'settings.scanFolder': { ja: 'フォルダ: {path}', en: 'Folder: {path}' },
  'settings.scanNoData': { ja: 'スキャン済みデータなし', en: 'No scanned data' },
  'settings.folderNotFound': { ja: '指定されたフォルダが見つかりません', en: 'The specified folder was not found' },
  'settings.folderSelect': { ja: 'スキャン対象フォルダ', en: 'Folders to Scan' },
  'settings.folderSelectDesc': { ja: 'スキャン・ギャラリーに含めるフォルダを選択してください。', en: 'Select folders to include in scan and gallery.' },
  'settings.saveSelection': { ja: '選択を保存', en: 'Save Selection' },
  'settings.selectAll': { ja: 'すべて選択', en: 'Select All' },
  'settings.deselectAll': { ja: 'すべて未選択', en: 'Deselect All' },
  'settings.browse': { ja: '選択', en: 'Browse' },
  'settings.langLabel': { ja: '表示言語:', en: 'Display Language:' },
  'settings.themeLabel': { ja: 'テーマ:', en: 'Theme:' },
  'settings.themeSystem': { ja: 'システム設定に合わせる', en: 'System' },
  'settings.themeDark': { ja: 'ダーク', en: 'Dark' },
  'settings.themeLight': { ja: 'ライト', en: 'Light' },
  'settings.resetData': { ja: 'データリセット', en: 'Reset Data' },
  'settings.resettingData': { ja: 'リセット中...', en: 'Resetting...' },
  'settings.resetDone': { ja: 'リセット完了', en: 'Reset complete' },
  'settings.resetConfirm': { ja: 'スキャンデータとサムネイルキャッシュを削除しますか？', en: 'Delete scan data and thumbnail cache?' },
  'settings.rescanSelected': { ja: '選択したフォルダのみを再スキャン', en: 'Rescan Selected Folders' },
  'settings.rescanning': { ja: '再スキャン中...', en: 'Rescanning...' },
  'settings.rescanComplete': { ja: '再スキャン完了: {count}件処理しました', en: 'Rescan complete: {count} files processed' },
} as const;

type TranslationKey = keyof typeof translations;

let currentLang: Lang = (localStorage.getItem('app_language') as Lang) || 'ja';
const listeners = new Set<() => void>();

export function getLang(): Lang {
  return currentLang;
}

export function setLang(lang: Lang) {
  currentLang = lang;
  localStorage.setItem('app_language', lang);
  listeners.forEach((fn) => fn());
}

export function t(key: TranslationKey, params?: Record<string, string | number>): string {
  const entry = translations[key];
  let text: string = entry?.[currentLang] ?? entry?.['en'] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      text = text.replace(`{${k}}`, String(v));
    }
  }
  return text;
}

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
