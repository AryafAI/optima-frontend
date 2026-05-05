import { useEffect, useRef, useState } from 'react'
import Logo from './Logo.jsx'
import ChatMessage from './ChatMessage.jsx'
import { INITIAL_CHAT, generateMockBotReply } from '../data/data.js'
import { api, isApiEnabled } from '../api/client.js'
import './SidebarChat.css'

// Right-side chat panel.
// When the bot reply contains a scenarioResult, it bubbles up via onScenarioResult
// so the dashboard can update the chart and summary cards.
// onBackendStatusChange?: (next: 'live' | 'mock', errorMsg?: string) => void
export default function SidebarChat({ onScenarioResult, onBackendStatusChange }) {
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
    let scenarioFromBackend = null

    // Try backend first; fall back to mock on failure.
    let backendError = null
    if (isApiEnabled()) {
      try {
        console.log('[chat] →', text)
        const res = await api.chat(text)
        console.log('[chat] ←', res)
        // Backend returns { text, result, route }
        // We re-shape result into the same format as MOCK_SCENARIO_RESULTS so the dashboard
        // can update its chart/summary directly.
        if (res?.result && res?.route === 'what_if') {
          scenarioFromBackend = backendChatResultToScenario(res.result)
        }
        botMsg = {
          id:     Date.now() + 1,
          sender: 'bot',
          text:   res?.text || 'Done.',
          time:   formatTime(),
        }
        onBackendStatusChange?.('live')
      } catch (err) {
        backendError = err?.message || String(err)
        console.error('[chat] Backend error:', err)
        onBackendStatusChange?.('mock', backendError)
      }
    }

    if (!botMsg) {
      // Mock reply — surface the backend error in the bot message so the user can see
      // exactly what went wrong instead of silently degrading to a fake answer.
      await new Promise((r) => setTimeout(r, 200))
      if (backendError) {
        botMsg = {
          id:     Date.now() + 1,
          sender: 'bot',
          text:   `⚠️ Backend error: ${backendError}\n\nFalling back to a mock response. Check the backend terminal for the full traceback.`,
          time:   formatTime(),
        }
      } else {
        const reply = generateMockBotReply(text)
        botMsg = {
          id:     Date.now() + 1,
          sender: 'bot',
          text:   reply.text,
          time:   formatTime(),
        }
        if (reply.scenarioResult && onScenarioResult) {
          onScenarioResult(reply.scenarioId, reply.scenarioResult)
        }
      }
    } else if (scenarioFromBackend && onScenarioResult) {
      onScenarioResult(scenarioFromBackend.id, scenarioFromBackend.result)
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

// Convert FastAPI /chat result into the scenario shape used by ScenarioChart + SummaryCards.
function backendChatResultToScenario(result) {
  if (!result) return null
  if (result.scenario === 'extended_discount' && Array.isArray(result.monthly_detail)) {
    const months = result.monthly_detail.map((m) => ({
      month:     m.month,
      baseline:  m.baseline_sales,
      predicted: m.new_sales,
    }))
    const t = result.total || {}
    return {
      id: 'extended_discount',
      result: {
        type: 'monthly',
        months,
        totals: {
          baseline:  t.baseline_sales ?? 0,
          predicted: t.new_sales      ?? 0,
          changePct: t.delta_pct      ?? 0,
        },
      },
    }
  }
  // Single comparison (price or discount change)
  const id = result.scenario === 'discount_change' ? 'discount_change' : 'price_change'
  return {
    id,
    result: {
      type: 'single',
      bars: [
        { label: 'Baseline',  value: result.baseline_sales || 0, kind: 'baseline'  },
        { label: 'Predicted', value: result.new_sales      || 0, kind: 'predicted' },
      ],
      totals: {
        baseline:  result.baseline_sales || 0,
        predicted: result.new_sales      || 0,
        changePct: result.difference_pct ?? 0,
      },
    },
  }
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
      <circle cx="9"  cy="13" r="1"/>
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
