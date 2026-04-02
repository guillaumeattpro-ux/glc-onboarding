import { useCallback, useEffect, useRef, useState } from 'react'
import config from '../config'

/** Fallback si config absente — YouTube embed ou chemin .mp4 */
const DEFAULT_WELCOME_MEDIA = 'https://www.youtube.com/embed/9ZsVtkEmjGg'

function isYoutubeUrl(url) {
  return /youtube\.com|youtu\.be/i.test(url || '')
}

/** Normalise watch / youtu.be vers une URL embed */
function toYoutubeEmbedUrl(url) {
  if (!url) return ''
  try {
    const u = new URL(url.includes('://') ? url : `https://${url}`)
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0]
      return `https://www.youtube.com/embed/${id}`
    }
    if (u.hostname.includes('youtube.com')) {
      if (u.pathname.startsWith('/embed/')) return url.split('&')[0]
      const v = u.searchParams.get('v')
      if (v) return `https://www.youtube.com/embed/${v}`
    }
  } catch {
    /* ignore */
  }
  return url
}

/** Largeur utile sous la carte (carte élargie − padding latéral) */
const CARD_INNER_MAX_W = 940

/** Cadre aux mêmes proportions que la vidéo, le plus grand possible dans maxW × maxH → contain remplit tout le noir */
function fitBoxToVideo(video) {
  const vw = video.videoWidth
  const vh = video.videoHeight
  if (!vw || !vh) return null
  const maxW = Math.min(CARD_INNER_MAX_W, window.innerWidth - 40)
  const maxH = Math.min(window.innerHeight * 0.68, 640)
  let w = maxW
  let h = (w * vh) / vw
  if (h > maxH) {
    h = maxH
    w = (h * vw) / vh
  }
  return { width: Math.round(w), height: Math.round(h) }
}

export default function Step1Welcome({ onNext }) {
  const mediaSrc = config.welcome_video?.src?.trim() || DEFAULT_WELCOME_MEDIA
  const isYoutube = isYoutubeUrl(mediaSrc)
  const embedUrl = isYoutube ? toYoutubeEmbedUrl(mediaSrc) : ''
  const videoRef = useRef(null)
  const [box, setBox] = useState(null)

  const fitVideoBox = useCallback((video) => {
    const next = fitBoxToVideo(video)
    if (next) setBox(next)
  }, [])

  useEffect(() => {
    const onResize = () => {
      const v = videoRef.current
      if (v?.videoWidth) fitVideoBox(v)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [fitVideoBox])

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px clamp(16px, 4vw, 48px)', textAlign: 'center', paddingTop: '80px'
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
        borderRadius: '16px', padding: 'clamp(16px, 2.5vw, 28px)',
        maxWidth: 'min(1000px, 100%)',
        width: '100%', marginBottom: '32px'
      }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '10px', letterSpacing: '4px', color: '#C9A44A',
          marginBottom: '16px'
        }}>Message du mentor</div>

        <div style={{ marginBottom: '8px' }}>
          <div
            style={
              isYoutube
                ? {
                    position: 'relative',
                    width: '100%',
                    paddingTop: '56.25%',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: '#000',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
                  }
                : {
                    position: 'relative',
                    width: box ? `${box.width}px` : '100%',
                    height: box ? `${box.height}px` : 'min(42vh, 400px)',
                    maxWidth: '100%',
                    margin: '0 auto',
                    borderRadius: '6px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: '#000',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
                  }
            }
          >
            {isYoutube ? (
              <iframe
                title="Message du mentor"
                src={`${embedUrl}${embedUrl.includes('?') ? '&' : '?'}rel=0&modestbranding=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
              />
            ) : (
              <video
                ref={videoRef}
                poster={config.welcome_video?.poster || undefined}
                controls
                playsInline
                muted
                autoPlay
                loop
                preload="metadata"
                onLoadedMetadata={(e) => fitVideoBox(e.target)}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  objectPosition: 'center center',
                }}
              >
                <source src={mediaSrc} type="video/mp4" />
                <source src="/videos/welcome.mp4" type="video/mp4" />
              </video>
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
        onClick={onNext}
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '14px', letterSpacing: '3px',
          padding: '18px 48px',
          background: '#C9A44A', border: 'none',
          color: '#0D0D0D', cursor: 'pointer',
          borderRadius: '8px', transition: 'all .2s'
        }}
        onMouseEnter={e => e.target.style.background = '#E8C06A'}
        onMouseLeave={e => e.target.style.background = '#C9A44A'}
      >
        Entrer dans l'arène →
      </button>
    </div>
  )
}