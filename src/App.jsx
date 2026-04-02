import { useCallback, useEffect, useMemo, useState } from 'react'
import Background from './components/Background'
import Step1Welcome from './steps/Step1Welcome'
import Step2Contract from './steps/Step2Contract'
import Step3Info from './steps/Step3Info'
import Step4Quiz from './steps/Step4Quiz'
import Step5Dashboard from './steps/Step5Dashboard'
import CoachView from './coach/CoachView'

const STEPS = ['Bienvenue', 'Contrat', 'Infos', 'Questionnaire', 'Dashboard']

export default function App() {
  const storageKey = 'glc_onboarding_client_data_v1'
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false
  const [step, setStep] = useState(0)
  const [clientData, setClientData] = useState(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
    }
  })
  const [isCoach, setIsCoach] = useState(false)

  const updateData = useCallback((newData) => {
    setClientData(prev => ({ ...prev, ...newData }))
  }, [])
  const next = () => setStep(s => Math.min(s + 1, 4))

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(clientData))
  }, [clientData])

  // Accès coach via URL ?coach=true
  const isCoachUrl = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('coach') === 'true'
  }, [])
  useEffect(() => {
    if (isCoachUrl) setIsCoach(true)
  }, [isCoachUrl])

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
          padding: isMobile ? '12px 14px' : '16px 40px',
          display: 'flex', alignItems: 'center', gap: '24px'
        }}>
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: isMobile ? '10px' : '12px', letterSpacing: isMobile ? '2px' : '3px', color: '#C9A44A'
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
                  fontSize: isMobile ? '8px' : '9px', letterSpacing: isMobile ? '1px' : '2px',
                  color: i <= step ? '#C9A44A' : '#444',
                  marginTop: '4px'
                }}>{s}</div>
              </div>
            ))}
          </div>
          <span style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: isMobile ? '9px' : '11px', letterSpacing: isMobile ? '1px' : '2px', color: '#444'
          }}>
            {step + 1} / 4
          </span>
        </div>
      )}

      {/* ÉTAPES */}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {step === 0 && <Step1Welcome onNext={next} />}
        {step === 1 && <Step2Contract onNext={next} updateData={updateData} clientData={clientData} />}
        {step === 2 && <Step3Info onNext={next} updateData={updateData} />}
        {step === 3 && <Step4Quiz onNext={next} updateData={updateData} clientData={clientData} />}
        {step === 4 && <Step5Dashboard clientData={clientData} />}
      </div>
    </div>
  )
}