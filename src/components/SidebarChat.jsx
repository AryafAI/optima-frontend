import { useEffect, useRef, useState } from 'react'
import Logo from './Logo.jsx'
import ChatMessage from './ChatMessage.jsx'
import { INITIAL_CHAT, generateMockBotReply } from '../data/data.js'
import { api, isApiEnabled } from '../api/client.js'
import './SidebarChat.css'

export default function SidebarChat() {
  const [messages, setMessages] = useState(INITIAL_CHAT)
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (e) => {
    e?.preventDefault()
    const text = input.trim()
    if (!text || sending) return

    const userMsg = {
      id:     Date.now(),
      sender: 'user',
      text,
      time:   formatTime(),
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setSending(true)

    let botMsg = null

    // Try backend first; fall back to mock on failure.
    if (isApiEnabled()) {
      try {
        const res = await api.chat(text)
        // Backend returns { text, result, route }
        const result = res?.result
        let chart = undefined
        let delta = undefined

        if (result && typeof result === 'object') {
          if (Array.isArray(result.monthly_detail) && result.monthly_detail.length) {
            chart = result.monthly_detail.map((m) => m.new_sales)
            delta = `${result.total?.delta_pct >= 0 ? '+' : ''}${result.total?.delta_pct ?? 0}%`
          } else if (typeof result.difference_pct === 'number') {
            chart = [result.baseline_sales, result.new_sales]
            delta = `${result.difference_pct >= 0 ? '+' : ''}${result.difference_pct}%`
          }
        }

        botMsg = {
          id:     Date.now() + 1,
          sender: 'bot',
          text:   res?.text || 'Done.',
          time:   formatTime(),
          chart,
          delta,
        }
      } catch (err) {
        console.warn('Chat backend failed, using mock:', err)
      }
    }

    if (!botMsg) {
      // Mock reply with small artificial delay
      await new Promise((r) => setTimeout(r, 600))
      const reply = generateMockBotReply(text)
      botMsg = {
        id:     Date.now() + 1,
        sender: 'bot',
        text:   reply.text,
        time:   formatTime(),
        chart:  reply.chart,
        delta:  reply.delta,
      }
    }

    setMessages((prev) => [...prev, botMsg])
    setSending(false)
  }

  return (
    <aside className="sidebar">
      <Logo />

      <div className="assistant-card">
        <div className="assistant-avatar" aria-hidden="true">
          <BotIcon />
        </div>
        <div>
          <div className="assistant-title">Optima AI Assistant</div>
          <div className="assistant-sub">Your intelligent pricing partner</div>
        </div>
      </div>

      <div className="chat-window" ref={scrollRef}>
        {messages.map((m) => (
          <ChatMessage key={m.id} message={m} />
        ))}
        {sending && (
          <div className="typing-indicator">
            <span></span><span></span><span></span>
          </div>
        )}
      </div>

      <form className="chat-input" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Type your question..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Type your question"
        />
        <button type="submit" aria-label="Send" disabled={!input.trim() || sending}>
          <SendIcon />
        </button>
      </form>
    </aside>
  )
}

function formatTime() {
  const d = new Date()
  let h = d.getHours()
  const m = String(d.getMinutes()).padStart(2, '0')
  const ampm = h >= 12 ? 'PM' : 'AM'
  h = h % 12 || 12
  return `${h}:${m} ${ampm}`
}

function BotIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="13" rx="3"/>
      <path d="M12 7V3"/>
      <circle cx="12" cy="3" r="1"/>
      <circle cx="9" cy="13" r="1"/>
      <circle cx="15" cy="13" r="1"/>
      <path d="M9 17h6"/>
    </svg>
  )
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2 11 13"/>
      <path d="M22 2 15 22 11 13 2 9 22 2z"/>
    </svg>
  )
}
