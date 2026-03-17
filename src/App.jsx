import { useState } from 'react'
import Background from './components/Background'
import Step1Welcome from './steps/Step1Welcome'
import Step2Contract from './steps/Step2Contract'
import Step3Info from './steps/Step3Info'
import Step4Quiz from './steps/Step4Quiz'
import Step5Dashboard from './steps/Step5Dashboard'
import CoachView from './coach/CoachView'

const STEPS = ['Bienvenue', 'Contrat', 'Infos', 'Questionnaire', 'Dashboard']

export default function App() {
  const [step, setStep] = useState(0)
  const [clientData, setClientData] = useState({})
  const [isCoach, setIsCoach] = useState(false)

  const updateData = (newData) => setClientData(prev => ({ ...prev, ...newData }))
  const next = () => setStep(s => Math.min(s + 1, 4))

  // Accès coach via URL ?coach=true
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('coach') === 'true' && !isCoach) {
    setIsCoach(true)
  }

  if (isCoach) return <><Background /><CoachView /></>

  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <Background />

      {/* BARRE DE PROGRESSION */}
      {step < 4 && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          background: 'rgba(13,13,13,0.95)',
          borderBottom: '1px solid rgba(201,164,74,0.15)',
          padding: '16px 40px',
          display: 'flex', alignItems: 'center', gap: '24px'
        }}>
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '12px', letterSpacing: '3px', color: '#C9A44A'
          }}>
            GLC
          </span>
          <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
            {STEPS.slice(0, 4).map((s, i) => (
              <div key={i} style={{ flex: 1 }}>
                <div style={{
                  height: '2px',
                  background: i <= step ? '#C9A44A' : 'rgba(255,255,255,0.08)',
                  borderRadius: '2px',
                  transition: 'background .3s'
                }} />
                <div style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: '9px', letterSpacing: '2px',
                  color: i <= step ? '#C9A44A' : '#444',
                  marginTop: '4px'
                }}>{s}</div>
              </div>
            ))}
          </div>
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: '11px', letterSpacing: '2px', color: '#444'
          }}>
            {step + 1} / 4
          </span>
        </div>
      )}

      {/* ÉTAPES */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {step === 0 && <Step1Welcome onNext={next} />}
        {step === 1 && <Step2Contract onNext={next} updateData={updateData} />}
        {step === 2 && <Step3Info onNext={next} updateData={updateData} />}
        {step === 3 && <Step4Quiz onNext={next} updateData={updateData} />}
        {step === 4 && <Step5Dashboard clientData={clientData} />}
      </div>
    </div>
  )
}