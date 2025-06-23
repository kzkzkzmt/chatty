'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SetupPage() {
  const [setupKey, setSetupKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSetup = async () => {
    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch(`/api/setup?key=${encodeURIComponent(setupKey)}`)
      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'セットアップに失敗しました')
        if (data.instructions) {
          setError(error + '\n\n' + data.instructions.join('\n'))
        }
      }
    } catch (err) {
      setError('ネットワークエラーが発生しました')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            初期セットアップ
          </h2>
          <p className="text-gray-600 mb-8">
            データベースの初期化を行います
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          {!result ? (
            <div className="space-y-6">
              <div>
                <label htmlFor="setupKey" className="block text-sm font-medium text-gray-700">
                  セットアップキー
                </label>
                <input
                  id="setupKey"
                  type="password"
                  value={setupKey}
                  onChange={(e) => setSetupKey(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="セットアップキーを入力"
                />
                <p className="mt-2 text-xs text-gray-500">
                  デフォルト: setup-construction-chat-2024
                </p>
              </div>

              {error && (
                <div className="text-red-600 text-sm whitespace-pre-wrap">{error}</div>
              )}

              <button
                onClick={handleSetup}
                disabled={isLoading || !setupKey}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'セットアップ中...' : 'セットアップ実行'}
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-green-600 text-xl mb-4">✅ セットアップ完了！</div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>作成されたユーザー数: {result.createdUsers}</p>
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900">テストアカウント:</p>
                    <p>メール: {result.testAccount.email}</p>
                    <p>パスワード: {result.testAccount.password}</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push('/login')}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                ログインページへ
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>このページは初期セットアップ専用です。</p>
          <p>通常は使用する必要はありません。</p>
        </div>
      </div>
    </div>
  )
}