import './ChatMessage.css'

// Plain text bubbles only — no inline charts.
export default function ChatMessage({ message }) {
  const isUser = message.sender === 'user'

  if (isUser) {
    return (
      <div className="msg msg-user">
        <div className="msg-label">You</div>
        <div className="msg-bubble user">{message.text}</div>
        <div className="msg-time">{message.time}</div>
      </div>
    )
  }

  return (
    <div className="msg msg-bot">
      <div className="msg-row">
        <div className="msg-avatar">
          <BotIcon />
        </div>
        <div className="msg-label-bot">Optima</div>
      </div>
      <div className="msg-bubble bot">{message.text}</div>
      <div className="msg-time">{message.time}</div>
    </div>
  )
}

function BotIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="7" width="18" height="13" rx="3"/>
      <path d="M12 7V3"/>
      <circle cx="9"  cy="13" r="1"/>
      <circle cx="15" cy="13" r="1"/>
      <path d="M9 17h6"/>
    </svg>
  )
}
