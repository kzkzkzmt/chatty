'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { io, Socket } from 'socket.io-client'
import CreateRoomModal from '@/components/CreateRoomModal'
import FileUploadModal from '@/components/FileUploadModal'
import FileList from '@/components/FileList'

interface User {
  id: string
  name: string
  email: string
}

interface Message {
  id: string
  content: string
  createdAt: string
  user: User
}

interface Room {
  id: string
  name: string
  description?: string
}

interface FileData {
  id: string
  name: string
  originalName: string
  totalVersions: number
}

export default function HomePage() {
  const [user, setUser] = useState<User | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateRoomModal, setShowCreateRoomModal] = useState(false)
  const [showFileUploadModal, setShowFileUploadModal] = useState(false)
  const [showFileList, setShowFileList] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [files, setFiles] = useState<FileData[]>([])
  const router = useRouter()

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Get user info
        const userResponse = await fetch('/api/user')
        if (!userResponse.ok) {
          router.push('/login')
          return
        }
        const userData = await userResponse.json()
        setUser(userData)

        // Get user's rooms
        const roomsResponse = await fetch('/api/rooms')
        if (roomsResponse.ok) {
          const roomsData = await roomsResponse.json()
          setRooms(roomsData)
          if (roomsData.length > 0) {
            setCurrentRoom(roomsData[0])
          }
        }

        // Initialize socket connection
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth-token='))
          ?.split('=')[1]

        if (token) {
          const newSocket = io({
            auth: { token },
          })

          newSocket.on('connect', () => {
            console.log('Connected to server')
          })

          newSocket.on('new-message', (message: Message) => {
            setMessages(prev => [...prev, message])
          })

          setSocket(newSocket)
        }
      } catch (error) {
        console.error('Initialization error:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    initializeApp()

    return () => {
      if (socket) {
        socket.disconnect()
      }
    }
  }, [router])

  useEffect(() => {
    if (currentRoom && socket) {
      socket.emit('join-room', currentRoom.id)
      loadMessages(currentRoom.id)
      loadFiles()
    }
  }, [currentRoom, socket])

  const loadMessages = async (roomId: string) => {
    try {
      const response = await fetch(`/api/messages?roomId=${roomId}`)
      if (response.ok) {
        const messagesData = await response.json()
        setMessages(messagesData)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const loadFiles = async () => {
    if (!currentRoom) return
    try {
      const response = await fetch(`/api/files?roomId=${currentRoom.id}`)
      if (response.ok) {
        const filesData = await response.json()
        setFiles(filesData.map((file: any) => ({
          id: file.id,
          name: file.name,
          originalName: file.originalName,
          totalVersions: file.totalVersions
        })))
      }
    } catch (error) {
      console.error('Error loading files:', error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !currentRoom || !socket) return

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId: currentRoom.id,
          content: newMessage,
        }),
      })

      if (response.ok) {
        const message = await response.json()
        setMessages(prev => [...prev, message])
        
        // Emit to other users
        socket.emit('send-message', {
          roomId: currentRoom.id,
          content: newMessage,
          messageId: message.id,
        })

        setNewMessage('')
      }
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleCreateRoom = async (name: string, description: string) => {
    try {
      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, description }),
      })

      if (response.ok) {
        const newRoom = await response.json()
        setRooms(prev => [newRoom, ...prev])
        setCurrentRoom(newRoom)
      }
    } catch (error) {
      console.error('Error creating room:', error)
    }
  }

  const handleFileUploaded = () => {
    loadFiles()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <h1 className="text-xl font-bold text-gray-900">建設チャットアプリ</h1>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4">
              <span className="text-sm text-gray-700 hidden sm:inline">
                {user?.name} さん
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                ログアウト
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-screen">
        {/* Sidebar */}
        <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block w-64 bg-white shadow-sm border-r fixed md:relative z-30 h-full`}>
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900">チャットルーム</h2>
              <button
                onClick={() => setShowCreateRoomModal(true)}
                className="text-sm bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700"
              >
                + 新規
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  onClick={() => {
                    setCurrentRoom(room)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    currentRoom?.id === room.id
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="font-medium">{room.name}</div>
                  {room.description && (
                    <div className="text-sm text-gray-500 mt-1">{room.description}</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          ></div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col md:flex-row">
          {/* Chat Area */}
          <div className={`${showFileList ? 'hidden lg:flex' : 'flex'} flex-1 flex-col`}>
            {currentRoom ? (
              <>
                {/* Chat Header */}
                <div className="bg-white border-b px-4 md:px-6 py-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {currentRoom.name}
                      </h3>
                      {currentRoom.description && (
                        <p className="text-sm text-gray-600">{currentRoom.description}</p>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowFileUploadModal(true)}
                        className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        📎 ファイル
                      </button>
                      <button
                        onClick={() => setShowFileList(!showFileList)}
                        className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 lg:hidden"
                      >
                        📁 一覧
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.user.id === user?.id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs sm:max-w-sm lg:max-w-md px-4 py-2 rounded-lg ${
                          message.user.id === user?.id
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-gray-900 shadow-sm'
                        }`}
                      >
                        {message.user.id !== user?.id && (
                          <div className="text-xs text-gray-500 mb-1">
                            {message.user.name}
                          </div>
                        )}
                        <div>{message.content}</div>
                        <div
                          className={`text-xs mt-1 ${
                            message.user.id === user?.id
                              ? 'text-indigo-200'
                              : 'text-gray-500'
                          }`}
                        >
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="bg-white border-t p-4">
                  <form onSubmit={sendMessage} className="flex space-x-2 md:space-x-4">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="メッセージを入力..."
                      className="flex-1 border border-gray-300 rounded-lg px-3 md:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base"
                    />
                    <button
                      type="submit"
                      className="bg-indigo-600 text-white px-4 md:px-6 py-2 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm md:text-base"
                    >
                      送信
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 mb-4">チャットルームを選択してください</p>
                  <button 
                    onClick={() => setShowCreateRoomModal(true)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                  >
                    新しいルームを作成
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* File List Panel */}
          {currentRoom && (
            <div className={`${showFileList ? 'block' : 'hidden lg:block'} w-full lg:w-80 bg-white border-l`}>
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900">ファイル一覧</h3>
                  <button
                    onClick={() => setShowFileList(false)}
                    className="lg:hidden text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="h-full overflow-y-auto p-4">
                <FileList roomId={currentRoom.id} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <CreateRoomModal
        isOpen={showCreateRoomModal}
        onClose={() => setShowCreateRoomModal(false)}
        onCreateRoom={handleCreateRoom}
      />

      <FileUploadModal
        isOpen={showFileUploadModal}
        onClose={() => setShowFileUploadModal(false)}
        roomId={currentRoom?.id || ''}
        existingFiles={files}
        onFileUploaded={handleFileUploaded}
      />
    </div>
  )
}