import { useEffect, useMemo, useState } from 'react'
import config from '../config'

const GOLD = '#C9A44A'
const GREEN = '#4ade80'
const RED = '#dc5050'
const BG_CARD = '#111'
const BORDER = 'rgba(255,255,255,0.05)'
const BORDER_CARD = 'rgba(255,255,255,0.06)'

const bebas = (size, extra = {}) => ({
  fontFamily: "'Bebas Neue', sans-serif",
  letterSpacing: '0.12em',
  ...extra,
  fontSize: size,
})

function cardStyle() {
  return {
    background: BG_CARD,
    border: `1px solid ${BORDER_CARD}`,
    borderRadius: 12,
  }
}

function btnOutline() {
  return {
    ...bebas(11),
    padding: '10px 16px',
    border: `1px solid ${GOLD}`,
    background: 'transparent',
    color: GOLD,
    cursor: 'pointer',
    borderRadius: 8,
    transition: 'background .2s, color .2s',
  }
}

function SectionHeader({ title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
      <h3 style={{ ...bebas(18), color: '#F0EDE8', whiteSpace: 'nowrap' }}>{title}</h3>
      <div
        style={{
          flex: 1,
          height: 2,
          borderRadius: 1,
          background: `linear-gradient(90deg, rgba(201,164,74,0.15) 0%, ${GOLD} 55%, rgba(201,164,74,0.35) 100%)`,
        }}
      />
    </div>
  )
}

function habitBarColor(pct) {
  if (pct >= 70) return GREEN
  if (pct >= 40) return '#f59e0b'
  return RED
}

function formatLastSeen(days) {
  if (days === 0) return "Aujourd'hui"
  if (days === 1) return 'Hier'
  return `Il y a ${days} jours`
}

function statusDotColor(status) {
  if (status === 'active') return GREEN
  if (status === 'inactive') return RED
  if (status === 'attention') return GOLD
  if (status === 'completed') return GREEN
  return '#888'
}

function badgeLabel(status) {
  if (status === 'active') return 'Actif'
  if (status === 'inactive') return 'Inactif'
  if (status === 'attention') return 'Attention'
  if (status === 'completed') return 'Terminé'
  return '—'
}

function navPanelTitle(navHint) {
  if (navHint === 'vue') return 'Vue globale'
  if (navHint === 'alertes') return 'Alertes'
  if (navHint === 'msg') return 'Messages'
  if (navHint === 'settings') return 'Paramètres'
  return ''
}

/** Jours du mois courant : 'ok' | 'miss' | 'empty' | 'today' */
function buildCalendarMap(student) {
  const { year, month, today, validated, missed } = student.calendar
  const daysInMonth = new Date(year, month, 0).getDate()
  const map = {}
  for (let d = 1; d <= daysInMonth; d++) {
    if (d === today) {
      if (missed.includes(d) && !validated.includes(d)) map[d] = 'miss'
      else map[d] = 'today'
    } else if (validated.includes(d)) map[d] = 'ok'
    else if (missed.includes(d)) map[d] = 'miss'
    else if (d < today) map[d] = 'empty'
    else map[d] = 'future'
  }
  return { map, daysInMonth, year, month }
}

const Q = config.questionnaire

const MOCK_STUDENTS = [
  {
    id: '1',
    prenom: 'Alexandre',
    nom: 'Martin',
    email: 'alexandre@email.com',
    instagram: '@alexandre_m',
    whatsapp: '+33612345678',
    subtitle: 'Entrepreneur · lancement SaaS',
    status: 'active',
    lastConnectionDaysAgo: 1,
    streak: 14,
    joursValides: 22,
    pctHabitudes: 82,
    contratStatut: 'Signé',
    habits: [
      { name: 'Lecture 20 min', pct: 85 },
      { name: 'Sport / cardio', pct: 72 },
      { name: 'Méditation', pct: 68 },
    ],
    calendar: {
      year: 2026,
      month: 3,
      today: 21,
      validated: [1, 2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 14, 15, 16, 17, 18, 19, 20, 21],
      missed: [6, 13],
    },
    questionnaire: [
      { bloc: Q[0].bloc, question: Q[0].question, slider: 7, text: 'Coincé, ambitieux, impatient. Entre-deux entre ambition et exécution.' },
      { bloc: Q[4].bloc, question: Q[4].question, slider: 9, text: 'Lancer mon business en ligne et viser 5000€/mois en 12 mois.' },
      { bloc: Q[6].bloc, question: Q[6].question, slider: 6, text: 'Procrastination et peur de ne pas être légitime.' },
    ],
    defis: [
      { id: 'd1', label: 'Poster 3 stories sur ton projet cette semaine', done: false },
      { id: 'd2', label: 'Bloc-notes : 10 idées de clients potentiels', done: true },
    ],
    notesHistory: [
      { at: '18/03/2026 14:20', text: 'Très réactif sur les calls. À pousser sur la constance sport.' },
    ],
  },
  {
    id: '2',
    prenom: 'Thomas',
    nom: 'Dubois',
    email: 'thomas@email.com',
    instagram: '@thomas_d',
    whatsapp: '+33623456789',
    subtitle: 'Salarié · transition fitness',
    status: 'inactive',
    lastConnectionDaysAgo: 8,
    streak: 0,
    joursValides: 9,
    pctHabitudes: 38,
    contratStatut: 'Signé',
    habits: [
      { name: 'Lecture 20 min', pct: 30 },
      { name: 'Sport / cardio', pct: 42 },
      { name: 'Méditation', pct: 35 },
    ],
    calendar: {
      year: 2026,
      month: 3,
      today: 21,
      validated: [1, 2, 3, 4, 5],
      missed: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    },
    questionnaire: [
      { bloc: Q[0].bloc, question: Q[0].question, slider: 4, text: 'Frustré, curieux, déterminé. Le CDI ne colle plus.' },
      { bloc: Q[4].bloc, question: Q[4].question, slider: 8, text: 'Vivre du coaching fitness à plein temps.' },
      { bloc: Q[6].bloc, question: Q[6].question, slider: 7, text: 'Peur de ne pas payer le loyer si je me lance.' },
    ],
    defis: [
      { id: 'd1', label: 'Premier post LinkedIn sur ton pivot', done: false },
      { id: 'd2', label: 'Appeler 2 anciens clients pour feedback', done: false },
    ],
    notesHistory: [
      { at: '10/03/2026 09:00', text: 'A relancer : plus de réponses WhatsApp depuis 1 semaine.' },
    ],
  },
  {
    id: '3',
    prenom: 'Léa',
    nom: 'Bernard',
    email: 'lea.b@email.com',
    instagram: '@lea.be',
    whatsapp: '+33634567890',
    subtitle: 'Freelance design · surcharge',
    status: 'attention',
    lastConnectionDaysAgo: 2,
    streak: 6,
    joursValides: 15,
    pctHabitudes: 55,
    contratStatut: 'Signé',
    habits: [
      { name: 'Lecture 20 min', pct: 50 },
      { name: 'Sport / cardio', pct: 62 },
      { name: 'Méditation', pct: 48 },
    ],
    calendar: {
      year: 2026,
      month: 3,
      today: 21,
      validated: [1, 3, 4, 5, 8, 9, 10, 11, 12, 15, 16, 17, 18, 19, 20],
      missed: [2, 6, 7, 13, 14, 21],
    },
    questionnaire: [
      { bloc: Q[0].bloc, question: Q[0].question, slider: 5, text: 'Fatiguée mais lucide. Trop de missions en parallèle.' },
      { bloc: Q[4].bloc, question: Q[4].question, slider: 7, text: 'Structurer mon offre premium et dire non.' },
      { bloc: Q[6].bloc, question: Q[6].question, slider: 8, text: 'Peur du vide si je réduis mes clients low-cost.' },
    ],
    defis: [
      { id: 'd1', label: 'Définir une plage “non négociable” sans écran', done: false },
      { id: 'd2', label: 'Script de refus poli pour projets sous X€', done: false },
    ],
    notesHistory: [],
  },
  {
    id: '4',
    prenom: 'Marc',
    nom: 'Lefèvre',
    email: 'marc.lefevre@email.com',
    instagram: '@marc.lfv',
    whatsapp: '+33645678901',
    subtitle: 'Commerce · programme bouclé',
    status: 'completed',
    lastConnectionDaysAgo: 0,
    streak: 30,
    joursValides: 28,
    pctHabitudes: 91,
    contratStatut: 'Complété',
    habits: [
      { name: 'Lecture 20 min', pct: 92 },
      { name: 'Sport / cardio', pct: 88 },
      { name: 'Méditation', pct: 85 },
    ],
    calendar: {
      year: 2026,
      month: 3,
      today: 21,
      validated: Array.from({ length: 21 }, (_, i) => i + 1),
      missed: [],
    },
    questionnaire: [
      { bloc: Q[0].bloc, question: Q[0].question, slider: 8, text: 'Aligné, discipliné. Besoin de cadre au départ.' },
      { bloc: Q[4].bloc, question: Q[4].question, slider: 9, text: 'Passer responsable régional et tenir mes objectifs perso.' },
      { bloc: Q[6].bloc, question: Q[6].question, slider: 5, text: 'Distractions et réseaux sociaux le soir.' },
    ],
    defis: [
      { id: 'd1', label: 'Bilan final & témoignage vidéo', done: true },
      { id: 'd2', label: 'Parrainer un nouveau membre', done: true },
    ],
    notesHistory: [
      { at: '15/03/2026 11:00', text: 'Parcours terminé avec succès. Témoignage reçu.' },
    ],
  },
  {
    id: '5',
    prenom: 'Sophie',
    nom: 'Petit',
    email: 'sophie.petit@email.com',
    instagram: '@sophie_p',
    whatsapp: '+33699887766',
    subtitle: 'Photographe · onboarding en cours',
    status: 'attention',
    lastConnectionDaysAgo: 0,
    streak: 3,
    joursValides: 12,
    pctHabitudes: 60,
    contratStatut: 'En attente',
    habits: [
      { name: 'Lecture 20 min', pct: 55 },
      { name: 'Sport / cardio', pct: 58 },
      { name: 'Méditation', pct: 62 },
    ],
    calendar: {
      year: 2026,
      month: 3,
      today: 21,
      validated: [1, 2, 4, 5, 8, 9, 10, 11, 12],
      missed: [3, 6, 7, 13, 14, 15, 16, 17, 18, 19, 20],
    },
    questionnaire: [
      { bloc: Q[0].bloc, question: Q[0].question, slider: 6, text: 'En transition, besoin de structure.' },
      { bloc: Q[4].bloc, question: Q[4].question, slider: 7, text: 'Lancer mon studio photo.' },
      { bloc: Q[6].bloc, question: Q[6].question, slider: 5, text: 'Manque de confiance sur les tarifs.' },
    ],
    defis: [{ id: 'd1', label: 'Signer le contrat GLC', done: false }],
    notesHistory: [],
  },
]

function filterStudents(list, search, pill) {
  const q = search.trim().toLowerCase()
  let base = list
  if (pill === 'actifs') {
    base = list.filter((s) => s.status === 'active' || s.status === 'attention')
  } else if (pill === 'alertes') {
    base = list.filter(
      (s) => s.status === 'attention' || s.status === 'inactive' || s.lastConnectionDaysAgo > 5
    )
  }
  if (!q) return base
  return base.filter((s) => {
    const blob = `${s.prenom} ${s.nom} ${s.email} ${s.instagram} ${s.subtitle}`.toLowerCase()
    return blob.includes(q)
  })
}

function waUrl(phone) {
  const n = String(phone).replace(/\D/g, '')
  return `https://wa.me/${n}`
}

function jourNonValidee(s) {
  const t = s.calendar.today
  return s.calendar.missed.includes(t) && !s.calendar.validated.includes(t)
}

function contratManquant(s) {
  const st = s.contratStatut
  return st === 'En attente' || st === 'Non signé'
}

function buildAlertList(students) {
  const items = []
  for (const s of students) {
    if (s.lastConnectionDaysAgo > 5) {
      items.push({
        student: s,
        type: 'inactif',
        label: 'Inactif (+5 j)',
        days: s.lastConnectionDaysAgo,
      })
    }
    if (contratManquant(s)) {
      items.push({
        student: s,
        type: 'contrat',
        label: 'Contrat manquant',
        days: null,
      })
    }
    if (jourNonValidee(s)) {
      items.push({
        student: s,
        type: 'journee',
        label: 'Journée non validée',
        days: 1,
      })
    }
  }
  return items
}

function completionPct(s) {
  const dim = new Date(s.calendar.year, s.calendar.month, 0).getDate()
  return Math.round((s.joursValides / dim) * 100)
}

function computeGlobalStats(students) {
  const actifs = students.filter((x) => x.status !== 'inactive').length
  const meanCompletion = Math.round(
    students.reduce((acc, s) => acc + completionPct(s), 0) / Math.max(students.length, 1)
  )
  const bestStreak = Math.max(0, ...students.map((s) => s.streak))
  const nbAlertes = buildAlertList(students).length
  const ranking = [...students].sort((a, b) => b.streak - a.streak)
  return { actifs, meanCompletion, bestStreak, nbAlertes, ranking }
}

function alertCount(list) {
  return buildAlertList(list).length
}

/** < 768px */
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 767px)').matches : false
  )
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const listener = () => setIsMobile(mq.matches)
    mq.addEventListener('change', listener)
    setIsMobile(mq.matches)
    return () => mq.removeEventListener('change', listener)
  }, [])
  return isMobile
}

export default function CoachView() {
  const [auth, setAuth] = useState(false)
  const [pwd, setPwd] = useState('')
  const [error, setError] = useState(false)
  const [search, setSearch] = useState('')
  const [pill, setPill] = useState('tous')
  const [selectedId, setSelectedId] = useState(MOCK_STUDENTS[0].id)
  const [navHint, setNavHint] = useState('eleves')
  const [noteDrafts, setNoteDrafts] = useState({})
  const [defiOverrides, setDefiOverrides] = useState({})
  const [coachSettings, setCoachSettings] = useState(() => {
    try {
      const raw = localStorage.getItem('glc_coach_settings_v1')
      if (raw) {
        const o = JSON.parse(raw)
        return {
          coachPassword: o.coachPassword ?? config.coach_password,
          prochainCall: o.prochainCall ?? config.prochain_call?.date?.split('T')[0] ?? '2026-04-09',
          citation: o.citation ?? config.citation,
        }
      }
    } catch {}
    return {
      coachPassword: config.coach_password,
      prochainCall: config.prochain_call?.date?.split('T')[0] ?? '2026-04-09',
      citation: config.citation,
    }
  })
  const isMobile = useIsMobile()
  /** list = sidebar seule ; detail = fiche élève plein écran */
  const [mobilePanel, setMobilePanel] = useState('list')

  const filtered = useMemo(() => filterStudents(MOCK_STUDENTS, search, pill), [search, pill])
  const alertsN = alertCount(MOCK_STUDENTS)
  const globalStats = useMemo(() => computeGlobalStats(MOCK_STUDENTS), [])
  const alertRows = useMemo(() => buildAlertList(MOCK_STUDENTS), [])

  const selected = useMemo(
    () => MOCK_STUDENTS.find((s) => s.id === selectedId) || MOCK_STUDENTS[0],
    [selectedId]
  )

  useEffect(() => {
    if (filtered.length && !filtered.some((s) => s.id === selectedId)) {
      setSelectedId(filtered[0].id)
    }
  }, [filtered, selectedId])

  useEffect(() => {
    if (!isMobile) setMobilePanel('list')
  }, [isMobile])

  const showInactiveBanner = selected.lastConnectionDaysAgo > 5

  const cal = useMemo(() => buildCalendarMap(selected), [selected])
  const firstWeekday = new Date(cal.year, cal.month - 1, 1).getDay()
  const monday0 = firstWeekday === 0 ? 6 : firstWeekday - 1

  const handleLogin = () => {
    if (pwd === coachSettings.coachPassword) {
      setAuth(true)
      setError(false)
    } else {
      setError(true)
    }
  }

  const saveCoachSettings = () => {
    localStorage.setItem('glc_coach_settings_v1', JSON.stringify(coachSettings))
  }

  const toggleDefi = (studentId, defiId, initialDone) => {
    const key = `${studentId}-${defiId}`
    const cur = defiOverrides[key]
    const effective = cur !== undefined ? cur : initialDone
    setDefiOverrides((o) => ({ ...o, [key]: !effective }))
  }

  const defiDone = (studentId, defiId, initialDone) => {
    const key = `${studentId}-${defiId}`
    if (defiOverrides[key] !== undefined) return defiOverrides[key]
    return initialDone
  }

  const noteValue = (id) => noteDrafts[id] ?? ''
  const setNoteValue = (id, v) => setNoteDrafts((d) => ({ ...d, [id]: v }))

  const shellBase = {
    position: 'relative',
    zIndex: 2,
    height: '100vh',
    width: '100%',
    overflow: 'hidden',
    display: 'flex',
    color: '#F0EDE8',
  }

  if (!auth) {
    return (
      <div style={{ ...shellBase, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
        <div style={{ width: '100%', maxWidth: 400, textAlign: 'center' }}>
          <div style={{ ...bebas(11), color: GOLD, marginBottom: 16 }}>Gentleman Létal Club</div>
          <h1 style={{ ...bebas(42), color: '#F0EDE8', marginBottom: 36 }}>Espace Coach</h1>
          <div style={{ ...cardStyle(), padding: 32 }}>
            <div style={{ ...bebas(10), color: '#555', marginBottom: 12, textAlign: 'left' }}>Mot de passe</div>
            <input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${error ? 'rgba(220,80,80,0.45)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 8,
                color: '#F0EDE8',
                fontFamily: "'Inter', sans-serif",
                fontSize: 14,
                outline: 'none',
                marginBottom: 16,
              }}
            />
            {error && (
              <div style={{ ...bebas(10), color: RED, marginBottom: 16 }}>Mot de passe incorrect</div>
            )}
            <button
              type="button"
              onClick={handleLogin}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = GOLD
                e.currentTarget.style.color = '#0D0D0D'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = GOLD
              }}
              style={{ ...btnOutline(), width: '100%', padding: '14px' }}
            >
              Accéder
            </button>
          </div>
        </div>
      </div>
    )
  }

  const navBtn = (id, emoji, label, extra = null, variant = 'rail') => {
    const active = navHint === id
    const bottom = variant === 'bottom'
    return (
      <button
        type="button"
        title={label}
        onClick={() => {
          setNavHint(id)
          if (isMobile && id === 'eleves') setMobilePanel('list')
        }}
        style={{
          position: 'relative',
          width: bottom ? undefined : 44,
          flex: bottom ? 1 : undefined,
          maxWidth: bottom ? 56 : undefined,
          height: bottom ? 48 : 44,
          borderRadius: bottom ? 12 : 10,
          border: active ? `1px solid ${GOLD}` : `1px solid ${BORDER}`,
          background: active ? 'rgba(201,164,74,0.12)' : 'transparent',
          cursor: 'pointer',
          fontSize: bottom ? 20 : 18,
          lineHeight: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span aria-hidden>{emoji}</span>
        {extra}
      </button>
    )
  }

  const isElevesNav = navHint === 'eleves'
  const showSidebar = isElevesNav && (!isMobile || mobilePanel === 'list')
  const showMain =
    (isElevesNav && (!isMobile || mobilePanel === 'detail')) ||
    navHint === 'vue' ||
    navHint === 'alertes' ||
    navHint === 'msg' ||
    navHint === 'settings'

  const shell = { ...shellBase, flexDirection: isMobile ? 'column' : 'row' }

  return (
    <div style={shell}>
      {/* Col 1 — nav rail (desktop uniquement) */}
      {!isMobile && (
      <aside
        style={{
          width: 64,
          flexShrink: 0,
          borderRight: `1px solid ${BORDER}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '12px 0',
          background: 'rgba(13,13,13,0.6)',
        }}
      >
        <div style={{ ...bebas(14), color: GOLD, marginBottom: 20 }}>GLC</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
          {navBtn('eleves', '👥', 'Élèves')}
          {navBtn('vue', '📊', 'Vue globale')}
          {navBtn(
            'alertes',
            '🔔',
            'Alertes',
            alertsN > 0 ? (
              <span
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  minWidth: 16,
                  height: 16,
                  padding: '0 4px',
                  borderRadius: 8,
                  background: RED,
                  color: '#fff',
                  fontSize: 9,
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  lineHeight: '16px',
                }}
              >
                {alertsN}
              </span>
            ) : null
          )}
          {navBtn('msg', '✉️', 'Messages')}
        </div>
        <div style={{ flex: 1 }} />
        {navBtn('settings', '⚙️', 'Paramètres')}
      </aside>
      )}

      {/* Col 2 — sidebar */}
      {showSidebar && (
      <aside
        style={{
          width: isMobile ? '100%' : 240,
          flex: isMobile ? 1 : undefined,
          flexShrink: isMobile ? 1 : 0,
          minWidth: 0,
          minHeight: 0,
          borderRight: isMobile ? 'none' : `1px solid ${BORDER}`,
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(17,17,17,0.85)',
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '16px 14px 12px', borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <span style={{ ...bebas(16), color: '#F0EDE8' }}>Élèves</span>
            <span style={{ ...bebas(12), color: GOLD }}>{filtered.length}</span>
          </div>
          <input
            type="search"
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              borderRadius: 8,
              border: `1px solid ${BORDER_CARD}`,
              background: 'rgba(255,255,255,0.03)',
              color: '#F0EDE8',
              fontSize: 13,
              outline: 'none',
              marginBottom: 12,
            }}
          />
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {[
              { id: 'tous', label: 'Tous' },
              { id: 'actifs', label: 'Actifs' },
              { id: 'alertes', label: 'Alertes' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPill(p.id)}
                style={{
                  ...bebas(9),
                  padding: '6px 10px',
                  borderRadius: 999,
                  border: `1px solid ${pill === p.id ? GOLD : BORDER_CARD}`,
                  background: pill === p.id ? 'rgba(201,164,74,0.15)' : 'transparent',
                  color: pill === p.id ? GOLD : '#888',
                  cursor: 'pointer',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 8 }}>
          {filtered.map((s) => {
            const active = s.id === selectedId
            const initials = `${s.prenom[0]}${s.nom[0]}`.toUpperCase()
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSelectedId(s.id)
                  setNavHint('eleves')
                  if (isMobile) setMobilePanel('detail')
                }}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: 10,
                  marginBottom: 6,
                  borderRadius: 10,
                  border: `1px solid ${active ? 'rgba(201,164,74,0.35)' : 'transparent'}`,
                  background: active ? 'rgba(201,164,74,0.08)' : 'transparent',
                  cursor: 'pointer',
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ position: 'relative' }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      background: 'rgba(255,255,255,0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      ...bebas(12),
                      color: GOLD,
                    }}
                  >
                    {initials}
                  </div>
                  <span
                    style={{
                      position: 'absolute',
                      bottom: -1,
                      right: -1,
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: statusDotColor(s.status),
                      border: '2px solid #111',
                    }}
                  />
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#F0EDE8', lineHeight: 1.2 }}>
                    {s.prenom} {s.nom}
                  </div>
                  <div style={{ fontSize: 10, color: '#666', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {s.subtitle}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 10, color: '#555' }}>
                    <span style={{ color: GOLD }}>🔥 {s.streak}j</span>
                    <span>{formatLastSeen(s.lastConnectionDaysAgo)}</span>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </aside>
      )}

      {/* Col 3 — main */}
      {showMain && (
      <main
        style={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(13,13,13,0.4)',
        }}
      >
        {navHint === 'eleves' ? (
        <>
        <header
          style={{
            flexShrink: 0,
            padding: isMobile ? '14px 16px' : '18px 22px',
            borderBottom: `1px solid ${BORDER}`,
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
            {isMobile && (
              <button
                type="button"
                onClick={() => setMobilePanel('list')}
                style={{
                  ...bebas(11),
                  flexShrink: 0,
                  padding: '8px 12px',
                  border: `1px solid ${BORDER_CARD}`,
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.04)',
                  color: GOLD,
                  cursor: 'pointer',
                }}
              >
                ← Retour
              </button>
            )}
            <div style={{ minWidth: 0 }}>
            <h2 style={{ ...bebas(isMobile ? 22 : 28), color: '#F0EDE8', marginBottom: 6 }}>
              {selected.prenom} {selected.nom}
            </h2>
            <div style={{ fontSize: 12, color: '#888', wordBreak: 'break-word' }}>
              {selected.email} · {selected.instagram}
            </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', width: isMobile ? '100%' : undefined, justifyContent: isMobile ? 'flex-start' : undefined }}>
            <span
              style={{
                ...bebas(10),
                padding: '6px 12px',
                borderRadius: 8,
                border: `1px solid ${BORDER_CARD}`,
                color: GOLD,
                background: 'rgba(201,164,74,0.08)',
              }}
            >
              {badgeLabel(selected.status)}
            </span>
            <button
              type="button"
              style={btnOutline()}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = GOLD
                e.currentTarget.style.color = '#0D0D0D'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = GOLD
              }}
            >
              Message
            </button>
            <button
              type="button"
              style={btnOutline()}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = GOLD
                e.currentTarget.style.color = '#0D0D0D'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = GOLD
              }}
            >
              Planifier
            </button>
          </div>
        </header>

        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? 16 : 22 }}>
          {showInactiveBanner && (
            <div
              style={{
                ...cardStyle(),
                padding: '14px 18px',
                marginBottom: 20,
                borderColor: 'rgba(220,80,80,0.35)',
                background: 'rgba(220,80,80,0.08)',
              }}
            >
              <div style={{ ...bebas(13), color: RED, marginBottom: 4 }}>Élève inactif</div>
              <div style={{ fontSize: 13, color: '#e8c8c8', lineHeight: 1.5 }}>
                Aucune connexion depuis plus de 5 jours ({formatLastSeen(selected.lastConnectionDaysAgo)}). Pense à
                relancer {selected.prenom} sur le canal privé.
              </div>
            </div>
          )}

          {/* 4 métriques */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))',
              gap: 12,
              marginBottom: 22,
            }}
          >
            {[
              { label: 'Streak', value: `${selected.streak} j`, sub: 'jours consécutifs' },
              { label: 'Jours validés', value: `${selected.joursValides}`, sub: 'ce mois-ci' },
              { label: 'Habitudes', value: `${selected.pctHabitudes}%`, sub: 'score global' },
              { label: 'Contrat', value: selected.contratStatut, sub: 'statut' },
            ].map((m) => (
              <div key={m.label} style={{ ...cardStyle(), padding: 16 }}>
                <div style={{ ...bebas(9), color: '#666', marginBottom: 8 }}>{m.label}</div>
                <div style={{ ...bebas(22), color: GOLD }}>{m.value}</div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>{m.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 22 }}>
            {/* Habitudes */}
            <div style={{ ...cardStyle(), padding: 18 }}>
              <SectionHeader title="Habitudes" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {selected.habits.map((h) => (
                  <div key={h.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12 }}>
                      <span style={{ color: '#ccc' }}>{h.name}</span>
                      <span style={{ color: habitBarColor(h.pct), ...bebas(10) }}>{h.pct}%</span>
                    </div>
                    <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${h.pct}%`,
                          height: '100%',
                          borderRadius: 4,
                          background: habitBarColor(h.pct),
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calendrier */}
            <div style={{ ...cardStyle(), padding: 18 }}>
              <SectionHeader title="Calendrier — Avril 2026" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 8 }}>
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, wi) => (
                  <div key={`wd-${wi}`} style={{ ...bebas(9), color: '#555', textAlign: 'center' }}>
                    {d}
                  </div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                {Array.from({ length: monday0 }).map((_, i) => (
                  <div key={`e-${i}`} />
                ))}
                {Array.from({ length: cal.daysInMonth }, (_, i) => {
                  const day = i + 1
                  const state = cal.map[day]
                  let bg = 'rgba(255,255,255,0.04)'
                  let border = '1px solid transparent'
                  if (state === 'ok') {
                    bg = 'rgba(74,222,128,0.2)'
                    border = `1px solid ${GREEN}`
                  } else if (state === 'miss') {
                    bg = 'rgba(220,80,80,0.15)'
                    border = `1px solid ${RED}`
                  } else if (state === 'today') {
                    bg = 'rgba(201,164,74,0.2)'
                    border = `1px solid ${GOLD}`
                  } else if (state === 'future') {
                    bg = 'rgba(255,255,255,0.02)'
                  }
                  return (
                    <div
                      key={day}
                      style={{
                        aspectRatio: '1',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        ...bebas(11),
                        color: state === 'today' ? GOLD : '#ccc',
                        background: bg,
                        border,
                      }}
                    >
                      {day}
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: 14, marginTop: 14, fontSize: 11, color: '#666', flexWrap: 'wrap' }}>
                <span>
                  <span style={{ color: GREEN }}>■</span> Validé
                </span>
                <span>
                  <span style={{ color: RED }}>■</span> Manqué
                </span>
                <span>
                  <span style={{ color: GOLD }}>■</span> Aujourd'hui
                </span>
              </div>
            </div>
          </div>

          {/* Questionnaire */}
          <div style={{ ...cardStyle(), padding: 18, marginBottom: 22 }}>
            <SectionHeader title="Questionnaire découverte" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {selected.questionnaire.map((q, idx) => (
                <div
                  key={idx}
                  style={{
                    paddingBottom: 18,
                    borderBottom: idx < selected.questionnaire.length - 1 ? `1px solid ${BORDER}` : 'none',
                  }}
                >
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ ...bebas(10), color: GOLD }}>{q.bloc}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#666', fontStyle: 'italic', marginBottom: 10 }}>{q.question}</div>
                  <div style={{ fontSize: 14, fontWeight: 300, lineHeight: 1.7, color: '#F0EDE8' }}>{q.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16 }}>
            <div style={{ ...cardStyle(), padding: 18 }}>
              <SectionHeader title="Défis assignés" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {selected.defis.map((d) => {
                  const done = defiDone(selected.id, d.id, d.done)
                  return (
                    <label
                      key={d.id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        cursor: 'pointer',
                        fontSize: 13,
                        lineHeight: 1.5,
                        color: done ? '#666' : '#ddd',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={() => toggleDefi(selected.id, d.id, d.done)}
                        style={{ width: 18, height: 18, accentColor: GOLD, marginTop: 2 }}
                      />
                      <span style={{ textDecoration: done ? 'line-through' : 'none' }}>{d.label}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            <div style={{ ...cardStyle(), padding: 18 }}>
              <SectionHeader title="Notes privées" />
              <textarea
                value={noteValue(selected.id)}
                onChange={(e) => setNoteValue(selected.id, e.target.value)}
                placeholder="Écris une note visible uniquement par toi…"
                rows={5}
                style={{
                  width: '100%',
                  resize: 'vertical',
                  padding: 12,
                  borderRadius: 10,
                  border: `1px solid ${BORDER_CARD}`,
                  background: 'rgba(0,0,0,0.25)',
                  color: '#F0EDE8',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: 13,
                  outline: 'none',
                  marginBottom: 16,
                }}
              />
              <div style={{ ...bebas(10), color: '#666', marginBottom: 8 }}>Historique</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 200, overflowY: 'auto' }}>
                {selected.notesHistory.length === 0 && (
                  <div style={{ fontSize: 12, color: '#555' }}>Aucune note archivée pour cet élève.</div>
                )}
                {selected.notesHistory.map((n, i) => (
                  <div
                    key={i}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      border: `1px solid ${BORDER}`,
                      background: 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <div style={{ ...bebas(9), color: GOLD, marginBottom: 6 }}>{n.at}</div>
                    <div style={{ fontSize: 13, lineHeight: 1.5, color: '#ccc' }}>{n.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        </>
        ) : (
        <>
        <div style={{ flexShrink: 0, padding: isMobile ? '14px 16px' : '18px 22px', borderBottom: `1px solid ${BORDER}` }}>
          <SectionHeader title={navPanelTitle(navHint)} />
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? 16 : 22 }}>
          {navHint === 'vue' && (
            <>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? 'repeat(2, minmax(0, 1fr))' : 'repeat(4, minmax(0, 1fr))',
                  gap: 12,
                  marginBottom: 24,
                }}
              >
                {[
                  { label: 'Élèves actifs', value: String(globalStats.actifs), sub: 'hors inactifs' },
                  { label: 'Complétion moyenne', value: `${globalStats.meanCompletion}%`, sub: 'du programme' },
                  { label: 'Meilleur streak', value: `${globalStats.bestStreak} j`, sub: 'actuel' },
                  { label: "Nombre d'alertes", value: String(globalStats.nbAlertes), sub: 'à traiter' },
                ].map((m) => (
                  <div key={m.label} style={{ ...cardStyle(), padding: 16 }}>
                    <div style={{ ...bebas(9), color: '#666', marginBottom: 8 }}>{m.label}</div>
                    <div style={{ ...bebas(22), color: GOLD }}>{m.value}</div>
                    <div style={{ fontSize: 11, color: '#555', marginTop: 4 }}>{m.sub}</div>
                  </div>
                ))}
              </div>
              <SectionHeader title="Classement par streak" />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {globalStats.ranking.map((s, i) => (
                  <div
                    key={s.id}
                    style={{
                      ...cardStyle(),
                      padding: 14,
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: 12,
                      justifyContent: 'space-between',
                    }}
                  >
                    <span style={{ ...bebas(16), color: GOLD, minWidth: 28 }}>{i + 1}</span>
                    <span style={{ flex: 1, fontWeight: 500, minWidth: 120 }}>
                      {s.prenom} {s.nom}
                    </span>
                    <span style={{ ...bebas(12), color: GOLD }}>🔥 {s.streak} j</span>
                    <span style={{ ...bebas(10), color: '#888' }}>{badgeLabel(s.status)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {navHint === 'alertes' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {alertRows.length === 0 && (
                <div style={{ fontSize: 14, color: '#666' }}>Aucune alerte pour le moment.</div>
              )}
              {alertRows.map((row, idx) => (
                <div
                  key={`${row.student.id}-${row.type}-${idx}`}
                  style={{
                    ...cardStyle(),
                    padding: 16,
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#F0EDE8' }}>
                      {row.student.prenom} {row.student.nom}
                    </div>
                    <div style={{ ...bebas(10), color: GOLD, marginTop: 6 }}>{row.label}</div>
                    <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                      {row.days != null ? `${row.days} jour(s)` : '—'}
                    </div>
                  </div>
                  <a
                    href={waUrl(row.student.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ ...btnOutline(), textDecoration: 'none', display: 'inline-block' }}
                  >
                    WhatsApp
                  </a>
                </div>
              ))}
            </div>
          )}
          {navHint === 'msg' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {MOCK_STUDENTS.map((s) => {
                const initials = `${s.prenom[0]}${s.nom[0]}`.toUpperCase()
                return (
                  <div
                    key={s.id}
                    style={{
                      ...cardStyle(),
                      padding: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 10,
                          background: 'rgba(255,255,255,0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          ...bebas(11),
                          color: GOLD,
                          flexShrink: 0,
                        }}
                      >
                        {initials}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{s.prenom} {s.nom}</div>
                        <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
                          Dernière connexion : {formatLastSeen(s.lastConnectionDaysAgo)}
                        </div>
                      </div>
                    </div>
                    <a
                      href={waUrl(s.whatsapp)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ ...btnOutline(), textDecoration: 'none', display: 'inline-block' }}
                    >
                      WhatsApp
                    </a>
                  </div>
                )
              })}
            </div>
          )}
          {navHint === 'settings' && (
            <div style={{ maxWidth: 520 }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ ...bebas(10), color: '#666', marginBottom: 8 }}>Mot de passe coach</div>
                <input
                  type="text"
                  value={coachSettings.coachPassword}
                  onChange={(e) => setCoachSettings((prev) => ({ ...prev, coachPassword: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 8,
                    border: `1px solid ${BORDER_CARD}`,
                    background: 'rgba(255,255,255,0.03)',
                    color: '#F0EDE8',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ ...bebas(10), color: '#666', marginBottom: 8 }}>Date du prochain call</div>
                <input
                  type="date"
                  value={coachSettings.prochainCall}
                  onChange={(e) => setCoachSettings((prev) => ({ ...prev, prochainCall: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: 8,
                    border: `1px solid ${BORDER_CARD}`,
                    background: 'rgba(255,255,255,0.03)',
                    color: '#F0EDE8',
                    fontSize: 14,
                    outline: 'none',
                  }}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ ...bebas(10), color: '#666', marginBottom: 8 }}>Citation du mois</div>
                <textarea
                  value={coachSettings.citation}
                  onChange={(e) => setCoachSettings((prev) => ({ ...prev, citation: e.target.value }))}
                  rows={6}
                  style={{
                    width: '100%',
                    padding: 12,
                    borderRadius: 10,
                    border: `1px solid ${BORDER_CARD}`,
                    background: 'rgba(0,0,0,0.25)',
                    color: '#F0EDE8',
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 14,
                    outline: 'none',
                    resize: 'vertical',
                  }}
                />
              </div>
              <button
                type="button"
                onClick={saveCoachSettings}
                style={btnOutline()}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = GOLD
                  e.currentTarget.style.color = '#0D0D0D'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = GOLD
                }}
              >
                Sauvegarder
              </button>
            </div>
          )}
        </div>
        </>
        )}
      </main>
      )}

      {/* Bottom nav — mobile */}
      {isMobile && (
        <nav
          style={{
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around',
            alignItems: 'center',
            gap: 4,
            borderTop: `1px solid ${BORDER}`,
            background: 'rgba(13,13,13,0.96)',
            padding: '8px 10px calc(8px + env(safe-area-inset-bottom, 0px))',
            zIndex: 20,
          }}
        >
          {navBtn('eleves', '👥', 'Élèves', null, 'bottom')}
          {navBtn('vue', '📊', 'Vue globale', null, 'bottom')}
          {navBtn(
            'alertes',
            '🔔',
            'Alertes',
            alertsN > 0 ? (
              <span
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  minWidth: 14,
                  height: 14,
                  padding: '0 3px',
                  borderRadius: 7,
                  background: RED,
                  color: '#fff',
                  fontSize: 8,
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 600,
                  lineHeight: '14px',
                }}
              >
                {alertsN}
              </span>
            ) : null,
            'bottom'
          )}
          {navBtn('msg', '✉️', 'Messages', null, 'bottom')}
          {navBtn('settings', '⚙️', 'Paramètres', null, 'bottom')}
        </nav>
      )}
    </div>
  )
}
