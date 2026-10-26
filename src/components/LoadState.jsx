// Shown in place of data while it loads, or when the server can't be reached.
export default function LoadState({ status, what, onRetry }) {
  if (status === 'loading') return <p className="load-state" role="status"><span className="spinner" aria-hidden="true" />Loading {what}…</p>
  return (
    <div className="load-state error" role="alert">
      <p>Couldn&apos;t load {what}. The server may be waking up or offline.</p>
      <button type="button" onClick={onRetry}>Try again</button>
    </div>
  )
}
