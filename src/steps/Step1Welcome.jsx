import config from '../config'

/** ID ou URL embed — modifie ici si tu changes de vidéo */
const DEFAULT_YOUTUBE_ID = '9ZsVtkEmjGg'

function buildYoutubeEmbedSrc() {
  const raw = config.welcome_video?.src?.trim()
  if (!raw) {
    return `https://www.youtube.com/embed/${DEFAULT_YOUTUBE_ID}?rel=0&modestbranding=1&playsinline=1`
  }
  if (/^https?:\/\//i.test(raw)) {
    try {
      const u = new URL(raw)
      if (u.hostname.includes('youtube.com') && u.pathname.startsWith('/embed/')) {
        return `${raw.split('&')[0]}?rel=0&modestbranding=1&playsinline=1`
      }
      if (u.hostname === 'youtu.be') {
        const id = u.pathname.replace(/^\//, '').split('/')[0]
        return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`
      }
      const v = u.searchParams.get('v')
      if (v) {
        return `https://www.youtube.com/embed/${v}?rel=0&modestbranding=1&playsinline=1`
      }
    } catch {
      /* ignore */
    }
    return raw.includes('?') ? `${raw}&rel=0&modestbranding=1` : `${raw}?rel=0&modestbranding=1`
  }
  if (/\.mp4(\?|$)/i.test(raw)) {
    return null
  }
  return `https://www.youtube.com/embed/${raw}?rel=0&modestbranding=1&playsinline=1`
}

export default function Step1Welcome({ onNext }) {
  const embedSrc = buildYoutubeEmbedSrc()
  const mp4Src = config.welcome_video?.src?.trim()
  const useMp4 = mp4Src && /\.mp4(\?|$)/i.test(mp4Src)

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '32px clamp(12px, 3vw, 36px)', textAlign: 'center', paddingTop: '72px'
    }}>
      <div style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '11px', letterSpacing: '5px', color: '#C9A44A',
        marginBottom: '20px'
      }}>
        {config.nom}
      </div>

      <h1 style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: 'clamp(52px, 8vw, 96px)',
        letterSpacing: '4px', color: '#F0EDE8',
        lineHeight: '.95', marginBottom: '20px'
      }}>
        {config.programme.split(' ')[0]}{' '}
        <span style={{ color: '#C9A44A' }}>{config.programme.split(' ')[1]}</span>
      </h1>

      <p style={{
        fontFamily: "'Bebas Neue', sans-serif",
        fontSize: '13px', letterSpacing: '4px',
        color: '#555', marginBottom: '28px',
        maxWidth: '500px'
      }}>
        {config.tagline}
      </p>

      <div style={{
        background: '#111', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px', padding: 'clamp(12px, 2vw, 22px)',
        maxWidth: 'min(1240px, 100%)',
        width: '100%', marginBottom: '32px'
      }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '10px', letterSpacing: '4px', color: '#C9A44A',
          marginBottom: '16px'
        }}>Message du mentor</div>

        <div style={{ marginBottom: '8px' }}>
          <div
            style={{
              position: 'relative',
              width: '100%',
              margin: '0 auto',
              borderRadius: '6px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)',
              background: '#000',
              boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
              aspectRatio: '16 / 9',
            }}
          >
            {useMp4 ? (
              <video
                controls
                playsInline
                preload="metadata"
                poster={config.welcome_video?.poster || undefined}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              >
                <source src={mp4Src} type="video/mp4" />
              </video>
            ) : (
              <iframe
                title="Message du mentor"
                src={embedSrc || `https://www.youtube.com/embed/${DEFAULT_YOUTUBE_ID}?rel=0&modestbranding=1&playsinline=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
              />
            )}
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(201,164,74,0.15)',
          paddingTop: '18px',
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '13px', letterSpacing: '3px', color: '#C9A44A'
        }}>
          "{config.citation}"
        </div>
      </div>

      <button
        type="button"
        onClick={onNext}
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '14px', letterSpacing: '3px',
          padding: '18px 48px',
          background: '#C9A44A', border: 'none',
          color: '#0D0D0D', cursor: 'pointer',
          borderRadius: '8px', transition: 'all .2s'
        }}
        onMouseEnter={e => { e.target.style.background = '#E8C06A' }}
        onMouseLeave={e => { e.target.style.background = '#C9A44A' }}
      >
        Entrer dans l'arène →
      </button>
    </div>
  )
}
