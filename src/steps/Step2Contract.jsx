import { useEffect, useRef, useState } from 'react'
import config from '../config'

export default function Step2Contract({ onNext, updateData, clientData }) {
  const canvasRef = useRef(null)
  const rafRef = useRef(null)
  const lastPointRef = useRef(null)
  const [drawing, setDrawing] = useState(false)
  const [signed, setSigned] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [signatureDate, setSignatureDate] = useState('')

  useEffect(() => {
    if (clientData?.signatureDateIso) {
      setSignatureDate(clientData.signatureDateIso)
    } else {
      setSignatureDate(new Date().toISOString().slice(0, 10))
    }
    if (clientData?.contratSigne) {
      setSigned(true)
      setAgreed(true)
    }
  }, [clientData])

  // Setup canvas with correct DPR to avoid blurry strokes on retina/mobile
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dpr = window.devicePixelRatio || 1
    const w = canvas.offsetWidth
    const h = canvas.offsetHeight
    canvas.width = w * dpr
    canvas.height = h * dpr
    const ctx = canvas.getContext('2d')
    ctx.scale(dpr, dpr)
    drawBaseline(ctx, w, h)
  }, [])

  function drawBaseline(ctx, w, h) {
    ctx.save()
    ctx.strokeStyle = 'rgba(201,164,74,0.2)'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 7])
    ctx.beginPath()
    ctx.moveTo(20, h * 0.68)
    ctx.lineTo(w - 20, h * 0.68)
    ctx.stroke()
    ctx.setLineDash([])
    ctx.restore()
  }

  useEffect(() => {
    if (!signatureDate) return
    const parsedDate = new Date(signatureDate)
    updateData({
      signatureDateIso: signatureDate,
      signatureDate: parsedDate.toLocaleDateString('fr-FR'),
    })
  }, [signatureDate, updateData])

  const getPoint = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    }
  }

  const startDraw = (e) => {
    setDrawing(true)
    canvasRef.current?.setPointerCapture?.(e.pointerId)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const { x, y } = getPoint(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    lastPointRef.current = { x, y }
  }

  const doDraw = (e) => {
    if (!drawing) return
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const point = getPoint(e)

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(() => {
      const from = lastPointRef.current || point
      const midX = (from.x + point.x) / 2
      const midY = (from.y + point.y) / 2
      ctx.strokeStyle = '#C9A44A'
      ctx.lineWidth = 2.4
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.quadraticCurveTo(from.x, from.y, midX, midY)
      ctx.stroke()
      lastPointRef.current = point
    })
    setSigned(true)
  }

  const stopDraw = () => {
    setDrawing(false)
    lastPointRef.current = null
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const dpr = window.devicePixelRatio || 1
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr)
    drawBaseline(ctx, canvas.offsetWidth, canvas.offsetHeight)
    setSigned(false)
  }

  const handleSign = () => {
    const signatureData = canvasRef.current.toDataURL()
    const parsedDate = signatureDate ? new Date(signatureDate) : new Date()
    const date = parsedDate.toLocaleDateString('fr-FR')
    updateData({
      signature: signatureData,
      signatureDate: date,
      signatureDateIso: signatureDate,
      contratSigne: true,
    })
    onNext()
  }

  return (
    <div style={{
      minHeight: '100vh', padding: '100px 16px 60px',
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
          fontSize: 'clamp(28px, 8vw, 42px)', letterSpacing: '3px',
          color: '#F0EDE8', marginBottom: '40px'
        }}>
          Ton engagement
        </h2>

        <div style={{
          background: '#111', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '14px', padding: '22px', marginBottom: '24px'
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

        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="signature-date"
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '10px', letterSpacing: '3px',
              color: '#C9A44A', display: 'block', marginBottom: '8px',
            }}
          >
            Date de signature
          </label>
          <input
            id="signature-date"
            type="date"
            value={signatureDate}
            onChange={(e) => setSignatureDate(e.target.value)}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px', padding: '12px', color: '#F0EDE8',
            }}
          />
        </div>

        <div style={{
          background: '#111', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '14px', padding: '18px', marginBottom: '24px'
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
            onPointerDown={startDraw}
            onPointerMove={doDraw}
            onPointerUp={stopDraw}
            onPointerLeave={stopDraw}
            style={{
              width: '100%', height: '150px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px', cursor: 'crosshair', display: 'block',
              touchAction: 'none',
            }}
          />
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginTop: '12px'
          }}>
            <span style={{ fontSize: '12px', color: signed ? '#C9A44A' : '#444' }}>
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
          disabled={!signed || !agreed || !signatureDate}
          style={{
            width: '100%', padding: '18px',
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '14px', letterSpacing: '3px',
            background: signed && agreed && signatureDate ? '#C9A44A' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${signed && agreed && signatureDate ? '#C9A44A' : 'rgba(255,255,255,0.08)'}`,
            color: signed && agreed && signatureDate ? '#0D0D0D' : '#444',
            cursor: signed && agreed && signatureDate ? 'pointer' : 'not-allowed',
            borderRadius: '10px', transition: 'all .3s'
          }}
        >
          {signed && agreed && signatureDate ? 'Signer et continuer →' : 'Signe le contrat pour continuer'}
        </button>

      </div>
    </div>
  )
}
