'use client'

import { useState, useEffect } from 'react'

interface FileVersion {
  id: string
  version: string
  fileName: string
  fileSize: number
  comment?: string
  createdAt: string
  downloadUrl: string
  mimeType: string
  user: {
    id: string
    name: string
    email: string
  }
}

interface FileData {
  id: string
  name: string
  originalName: string
  createdAt: string
  updatedAt: string
  latestVersion: FileVersion | null
  versions: FileVersion[]
  totalVersions: number
}

interface FileListProps {
  roomId: string
  onFileSelected?: (fileId: string) => void
}

export default function FileList({ roomId, onFileSelected }: FileListProps) {
  const [files, setFiles] = useState<FileData[]>([])
  const [selectedFile, setSelectedFile] = useState<FileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadFiles()
  }, [roomId])

  const loadFiles = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/files?roomId=${roomId}`)
      if (response.ok) {
        const filesData = await response.json()
        setFiles(filesData)
      } else {
        setError('ファイルの読み込みに失敗しました')
      }
    } catch (error) {
      setError('ネットワークエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileClick = (file: FileData) => {
    setSelectedFile(file)
    if (onFileSelected) {
      onFileSelected(file.id)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const isNewerVersion = (currentVersion: string, latestVersion: string): boolean => {
    const current = currentVersion.replace('v', '').split('.').map(Number)
    const latest = latestVersion.replace('v', '').split('.').map(Number)
    
    for (let i = 0; i < Math.max(current.length, latest.length); i++) {
      const c = current[i] || 0
      const l = latest[i] || 0
      if (c < l) return true
      if (c > l) return false
    }
    return false
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">共有ファイル</h3>
      
      {files.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          まだファイルがアップロードされていません
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((file) => (
            <div
              key={file.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedFile?.id === file.id
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleFileClick(file)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{file.name}</h4>
                  <p className="text-sm text-gray-600">
                    最新バージョン: {file.latestVersion?.version || 'なし'}
                  </p>
                  <p className="text-xs text-gray-500">
                    更新日: {formatDate(file.updatedAt)}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-indigo-600">
                    {file.totalVersions} バージョン
                  </span>
                </div>
              </div>

              {selectedFile?.id === file.id && (
                <div className="mt-4 border-t pt-4">
                  <h5 className="font-medium text-gray-900 mb-2">バージョン履歴</h5>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {file.versions.map((version) => (
                      <div
                        key={version.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                      >
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm">
                              {version.version}
                            </span>
                            {file.latestVersion?.version !== version.version && 
                             isNewerVersion(version.version, file.latestVersion?.version || 'v1.0') && (
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                                新しいバージョンあり
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600">
                            {version.user.name} • {formatDate(version.createdAt)}
                          </p>
                          {version.comment && (
                            <p className="text-xs text-gray-700 mt-1">
                              {version.comment}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {formatFileSize(version.fileSize)}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <a
                            href={version.downloadUrl}
                            download={version.fileName}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                          >
                            DL
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}