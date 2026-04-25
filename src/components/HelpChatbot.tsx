'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslation } from '@/contexts/TranslationContext'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function HelpChatbot() {
  const { t, language } = useTranslation()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const greeting = t(
    'chat.greeting',
    {},
    "Hi! I'm the Little Bo Peep help assistant. Ask me anything about using the app — I can answer in any language."
  )

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [open, messages])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)

    const assistantMsg: Message = { role: 'assistant', content: '' }
    setMessages([...next, assistantMsg])

    try {
      const res = await fetch('/api/chat-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: messages, language }),
      })

      const data = await res.json()
      const reply = data?.reply ?? t('chat.error', {}, 'Sorry, something went wrong. Please try again.')

      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: reply }
        return updated
      })
    } catch {
      setMessages((prev) => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: t('chat.error', {}, 'Sorry, something went wrong. Please try again.'),
        }
        return updated
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? t('chat.close', {}, 'Close help chat') : t('chat.open', {}, 'Open help chat')}
        className="fixed bottom-6 right-5 z-50 w-13 h-13 rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
        style={{
          width: 52,
          height: 52,
          backgroundColor: '#614270',
        }}
      >
        {open ? (
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
        )}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          className="fixed bottom-[72px] right-4 z-50 w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl flex flex-col overflow-hidden border"
          style={{
            backgroundColor: '#fff',
            borderColor: 'rgba(97,66,112,0.2)',
            maxHeight: 'min(520px, calc(100vh - 100px))',
          }}
        >
          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-3 border-b" style={{ backgroundColor: '#614270', borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              🐑
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white leading-tight">{t('chat.title', {}, 'Help Assistant')}</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>{t('chat.subtitle', {}, 'Ask anything, any language')}</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
              aria-label={t('chat.close', {}, 'Close')}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ minHeight: 0 }}>
            {/* Greeting */}
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs" style={{ backgroundColor: 'rgba(97,66,112,0.1)' }}>
                🐑
              </div>
              <div
                className="rounded-2xl rounded-tl-sm px-3 py-2 text-sm leading-relaxed max-w-[85%]"
                style={{ backgroundColor: 'rgba(97,66,112,0.08)', color: '#333' }}
              >
                {greeting}
              </div>
            </div>

            {messages.map((msg, i) => (
              <div key={i} className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs" style={{ backgroundColor: 'rgba(97,66,112,0.1)' }}>
                    🐑
                  </div>
                )}
                <div
                  className="rounded-2xl px-3 py-2 text-sm leading-relaxed max-w-[85%] whitespace-pre-wrap"
                  style={
                    msg.role === 'user'
                      ? { backgroundColor: '#614270', color: '#fff', borderRadius: '16px 4px 16px 16px' }
                      : { backgroundColor: 'rgba(97,66,112,0.08)', color: '#333', borderRadius: '4px 16px 16px 16px' }
                  }
                >
                  {msg.content || (
                    <span className="inline-flex gap-1">
                      <span className="animate-bounce" style={{ animationDelay: '0ms' }}>·</span>
                      <span className="animate-bounce" style={{ animationDelay: '150ms' }}>·</span>
                      <span className="animate-bounce" style={{ animationDelay: '300ms' }}>·</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t" style={{ borderColor: 'rgba(146,153,139,0.2)' }}>
            <div className="flex items-center gap-2 rounded-xl border px-3 py-2" style={{ borderColor: 'rgba(97,66,112,0.2)' }}>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                disabled={loading}
                placeholder={t('chat.placeholder', {}, 'Ask a question…')}
                className="flex-1 text-sm bg-transparent outline-none"
                style={{ color: '#333' }}
                maxLength={1000}
              />
              <button
                onClick={send}
                disabled={!input.trim() || loading}
                className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-opacity disabled:opacity-30"
                style={{ backgroundColor: '#614270' }}
                aria-label={t('chat.send', {}, 'Send')}
              >
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19V5m0 0l-7 7m7-7l7 7" />
                </svg>
              </button>
            </div>
            <p className="text-center text-[10px] mt-1.5" style={{ color: 'rgba(146,153,139,0.7)' }}>
              {t('chat.poweredBy', {}, 'Powered by AI · Not a substitute for official advice')}
            </p>
          </div>
        </div>
      )}
    </>
  )
}
