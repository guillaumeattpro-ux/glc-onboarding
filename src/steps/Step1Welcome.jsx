import config from '../config'

/** ID de secours si welcome_video.src est vide */
const DEFAULT_YOUTUBE_ID = 'FIgVTGF2bMs'

const EMBED_PARAMS = 'rel=0&modestbranding=1&playsinline=1'

/** Extrait l’ID vidéo (watch, embed, youtu.be, shorts, ou ID seul sur 11 car.) */
function extractYoutubeVideoId(raw) {
  if (!raw || typeof raw !== 'string') return null
  const s = raw.trim()
  if (/\.mp4(\?|$)/i.test(s)) return null
  if (!/^https?:\/\//i.test(s)) {
    return /^[a-zA-Z0-9_-]{11}$/.test(s) ? s : null
  }
  try {
    const u = new URL(s)
    if (u.hostname === 'youtu.be') {
      return u.pathname.replace(/^\//, '').split('/')[0] || null
    }
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname.startsWith('/embed/')) {
        return u.pathname.replace(/^\/embed\//, '').split('/')[0] || null
      }
      if (u.pathname.startsWith('/shorts/')) {
        return u.pathname.replace(/^\/shorts\//, '').split('/')[0] || null
      }
      const v = u.searchParams.get('v')
      if (v) return v
    }
  } catch {
    return null
  }
  return null
}

function buildYoutubeEmbedSrc() {
  const raw = config.welcome_video?.src?.trim()
  if (!raw) {
    return `https://www.youtube.com/embed/${DEFAULT_YOUTUBE_ID}?${EMBED_PARAMS}`
  }
  if (/\.mp4(\?|$)/i.test(raw)) {
    return null
  }
  const id = extractYoutubeVideoId(raw)
  if (id) {
    return `https://www.youtube.com/embed/${id}?${EMBED_PARAMS}`
  }
  return `https://www.youtube.com/embed/${DEFAULT_YOUTUBE_ID}?${EMBED_PARAMS}`
}

/** Lien « ouvrir sur YouTube » (même source que l’embed) */
function buildYoutubeWatchUrl() {
  const raw = config.welcome_video?.src?.trim()
  const id = raw && !/\.mp4(\?|$)/i.test(raw) ? extractYoutubeVideoId(raw) : null
  const vid = id || DEFAULT_YOUTUBE_ID
  return `https://www.youtube.com/watch?v=${vid}`
}

export default function Step1Welcome({ onNext }) {
  const embedSrc = buildYoutubeEmbedSrc()
  const youtubeWatchUrl = buildYoutubeWatchUrl()
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
                src={embedSrc || `https://www.youtube.com/embed/${DEFAULT_YOUTUBE_ID}?${EMBED_PARAMS}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="eager"
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

        {!useMp4 && (
          <p style={{
            marginTop: '12px',
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '11px',
            letterSpacing: '2px',
            color: '#666',
          }}>
            <a
              href={youtubeWatchUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: '#C9A44A', textDecoration: 'underline' }}
            >
              Ouvrir la vidéo sur YouTube
            </a>
          </p>
        )}

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
