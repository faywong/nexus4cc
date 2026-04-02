import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import GhostShield from './GhostShield'
import { Icon } from './icons'
import FileBrowser from './FileBrowser'

interface Config {
  id: string
  label: string
}

interface Props {
  token: string
  onClose: () => void
  onConfirm: (path: string, shellType: 'claude' | 'bash', profile?: string) => void
}

// 检测是否为 PC 端（>= 768px）
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 768)
  useEffect(() => {
    const onResize = () => setIsDesktop(window.innerWidth >= 768)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return isDesktop
}

export default function WorkspaceSelector({ token, onClose, onConfirm }: Props) {
  const { t } = useTranslation()
  const isDesktop = useIsDesktop()
  const [selectedPath, setSelectedPath] = useState(() => localStorage.getItem('nexus_last_path') || '/workspace')
  const [inputPath, setInputPath] = useState(() => localStorage.getItem('nexus_last_path') || '/workspace')
  const [shellType, setShellType] = useState<'claude' | 'bash'>('claude')
  const [configs, setConfigs] = useState<Config[]>([])
  const [selectedProfile, setSelectedProfile] = useState<string>(() => localStorage.getItem('nexus_last_profile') || '')

  const headers = { Authorization: `Bearer ${token}` }

  useEffect(() => {
    fetchConfigs()
  }, [])

  async function fetchConfigs() {
    try {
      const r = await fetch('/api/configs', { headers })
      if (r.ok) {
        const data = await r.json()
        setConfigs(data)
        if (!localStorage.getItem('nexus_last_profile') && data.length > 0) {
          setSelectedProfile(data[0].id)
        }
      }
    } catch {
      // ignore
    }
  }

  function handleDirSelect(path: string) {
    setSelectedPath(path)
    setInputPath(path)
  }

  function handleInputChange(value: string) {
    setInputPath(value)
    setSelectedPath(value)
  }

  function handleProfileChange(id: string) {
    setSelectedProfile(id)
    if (id) localStorage.setItem('nexus_last_profile', id)
  }

  function handleConfirm() {
    const path = inputPath.trim()
    if (!path) return
    const profile = shellType === 'claude' && selectedProfile ? selectedProfile : undefined
    localStorage.setItem('nexus_last_path', path)
    if (profile) localStorage.setItem('nexus_last_profile', profile)
    onConfirm(path, shellType, profile)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      handleConfirm()
    }
  }

  return (
    <div className={isDesktop ? 'fixed inset-0 bg-black/70 z-[100] flex items-center justify-center p-5' : 'fixed inset-0 bg-black/60 z-[100]'}>
      <GhostShield />
      <div className={isDesktop ? 'bg-nexus-bg border border-nexus-border rounded-xl flex flex-col text-nexus-text w-full max-w-[600px] max-h-[85vh] shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden' : 'fixed inset-0 bg-nexus-bg flex flex-col text-nexus-text'}>
        {/* 顶部：标题 + 关闭 */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-nexus-border shrink-0">
          <span className="text-base font-semibold">{t('workspace.title')}</span>
          <button className="bg-transparent border-none text-nexus-text-2 cursor-pointer text-2xl leading-none px-1 flex items-center justify-center" onPointerDown={onClose}><Icon name="x" size={20} /></button>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto py-2">
          {/* 当前选择 */}
          <div className="px-4 py-3 border-b border-nexus-border">
            <div className="text-[11px] text-nexus-text-2 tracking-wider uppercase mb-0">{t('workspace.currentSelection')}</div>
            <div className="text-sm text-nexus-accent font-mono px-3 py-2 bg-nexus-bg-2 rounded-md break-all mt-2">{selectedPath || '~'}</div>
          </div>

          {/* 手动输入 */}
          <div className="px-4 py-3 border-b border-nexus-border">
            <div className="text-[11px] text-nexus-text-2 tracking-wider uppercase mb-0">{t('workspace.inputPath')}</div>
            <div className={isDesktop ? 'flex flex-row items-center gap-4 mt-2' : 'flex flex-col gap-1 mt-2'}>
              <input
                className={isDesktop ? 'bg-nexus-bg-2 border border-nexus-border rounded-md text-nexus-text text-sm px-3 py-2.5 outline-none flex-1 box-border' : 'bg-nexus-bg-2 border border-nexus-border rounded-md text-nexus-text text-sm px-2.5 py-2 outline-none w-full box-border'}
                value={inputPath}
                onChange={e => handleInputChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t('workspace.pathPlaceholder')}
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>
            <div className="text-nexus-muted text-[11px] mt-1.5">{t('workspace.pathHelp')}</div>
          </div>

          {/* Shell 类型选择 */}
          <div className="px-4 py-3 border-b border-nexus-border">
            <div className="text-[11px] text-nexus-text-2 tracking-wider uppercase mb-0">{t('workspace.shellType')}</div>
            <div className="flex flex-col gap-2.5 mt-2">
              <label className="flex items-center gap-2 text-nexus-text text-sm cursor-pointer">
                <input
                  type="radio"
                  name="shellType"
                  value="claude"
                  checked={shellType === 'claude'}
                  onChange={() => setShellType('claude')}
                />
                <span>{t('workspace.shellClaude')}</span>
              </label>
              <label className="flex items-center gap-2 text-nexus-text text-sm cursor-pointer">
                <input
                  type="radio"
                  name="shellType"
                  value="bash"
                  checked={shellType === 'bash'}
                  onChange={() => setShellType('bash')}
                />
                <span>{t('workspace.shellZsh')}</span>
              </label>
            </div>
          </div>

          {/* Profile 选择 (仅 claude 模式) */}
          {shellType === 'claude' && (
            <div className="px-4 py-3 border-b border-nexus-border">
              <div className="text-[11px] text-nexus-text-2 tracking-wider uppercase mb-0">{t('workspace.profileLabel')}</div>
              <select
                className="bg-nexus-bg-2 border border-nexus-border rounded-md text-nexus-text text-sm px-2.5 py-2 w-full outline-none mt-2"
                value={selectedProfile}
                onChange={(e) => handleProfileChange(e.target.value)}
              >
                <option value="">{t('workspace.profileDefault')}</option>
                {configs.map((cfg) => (
                  <option key={cfg.id} value={cfg.id}>
                    {cfg.label}
                  </option>
                ))}
              </select>
              <div className="text-nexus-muted text-[11px] mt-1.5">{t('workspace.profileHelp')}</div>
            </div>
          )}

          {/* 目录浏览器 - 使用 FileBrowser 组件 */}
          <div className="px-4 py-3 border-b border-nexus-border">
            <FileBrowser
              token={token}
              mode="dirs-only"
              initialPath="/workspace"
              onSelectDir={handleDirSelect}
              showBreadcrumb={false}
              showParentEntry={true}
              className="max-h-[240px]"
              headerActions={
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-nexus-text-2 tracking-wider uppercase">{t('workspace.browseDir')}</span>
                  <button
                    className="bg-transparent border border-nexus-border rounded text-nexus-text-2 cursor-pointer text-[11px] px-2 py-0.5"
                    onClick={() => handleDirSelect(selectedPath)}
                    disabled={!selectedPath}
                  >
                    {t('workspace.selectThisDir')}
                  </button>
                </div>
              }
            />
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex gap-3 px-4 py-3 border-t border-nexus-border shrink-0 justify-end">
          <button className="bg-transparent border border-nexus-border rounded-md text-nexus-text-2 cursor-pointer text-sm px-4 py-2" onPointerDown={onClose}>{t('common.cancel')}</button>
          <button className="bg-nexus-accent border-none rounded-md text-white cursor-pointer text-sm font-semibold px-4 py-2" onPointerDown={handleConfirm}>{t('common.create')}</button>
        </div>
      </div>
    </div>
  )
}
