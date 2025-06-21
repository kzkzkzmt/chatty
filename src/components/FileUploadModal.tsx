'use client'

import { useState, useRef } from 'react'

interface FileUploadModalProps {
  isOpen: boolean
  onClose: () => void
  roomId: string
  existingFiles: Array<{
    id: string
    name: string
    originalName: string
    totalVersions: number
  }>
  onFileUploaded: () => void
}

export default function FileUploadModal({ 
  isOpen, 
  onClose, 
  roomId, 
  existingFiles, 
  onFileUploaded 
}: FileUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadType, setUploadType] = useState<'new' | 'update'>('new')
  const [selectedExistingFile, setSelectedExistingFile] = useState<string>('')
  const [comment, setComment] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('ファイルサイズは10MB以下にしてください')
        return
      }
      setSelectedFile(file)
      setError('')
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    if (uploadType === 'update' && !selectedExistingFile) {
      setError('更新するファイルを選択してください')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('roomId', roomId)
      if (uploadType === 'update') {
        formData.append('fileId', selectedExistingFile)
      }
      if (comment) {
        formData.append('comment', comment)
      }

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        onFileUploaded()
        handleClose()
      } else {
        const data = await response.json()
        setError(data.error || 'アップロードに失敗しました')
      }
    } catch (error) {
      setError('ネットワークエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setSelectedFile(null)
    setUploadType('new')
    setSelectedExistingFile('')
    setComment('')
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">ファイルアップロード</h2>
        
        <div className="space-y-4">
          {/* Upload Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              アップロード種類
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="new"
                  checked={uploadType === 'new'}
                  onChange={(e) => setUploadType(e.target.value as 'new' | 'update')}
                  className="mr-2"
                />
                新規ファイル
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="update"
                  checked={uploadType === 'update'}
                  onChange={(e) => setUploadType(e.target.value as 'new' | 'update')}
                  className="mr-2"
                />
                既存ファイルの更新
              </label>
            </div>
          </div>

          {/* Existing File Selection */}
          {uploadType === 'update' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                更新するファイル
              </label>
              <select
                value={selectedExistingFile}
                onChange={(e) => setSelectedExistingFile(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="">ファイルを選択...</option>
                {existingFiles.map((file) => (
                  <option key={file.id} value={file.id}>
                    {file.name} (v{file.totalVersions})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ファイル選択
            </label>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              accept=".pdf,.jpg,.jpeg,.png,.gif,.xlsx,.xls,.docx,.doc,.txt,.zip"
            />
            <p className="text-xs text-gray-500 mt-1">
              対応形式: PDF, 画像, Excel, Word, テキスト, ZIP (最大10MB)
            </p>
          </div>

          {/* Comment */}
          {uploadType === 'update' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                バージョンコメント
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={3}
                placeholder="変更内容を記述..."
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              キャンセル
            </button>
            <button
              onClick={handleUpload}
              disabled={isLoading || !selectedFile}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'アップロード中...' : 'アップロード'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}