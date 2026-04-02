import { useState } from 'react'
import config from '../config'

const initAnswer = { text: '' }

export default function Step4Quiz({ onNext, updateData, clientData }) {
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState(() => clientData?.questionnaire || {})
  const [text, setText] = useState(() => clientData?.questionnaire?.[0]?.text ?? '')

  const q = config.questionnaire[current]
  const total = config.questionnaire.length
  const progress = ((current + 1) / total) * 100

  const getAnswerAt = (idx) => answers[idx] || initAnswer

  const persistAnswer = (index, value) => {
    const nextAnswers = {
      ...answers,
      [index]: {
        question: config.questionnaire[index].question,
        bloc: config.questionnaire[index].bloc,
        text: value.text,
      },
    }
    setAnswers(nextAnswers)
    updateData({ questionnaire: nextAnswers })
    return nextAnswers
  }

  const handleNext = () => {
    persistAnswer(current, { text })

    if (current + 1 >= total) {
      onNext()
    } else {
      const nextIndex = current + 1
      const nextAnswer = getAnswerAt(nextIndex)
      setCurrent(nextIndex)
      setText(nextAnswer.text ?? '')
    }
  }

  const handleBack = () => {
    persistAnswer(current, { text })
    const prevIndex = Math.max(0, current - 1)
    const prevAnswer = getAnswerAt(prevIndex)
    setCurrent(prevIndex)
    setText(prevAnswer.text ?? '')
  }

  const handleSkip = () => {
    persistAnswer(current, { text: '' })
    if (current + 1 >= total) {
      onNext()
      return
    }
    const nextIndex = current + 1
    const nextAnswer = getAnswerAt(nextIndex)
    setCurrent(nextIndex)
    setText(nextAnswer.text ?? '')
  }

  const canContinue = text.trim().length > 10

  return (
    <div style={{
      minHeight: '100vh',
      padding: '100px 16px 60px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      overflowX: 'hidden',
    }}>
      <div style={{ maxWidth: '640px', width: '100%', overflowX: 'hidden' }}>

        {/* HEADER */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '12px', gap: '8px'
          }}>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '10px', letterSpacing: '4px', color: '#C9A44A'
            }}>
              {q.bloc}
            </div>
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '10px', letterSpacing: '1px', color: '#444'
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
          borderRadius: '16px', padding: '24px', marginBottom: '24px'
        }}>
          <h3 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(18px, 5vw, 22px)', letterSpacing: '1.5px',
            color: '#F0EDE8', lineHeight: 1.4, marginBottom: '24px'
          }}>
            {q.question}
          </h3>

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
                width: '100%', minHeight: '140px', maxWidth: '100%',
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <button
            onClick={handleBack}
            disabled={current === 0}
            style={{
              width: '100%', padding: '16px',
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '13px', letterSpacing: '2px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.08)',
              color: current === 0 ? '#333' : '#F0EDE8',
              cursor: current === 0 ? 'not-allowed' : 'pointer',
              borderRadius: '10px', transition: 'all .3s'
            }}
          >
            ← Retour
          </button>
          <button
            onClick={handleNext}
            disabled={!canContinue}
            style={{
              width: '100%', padding: '16px',
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: '13px', letterSpacing: '2px',
              background: canContinue ? '#C9A44A' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${canContinue ? '#C9A44A' : 'rgba(255,255,255,0.08)'}`,
              color: canContinue ? '#0D0D0D' : '#444',
              cursor: canContinue ? 'pointer' : 'not-allowed',
              borderRadius: '10px', transition: 'all .3s'
            }}
          >
            {current + 1 >= total
              ? 'Terminer →'
              : `Suivant (${current + 2}/${total}) →`
            }
          </button>
        </div>

        {/* SKIP */}
        {canContinue && (
          <button
            onClick={handleSkip}
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