import { useEffect, useRef, useState } from 'react'
import config from '../config'
import UiModal from '../components/UiModal'

const STORAGE_KEY = 'glc_dashboard_state_v1'
const NOTES_KEY   = 'glc_dashboard_notes_history_v1'
const TODAY_KEY   = () => new Date().toISOString().slice(0, 10)

const migrateHabit = (h) => ({
  ...h,
  streak: typeof h.streak === 'string' ? (parseInt(h.streak) || 0) : (h.streak ?? 0),
  lastCheckedDate: h.lastCheckedDate ?? null,
})

const defaultRoutines = {
  matin: [
    { n: 'Reveil 6h00',    streak: 5, lastCheckedDate: null, done: false },
    { n: 'Douche froide',  streak: 3, lastCheckedDate: null, done: false },
    { n: 'Lecture 20 min', streak: 7, lastCheckedDate: null, done: false },
    { n: 'Pompes 50',      streak: 2, lastCheckedDate: null, done: false },
  ],
  soir: [
    { n: 'Revue du jour',     streak: 4, lastCheckedDate: null, done: false },
    { n: 'Gratitude',         streak: 6, lastCheckedDate: null, done: false },
    { n: "Pas d'ecran 22h",   streak: 2, lastCheckedDate: null, done: false },
    { n: 'Lecture 20 min',    streak: 5, lastCheckedDate: null, done: false },
  ],
}

// ─── SVG Icons ──────────────────────────────────────────────────────────────
const IconToday = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
    <circle cx="9" cy="9" r="6.5" />
    <circle cx="9" cy="9" r="2.5" fill={color} stroke="none" />
  </svg>
)
const IconCalendar = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
    <rect x="2" y="3.5" width="14" height="12" rx="2" />
    <path d="M2 7.5h14M6 3.5v-2M12 3.5v-2" />
  </svg>
)
const IconTarget = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke={color} strokeWidth="1.5">
    <circle cx="9" cy="9" r="7" />
    <circle cx="9" cy="9" r="3.5" />
  </svg>
)
const IconNotes = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round">
    <path d="M3 5h12M3 9h12M3 13h7" />
  </svg>
)
const IconLink = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 18 18" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 13L13 4M13 4H8M13 4v5" />
  </svg>
)

// ─── Main component ──────────────────────────────────────────────────────────
export default function Step5Dashboard({ clientData }) {
  const prenom = clientData?.infos?.prenom || 'Membre'
  const now    = new Date()
  const mois   = ['Janvier','Fevrier','Mars','Avril','Mai','Juin','Juillet','Aout','Septembre','Octobre','Novembre','Decembre']

  // ─── State ──────────────────────────────────────────────
  const [isMobile, setIsMobile]         = useState(() => window.innerWidth < 900)
  const [activeView, setActiveView]     = useState('today')
  const [pomoExpanded, setPomoExpanded] = useState(false)
  const [countdown, setCountdown]       = useState({ d:'00', h:'00', m:'00', s:'00' })

  const [calYear, setCalYear]   = useState(now.getFullYear())
  const [calMonth, setCalMonth] = useState(now.getMonth())
  const [todoTab, setTodoTab]   = useState('daily')
  const [newTodo, setNewTodo]   = useState('')

  const [todoDraftTitle, setTodoDraftTitle] = useState('')
  const [noteDraft, setNoteDraft]           = useState('')
  const [notesHistory, setNotesHistory]     = useState(() => {
    try { const r = localStorage.getItem(NOTES_KEY); return r ? JSON.parse(r) : [] } catch { return [] }
  })
  const [todos, setTodos] = useState({
    mois:    [{ t: 'Definir mon offre principale', done: false }, { t: 'Creer ma page de vente', done: false }],
    semaine: [{ t: 'Session deep work 9h-11h', done: true },  { t: 'Relire les notes du call', done: false }, { t: '30 min de prospection', done: false }],
    daily:   [{ t: 'Meditation 10 min', done: false }, { t: 'Lecture 20 min', done: true }],
  })
  const [routines, setRoutines]         = useState(defaultRoutines)
  const [eventsMap, setEventsMap]       = useState({})
  const [validatedDays, setValidatedDays] = useState(() => new Set())
  const [objectifs, setObjectifs]       = useState(() => ({
    Physique:  clientData?.questionnaire?.[0]?.text || 'Definis ton objectif physique principal.',
    Business:  clientData?.questionnaire?.[4]?.text || 'Definis ton objectif business du mois.',
    Personnel: clientData?.questionnaire?.[9]?.text || 'Definis ton objectif personnel.',
    Blocages:  clientData?.questionnaire?.[6]?.text || 'Liste tes blocages actuels.',
  }))
  const [modal, setModal]               = useState({ type: null })
  const closeModal = () => setModal({ type: null })
  const openModal  = (type, data = {}) => setModal({ type, ...data })

  const [eventDraft, setEventDraft]       = useState({ date: '', title: '' })
  const [objectifsDraft, setObjectifsDraft] = useState(objectifs)
  const [habitDraft, setHabitDraft]       = useState({ mode:'edit', period:'matin', index:0, name:'', streak:'', done:false })
  const [todoDraftTab, setTodoDraftTab]   = useState('daily')

  const [pomoSec, setPomoSec]       = useState(25 * 60)
  const [pomoRunning, setPomoRunning] = useState(false)
  const [pomoPhase, setPomoPhase]   = useState('focus')
  const [pomoVals, setPomoVals]     = useState({ f: 25, s: 5, l: 15 })
  const [pomoSess, setPomoSess]     = useState(1)
  const [pomoFlash, setPomoFlash]   = useState(false)

  const pomoRef    = useRef(null)
  const pomoEndRef = useRef(null)
  const saveTimerRef = useRef(null)

  // ─── Effects ────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const diff = new Date(config.prochain_call.date) - new Date()
      if (diff <= 0) { setCountdown({ d:'00', h:'00', m:'00', s:'00' }); return }
      setCountdown({
        d: String(Math.floor(diff / 86400000)).padStart(2,'0'),
        h: String(Math.floor((diff % 86400000) / 3600000)).padStart(2,'0'),
        m: String(Math.floor((diff % 3600000) / 60000)).padStart(2,'0'),
        s: String(Math.floor((diff % 60000) / 1000)).padStart(2,'0'),
      })
    }
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', fn)
    return () => window.removeEventListener('resize', fn)
  }, [])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const p = JSON.parse(raw)
      if (p.todos)        setTodos(p.todos)
      if (p.eventsMap)    setEventsMap(p.eventsMap)
      if (p.validatedDays) setValidatedDays(new Set(p.validatedDays))
      if (p.objectifs)    setObjectifs(p.objectifs)
      if (p.routines) {
        const today    = TODAY_KEY()
        const isNewDay = p.lastResetDate !== today
        const migrated = {}
        for (const [period, habits] of Object.entries(p.routines)) {
          migrated[period] = habits.map(h => {
            const m = migrateHabit(h)
            return isNewDay ? { ...m, done: false } : m
          })
        }
        setRoutines(migrated)
      }
    } catch {}
  }, [])

  useEffect(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        todos, routines, eventsMap,
        validatedDays: Array.from(validatedDays),
        objectifs, lastResetDate: TODAY_KEY(),
      }))
    }, 400)
    return () => clearTimeout(saveTimerRef.current)
  }, [todos, routines, eventsMap, validatedDays, objectifs])

  useEffect(() => {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notesHistory))
  }, [notesHistory])

  useEffect(() => {
    if (pomoRunning) {
      pomoEndRef.current = Date.now() + pomoSec * 1000
      pomoRef.current = setInterval(() => {
        const remaining = Math.max(0, Math.round((pomoEndRef.current - Date.now()) / 1000))
        setPomoSec(remaining)
        if (remaining <= 0) {
          clearInterval(pomoRef.current)
          setPomoRunning(false)
          setPomoSess(s => Math.min(s + 1, 4))
          if (Notification.permission === 'granted') {
            new Notification('GLC — Session terminée !', {
              body: pomoPhase === 'focus' ? 'Bien joué. Prends une pause.' : 'Pause terminée. Retour au focus.',
              icon: '/favicon.svg',
            })
          } else {
            setPomoFlash(true)
            setTimeout(() => setPomoFlash(false), 1200)
          }
        }
      }, 500)
    } else {
      clearInterval(pomoRef.current)
    }
    return () => clearInterval(pomoRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pomoRunning])

  // ─── Calendar helpers ────────────────────────────────────
  const pomoMaxSec  = pomoVals[pomoPhase === 'focus' ? 'f' : pomoPhase === 'short' ? 's' : 'l'] * 60
  const pomoTime    = `${String(Math.floor(pomoSec / 60)).padStart(2,'0')}:${String(pomoSec % 60).padStart(2,'0')}`
  const pomoPct     = 1 - pomoSec / pomoMaxSec
  const CIRCUMF     = 2 * Math.PI * 36
  const pomoDash    = CIRCUMF * pomoPct

  const DN          = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']
  const firstDay    = new Date(calYear, calMonth, 1).getDay()
  const offset      = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const isCurMonth  = calMonth === now.getMonth() && calYear === now.getFullYear()

  const getDateKey      = (d) => `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
  const toggleValidatedDay = (d) => {
    const key = getDateKey(d)
    setValidatedDays(prev => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n })
  }
  const getEventsForDay = (d) => {
    const key    = getDateKey(d)
    const custom  = eventsMap[key] || []
    const monthly = config.evenements[d] ? [config.evenements[d]] : []
    const live    = new Date(calYear, calMonth, d).getDay() === 0 ? ['Live'] : []
    return [...live, ...monthly, ...custom]
  }

  // ─── Handlers ───────────────────────────────────────────
  const openAddEventModal = () => {
    const defaultDay = isCurMonth ? now.getDate() : 1
    setEventDraft({ date: getDateKey(defaultDay), title: '' })
    openModal('event_add')
  }
  const saveEventFromModal = () => {
    const { date: dateKey, title } = eventDraft
    if (!dateKey || !title.trim()) return
    setEventsMap(prev => ({ ...prev, [dateKey]: [...(prev[dateKey] || []), title.trim()] }))
    closeModal()
  }
  const saveObjectifsFromModal = () => {
    setObjectifs({ Physique:(objectifsDraft.Physique||'').trim(), Business:(objectifsDraft.Business||'').trim(), Personnel:(objectifsDraft.Personnel||'').trim(), Blocages:(objectifsDraft.Blocages||'').trim() })
    closeModal()
  }
  const saveHabitFromModal = () => {
    const { period, mode, name, streak, done, index } = habitDraft
    if (!period || !routines[period] || !name.trim()) return
    if (mode === 'add') {
      setRoutines(prev => ({ ...prev, [period]: [...prev[period], { n: name.trim(), streak: parseInt(streak)||0, lastCheckedDate:null, done:false }] }))
    } else {
      const idx = Number(index)
      if (Number.isNaN(idx)) return
      setRoutines(prev => ({ ...prev, [period]: prev[period].map((h,j) => j===idx ? { ...h, n:name.trim(), streak:parseInt(streak)||0, done:!!done } : h) }))
    }
    closeModal()
  }
  const saveTodoFromModal = () => {
    const tab = todoDraftTab
    if (!tab || !todos[tab] || !todoDraftTitle.trim()) return
    setTodos(prev => ({ ...prev, [tab]: [...prev[tab], { t:todoDraftTitle.trim(), done:false }] }))
    setTodoDraftTitle('')
    closeModal()
  }
  const downloadContract = () => {
    const blob = new Blob([config.contrat], { type:'text/plain;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), { href:url, download:'GLC_contrat.txt' })
    document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
  }
  const saveNote = () => {
    if (!noteDraft.trim()) return
    setNotesHistory(prev => [{ id:crypto.randomUUID(), text:noteDraft.trim(), createdAt:new Date().toISOString() }, ...prev])
    setNoteDraft('')
  }
  const toggleHabit = (period, index) => {
    const today = TODAY_KEY()
    setRoutines(prev => ({
      ...prev,
      [period]: prev[period].map((h,j) => {
        if (j !== index) return h
        if (!h.done) {
          const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1)
          const yKey = yesterday.toISOString().slice(0,10)
          let newStreak = 1
          if (h.lastCheckedDate === today)  newStreak = h.streak
          else if (h.lastCheckedDate === yKey) newStreak = (h.streak||0)+1
          return { ...h, done:true, streak:newStreak, lastCheckedDate:today }
        }
        return { ...h, done:false }
      }),
    }))
  }
  const deleteTodo = (tab, index) => setTodos(prev => ({ ...prev, [tab]: prev[tab].filter((_,j)=>j!==index) }))
  const deleteNote = (id) => setNotesHistory(prev => prev.filter(n=>n.id!==id))

  // ─── Computed values ────────────────────────────────────
  const allHabits         = Object.values(routines).flat()
  const doneRoutinesCount = allHabits.filter(h=>h.done).length
  const totalRoutinesCount = allHabits.length
  const habitudesPct      = totalRoutinesCount > 0 ? Math.round((doneRoutinesCount/totalRoutinesCount)*100) : 0
  const streakMax         = Math.max(0, ...allHabits.map(h=>h.streak||0))
  const validatedDaysCount = validatedDays.size
  const validatedPct      = daysInMonth > 0 ? Math.round((validatedDaysCount/daysInMonth)*100) : 0
  const daysLeft          = Math.max(0, daysInMonth - (isCurMonth ? now.getDate() : daysInMonth))

  const programDay  = Math.max(1, Math.floor((now - new Date(now.getFullYear(),now.getMonth(),1))/86400000)+1)
  const weekNum     = Math.min(4, Math.ceil(programDay/7))
  const weekLabel   = `Semaine ${weekNum} — ${['Initié','Engagé','Confirmé','Final'][weekNum-1]}`
  const engagements = config.contrat.split('\n').filter(l=>/^\s*\d+\./.test(l)).map(l=>l.replace(/^\s*\d+\.\s*/,'').trim()).filter(Boolean)

  const todayLabel = now.toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long' })

  // ─── Style constants ────────────────────────────────────
  const card = {
    background: 'linear-gradient(145deg,#131313 0%,#0f0f0f 100%)',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '14px', overflow:'hidden',
    boxShadow: '0 4px 28px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.03)',
  }
  const sHead = { display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px', flexWrap:'wrap' }
  const sTitle = { fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:'11px', letterSpacing:'1.5px', color:'#F0EDE8', textTransform:'uppercase' }
  const sLine  = { flex:1, minWidth:'40px', height:'1px', background:'linear-gradient(to right,rgba(201,164,74,0.18),transparent)' }
  const sBtnG  = { fontFamily:"'Inter',sans-serif", fontWeight:500, fontSize:'11px', color:'#C9A44A', background:'rgba(201,164,74,0.07)', border:'1px solid rgba(201,164,74,0.28)', padding:'7px 14px', cursor:'pointer', borderRadius:'8px' }
  const sBtn   = { fontFamily:"'Inter',sans-serif", fontWeight:500, fontSize:'11px', color:'#505050', background:'transparent', border:'1px solid rgba(255,255,255,0.08)', padding:'7px 14px', cursor:'pointer', borderRadius:'8px' }

  // ─── Nav items ───────────────────────────────────────────
  const NAV = [
    { id:'today',      label:"Aujourd'hui", Icon:IconToday },
    { id:'calendar',   label:'Calendrier',  Icon:IconCalendar },
    { id:'objectifs',  label:'Objectifs',   Icon:IconTarget },
    { id:'outils',     label:'Notes',       Icon:IconNotes },
    { id:'ressources', label:'Ressources',  Icon:IconLink },
  ]

  // ─── Shared section wrapper ──────────────────────────────
  const SectionWrap = ({ children, animClass = 'fade-up' }) => (
    <div className={animClass} style={{ marginBottom:'28px' }}>{children}</div>
  )

  // ════════════════════════════════════════════════════════
  // VIEWS
  // ════════════════════════════════════════════════════════

  // ─── TODAY VIEW ──────────────────────────────────────────
  const ViewToday = () => (
    <div style={{ padding: isMobile ? '20px 16px 20px' : '32px 40px' }}>

      {/* GREETING */}
      <div className="fade-up" style={{ marginBottom:'28px' }}>
        <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:300, fontSize:'12px', letterSpacing:'1.5px', color:'#404040', textTransform:'uppercase', marginBottom:'8px' }}>{todayLabel}</div>
        <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize: isMobile ? 'clamp(36px,10vw,48px)' : '56px', letterSpacing:'3px', color:'#F0EDE8', lineHeight:.95, marginBottom:'10px' }}>
          Bonjour, <span style={{ color:'#C9A44A' }}>{prenom}</span>
        </div>
        <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:500, fontSize:'11px', letterSpacing:'1.5px', color:'#C9A44A', textTransform:'uppercase', opacity:.7 }}>{weekLabel}</div>
      </div>

      {/* COUNTDOWN COMPACT */}
      <div className="fade-up-1" style={{ ...card, padding:'16px 20px', marginBottom:'16px', display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap' }}>
        <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:500, fontSize:'11px', letterSpacing:'1px', color:'#404040', textTransform:'uppercase', flexShrink:0 }}>Prochain call</div>
        <div style={{ flex:1, display:'flex', gap: isMobile ? '8px' : '12px', alignItems:'baseline', flexWrap:'wrap' }}>
          {[['d','j'],['h','h'],['m','min']].map(([k,u])=>(
            <div key={k} style={{ display:'flex', alignItems:'baseline', gap:'2px' }}>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'28px', color:'#F0EDE8', letterSpacing:'1px', fontVariantNumeric:'tabular-nums' }}>{countdown[k]}</span>
              <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:500, fontSize:'10px', color:'#404040' }}>{u}</span>
            </div>
          ))}
        </div>
        <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:400, fontSize:'12px', color:'#353535', flexShrink:0 }}>{config.prochain_call.label}</div>
      </div>

      {/* STATS CHIPS */}
      <div className="fade-up-2" style={{ display:'flex', gap:'8px', marginBottom:'28px', flexWrap:'wrap' }}>
        {[
          { label:'Streak', val:`${streakMax}j`, color: streakMax>=7?'#4ade80':streakMax>=3?'#C9A44A':'#f87171' },
          { label:'Habitudes', val:`${doneRoutinesCount}/${totalRoutinesCount}`, color: habitudesPct>=70?'#4ade80':habitudesPct>=40?'#C9A44A':'#f87171' },
          { label:'Jours validés', val:`${validatedDaysCount}/${daysInMonth}`, color: validatedPct>=70?'#4ade80':validatedPct>=30?'#C9A44A':'#888' },
        ].map(({ label, val, color }) => (
          <div key={label} style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'8px', padding:'8px 14px', display:'flex', alignItems:'center', gap:'8px' }}>
            <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:400, fontSize:'11px', color:'#404040' }}>{label}</span>
            <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'16px', color, letterSpacing:'0.5px' }}>{val}</span>
          </div>
        ))}
      </div>

      {/* ROUTINES */}
      <div className="fade-up-3" style={{ marginBottom:'28px' }}>
        <div style={sHead}><span style={sTitle}>Routines</span><div style={sLine}/></div>
        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:'12px' }}>
          {['matin','soir'].map(period => {
            const habits      = routines[period] || []
            const donePeriod  = habits.filter(h=>h.done).length
            const totalPeriod = habits.length
            const pct         = totalPeriod > 0 ? (donePeriod/totalPeriod)*100 : 0
            const allDone     = donePeriod === totalPeriod && totalPeriod > 0
            return (
              <div key={period} style={card}>
                <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
                    <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:'10px', letterSpacing:'1.5px', color: allDone ? '#4ade80' : '#404040', textTransform:'uppercase', transition:'color .3s' }}>{period}</span>
                    <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:500, fontSize:'11px', color: allDone ? '#4ade80' : '#404040', transition:'color .3s' }}>{donePeriod}/{totalPeriod}</span>
                  </div>
                  <div style={{ height:'2px', background:'rgba(255,255,255,0.05)', borderRadius:'1px', overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${pct}%`, background: allDone ? '#4ade80' : '#C9A44A', borderRadius:'1px', transition:'width .5s cubic-bezier(0.22,1,0.36,1), background .3s' }} />
                  </div>
                </div>
                {habits.map((r, i) => (
                  <div key={i} onClick={() => toggleHabit(period, i)} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 20px', borderBottom: i < habits.length-1 ? '1px solid rgba(255,255,255,0.03)' : 'none', cursor:'pointer', transition:'background .15s' }}
                    onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                    onMouseLeave={e=>e.currentTarget.style.background='transparent'}
                  >
                    <div style={{ width:'22px', height:'22px', border:`1.5px solid ${r.done?'#C9A44A':'rgba(255,255,255,0.1)'}`, borderRadius:'7px', background: r.done?'#C9A44A':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .2s' }}>
                      {r.done && <svg width="10" height="10" viewBox="0 0 10 10"><polyline points="1,5 4,8 9,2" fill="none" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round"/></svg>}
                    </div>
                    <span style={{ flex:1, fontFamily:"'Inter',sans-serif", fontWeight: r.done?300:400, fontSize:'13px', color: r.done?'#404040':'#D8D5D0', textDecoration: r.done?'line-through':'none', transition:'all .25s' }}>{r.n}</span>
                    {r.streak > 0 && <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'13px', color:'#C9A44A', opacity: r.done ? 1 : 0.45 }}>{r.streak}j</span>}
                  </div>
                ))}
                <div style={{ padding:'10px 20px', display:'flex', gap:'8px' }}>
                  <button style={{ ...sBtn, fontSize:'10px', padding:'5px 10px' }} onClick={() => { setHabitDraft({ mode:'add', period, index:0, name:'', streak:'', done:false }); openModal('habit_add') }}>+ Ajouter</button>
                  <button style={{ ...sBtn, fontSize:'10px', padding:'5px 10px' }} onClick={() => { const first=routines[period]?.[0]; setHabitDraft({ mode:'edit', period, index:0, name:first?.n||'', streak:String(first?.streak??''), done:!!first?.done }); openModal('habit_edit') }}>Modifier</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* TODOS */}
      <div className="fade-up-4" style={{ marginBottom:'20px' }}>
        <div style={sHead}>
          <span style={sTitle}>Tâches</span>
          <div style={sLine}/>
          <button style={sBtnG} onClick={() => { setTodoDraftTitle(''); setTodoDraftTab(todoTab); openModal('todo_add') }}>+ Ajouter</button>
        </div>
        <div style={card}>
          <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.04)', padding:'0 12px' }}>
            {[['daily',"Aujourd'hui"],['semaine','Semaine'],['mois','Mois']].map(([k,l]) => (
              <button key={k} onClick={() => setTodoTab(k)} style={{ fontFamily:"'Inter',sans-serif", fontWeight: todoTab===k?600:400, fontSize:'11px', color: todoTab===k?'#C9A44A':'#404040', background:'transparent', border:'none', borderBottom: todoTab===k?'2px solid #C9A44A':'2px solid transparent', padding:'12px 14px', cursor:'pointer', marginBottom:'-1px', transition:'color .2s' }}>{l}</button>
            ))}
          </div>
          {todos[todoTab].length === 0 && (
            <div style={{ padding:'32px 24px', textAlign:'center', color:'#2A2A2A', fontFamily:"'Inter',sans-serif", fontSize:'13px' }}>Aucune tâche — bien joué.</div>
          )}
          {todos[todoTab].map((t, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'14px', padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.03)' }}>
              <div onClick={() => setTodos(prev=>({...prev,[todoTab]:prev[todoTab].map((x,j)=>j===i?{...x,done:!x.done}:x)}))} style={{ width:'18px', height:'18px', border:`1.5px solid ${t.done?'#C9A44A':'rgba(255,255,255,0.12)'}`, borderRadius:'5px', background: t.done?'#C9A44A':'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, cursor:'pointer', transition:'all .2s' }}>
                {t.done && <svg width="9" height="9" viewBox="0 0 10 10"><polyline points="1,5 4,8 9,2" fill="none" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round"/></svg>}
              </div>
              <span onClick={() => setTodos(prev=>({...prev,[todoTab]:prev[todoTab].map((x,j)=>j===i?{...x,done:!x.done}:x)}))} style={{ flex:1, fontFamily:"'Inter',sans-serif", fontWeight:t.done?300:400, fontSize:'13px', color: t.done?'#383838':'#D8D5D0', textDecoration: t.done?'line-through':'none', cursor:'pointer', transition:'all .2s' }}>{t.t}</span>
              <button onClick={() => deleteTodo(todoTab,i)} style={{ background:'transparent', border:'none', color:'#2A2A2A', cursor:'pointer', fontSize:'14px', padding:'2px 6px', borderRadius:'4px', transition:'color .2s' }} onMouseEnter={e=>e.target.style.color='#f87171'} onMouseLeave={e=>e.target.style.color='#2A2A2A'}>✕</button>
            </div>
          ))}
          <div style={{ padding:'10px 20px', borderTop:'1px solid rgba(255,255,255,0.03)' }}>
            <input value={newTodo} onChange={e=>setNewTodo(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&newTodo.trim()){setTodos(prev=>({...prev,[todoTab]:[...prev[todoTab],{t:newTodo.trim(),done:false}]}));setNewTodo('')}}} placeholder="Nouvelle tâche — Entrée pour valider" style={{ width:'100%', background:'transparent', border:'none', color:'#404040', fontFamily:"'Inter',sans-serif", fontSize:'12px', outline:'none', padding:'4px 0' }} />
          </div>
        </div>
      </div>
    </div>
  )

  // ─── CALENDAR VIEW ───────────────────────────────────────
  const ViewCalendar = () => (
    <div style={{ padding: isMobile ? '20px 16px' : '32px 40px' }}>
      <div className="fade-up" style={{ marginBottom:'28px' }}>
        <div style={sHead}><span style={sTitle}>Calendrier</span><div style={sLine}/><button style={sBtnG} onClick={openAddEventModal}>+ Événement</button></div>
        <div style={card}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 28px', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
            <button onClick={()=>{if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1)}else setCalMonth(m=>m-1)}} style={{ width:'32px', height:'32px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'8px', color:'#555', cursor:'pointer', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center' }}>‹</button>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'18px', letterSpacing:'4px', color:'#F0EDE8', fontVariantNumeric:'tabular-nums' }}>{mois[calMonth].toUpperCase()} {calYear}</div>
            <button onClick={()=>{if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1)}else setCalMonth(m=>m+1)}} style={{ width:'32px', height:'32px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'8px', color:'#555', cursor:'pointer', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center' }}>›</button>
          </div>
          <div style={{ padding: isMobile?'10px':'14px 18px 22px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap: isMobile?'4px':'6px', marginBottom:'8px' }}>
              {DN.map(d=><div key={d} style={{ textAlign:'center', fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:'9px', letterSpacing:'1.5px', color:'#303030', padding:'6px 0', textTransform:'uppercase' }}>{d}</div>)}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap: isMobile?'4px':'6px' }}>
              {Array(offset).fill(null).map((_,i)=><div key={`e${i}`}/>)}
              {Array(daysInMonth).fill(null).map((_,i)=>{
                const d = i+1
                const isToday     = isCurMonth && d === now.getDate()
                const isValidated = validatedDays.has(getDateKey(d))
                const events      = getEventsForDay(d)
                return (
                  <div key={d} onClick={() => toggleValidatedDay(d)} style={{ minHeight: isMobile?'48px':'68px', borderRadius:'10px', border: isValidated ? '1px solid rgba(201,164,74,0.7)' : isToday ? '1px solid rgba(201,164,74,0.45)' : '1px solid rgba(255,255,255,0.04)', background: isValidated ? 'rgba(201,164,74,0.15)' : isToday ? 'rgba(201,164,74,0.06)' : 'rgba(255,255,255,0.01)', display:'flex', flexDirection:'column', alignItems:'flex-start', justifyContent:'space-between', padding: isMobile?'5px':'8px 10px', cursor:'pointer', transition:'all .2s', userSelect:'none' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', width:'100%' }}>
                      <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize: isMobile?'11px':'13px', color: isValidated ? '#C9A44A' : isToday ? '#C9A44A' : '#444' }}>{d}</span>
                      {isValidated && <div style={{ width:'12px', height:'12px', borderRadius:'50%', background:'#C9A44A', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><svg width="6" height="6" viewBox="0 0 10 10"><polyline points="1,5 4,8 9,2" fill="none" stroke="#0D0D0D" strokeWidth="2.5" strokeLinecap="round"/></svg></div>}
                    </div>
                    {events.length > 0 && <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:500, fontSize: isMobile?'6px':'7px', letterSpacing:'0.5px', color: isToday?'rgba(201,164,74,0.6)':'#333', lineHeight:1.2 }}>{events[0]}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ─── OBJECTIFS VIEW ─────────────────────────────────────
  const ViewObjectifs = () => (
    <div style={{ padding: isMobile?'20px 16px':'32px 40px' }}>
      <div className="fade-up" style={{ marginBottom:'28px' }}>
        <div style={sHead}><span style={sTitle}>Objectifs</span><div style={sLine}/><button style={sBtn} onClick={()=>{setObjectifsDraft(objectifs);openModal('objectifs_edit')}}>Modifier</button></div>
        <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'1fr 1fr', gap:'12px' }}>
          {Object.entries(objectifs).map(([lbl,txt]) => (
            <div key={lbl} style={{ ...card, padding:'24px' }}>
              <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:'10px', letterSpacing:'1.2px', color:'#C9A44A', textTransform:'uppercase', marginBottom:'12px', display:'flex', alignItems:'center', gap:'10px' }}>{lbl}<div style={{ flex:1, height:'1px', background:'rgba(201,164,74,0.12)' }}/></div>
              <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:300, fontSize:'13px', color:'#C0BDB8', lineHeight:1.8 }}>{txt}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="fade-up-1" style={{ marginBottom:'28px' }}>
        <div style={sHead}><span style={sTitle}>Engagements</span><div style={sLine}/></div>
        <div style={card}>
          {engagements.map((txt,i) => (
            <div key={i} style={{ display:'grid', gridTemplateColumns:'52px 1fr', borderBottom: i<engagements.length-1?'1px solid rgba(255,255,255,0.04)':'none' }}>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'22px', color:'rgba(201,164,74,0.1)', padding:'22px 0', lineHeight:1, borderRight:'1px solid rgba(255,255,255,0.04)', display:'flex', alignItems:'center', justifyContent:'center' }}>{String(i+1).padStart(2,'0')}</div>
              <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:300, fontSize:'13px', color:'#C0BDB8', padding:'22px 24px', lineHeight:1.75 }}>{txt}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  // ─── OUTILS VIEW (Notes) ─────────────────────────────────
  const ViewOutils = () => (
    <div style={{ padding: isMobile?'20px 16px':'32px 40px' }}>
      <div className="fade-up" style={{ marginBottom:'28px' }}>
        <div style={sHead}><span style={sTitle}>Notes personnelles</span><div style={sLine}/></div>
        <div style={card}>
          <div style={{ padding:'18px' }}>
            <textarea value={noteDraft} onChange={e=>setNoteDraft(e.target.value)} placeholder="Tes réflexions, insights, ce qui émerge pendant le programme..." style={{ width:'100%', background:'transparent', border:'1px solid rgba(255,255,255,0.07)', color:'#F0EDE8', fontFamily:"'Inter',sans-serif", fontSize:'14px', fontWeight:300, padding:'14px', resize:'vertical', outline:'none', lineHeight:1.8, minHeight:'140px', borderRadius:'10px' }} />
            <button onClick={saveNote} style={{ marginTop:'10px', ...sBtnG }}>Sauvegarder</button>
          </div>
          <div style={{ maxHeight:'420px', overflowY:'auto', borderTop:'1px solid rgba(255,255,255,0.04)' }}>
            {notesHistory.length === 0 && <div style={{ color:'#252525', padding:'24px 18px', fontFamily:"'Inter',sans-serif", fontSize:'13px', textAlign:'center' }}>Aucune note enregistrée.</div>}
            {notesHistory.map(item => (
              <div key={item.id} style={{ padding:'16px 18px', borderBottom:'1px solid rgba(255,255,255,0.03)', display:'flex', gap:'12px', alignItems:'flex-start' }}>
                <div style={{ flex:1 }}>
                  <div style={{ color:'#C9A44A', fontFamily:"'Inter',sans-serif", fontWeight:500, fontSize:'11px', marginBottom:'7px', letterSpacing:'0.5px' }}>{new Date(item.createdAt).toLocaleString('fr-FR')}</div>
                  <div style={{ color:'#C0BDB8', fontFamily:"'Inter',sans-serif", fontWeight:300, fontSize:'13px', lineHeight:1.7 }}>{item.text}</div>
                </div>
                <button onClick={()=>deleteNote(item.id)} style={{ background:'transparent', border:'none', color:'#252525', cursor:'pointer', fontSize:'14px', padding:'2px 6px', borderRadius:'4px', flexShrink:0, transition:'color .2s' }} onMouseEnter={e=>e.target.style.color='#f87171'} onMouseLeave={e=>e.target.style.color='#252525'}>✕</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // ─── RESSOURCES VIEW ─────────────────────────────────────
  const ViewRessources = () => (
    <div style={{ padding: isMobile?'20px 16px':'32px 40px' }}>
      <div className="fade-up" style={{ marginBottom:'28px' }}>
        <div style={sHead}><span style={sTitle}>Ressources</span><div style={sLine}/></div>
        <div style={{ display:'grid', gridTemplateColumns: isMobile?'1fr':'repeat(3,1fr)', gap:'14px' }}>

          <div style={card}>
            <div style={{ padding:'14px 20px', fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:'10px', letterSpacing:'1.5px', color:'#404040', borderBottom:'1px solid rgba(255,255,255,0.04)', textTransform:'uppercase' }}>Communauté</div>
            {config.ressources.communaute.map(r => (
              <a key={r.label} href={r.url} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.03)', textDecoration:'none', transition:'background .15s' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:400, fontSize:'13px', color:'#D8D5D0' }}>{r.label}</span>
                <span style={{ fontSize:'12px', color:'#404040' }}>↗</span>
              </a>
            ))}
          </div>

          <div style={card}>
            <div style={{ padding:'14px 20px', fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:'10px', letterSpacing:'1.5px', color:'#404040', borderBottom:'1px solid rgba(255,255,255,0.04)', textTransform:'uppercase' }}>Programme</div>
            {config.ressources.programme.map(r => (
              <a key={r.label} href={r.url} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom:'1px solid rgba(255,255,255,0.03)', textDecoration:'none', transition:'background .15s' }} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:400, fontSize:'13px', color:'#D8D5D0' }}>{r.label}</span>
                <span style={{ fontSize:'12px', color:'#404040' }}>↗</span>
              </a>
            ))}
          </div>

          <div style={card}>
            <div style={{ padding:'14px 20px', fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:'10px', letterSpacing:'1.5px', color:'#404040', borderBottom:'1px solid rgba(255,255,255,0.04)', textTransform:'uppercase' }}>Mon contrat</div>
            <div style={{ padding:'20px' }}>
              <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:500, fontSize:'10px', letterSpacing:'1px', color:'#C9A44A', opacity:.6, marginBottom:'6px', textTransform:'uppercase' }}>Signé le {clientData?.signatureDate || '—'}</div>
              <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'20px', letterSpacing:'2px', color:'#F0EDE8', marginBottom:'20px' }}>{clientData?.infos?.prenom||''} {clientData?.infos?.nom||''}</div>
              <div style={{ display:'grid', gap:'8px' }}>
                <button onClick={()=>openModal('contract_view')} style={{ ...sBtn, width:'100%', padding:'10px' }}>Voir le contrat</button>
                <button onClick={downloadContract} style={{ ...sBtnG, width:'100%', padding:'10px' }}>Télécharger</button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )

  // ════════════════════════════════════════════════════════
  // FLOATING POMODORO WIDGET
  // ════════════════════════════════════════════════════════
  const floatRight  = isMobile ? '16px' : '24px'
  const floatBottom = isMobile ? '88px' : '24px'
  const pomoColor   = pomoPhase === 'focus' ? '#C9A44A' : '#4ade80'
  const smallR      = 20
  const smallCirc   = 2 * Math.PI * smallR
  const smallDash   = smallCirc * pomoPct

  // ════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════
  return (
    <div style={{ display:'flex', minHeight:'100vh', background:'#0D0D0D' }}>

      {/* ── SIDEBAR (desktop) ─────────────────────────── */}
      {!isMobile && (
        <aside style={{ position:'fixed', top:0, left:0, bottom:0, width:'220px', background:'#0A0A0A', borderRight:'1px solid rgba(255,255,255,0.05)', display:'flex', flexDirection:'column', zIndex:50, overflowY:'auto' }}>
          {/* Logo */}
          <div style={{ padding:'28px 24px 24px', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'20px', letterSpacing:'4px', color:'#C9A44A' }}>GLC</div>
            <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:300, fontSize:'11px', color:'#303030', letterSpacing:'1px', marginTop:'4px' }}>{config.programme}</div>
          </div>

          {/* Nav items */}
          <nav style={{ flex:1, padding:'16px 12px' }}>
            {NAV.map(({ id, label, Icon }) => {
              const active = activeView === id
              return (
                <button key={id} onClick={() => setActiveView(id)} style={{ width:'100%', display:'flex', alignItems:'center', gap:'12px', padding:'11px 14px', borderRadius:'10px', border:'none', cursor:'pointer', background: active ? 'rgba(201,164,74,0.1)' : 'transparent', color: active ? '#C9A44A' : '#404040', marginBottom:'2px', transition:'all .2s', textAlign:'left' }}
                  onMouseEnter={e=>{ if(!active) e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.color=active?'#C9A44A':'#808080' }}
                  onMouseLeave={e=>{ e.currentTarget.style.background=active?'rgba(201,164,74,0.1)':'transparent'; e.currentTarget.style.color=active?'#C9A44A':'#404040' }}
                >
                  <Icon size={16} color="currentColor" />
                  <span style={{ fontFamily:"'Inter',sans-serif", fontWeight: active?600:400, fontSize:'13px', letterSpacing:'0.2px' }}>{label}</span>
                  {active && <div style={{ marginLeft:'auto', width:'4px', height:'4px', borderRadius:'50%', background:'#C9A44A' }}/>}
                </button>
              )
            })}
          </nav>

          {/* Footer */}
          <div style={{ padding:'16px 24px', borderTop:'1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:'12px', color:'#C9A44A', letterSpacing:'0.5px' }}>{prenom}</div>
            <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:400, fontSize:'11px', color:'#303030', marginTop:'2px' }}>{weekLabel}</div>
          </div>
        </aside>
      )}

      {/* ── MAIN CONTENT ──────────────────────────────── */}
      <main style={{ flex:1, marginLeft: isMobile ? 0 : '220px', paddingBottom: isMobile ? '80px' : '40px', minHeight:'100vh', overflowX:'hidden' }}>
        {/* Mobile header */}
        {isMobile && (
          <div style={{ position:'sticky', top:0, zIndex:40, background:'rgba(10,10,10,0.95)', backdropFilter:'blur(12px)', borderBottom:'1px solid rgba(255,255,255,0.05)', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'18px', letterSpacing:'4px', color:'#C9A44A' }}>GLC</div>
            <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:400, fontSize:'12px', color:'#404040' }}>{prenom} · {weekLabel}</div>
          </div>
        )}

        {activeView === 'today'      && ViewToday()}
        {activeView === 'calendar'   && ViewCalendar()}
        {activeView === 'objectifs'  && ViewObjectifs()}
        {activeView === 'outils'     && ViewOutils()}
        {activeView === 'ressources' && ViewRessources()}
      </main>

      {/* ── BOTTOM NAV (mobile) ───────────────────────── */}
      {isMobile && (
        <nav style={{ position:'fixed', bottom:0, left:0, right:0, background:'rgba(10,10,10,0.97)', backdropFilter:'blur(16px)', borderTop:'1px solid rgba(255,255,255,0.05)', display:'flex', zIndex:50, height:'68px' }}>
          {NAV.map(({ id, label, Icon }) => {
            const active = activeView === id
            return (
              <button key={id} onClick={() => setActiveView(id)} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'5px', border:'none', background:'transparent', color: active ? '#C9A44A' : '#303030', cursor:'pointer', padding:'8px 4px', transition:'color .2s' }}>
                <Icon size={18} color="currentColor" />
                <span style={{ fontFamily:"'Inter',sans-serif", fontWeight: active?600:400, fontSize:'9px', letterSpacing:'0.5px', textTransform:'uppercase' }}>{label === "Aujourd'hui" ? 'Auj.' : label}</span>
              </button>
            )
          })}
        </nav>
      )}

      {/* ── FLOATING POMODORO ─────────────────────────── */}
      <div style={{ position:'fixed', right: floatRight, bottom: floatBottom, zIndex:60, display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'8px' }}>

        {/* Expanded panel */}
        {pomoExpanded && (
          <div className="scale-in" style={{ width:'280px', background:'linear-gradient(145deg,#131313,#0f0f0f)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:'16px', boxShadow:'0 16px 60px rgba(0,0,0,0.7)', overflow:'hidden' }}>
            {/* Header */}
            <div style={{ padding:'14px 16px', borderBottom:'1px solid rgba(255,255,255,0.04)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:'11px', letterSpacing:'1.5px', color:'#F0EDE8', textTransform:'uppercase' }}>Pomodoro</span>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'12px', letterSpacing:'2px', color:'#404040' }}>Session {pomoSess}/4</span>
            </div>

            {/* Phase tabs */}
            <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.04)', background:'rgba(0,0,0,0.2)' }}>
              {[['focus','Focus'],['short','Pause'],['long','Long']].map(([k,l]) => (
                <button key={k} onClick={()=>{setPomoPhase(k);setPomoRunning(false);setPomoSec((k==='focus'?pomoVals.f:k==='short'?pomoVals.s:pomoVals.l)*60)}} style={{ flex:1, fontFamily:"'Inter',sans-serif", fontWeight: pomoPhase===k?600:400, fontSize:'10px', color: pomoPhase===k ? pomoColor : '#404040', background: pomoPhase===k ? `rgba(${pomoPhase==='focus'?'201,164,74':'74,222,128'},0.08)` : 'transparent', border:'none', padding:'10px 4px', cursor:'pointer', transition:'all .2s' }}>{l}</button>
              ))}
            </div>

            {/* Timer */}
            <div style={{ padding:'24px 16px 16px', textAlign:'center' }}>
              <div style={{ position:'relative', width:'120px', height:'120px', margin:'0 auto 16px' }}>
                <svg width="120" height="120" viewBox="0 0 120 120" style={{ transform:'rotate(-90deg)' }}>
                  <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3"/>
                  <circle cx="60" cy="60" r="52" fill="none" stroke={pomoColor} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${2*Math.PI*52}`} strokeDashoffset={`${2*Math.PI*52*(1-pomoPct)}`} style={{ transition:'stroke-dashoffset .5s linear, stroke .3s' }}/>
                </svg>
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                  <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'36px', letterSpacing:'2px', color:'#F0EDE8', fontVariantNumeric:'tabular-nums' }}>{pomoTime}</div>
                  <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:500, fontSize:'9px', letterSpacing:'2px', color:'#404040', marginTop:'2px', textTransform:'uppercase' }}>{pomoPhase}</div>
                </div>
              </div>

              {/* Controls */}
              <div style={{ display:'flex', gap:'8px', justifyContent:'center', marginBottom:'16px' }}>
                <button onClick={()=>{if(!pomoRunning&&Notification.permission==='default')Notification.requestPermission();setPomoRunning(r=>!r)}} style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:'11px', padding:'10px 22px', background: pomoColor, border:'none', color:'#0D0D0D', cursor:'pointer', borderRadius:'8px', letterSpacing:'0.5px' }}>{pomoRunning ? '⏸ Pause' : '▶ Démarrer'}</button>
                <button onClick={()=>{setPomoRunning(false);setPomoSec(pomoMaxSec)}} style={{ width:'38px', height:'38px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', color:'#505050', cursor:'pointer', borderRadius:'8px', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center' }}>↺</button>
              </div>

              {/* Session dots */}
              <div style={{ display:'flex', gap:'6px', justifyContent:'center', marginBottom:'16px' }}>
                {Array(4).fill(null).map((_,i)=><div key={i} style={{ width:'6px', height:'6px', borderRadius:'50%', background: i<pomoSess ? pomoColor : '#1A1A1A', border:'1px solid rgba(255,255,255,0.06)', transition:'background .3s' }}/>)}
              </div>

              {/* Settings */}
              <div style={{ borderTop:'1px solid rgba(255,255,255,0.04)', paddingTop:'14px', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'8px' }}>
                {[['f','Focus'],['s','Pause'],['l','Long']].map(([k,l]) => (
                  <div key={k} style={{ textAlign:'center' }}>
                    <div style={{ fontFamily:"'Inter',sans-serif", fontSize:'9px', fontWeight:500, letterSpacing:'1px', color:'#303030', textTransform:'uppercase', marginBottom:'6px' }}>{l}</div>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'6px' }}>
                      <button onClick={()=>setPomoVals(v=>({...v,[k]:Math.max(1,v[k]-1)})) } style={{ width:'20px', height:'20px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'4px', color:'#505050', cursor:'pointer', fontSize:'12px', display:'flex', alignItems:'center', justifyContent:'center' }}>−</button>
                      <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'18px', color:'#F0EDE8', minWidth:'24px', textAlign:'center' }}>{pomoVals[k]}</span>
                      <button onClick={()=>setPomoVals(v=>({...v,[k]:v[k]+1}))} style={{ width:'20px', height:'20px', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'4px', color:'#505050', cursor:'pointer', fontSize:'12px', display:'flex', alignItems:'center', justifyContent:'center' }}>+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Toggle button (always visible) */}
        <button onClick={()=>setPomoExpanded(e=>!e)} style={{ width:'52px', height:'52px', borderRadius:'50%', border:`2px solid ${pomoRunning ? pomoColor : 'rgba(255,255,255,0.1)'}`, background:'#0A0A0A', cursor:'pointer', position:'relative', boxShadow: pomoRunning ? `0 0 0 4px ${pomoColor}22, 0 8px 24px rgba(0,0,0,0.6)` : '0 4px 20px rgba(0,0,0,0.6)', transition:'all .3s', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', overflow:'hidden' }}
          onMouseEnter={e=>e.currentTarget.style.borderColor=pomoColor}
          onMouseLeave={e=>e.currentTarget.style.borderColor=pomoRunning?pomoColor:'rgba(255,255,255,0.1)'}
        >
          <svg width="52" height="52" viewBox="0 0 52 52" style={{ position:'absolute', inset:0, transform:'rotate(-90deg)' }}>
            <circle cx="26" cy="26" r={smallR} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2"/>
            <circle cx="26" cy="26" r={smallR} fill="none" stroke={pomoColor} strokeWidth="2" strokeLinecap="round" strokeDasharray={smallCirc} strokeDashoffset={smallCirc - smallDash} style={{ transition:'stroke-dashoffset .5s linear, stroke .3s', opacity: pomoRunning ? 1 : 0.4 }}/>
          </svg>
          <div style={{ position:'relative', textAlign:'center' }}>
            <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'11px', letterSpacing:'0.5px', color: pomoRunning ? pomoColor : '#505050', fontVariantNumeric:'tabular-nums', lineHeight:1, transition:'color .3s' }}>{pomoTime}</div>
          </div>
        </button>

      </div>

      {/* ── FLASH overlay ─────────────────────────────── */}
      {pomoFlash && (
        <div style={{ position:'fixed', inset:0, background:`rgba(${pomoPhase==='focus'?'201,164,74':'74,222,128'},0.07)`, zIndex:55, pointerEvents:'none', animation:'fadeIn .1s ease' }}/>
      )}

      {/* ══════════════════════════════════════════════════
          MODALS
      ══════════════════════════════════════════════════ */}
      <UiModal open={modal.type==='event_add'} title="Ajouter un événement" onClose={closeModal} footer={[
        <button key="c" onClick={closeModal} style={{ ...sBtn, padding:'10px 18px' }}>Annuler</button>,
        <button key="s" onClick={saveEventFromModal} style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:'11px', background:'#C9A44A', border:'none', color:'#0D0D0D', padding:'10px 18px', borderRadius:'8px', cursor:'pointer' }}>Ajouter</button>,
      ]}>
        <div style={{ display:'grid', gap:'12px' }}>
          {[['Date','date','date',eventDraft.date,v=>setEventDraft(d=>({...d,date:v}))],['Événement','text','text',eventDraft.title,v=>setEventDraft(d=>({...d,title:v})),' Ex: Call spécial']].map(([lbl,id,type,val,onChange,ph])=>(
            <div key={id}>
              <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:'10px', letterSpacing:'1.2px', color:'#C9A44A', textTransform:'uppercase', marginBottom:'8px' }}>{lbl}</div>
              <input type={type} value={val} onChange={e=>onChange(e.target.value)} placeholder={ph||''} style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'11px 12px', color:'#F0EDE8', outline:'none', fontFamily:"'Inter',sans-serif", fontSize:'13px' }}/>
            </div>
          ))}
        </div>
      </UiModal>

      <UiModal open={modal.type==='objectifs_edit'} title="Modifier les objectifs" onClose={closeModal} footer={[
        <button key="c" onClick={closeModal} style={{ ...sBtn, padding:'10px 18px' }}>Annuler</button>,
        <button key="s" onClick={saveObjectifsFromModal} style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:'11px', background:'#C9A44A', border:'none', color:'#0D0D0D', padding:'10px 18px', borderRadius:'8px', cursor:'pointer' }}>Enregistrer</button>,
      ]}>
        <div style={{ display:'grid', gap:'14px' }}>
          {Object.keys(objectifs).map(key=>(
            <div key={key}>
              <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:'10px', letterSpacing:'1.2px', color:'#C9A44A', textTransform:'uppercase', marginBottom:'8px' }}>{key}</div>
              <textarea value={objectifsDraft?.[key]??''} onChange={e=>setObjectifsDraft(d=>({...d,[key]:e.target.value}))} style={{ width:'100%', minHeight:'90px', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'11px 12px', color:'#F0EDE8', outline:'none', fontFamily:"'Inter',sans-serif", fontSize:'13px', resize:'vertical', lineHeight:1.7 }}/>
            </div>
          ))}
        </div>
      </UiModal>

      <UiModal open={modal.type==='habit_edit'||modal.type==='habit_add'} title={habitDraft.mode==='add'?'Ajouter une habitude':'Modifier une habitude'} onClose={closeModal} footer={[
        <button key="c" onClick={closeModal} style={{ ...sBtn, padding:'10px 18px' }}>Annuler</button>,
        <button key="s" onClick={saveHabitFromModal} style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:'11px', background:'#C9A44A', border:'none', color:'#0D0D0D', padding:'10px 18px', borderRadius:'8px', cursor:'pointer' }}>Enregistrer</button>,
      ]}>
        <div style={{ display:'grid', gap:'14px' }}>
          <div>
            <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:'10px', letterSpacing:'1.2px', color:'#C9A44A', textTransform:'uppercase', marginBottom:'8px' }}>Période</div>
            <select value={habitDraft.period} onChange={e=>{const p=e.target.value;const f=routines?.[p]?.[0];setHabitDraft(d=>({...d,period:p,index:0,name:f?.n??'',streak:String(f?.streak??''),done:!!f?.done}))}} style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'11px 12px', color:'#F0EDE8', outline:'none', fontFamily:"'Inter',sans-serif", fontSize:'13px' }}>
              <option value="matin">Matin</option><option value="soir">Soir</option>
            </select>
          </div>
          {habitDraft.mode==='edit' && (
            <div>
              <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:'10px', letterSpacing:'1.2px', color:'#C9A44A', textTransform:'uppercase', marginBottom:'8px' }}>Habitude</div>
              <select value={habitDraft.index} onChange={e=>{const idx=Number(e.target.value);const r=routines?.[habitDraft.period]?.[idx];setHabitDraft(d=>({...d,index:idx,name:r?.n??'',streak:String(r?.streak??''),done:!!r?.done}))}} style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'11px 12px', color:'#F0EDE8', outline:'none', fontFamily:"'Inter',sans-serif", fontSize:'13px' }}>
                {(routines?.[habitDraft.period]||[]).map((r,i)=><option key={i} value={i}>{r.n}</option>)}
              </select>
            </div>
          )}
          <div>
            <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:'10px', letterSpacing:'1.2px', color:'#C9A44A', textTransform:'uppercase', marginBottom:'8px' }}>Nom</div>
            <input type="text" value={habitDraft.name} onChange={e=>setHabitDraft(d=>({...d,name:e.target.value}))} placeholder="Ex: Lecture 20 min" style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'11px 12px', color:'#F0EDE8', outline:'none', fontFamily:"'Inter',sans-serif", fontSize:'13px' }}/>
          </div>
          <div>
            <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:'10px', letterSpacing:'1.2px', color:'#C9A44A', textTransform:'uppercase', marginBottom:'8px' }}>Streak actuel</div>
            <input type="number" value={habitDraft.streak} onChange={e=>setHabitDraft(d=>({...d,streak:e.target.value}))} placeholder="0" style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'11px 12px', color:'#F0EDE8', outline:'none', fontFamily:"'Inter',sans-serif", fontSize:'13px' }}/>
          </div>
        </div>
      </UiModal>

      <UiModal open={modal.type==='todo_add'} title="Ajouter une tâche" onClose={closeModal} footer={[
        <button key="c" onClick={closeModal} style={{ ...sBtn, padding:'10px 18px' }}>Annuler</button>,
        <button key="s" onClick={saveTodoFromModal} style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:'11px', background:'#C9A44A', border:'none', color:'#0D0D0D', padding:'10px 18px', borderRadius:'8px', cursor:'pointer' }}>Ajouter</button>,
      ]}>
        <div style={{ display:'grid', gap:'12px' }}>
          <div>
            <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:'10px', letterSpacing:'1.2px', color:'#C9A44A', textTransform:'uppercase', marginBottom:'8px' }}>Catégorie</div>
            <div style={{ display:'flex', gap:'8px' }}>
              {[['daily',"Aujourd'hui"],['semaine','Semaine'],['mois','Mois']].map(([k,l])=>(
                <button key={k} onClick={()=>setTodoDraftTab(k)} style={{ flex:1, fontFamily:"'Inter',sans-serif", fontWeight: todoDraftTab===k?600:400, fontSize:'11px', color: todoDraftTab===k?'#C9A44A':'#404040', background: todoDraftTab===k?'rgba(201,164,74,0.08)':'rgba(255,255,255,0.03)', border:`1px solid ${todoDraftTab===k?'rgba(201,164,74,0.3)':'rgba(255,255,255,0.07)'}`, padding:'8px', borderRadius:'8px', cursor:'pointer', transition:'all .2s' }}>{l}</button>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:'10px', letterSpacing:'1.2px', color:'#C9A44A', textTransform:'uppercase', marginBottom:'8px' }}>Tâche</div>
            <input type="text" value={todoDraftTitle} onChange={e=>setTodoDraftTitle(e.target.value)} onKeyDown={e=>e.key==='Enter'&&saveTodoFromModal()} placeholder="Ex: Relire les notes du call" style={{ width:'100%', background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'10px', padding:'11px 12px', color:'#F0EDE8', outline:'none', fontFamily:"'Inter',sans-serif", fontSize:'13px' }}/>
          </div>
        </div>
      </UiModal>

      <UiModal open={modal.type==='contract_view'} title="Mon contrat" onClose={closeModal} footer={[
        <button key="d" onClick={()=>{downloadContract();closeModal()}} style={{ fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:'11px', background:'#C9A44A', border:'none', color:'#0D0D0D', padding:'10px 18px', borderRadius:'8px', cursor:'pointer' }}>Télécharger</button>,
        <button key="c" onClick={closeModal} style={{ ...sBtn, padding:'10px 18px' }}>Fermer</button>,
      ]}>
        <div style={{ maxHeight:'65vh', overflowY:'auto', background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.07)', borderRadius:'10px', padding:'14px' }}>
          <pre style={{ margin:0, whiteSpace:'pre-wrap', wordBreak:'break-word', fontFamily:"'Inter',sans-serif", fontWeight:300, fontSize:'13px', lineHeight:1.85, color:'#C0BDB8' }}>{config.contrat}</pre>
        </div>
      </UiModal>

    </div>
  )
}
