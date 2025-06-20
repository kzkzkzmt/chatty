'use client'

import { useState, useRef, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
}

interface MentionInputProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  placeholder?: string
  roomMembers: User[]
  disabled?: boolean
}

export default function MentionInput({
  value,
  onChange,
  onSubmit,
  placeholder = "メッセージを入力...",
  roomMembers,
  disabled = false
}: MentionInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<User[]>([])
  const [selectedSuggestion, setSelectedSuggestion] = useState(0)
  const [mentionStart, setMentionStart] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    const cursorPos = e.target.selectionStart || 0
    
    onChange(newValue)
    
    // Check for @ mentions
    const beforeCursor = newValue.slice(0, cursorPos)
    const atIndex = beforeCursor.lastIndexOf('@')
    
    if (atIndex >= 0) {
      const afterAt = beforeCursor.slice(atIndex + 1)
      // Check if there's no space after @
      if (!afterAt.includes(' ')) {
        const query = afterAt.toLowerCase()
        const filteredMembers = roomMembers.filter(member =>
          member.name.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query)
        )
        
        if (filteredMembers.length > 0) {
          setSuggestions(filteredMembers)
          setShowSuggestions(true)
          setMentionStart(atIndex)
          setSelectedSuggestion(0)
        } else {
          setShowSuggestions(false)
        }
      } else {
        setShowSuggestions(false)
      }
    } else {
      setShowSuggestions(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedSuggestion(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        )
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedSuggestion(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        )
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        if (suggestions.length > 0) {
          e.preventDefault()
          selectSuggestion(suggestions[selectedSuggestion])
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false)
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      onSubmit()
    }
  }

  const selectSuggestion = (user: User) => {
    const beforeMention = value.slice(0, mentionStart)
    const afterCursor = value.slice(inputRef.current?.selectionStart || 0)
    const newValue = `${beforeMention}@${user.name} ${afterCursor}`
    
    onChange(newValue)
    setShowSuggestions(false)
    
    // Focus back to input
    setTimeout(() => {
      if (inputRef.current) {
        const newCursorPos = beforeMention.length + user.name.length + 2
        inputRef.current.focus()
        inputRef.current.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false)
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const renderMessageWithMentions = (text: string) => {
    const parts = text.split(/(@\w+)/g)
    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        const mentionedName = part.slice(1)
        const mentionedUser = roomMembers.find(user => user.name === mentionedName)
        if (mentionedUser) {
          return (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 px-1 rounded"
            >
              {part}
            </span>
          )
        }
      }
      return part
    })
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 border border-gray-300 rounded-lg px-3 md:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm md:text-base w-full"
      />
      
      {showSuggestions && (
        <div className="absolute bottom-full left-0 right-0 bg-white border border-gray-300 rounded-lg shadow-lg mb-1 max-h-40 overflow-y-auto z-10">
          {suggestions.map((user, index) => (
            <button
              key={user.id}
              onClick={() => selectSuggestion(user)}
              className={`w-full text-left px-3 py-2 hover:bg-gray-100 ${
                index === selectedSuggestion ? 'bg-gray-100' : ''
              }`}
            >
              <div className="font-medium text-sm">{user.name}</div>
              <div className="text-xs text-gray-500">{user.email}</div>
            </button>
          ))}
        </div>
      )}
      
      {/* Preview of message with mentions highlighted */}
      {value && value.includes('@') && (
        <div className="mt-1 text-xs text-gray-600 p-2 bg-gray-50 rounded">
          プレビュー: {renderMessageWithMentions(value)}
        </div>
      )}
    </div>
  )
}