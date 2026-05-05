import { useState } from 'react'
import './Logo.css'

// Loads the official Optima logo from /public/OptimaLogo.png.
// If that file is missing, falls back to a clean inline SVG so the dashboard
// always renders without a broken image icon.
export default function Logo() {
  const [imgFailed, setImgFailed] = useState(false)

  return (
    <div className="logo">
      <div className="logo-mark" aria-hidden="true">
        {imgFailed ? (
          <FallbackSvg />
        ) : (
          <img
            src="/OptimaLogo.png"
            alt="Optima"
            className="logo-img"
            onError={() => setImgFailed(true)}
          />
        )}
      </div>
      <div className="logo-text">
        <div className="logo-name">OPTIMA</div>
        <div className="logo-tag">Decisions You Can Trust</div>
      </div>
    </div>
  )
}

function FallbackSvg() {
  return (
    <svg width="38" height="38" viewBox="0 0 40 40" fill="none">
      <defs>
        <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1e40af"/>
          <stop offset="0.5" stopColor="#3b82f6"/>
          <stop offset="1" stopColor="#06b6d4"/>
        </linearGradient>
      </defs>
      <path d="M20 4 L36 14 L36 28 L20 38 L4 28 L4 14 Z" fill="url(#logoGrad)"/>
      <path d="M20 12 L28 17 L28 25 L20 30 L12 25 L12 17 Z" fill="#ffffff" fillOpacity="0.92"/>
      <circle cx="20" cy="21" r="3.5" fill="url(#logoGrad)"/>
    </svg>
  )
}
