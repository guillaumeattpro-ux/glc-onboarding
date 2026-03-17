import { useState } from 'react'
import config from '../config'

export default function Step4Quiz({ onNext, updateData }) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState({})
  const [slider, setSlider] = useState(5)
  const [text, setText] = useState('')

  const q = config.questionnaire[current]
  const total = config.questionnaire.length
  const progress = ((current) / total) * 100

  const handleNext = () => {
    const newAnswers = {
      ...answers,
      [current]: { question: q.question, bloc: q.bloc, slider, text }
    }
    setAnswers(newAnswers)

    if (current + 1 >= total) {
      updateData({ questionnaire: newAnswers })
      onNext()
    } else {
      setCurrent(current + 1)
      setSlider(5)
      setText('')
    }
  }

  const canContinue = text.trim().length > 10

  return (
    <div style={{
      minHeight: '100vh', padding: '100px 40px 60px',
      display: 'flex', flexDirection: 'column', alignItems: 'center'
    }}>
      <div style={{ maxWidth: '640px', width: '100%' }}>

        {/* HEADER */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '12px'
          }}>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '10px', letterSpacing: '4px', color: '#C9A44A'
            }}>
              {q.bloc}
            </div>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '11px', letterSpacing: '2px', color: '#444'
            }}>
              {current + 1} / {total}
            </div>
          </div>
          <div style={{
            height: '2px', background: 'rgba(255,255,255,0.06)',
            borderRadius: '2px', overflow: 'hidden'
          }}>
            <div style={{
              height: '100%', background: '#C9A44A',
              width: `${progress}%`, transition: 'width .4s ease',
              borderRadius: '2px'
            }} />
          </div>
        </div>

        {/* QUESTION */}
        <div style={{
          background: '#111', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '16px', padding: '40px', marginBottom: '24px'
        }}>
          <h3 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '22px', letterSpacing: '2px',
            color: '#F0EDE8', lineHeight: 1.4, marginBottom: '32px'
          }}>
            {q.question}
          </h3>

          {/* SLIDER */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              marginBottom: '10px'
            }}>
              <span style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '9px', letterSpacing: '2px', color: '#444'
              }}>Pas du tout</span>
              <span style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '14px', letterSpacing: '2px', color: '#C9A44A'
              }}>{slider} / 10</span>
              <span style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: '9px', letterSpacing: '2px', color: '#444'
              }}>Totalement</span>
            </div>
            <input
              type="range" min="0" max="10" step="1"
              value={slider}
              onChange={e => setSlider(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#C9A44A', cursor: 'pointer' }}
            />
          </div>

          {/* TEXTE LIBRE */}
          <div>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '9px', letterSpacing: '3px',
              color: '#C9A44A', marginBottom: '10px'
            }}>
              Développe ta réponse
            </div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Prends le temps d'être honnête avec toi-même..."
              style={{
                width: '100%', minHeight: '140px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px', color: '#F0EDE8',
                fontFamily: "'Inter', sans-serif",
                fontSize: '14px', fontWeight: 300,
                padding: '14px 16px', resize: 'none',
                outline: 'none', lineHeight: 1.8,
                transition: 'border .2s'
              }}
              onFocus={e => e.target.style.borderColor = 'rgba(201,164,74,0.4)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
            <div style={{
              fontSize: '11px', color: '#333',
              marginTop: '6px', textAlign: 'right'
            }}>
              {text.length} caractères
            </div>
          </div>
        </div>

        {/* BOUTON */}
        <button
          onClick={handleNext}
          disabled={!canContinue}
          style={{
            width: '100%', padding: '18px',
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '14px', letterSpacing: '3px',
            background: canContinue ? '#C9A44A' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${canContinue ? '#C9A44A' : 'rgba(255,255,255,0.08)'}`,
            color: canContinue ? '#0D0D0D' : '#444',
            cursor: canContinue ? 'pointer' : 'not-allowed',
            borderRadius: '10px', transition: 'all .3s'
          }}
        >
          {current + 1 >= total
            ? 'Terminer le questionnaire →'
            : `Question suivante → (${current + 2}/${total})`
          }
        </button>

        {/* SKIP */}
        {canContinue && (
          <button
            onClick={() => { setText(''); handleNext() }}
            style={{
              width: '100%', padding: '12px', marginTop: '8px',
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '11px', letterSpacing: '2px',
              background: 'transparent', border: 'none',
              color: '#333', cursor: 'pointer'
            }}
          >
            Passer cette question
          </button>
        )}

      </div>
    </div>
  )
}