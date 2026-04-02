import { useEffect } from 'react'

export default function UiModal({
  open,
  title,
  children,
  onClose,
  footer,
}) {
  useEffect(() => {
    if (!open) return

    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)

    // Prevent background scroll while modal is open
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        // close when clicking the overlay (not the content)
        if (e.target === e.currentTarget) onClose?.()
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.68)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '18px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '820px',
          background: '#0D0D0D',
          border: '1px solid rgba(201,164,74,0.25)',
          borderRadius: '16px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.55)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            gap: '12px',
          }}
        >
          <div
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              letterSpacing: '3px',
              color: '#C9A44A',
              fontSize: '14px',
            }}
          >
            {title}
          </div>
          <button
            onClick={() => onClose?.()}
            aria-label="Close"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#F0EDE8',
              cursor: 'pointer',
              fontSize: '16px',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '18px 20px' }}>{children}</div>

        {footer && (
          <div
            style={{
              padding: '14px 20px',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

