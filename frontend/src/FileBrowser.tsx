import { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from './icons'

export interface DirEntry {
  name: string
  path: string
}

export interface FileEntry {
  name: string
  type: 'dir' | 'file'
  size?: number
  mtime: number
}

export interface BrowseResult {
  path: string
  parent: string | null
  dirs: DirEntry[]
}

interface FileBrowserProps {
  token: string
  /** 初始路径 */
  initialPath?: string
  /** 模式：仅目录 或 目录+文件 */
  mode: 'dirs-only' | 'dirs-and-files'
  /** 当前路径变化回调 */
  onPathChange?: (path: string) => void
  /** 选中目录回调（单击） */
  onSelectDir?: (path: string) => void
  /** 选中文件回调（单击，仅在 dirs-and-files 模式） */
  onSelectFile?: (path: string) => void
  /** 自定义顶部操作区 */
  headerActions?: React.ReactNode
  /** 自定义底部操作区 */
  footerActions?: React.ReactNode
  /** 自定义类名 */
  className?: string
  /** 是否显示面包屑 */
  showBreadcrumb?: boolean
  /** 是否显示向上一级 */
  showParentEntry?: boolean
}

function formatSize(bytes?: number): string {
  if (bytes === undefined) return ''
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

function formatTime(ts: number): string {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

// 截断路径显示
function formatBrowsePath(p: string | null): string {
  if (!p) return '/'
  const parts = p.split('/').filter(Boolean)
  if (parts.length <= 3) return '/' + parts.join('/')
  return '.../' + parts.slice(-2).join('/')
}

function getFileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase()
  if (!ext) return '📄'
  const iconMap: Record<string, string> = {
    js: '📜', ts: '📜', jsx: '📜', tsx: '📜',
    py: '🐍', go: '🔵', rs: '🦀', java: '☕',
    c: '🔧', cpp: '🔧', h: '🔧', hpp: '🔧',
    json: '📋', yml: '📋', yaml: '📋', toml: '📋',
    md: '📝', txt: '📝', log: '📝',
    html: '🌐', css: '🎨', svg: '🎨',
    png: '🖼️', jpg: '🖼️', jpeg: '🖼️', gif: '🖼️', webp: '🖼️',
    zip: '📦', tar: '📦', gz: '📦', rar: '📦',
    sh: '⚙️', bash: '⚙️', zsh: '⚙️',
    dockerfile: '🐳', env: '🔐',
  }
  return iconMap[ext] || '📄'
}

export default function FileBrowser({
  token,
  initialPath = '',
  mode,
  onPathChange,
  onSelectDir,
  onSelectFile,
  headerActions,
  footerActions,
  className = '',
  showBreadcrumb = true,
  showParentEntry = true,
}: FileBrowserProps) {
  const { t } = useTranslation()
  const [currentPath, setCurrentPath] = useState(initialPath || '/')
  const [selectedPath, setSelectedPath] = useState<string | null>(null)

  // 目录浏览状态
  const [browseResult, setBrowseResult] = useState<BrowseResult | null>(null)
  const [browseLoading, setBrowseLoading] = useState(false)
  const [browseError, setBrowseError] = useState<string | null>(null)

  // 文件列表状态（仅在 dirs-and-files 模式）
  const [files, setFiles] = useState<FileEntry[]>([])
  const [filesLoading, setFilesLoading] = useState(false)

  const headers = { Authorization: `Bearer ${token}` }

  // 获取文件列表
  const loadFiles = useCallback(async (path: string) => {
    if (mode !== 'dirs-and-files') return
    setFilesLoading(true)
    try {
      const r = await fetch(`/api/workspace/files?path=${encodeURIComponent(path)}`, { headers })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data = await r.json()
      setFiles(data.entries || [])
    } catch {
      setFiles([])
    } finally {
      setFilesLoading(false)
    }
  }, [token, mode])

  // 浏览目录
  const browseDir = useCallback(async (path: string) => {
    setBrowseLoading(true)
    setBrowseError(null)
    try {
      const url = `/api/browse?path=${encodeURIComponent(path)}`
      const r = await fetch(url, { headers })
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      const data: BrowseResult = await r.json()
      setBrowseResult(data)
      setCurrentPath(data.path)
      setSelectedPath(null)
      onPathChange?.(data.path)
      // 同时加载文件列表
      loadFiles(data.path)
    } catch (e: unknown) {
      setBrowseError(e instanceof Error ? e.message : '浏览失败')
    } finally {
      setBrowseLoading(false)
    }
  }, [token, onPathChange, loadFiles])

  // 初始加载
  useEffect(() => {
    browseDir(initialPath || '/')
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 单击目录
  const handleDirClick = useCallback((path: string) => {
    setSelectedPath(path)
    onSelectDir?.(path)
  }, [onSelectDir])

  // 双击进入目录
  const handleDirDoubleClick = useCallback((path: string) => {
    setSelectedPath(path)
    browseDir(path)
  }, [browseDir])

  // 单击文件
  const handleFileClick = useCallback((name: string) => {
    const filePath = currentPath === '/'
      ? `/${name}`
      : `${currentPath}/${name}`
    onSelectFile?.(filePath)
  }, [currentPath, onSelectFile])

  // 面包屑路径
  const breadcrumbs = currentPath === '/' ? [] : currentPath.split('/').filter(Boolean)

  // 过滤出文件（仅在 dirs-and-files 模式）
  const fileEntries = mode === 'dirs-and-files'
    ? files.filter(f => f.type === 'file').sort((a, b) => a.name.localeCompare(b.name))
    : []

  if (browseLoading && !browseResult) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        <div className="flex-1 flex items-center justify-center text-nexus-muted text-sm">
          {t('common.loading')}
        </div>
      </div>
    )
  }

  if (browseError) {
    return (
      <div className={`flex flex-col h-full ${className}`}>
        <div className="flex-1 flex flex-col items-center justify-center text-nexus-error text-sm px-4">
          <Icon name="alert" size={24} className="mb-2 opacity-60" />
          {browseError}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* 面包屑导航 */}
      {showBreadcrumb && (
        <div className="flex items-center gap-1 px-4 py-2 border-b border-nexus-border bg-nexus-bg-2 flex-shrink-0 overflow-x-auto">
          <button
            onClick={() => browseDir('/')}
            className={`text-sm whitespace-nowrap ${currentPath === '/' ? 'text-nexus-accent font-medium' : 'text-nexus-text-2 hover:text-nexus-text'}`}
          >
            /
          </button>
          {breadcrumbs.map((crumb, idx) => (
            <span key={idx} className="flex items-center gap-1">
              <span className="text-nexus-muted">/</span>
              <button
                onClick={() => browseDir('/' + breadcrumbs.slice(0, idx + 1).join('/'))}
                className={`text-sm whitespace-nowrap ${idx === breadcrumbs.length - 1 ? 'text-nexus-accent font-medium' : 'text-nexus-text-2 hover:text-nexus-text'}`}
              >
                {crumb}
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 头部操作区 */}
      {headerActions && (
        <div className="px-4 py-2 border-b border-nexus-border flex-shrink-0">
          {headerActions}
        </div>
      )}

      {/* 内容区 */}
      <div className="flex-1 overflow-y-auto">
        {/* 目录列表 */}
        <div className="px-4 py-2">
          {/* 当前路径显示 + 快捷操作 */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[11px] text-nexus-text-2 tracking-wider uppercase shrink-0">
                {mode === 'dirs-only' ? t('workspace.browseDir') : t('workspace.directories')}
              </span>
              <span
                className="text-[11px] text-nexus-accent font-mono overflow-hidden text-ellipsis whitespace-nowrap"
                title={currentPath}
              >
                {formatBrowsePath(currentPath)}
              </span>
            </div>
            <button
              className="bg-transparent border border-nexus-border rounded text-nexus-text-2 cursor-pointer text-[11px] px-2 py-0.5 shrink-0"
              onClick={() => browseDir('/')}
            >
              {t('workspace.rootDir')}
            </button>
          </div>

          <div className="flex flex-col gap-0.5">
            {/* 向上一级 */}
            {showParentEntry && browseResult?.parent && (
              <div
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-md cursor-pointer bg-transparent border-b border-nexus-border mb-1 hover:bg-nexus-bg-2"
                onClick={() => browseDir(browseResult.parent!)}
              >
                <span className="text-sm shrink-0">↑</span>
                <span className="text-nexus-text-2 text-sm flex-1 overflow-hidden text-ellipsis whitespace-nowrap">..</span>
                <span className="text-[11px] text-nexus-muted font-mono">
                  {browseResult.parent.split('/').slice(-1)[0] || '/'}
                </span>
              </div>
            )}

            {/* 子目录列表 */}
            {browseResult?.dirs.length === 0 && (
              <div className="text-nexus-muted text-sm py-2">{t('workspace.noSubDirs')}</div>
            )}
            {browseResult?.dirs.map(dir => (
              <div
                key={dir.path}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-md cursor-pointer ${
                  selectedPath === dir.path
                    ? 'bg-nexus-bg-2 border border-nexus-accent'
                    : 'bg-transparent hover:bg-nexus-bg-2'
                }`}
                onClick={() => handleDirClick(dir.path)}
                onDoubleClick={() => handleDirDoubleClick(dir.path)}
                title={t('workspace.dirClickHint')}
              >
                <span className="text-sm shrink-0">📁</span>
                <span className="text-nexus-text text-sm flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                  {dir.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* 文件列表（仅在 dirs-and-files 模式） */}
        {mode === 'dirs-and-files' && (
          <div className="px-4 py-2 border-t border-nexus-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-nexus-text-2 tracking-wider uppercase">
                {t('workspace.files')}
              </span>
              {filesLoading && <span className="text-[11px] text-nexus-muted">{t('common.loading')}</span>}
            </div>

            {fileEntries.length === 0 && !filesLoading ? (
              <div className="text-nexus-muted text-sm py-4 text-center">
                {t('workspace.noFiles')}
              </div>
            ) : (
              <div className="flex flex-col gap-0.5">
                {fileEntries.map((file) => (
                  <button
                    key={file.name}
                    onClick={() => handleFileClick(file.name)}
                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-nexus-bg-2 transition-colors text-left rounded-md"
                  >
                    <span className="text-xl shrink-0">{getFileIcon(file.name)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-nexus-text text-sm overflow-hidden text-ellipsis whitespace-nowrap font-mono">
                        {file.name}
                      </div>
                    </div>
                    {file.size !== undefined && (
                      <span className="text-nexus-muted text-xs shrink-0">{formatSize(file.size)}</span>
                    )}
                    <span className="text-nexus-muted text-xs shrink-0">{formatTime(file.mtime)}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 底部操作区 */}
      {footerActions && (
        <div className="px-4 py-3 border-t border-nexus-border flex-shrink-0">
          {footerActions}
        </div>
      )}
    </div>
  )
}
