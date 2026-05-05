import './BackendStatus.css'

/**
 * Tiny status badge that tells the user which mode the dashboard is in.
 *  - 'connecting' (gray dot, pulsing): probe in flight on app load
 *  - 'live'       (green dot)        : backend reachable, real predictions
 *  - 'mock'       (amber dot)        : backend unreachable, using mock data
 *  - 'disabled'   (slate dot)        : VITE_API_URL is intentionally empty
 */
export default function BackendStatus({ status, apiUrl, error }) {
  const labelMap = {
    connecting: 'Connecting…',
    live:       'Live API',
    mock:       'Mock data',
    disabled:   'Mock only',
  }
  const label = labelMap[status] || 'Unknown'

  const titleMap = {
    connecting: `Probing ${apiUrl || 'backend'}…`,
    live:       `Connected to ${apiUrl}`,
    mock:       `Backend not reachable${error ? ` (${error})` : ''} — falling back to mock data`,
    disabled:   'VITE_API_URL is empty — running in mock-only mode',
  }

  return (
    <div className={`backend-status backend-status-${status}`} title={titleMap[status]}>
      <span className="backend-status-dot" aria-hidden="true" />
      <span className="backend-status-label">{label}</span>
    </div>
  )
}
