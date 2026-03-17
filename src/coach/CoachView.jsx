import { useState } from 'react'
import config from '../config'

export default function CoachView() {
  const [auth, setAuth] = useState(false)
  const [pwd, setPwd] = useState('')
  const [error, setError] = useState(false)
  const [selected, setSelected] = useState(null)

  // Données de démo
  const clients = [
    {
      id: 1, prenom: 'Alexandre', nom: 'Martin', email: 'alexandre@email.com',
      instagram: '@alexandre', situation: 'Entrepreneur en cours de lancement',
      signatureDate: '17/03/2026', contratSigne: true,
      questionnaire: {
        0: { bloc: "L'état des lieux", question: config.questionnaire[0].question, slider: 7, text: 'Coincé, ambitieux, impatient. Je me sens dans un entre-deux — j\'ai des ambitions mais je n\'arrive pas à les concrétiser.' },
        4: { bloc: "Ce que tu veux vraiment", question: config.questionnaire[4].question, slider: 9, text: 'Je veux lancer mon business en ligne et atteindre 5000€/mois dans les 12 prochains mois.' },
        6: { bloc: "Les blocages réels", question: config.questionnaire[6].question, slider: 6, text: 'La procrastination et la peur de ne pas être légitime. Je commence mais je ne finis pas.' },
      }
    },
    {
      id: 2, prenom: 'Thomas', nom: 'Dubois', email: 'thomas@email.com',
      instagram: '@thomas_d', situation: 'Salarié qui veut se lancer',
      signatureDate: '16/03/2026', contratSigne: true,
      questionnaire: {
        0: { bloc: "L'état des lieux", question: config.questionnaire[0].question, slider: 4, text: 'Frustré, curieux, déterminé. Mon job ne me correspond plus du tout.' },
        4: { bloc: "Ce que tu veux vraiment", question: config.questionnaire[4].question, slider: 8, text: 'Quitter mon CDI et vivre de ma passion pour le fitness coaching.' },
        6: { bloc: "Les blocages réels", question: config.questionnaire[6].question, slider: 7, text: 'La sécurité financière. J\'ai peur de ne pas pouvoir payer mon loyer si ça ne marche pas.' },
      }
    }
  ]

  const handleLogin = () => {
    if (pwd === config.coach_password) {
      setAuth(true)
      setError(false)
    } else {
      setError(true)
    }
  }

  const s = {
    card: { background: '#111', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', overflow: 'hidden' },
  }

  if (!auth) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
      <div style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '11px', letterSpacing: '5px', color: '#C9A44A', marginBottom: '16px' }}>
          Gentleman Létal Club
        </div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '42px', letterSpacing: '3px', color: '#F0EDE8', marginBottom: '40px' }}>
          Espace Coach
        </h1>
        <div style={{ ...s.card, padding: '32px' }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '10px', letterSpacing: '3px', color: '#555', marginBottom: '12px', textAlign: 'left' }}>
            Mot de passe
          </div>
          <input
            type="password"
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            placeholder="••••••••"
            style={{
              width: '100%', padding: '14px 16px',
              background: 'rgba(255,255,255,0.03)',
              border: `1px solid ${error ? 'rgba(220,50,50,0.4)' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '8px', color: '#F0EDE8',
              fontFamily: "'Inter', sans-serif", fontSize: '14px',
              outline: 'none', marginBottom: '16px'
            }}
          />
          {error && (
            <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '10px', letterSpacing: '2px', color: '#dc3232', marginBottom: '16px' }}>
              Mot de passe incorrect
            </div>
          )}
          <button
            onClick={handleLogin}
            style={{
              width: '100%', padding: '14px',
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '13px', letterSpacing: '3px',
              background: '#C9A44A', border: 'none',
              color: '#0D0D0D', cursor: 'pointer', borderRadius: '8px'
            }}
          >
            Accéder →
          </button>
        </div>
      </div>
    </div>
  )

  if (selected) return (
    <div style={{ minHeight: '100vh', padding: '60px 40px', maxWidth: '800px', margin: '0 auto' }}>
      <button
        onClick={() => setSelected(null)}
        style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '11px', letterSpacing: '3px', color: '#555', background: 'transparent', border: 'none', cursor: 'pointer', marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '8px' }}
      >
        ← Retour
      </button>

      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '42px', letterSpacing: '3px', color: '#F0EDE8', marginBottom: '8px' }}>
        {selected.prenom} {selected.nom}
      </div>
      <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '11px', letterSpacing: '3px', color: '#555', marginBottom: '40px' }}>
        {selected.email} · {selected.instagram}
      </div>

      {/* INFOS */}
      <div style={{ ...s.card, marginBottom: '24px' }}>
        <div style={{ padding: '16px 24px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '10px', letterSpacing: '4px', color: '#C9A44A', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          Informations personnelles
        </div>
        <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[['Situation', selected.situation], ['Contrat', selected.contratSigne ? `Signé le ${selected.signatureDate}` : 'Non signé']].map(([k, v]) => (
            <div key={k}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '9px', letterSpacing: '3px', color: '#555', marginBottom: '6px' }}>{k}</div>
              <div style={{ fontSize: '13px', fontWeight: 300, color: '#F0EDE8', lineHeight: 1.6 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* QUESTIONNAIRE */}
      <div style={s.card}>
        <div style={{ padding: '16px 24px', fontFamily: "'Bebas Neue', sans-serif", fontSize: '10px', letterSpacing: '4px', color: '#C9A44A', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
          Réponses questionnaire
        </div>
        {Object.values(selected.questionnaire).map((q, i) => (
          <div key={i} style={{ padding: '24px', borderBottom: i < Object.values(selected.questionnaire).length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '9px', letterSpacing: '3px', color: '#C9A44A' }}>{q.bloc}</div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '11px', color: '#C9A44A' }}>{q.slider}/10</div>
            </div>
            <div style={{ fontSize: '12px', color: '#555', marginBottom: '10px', fontStyle: 'italic' }}>{q.question}</div>
            <div style={{ fontSize: '14px', fontWeight: 300, color: '#F0EDE8', lineHeight: 1.8 }}>{q.text}</div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', padding: '60px 40px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', paddingBottom: '24px', borderBottom: '1px solid rgba(201,164,74,0.1)' }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '11px', letterSpacing: '5px', color: '#C9A44A', marginBottom: '12px' }}>
            Gentleman Létal Club
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '48px', letterSpacing: '3px', color: '#F0EDE8' }}>
            Espace Coach
          </h1>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '32px', letterSpacing: '2px', color: '#C9A44A' }}>{clients.length}</div>
          <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '10px', letterSpacing: '3px', color: '#555' }}>Élèves onboardés</div>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {clients.map(c => (
          <div
            key={c.id}
            onClick={() => setSelected(c)}
            style={{
              ...s.card, padding: '24px',
              cursor: 'pointer', transition: 'all .2s',
              display: 'grid', gridTemplateColumns: '1fr auto',
              alignItems: 'center'
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,164,74,0.3)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
          >
            <div>
              <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '18px', letterSpacing: '2px', color: '#F0EDE8', marginBottom: '6px' }}>
                {c.prenom} {c.nom}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 300, color: '#555' }}>
                {c.email} · {c.instagram} · {c.situation}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '9px', letterSpacing: '2px', color: c.contratSigne ? '#C9A44A' : '#555' }}>
                  {c.contratSigne ? '✓ Contrat signé' : '○ En attente'}
                </div>
                <div style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '9px', letterSpacing: '2px', color: '#333', marginTop: '4px' }}>
                  {c.signatureDate}
                </div>
              </div>
              <span style={{ color: '#333', fontSize: '16px' }}>›</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}