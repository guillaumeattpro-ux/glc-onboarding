import config from '../config'

export default function Step1Welcome({ onNext }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '40px', textAlign: 'center', paddingTop: '80px'
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
        color: '#555', marginBottom: '60px',
        maxWidth: '500px'
      }}>
        {config.tagline}
      </p>

      <div style={{
        background: '#111', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px', padding: '48px', maxWidth: '600px',
        width: '100%', marginBottom: '48px'
      }}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '10px', letterSpacing: '4px', color: '#C9A44A',
          marginBottom: '24px'
        }}>Message du mentor</div>

        <p style={{
          fontSize: '16px', fontWeight: 300, color: '#F0EDE8',
          lineHeight: '1.9', marginBottom: '32px'
        }}>
          Tu viens de faire quelque chose que la plupart des gens ne feront jamais — tu as choisi l'inconfort.
          <br /><br />
          Ce programme va te pousser hors de ta zone de confort. C'est exactement pour ça que tu es là.
          <br /><br />
          Avant de commencer, prends 5 minutes pour compléter cet onboarding. Il me permettra de t'accompagner de la meilleure façon possible.
        </p>

        <div style={{
          borderTop: '1px solid rgba(201,164,74,0.15)',
          paddingTop: '24px',
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