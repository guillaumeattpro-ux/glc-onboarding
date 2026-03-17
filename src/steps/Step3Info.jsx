import { useState } from 'react'

export default function Step3Info({ onNext, updateData }) {
  const [form, setForm] = useState({
    prenom: '', nom: '', email: '',
    instagram: '', situation: ''
  })

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }))
  const isValid = form.prenom && form.nom && form.email && form.situation

  const handleSubmit = () => {
    updateData({ infos: form })
    onNext()
  }

  const inputStyle = {
    width: '100%', padding: '14px 16px',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px', color: '#F0EDE8',
    fontFamily: "'Inter', sans-serif",
    fontSize: '14px', fontWeight: 300,
    outline: 'none', transition: 'border .2s'
  }

  const labelStyle = {
    fontFamily: "'Bebas Neue', sans-serif",
    fontSize: '10px', letterSpacing: '3px',
    color: '#C9A44A', marginBottom: '8px', display: 'block'
  }

  return (
    <div style={{
      minHeight: '100vh', padding: '100px 40px 60px',
      display: 'flex', flexDirection: 'column', alignItems: 'center'
    }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>

        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '11px', letterSpacing: '5px',
          color: '#C9A44A', marginBottom: '16px'
        }}>
          Étape 3 — Informations
        </div>

        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '42px', letterSpacing: '3px',
          color: '#F0EDE8', marginBottom: '8px'
        }}>
          Qui es-tu ?
        </h2>

        <p style={{
          fontSize: '14px', fontWeight: 300, color: '#555',
          marginBottom: '40px', letterSpacing: '1px'
        }}>
          Ces informations me permettent de personnaliser ton accompagnement.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>Prénom *</label>
            <input
              style={inputStyle} placeholder="Alexandre"
              value={form.prenom}
              onChange={e => update('prenom', e.target.value)}
              onFocus={e => e.target.style.borderColor = 'rgba(201,164,74,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>
          <div>
            <label style={labelStyle}>Nom *</label>
            <input
              style={inputStyle} placeholder="Martin"
              value={form.nom}
              onChange={e => update('nom', e.target.value)}
              onFocus={e => e.target.style.borderColor = 'rgba(201,164,74,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Email *</label>
          <input
            style={inputStyle} placeholder="alexandre@email.com"
            type="email" value={form.email}
            onChange={e => update('email', e.target.value)}
            onFocus={e => e.target.style.borderColor = 'rgba(201,164,74,0.4)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Instagram</label>
          <input
            style={inputStyle} placeholder="@alexandre"
            value={form.instagram}
            onChange={e => update('instagram', e.target.value)}
            onFocus={e => e.target.style.borderColor = 'rgba(201,164,74,0.4)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
        </div>

        <div style={{ marginBottom: '40px' }}>
          <label style={labelStyle}>Ta situation actuelle *</label>
          <textarea
            style={{ ...inputStyle, minHeight: '120px', resize: 'none', lineHeight: 1.8 }}
            placeholder="Décris brièvement ta situation professionnelle et personnelle aujourd'hui..."
            value={form.situation}
            onChange={e => update('situation', e.target.value)}
            onFocus={e => e.target.style.borderColor = 'rgba(201,164,74,0.4)'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!isValid}
          style={{
            width: '100%', padding: '18px',
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '14px', letterSpacing: '3px',
            background: isValid ? '#C9A44A' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${isValid ? '#C9A44A' : 'rgba(255,255,255,0.08)'}`,
            color: isValid ? '#0D0D0D' : '#444',
            cursor: isValid ? 'pointer' : 'not-allowed',
            borderRadius: '10px', transition: 'all .3s'
          }}
        >
          {isValid ? 'Continuer →' : 'Remplis les champs obligatoires'}
        </button>

      </div>
    </div>
  )
}