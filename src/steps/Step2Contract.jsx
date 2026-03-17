import { useRef, useState } from 'react'
import config from '../config'

export default function Step2Contract({ onNext, updateData }) {
  const canvasRef = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const [signed, setSigned] = useState(false)
  const [agreed, setAgreed] = useState(false)

  const startDraw = (e) => {
    setDrawing(true)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const doDraw = (e) => {
    if (!drawing) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top
    ctx.lineTo(x, y)
    ctx.strokeStyle = '#C9A44A'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.stroke()
    setSigned(true)
  }

  const stopDraw = () => setDrawing(false)

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSigned(false)
  }

  const handleSign = () => {
    const signatureData = canvasRef.current.toDataURL()
    const date = new Date().toLocaleDateString('fr-FR')
    updateData({ signature: signatureData, signatureDate: date, contratSigne: true })
    onNext()
  }

  return (
    <div style={{
      minHeight: '100vh', padding: '100px 40px 60px',
      display: 'flex', flexDirection: 'column', alignItems: 'center'
    }}>
      <div style={{ maxWidth: '680px', width: '100%' }}>

        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '11px', letterSpacing: '5px',
          color: '#C9A44A', marginBottom: '16px'
        }}>
          Étape 2 — Contrat
        </div>

        <h2 style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: '42px', letterSpacing: '3px',
          color: '#F0EDE8', marginBottom: '40px'
        }}>
          Ton engagement
        </h2>

        {/* CONTRAT */}
        <div style={{
          background: '#111', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '14px', padding: '36px', marginBottom: '32px'
        }}>
          <pre style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '13px', fontWeight: 300,
            color: '#F0EDE8', lineHeight: '1.9',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word'
          }}>
            {config.contrat}
          </pre>
        </div>

        {/* CHECKBOX */}
        <div
          onClick={() => setAgreed(!agreed)}
          style={{
            display: 'flex', alignItems: 'center', gap: '14px',
            cursor: 'pointer', marginBottom: '32px', padding: '16px',
            background: '#111', border: `1px solid ${agreed ? 'rgba(201,164,74,0.4)' : 'rgba(255,255,255,0.06)'}`,
            borderRadius: '10px', transition: 'all .2s'
          }}>
          <div style={{
            width: '20px', height: '20px', border: `1.5px solid ${agreed ? '#C9A44A' : 'rgba(255,255,255,0.15)'}`,
            borderRadius: '5px', background: agreed ? '#C9A44A' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, transition: 'all .2s'
          }}>
            {agreed && <svg width="10" height="10" viewBox="0 0 10 10"><polyline points="1,5 4,8 9,2" fill="none" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round"/></svg>}
          </div>
          <span style={{ fontSize: '13px', fontWeight: 300, color: '#F0EDE8', lineHeight: 1.6 }}>
            J'ai lu et j'accepte les termes de cet engagement. Je comprends que ce programme est conçu pour me pousser hors de ma zone de confort.
          </span>
        </div>

        {/* SIGNATURE */}
        <div style={{
          background: '#111', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '14px', padding: '28px', marginBottom: '32px'
        }}>
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '10px', letterSpacing: '4px',
            color: '#C9A44A', marginBottom: '16px'
          }}>
            Signature
          </div>
          <canvas
            ref={canvasRef}
            width={580} height={150}
            onMouseDown={startDraw} onMouseMove={doDraw}
            onMouseUp={stopDraw} onMouseLeave={stopDraw}
            onTouchStart={startDraw} onTouchMove={doDraw} onTouchEnd={stopDraw}
            style={{
              width: '100%', height: '150px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px', cursor: 'crosshair', display: 'block'
            }}
          />
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginTop: '12px'
          }}>
            <span style={{ fontSize: '12px', color: '#444' }}>
              {signed ? '✓ Signature enregistrée' : 'Signe dans le cadre ci-dessus'}
            </span>
            <button
              onClick={clearCanvas}
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '10px', letterSpacing: '2px',
                background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
                color: '#555', padding: '6px 14px', cursor: 'pointer',
                borderRadius: '6px', transition: 'all .2s'
              }}
              onMouseEnter={e => e.target.style.color = '#F0EDE8'}
              onMouseLeave={e => e.target.style.color = '#555'}
            >
              Effacer
            </button>
          </div>
        </div>

        <button
          onClick={handleSign}
          disabled={!signed || !agreed}
          style={{
            width: '100%', padding: '18px',
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '14px', letterSpacing: '3px',
            background: signed && agreed ? '#C9A44A' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${signed && agreed ? '#C9A44A' : 'rgba(255,255,255,0.08)'}`,
            color: signed && agreed ? '#0D0D0D' : '#444',
            cursor: signed && agreed ? 'pointer' : 'not-allowed',
            borderRadius: '10px', transition: 'all .3s'
          }}
        >
          {signed && agreed ? 'Signer et continuer →' : 'Signe le contrat pour continuer'}
        </button>

      </div>
    </div>
  )
}