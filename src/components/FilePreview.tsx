'use client'

import { useState } from 'react'

interface FilePreviewProps {
  fileUrl: string
  fileName: string
  mimeType: string
  onClose: () => void
}

export default function FilePreview({ fileUrl, fileName, mimeType, onClose }: FilePreviewProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')

  const renderPreview = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <a
              href={fileUrl}
              download={fileName}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
            >
              ダウンロード
            </a>
          </div>
        </div>
      )
    }

    // Image Preview
    if (mimeType.startsWith('image/')) {
      return (
        <div className="flex justify-center">
          <img
            src={fileUrl}
            alt={fileName}
            className="max-w-full max-h-96 object-contain border border-gray-300 rounded"
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setError('画像の読み込みに失敗しました')
              setIsLoading(false)
            }}
          />
        </div>
      )
    }

    // PDF Preview (simplified - would need PDF.js for full implementation)
    if (mimeType === 'application/pdf') {
      return (
        <div className="flex flex-col items-center">
          <div className="mb-4">
            <iframe
              src={fileUrl}
              className="w-full h-96 border border-gray-300 rounded"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setError('PDFの読み込みに失敗しました')
                setIsLoading(false)
              }}
            />
          </div>
        </div>
      )
    }

    // Default: Download only
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-gray-600 mb-4">
            このファイル形式はプレビューできません
          </div>
          <a
            href={fileUrl}
            download={fileName}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
          >
            ダウンロード
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">{fileName}</h2>
          <div className="flex space-x-2">
            <a
              href={fileUrl}
              download={fileName}
              className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              ダウンロード
            </a>
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              閉じる
            </button>
          </div>
        </div>
        
        {renderPreview()}
      </div>
    </div>
  )
}