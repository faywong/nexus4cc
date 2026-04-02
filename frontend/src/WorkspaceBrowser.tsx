import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Icon } from './icons'
import FileBrowser from './FileBrowser'

interface Props {
  token: string
  onClose: () => void
  initialPath?: string
  currentSession?: string
}

export default function WorkspaceBrowser({ token, onClose, initialPath = '', currentSession }: Props) {
  const { t } = useTranslation()
  const [currentPath, setCurrentPath] = useState(initialPath)

  // 获取当前 session 的 CWD 作为初始路径
  useEffect(() => {
    if (!currentSession) return
    const headers = { Authorization: `Bearer ${token}` }
    fetch(`/api/session-cwd?session=${encodeURIComponent(currentSession)}`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.cwd) {
          setCurrentPath(data.cwd)
        }
      })
      .catch(() => {})
  }, [currentSession, token])

  // 打开文件
  const handleSelectFile = (filePath: string) => {
    window.open(filePath, '_blank')
  }

  return (
    <div className="fixed inset-0 z-[450] bg-nexus-bg flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-nexus-border flex-shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon name="folder" size={20} />
          <span className="text-nexus-text font-semibold text-base truncate">
            {t('workspace.title')}
          </span>
        </div>
        <button
          onClick={onClose}
          className="bg-transparent border-none text-nexus-text-2 cursor-pointer p-1.5 flex items-center justify-center rounded-md shrink-0"
        >
          <Icon name="x" size={20} />
        </button>
      </div>

      {/* File Browser */}
      <div className="flex-1 overflow-hidden">
        <FileBrowser
          token={token}
          mode="dirs-and-files"
          initialPath={currentPath}
          onPathChange={setCurrentPath}
          onSelectFile={handleSelectFile}
          className="h-full"
        />
      </div>
    </div>
  )
}
