import { useState, useEffect, useRef } from 'react'
import config from '../config'

export default function Step5Dashboard({ clientData }) {
  const prenom = clientData?.infos?.prenom || 'Membre'
  const now = new Date()
  const mois = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre']
  const [countdown, setCountdown] = useState({d:'--',h:'--',m:'--',s:'--'})
  const [calYear, setCalYear] = useState(now.getFullYear())
  const [calMonth, setCalMonth] = useState(now.getMonth())
  const [doneDays, setDoneDays] = useState(new Set())
  const [todoTab, setTodoTab] = useState('semaine')
  const [todos, setTodos] = useState({
    mois: [{t:'Définir mon offre principale',done:false},{t:'Créer ma page de vente',done:false}],
    semaine: [{t:'Session deep work 9h-11h',done:true},{t:'Relire les notes du call',done:false},{t:'30 min de prospection',done:false}],
    daily: [{t:'Méditation 10 min',done:false},{t:'Lecture 20 min',done:true}]
  })
  const [routines, setRoutines] = useState({
    matin: [{n:'Réveil 6h00',streak:'5j',done:true},{n:'Douche froide',streak:'3j',done:false},{n:'Lecture 20 min',streak:'7j',done:true},{n:'Pompes 50',streak:'2j',done:false}],
    soir: [{n:'Revue du jour',streak:'4j',done:false},{n:'Gratitude',streak:'6j',done:true},{n:'Pas d\'écran 22h',streak:'2j',done:false},{n:'Lecture 20 min',streak:'5j',done:true}]
  })
  const [notes, setNotes] = useState('')
  const [pomoSec, setPomoSec] = useState(25*60)
  const [pomoTotal] = useState(25*60)
  const [pomoRunning, setPomoRunning] = useState(false)
  const [pomoPhase, setPomoPhase] = useState('focus')
  const [pomoSess, setPomoSess] = useState(1)
  const [pomoVals, setPomoVals] = useState({f:25,s:5,l:15})
  const pomoRef = useRef(null)
  const [newTodo, setNewTodo] = useState('')

  // COUNTDOWN
  useEffect(() => {
    const tick = () => {
      const target = new Date(config.prochain_call.date)
      const diff = target - new Date()
      if (diff < 0) return
      setCountdown({
        d: String(Math.floor(diff/86400000)).padStart(2,'0'),
        h: String(Math.floor(diff%86400000/3600000)).padStart(2,'0'),
        m: String(Math.floor(diff%3600000/60000)).padStart(2,'0'),
        s: String(Math.floor(diff%60000/1000)).padStart(2,'0')
      })
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  // POMODORO
  useEffect(() => {
    if (pomoRunning) {
      pomoRef.current = setInterval(() => {
        setPomoSec(s => {
          if (s <= 1) {
            clearInterval(pomoRef.current)
            setPomoRunning(false)
            return 0
          }
          return s - 1
        })
      }, 1000)
    } else {
      clearInterval(pomoRef.current)
    }
    return () => clearInterval(pomoRef.current)
  }, [pomoRunning])

  const pomoTime = `${String(Math.floor(pomoSec/60)).padStart(2,'0')}:${String(pomoSec%60).padStart(2,'0')}`
  const pomoProg = 465 * (1 - pomoSec / (pomoVals[pomoPhase === 'focus' ? 'f' : pomoPhase === 'short' ? 's' : 'l'] * 60))

  const DN = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']
  const firstDay = new Date(calYear, calMonth, 1).getDay()
  const offset = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  const isCurMonth = calMonth === now.getMonth() && calYear === now.getFullYear()

  const s = {
    card: { background:'#111', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'14px', overflow:'hidden' },
    sHead: { display:'flex', alignItems:'center', gap:'16px', marginBottom:'20px' },
    sTitle: { fontFamily:"'Bebas Neue', sans-serif", fontSize:'18px', letterSpacing:'4px', color:'#F0EDE8' },
    sLine: { flex:1, height:'1px', background:'linear-gradient(to right,rgba(201,164,74,0.25),transparent)' },
    sBtn: { fontFamily:"'Bebas Neue', sans-serif", fontSize:'9px', letterSpacing:'2px', color:'#555', background:'transparent', border:'1px solid rgba(255,255,255,0.08)', padding:'7px 14px', cursor:'pointer', borderRadius:'6px' },
    sBtnG: { fontFamily:"'Bebas Neue', sans-serif", fontSize:'9px', letterSpacing:'2px', color:'#C9A44A', background:'transparent', border:'1px solid rgba(201,164,74,0.35)', padding:'7px 14px', cursor:'pointer', borderRadius:'6px' },
    label: { fontFamily:"'Bebas Neue', sans-serif", fontSize:'9px', letterSpacing:'4px', color:'#C9A44A', marginBottom:'12px', display:'flex', alignItems:'center', gap:'10px' },
  }

  return (
    <div style={{ minHeight:'100vh', padding:'100px 40px 80px', maxWidth:'1080px', margin:'0 auto' }}>

      {/* HERO */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr auto', alignItems:'end', paddingBottom:'56px', borderBottom:'1px solid rgba(201,164,74,0.1)', marginBottom:'72px' }}>
        <div>
          <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'11px', letterSpacing:'5px', color:'#C9A44A', display:'block', marginBottom:'14px' }}>Gentleman Létal Club</span>
          <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'clamp(52px,7vw,80px)', letterSpacing:'4px', color:'#F0EDE8', lineHeight:.95 }}>
            {mois[now.getMonth()].toUpperCase()} <span style={{color:'#C9A44A'}}>{now.getFullYear()}</span>
          </div>
          <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'12px', letterSpacing:'4px', color:'#555', display:'block', marginTop:'14px' }}>{config.tagline}</span>
        </div>
        <div style={{ textAlign:'right' }}>
          <div style={{ display:'inline-block', border:'1px solid rgba(201,164,74,0.35)', padding:'8px 18px', fontFamily:"'Bebas Neue', sans-serif", fontSize:'11px', letterSpacing:'3px', color:'#C9A44A', background:'rgba(201,164,74,0.05)', marginBottom:'10px' }}>Semaine 1 — Initié</div>
          <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'15px', letterSpacing:'3px', color:'#555' }}>{prenom}</div>
        </div>
      </div>

      {/* COUNTDOWN */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'1px', background:'rgba(201,164,74,0.08)', border:'1px solid rgba(201,164,74,0.1)', marginBottom:'72px' }}>
        {[['d','Jours'],['h','Heures'],['m','Minutes'],['s','Secondes']].map(([k,l]) => (
          <div key={k} style={{ background:'#0D0D0D', padding:'32px 20px', textAlign:'center' }}>
            <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'52px', letterSpacing:'2px', color:'#F0EDE8', display:'block', lineHeight:1 }}>{countdown[k]}</span>
            <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'9px', letterSpacing:'4px', color:'#555', marginTop:'6px', display:'block' }}>{l}</span>
          </div>
        ))}
      </div>

      {/* STATS */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px', marginBottom:'72px' }}>
        {[['🔥','0','Streak actuel'],['✓',String(doneDays.size),'Jours complétés'],['◎',String(Math.max(0,daysInMonth-now.getDate())),'Jours restants'],['△','#9','Rang GLC']].map(([icon,val,lbl]) => (
          <div key={lbl} style={{ padding:'28px 22px', background:'#161616', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'12px' }}>
            <span style={{ fontSize:'18px', marginBottom:'12px', display:'block', opacity:.8 }}>{icon}</span>
            <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'40px', letterSpacing:'2px', color:'#F0EDE8', display:'block', marginBottom:'5px' }}>{val}</span>
            <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'9px', letterSpacing:'3px', color:'#555' }}>{lbl}</span>
          </div>
        ))}
      </div>

      {/* CITATION */}
      <div style={{ textAlign:'center', padding:'64px 0', borderTop:'1px solid rgba(255,255,255,0.04)', borderBottom:'1px solid rgba(255,255,255,0.04)', marginBottom:'72px' }}>
        <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'clamp(22px,3.5vw,36px)', letterSpacing:'3px', color:'#C9A44A', lineHeight:1.3, maxWidth:'680px', margin:'0 auto 14px' }}>"{config.citation}"</div>
        <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'10px', letterSpacing:'4px', color:'#444' }}>— {config.citation_auteur}</div>
      </div>

      {/* CALENDRIER */}
      <div style={{ marginBottom:'64px' }}>
        <div style={s.sHead}>
          <span style={{ fontSize:'16px' }}>📅</span>
          <span style={s.sTitle}>Calendrier</span>
          <div style={s.sLine}></div>
          <button style={s.sBtnG}>+ Événement</button>
        </div>
        <div style={s.card}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'20px 28px', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
            <button onClick={() => { if(calMonth===0){setCalMonth(11);setCalYear(y=>y-1)}else setCalMonth(m=>m-1) }} style={{ width:'30px', height:'30px', background:'#1A1A1A', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'6px', color:'#555', cursor:'pointer', fontSize:'13px' }}>‹</button>
            <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'18px', letterSpacing:'4px', color:'#F0EDE8' }}>{mois[calMonth].toUpperCase()} {calYear}</div>
            <button onClick={() => { if(calMonth===11){setCalMonth(0);setCalYear(y=>y+1)}else setCalMonth(m=>m+1) }} style={{ width:'30px', height:'30px', background:'#1A1A1A', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'6px', color:'#555', cursor:'pointer', fontSize:'13px' }}>›</button>
          </div>
          <div style={{ padding:'12px 16px 20px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'6px', marginBottom:'6px' }}>
              {DN.map(d => <div key={d} style={{ textAlign:'center', fontFamily:"'Bebas Neue', sans-serif", fontSize:'9px', letterSpacing:'3px', color:'#444', padding:'6px 0' }}>{d}</div>)}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'6px' }}>
              {Array(offset).fill(null).map((_,i) => <div key={`e${i}`} />)}
              {Array(daysInMonth).fill(null).map((_,i) => {
                const d = i+1
                const isToday = isCurMonth && d === now.getDate()
                const isDone = doneDays.has(`${calYear}-${calMonth}-${d}`)
                return (
                  <div key={d} onClick={() => {
                    if (isToday) return
                    const key = `${calYear}-${calMonth}-${d}`
                    setDoneDays(prev => { const n = new Set(prev); isDone ? n.delete(key) : n.add(key); return n })
                  }} style={{
                    aspectRatio:'1', borderRadius:'10px',
                    border: isToday ? '1px solid rgba(201,164,74,0.5)' : isDone ? '1px solid rgba(45,106,53,0.4)' : '1px solid rgba(255,255,255,0.04)',
                    background: isToday ? 'rgba(201,164,74,0.07)' : isDone ? 'rgba(45,106,53,0.18)' : 'rgba(255,255,255,0.01)',
                    display:'flex', flexDirection:'column', alignItems:'flex-start', justifyContent:'space-between',
                    padding:'8px 10px', cursor: isToday ? 'default' : 'pointer', position:'relative', transition:'all .2s'
                  }}>
                    <div style={{ display:'flex', justifyContent:'space-between', width:'100%' }}>
                      <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'13px', color: isToday ? '#C9A44A' : isDone ? '#4ade80' : '#888' }}>{d}</span>
                      {isDone && <div style={{ width:'14px', height:'14px', borderRadius:'50%', background:'#2d6a35', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <svg width="7" height="7" viewBox="0 0 10 10"><polyline points="1,5 4,8 9,2" fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round"/></svg>
                      </div>}
                    </div>
                    {config.evenements[d] && <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'7px', letterSpacing:'1px', color: isToday ? 'rgba(201,164,74,0.7)' : '#444', lineHeight:1.2 }}>{config.evenements[d]}</div>}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* OBJECTIFS */}
      <div style={{ marginBottom:'64px' }}>
        <div style={s.sHead}>
          <span style={{ fontSize:'16px' }}>🎯</span>
          <span style={s.sTitle}>Objectifs</span>
          <div style={s.sLine}></div>
          <button style={s.sBtn}>Modifier</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          {[
            ['État des lieux', clientData?.questionnaire?.[0]?.text || 'Complète le questionnaire pour voir tes réponses ici.'],
            ['Ce que tu veux vraiment', clientData?.questionnaire?.[4]?.text || 'Complète le questionnaire pour voir tes réponses ici.'],
            ['Mes blocages', clientData?.questionnaire?.[6]?.text || 'Complète le questionnaire pour voir tes réponses ici.'],
            ['Mes ressources', clientData?.questionnaire?.[9]?.text || 'Complète le questionnaire pour voir tes réponses ici.'],
          ].map(([lbl, txt]) => (
            <div key={lbl} style={{ ...s.card, padding:'28px' }}>
              <div style={{ ...s.label }}>{lbl}<div style={{ flex:1, height:'1px', background:'rgba(201,164,74,0.15)' }}></div></div>
              <div style={{ fontSize:'13px', fontWeight:300, color:'#F0EDE8', lineHeight:1.8 }}>{txt}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ENGAGEMENTS */}
      <div style={{ marginBottom:'64px' }}>
        <div style={s.sHead}>
          <span style={{ fontSize:'16px' }}>⚔️</span>
          <span style={s.sTitle}>Engagements</span>
          <div style={s.sLine}></div>
        </div>
        <div style={s.card}>
          {['Être présent à chaque call de groupe sans exception','Compléter mes routines quotidiennes 6 jours sur 7','Être honnête sur mes blocages et demander de l\'aide','Livrer mes objectifs hebdomadaires chaque dimanche soir'].map((txt, i) => (
            <div key={i} style={{ display:'grid', gridTemplateColumns:'52px 1fr', borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
              <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'28px', color:'rgba(201,164,74,0.12)', padding:'24px 0 24px 8px', lineHeight:1, borderRight:'1px solid rgba(255,255,255,0.04)' }}>0{i+1}</div>
              <div style={{ fontSize:'14px', fontWeight:300, color:'#F0EDE8', padding:'24px', lineHeight:1.6 }}>{txt}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TODO */}
      <div style={{ marginBottom:'64px' }}>
        <div style={s.sHead}>
          <span style={{ fontSize:'16px' }}>📋</span>
          <span style={s.sTitle}>To-Do</span>
          <div style={s.sLine}></div>
          <button style={s.sBtnG}>+ Ajouter</button>
        </div>
        <div style={s.card}>
          <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,0.04)', padding:'4px 12px 0' }}>
            {[['mois','Mois'],['semaine','Semaine'],['daily','Aujourd\'hui']].map(([k,l]) => (
              <button key={k} onClick={() => setTodoTab(k)} style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'10px', letterSpacing:'3px', color: todoTab===k ? '#C9A44A' : '#444', background:'transparent', border:'none', borderBottom: todoTab===k ? '2px solid #C9A44A' : '2px solid transparent', padding:'12px 16px', cursor:'pointer', marginBottom:'-1px' }}>{l}</button>
            ))}
          </div>
          <div>
            {todos[todoTab].map((t, i) => (
              <div key={i} onClick={() => setTodos(prev => ({ ...prev, [todoTab]: prev[todoTab].map((x,j) => j===i ? {...x,done:!x.done} : x) }))} style={{ display:'flex', alignItems:'center', gap:'16px', padding:'16px 24px', borderBottom:'1px solid rgba(255,255,255,0.03)', cursor:'pointer' }}>
                <div style={{ width:'18px', height:'18px', border:`1.5px solid ${t.done ? '#C9A44A' : 'rgba(255,255,255,0.12)'}`, borderRadius:'5px', background: t.done ? '#C9A44A' : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .2s' }}>
                  {t.done && <svg width="9" height="9" viewBox="0 0 10 10"><polyline points="1,5 4,8 9,2" fill="none" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round"/></svg>}
                </div>
                <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'13px', letterSpacing:'2px', color: t.done ? '#444' : '#F0EDE8', textDecoration: t.done ? 'line-through' : 'none', transition:'all .2s' }}>{t.t}</span>
              </div>
            ))}
            <div style={{ display:'flex', gap:'8px', padding:'12px 24px', borderTop:'1px solid rgba(255,255,255,0.03)' }}>
              <input value={newTodo} onChange={e => setNewTodo(e.target.value)} onKeyDown={e => { if(e.key==='Enter' && newTodo.trim()){ setTodos(prev=>({...prev,[todoTab]:[...prev[todoTab],{t:newTodo.trim(),done:false}]})); setNewTodo('') }}} placeholder="+ Nouvelle tâche (Entrée pour valider)" style={{ flex:1, background:'transparent', border:'none', color:'#444', fontFamily:"'Bebas Neue', sans-serif", fontSize:'10px', letterSpacing:'2px', outline:'none' }} />
            </div>
          </div>
        </div>
      </div>

      {/* HABITUDES */}
      <div style={{ marginBottom:'64px' }}>
        <div style={s.sHead}>
          <span style={{ fontSize:'16px' }}>💪</span>
          <span style={s.sTitle}>Habitudes</span>
          <div style={s.sLine}></div>
          <button style={s.sBtn}>Modifier</button>
          <button style={s.sBtnG}>+ Ajouter</button>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
          {['matin','soir'].map(period => (
            <div key={period} style={s.card}>
              <div style={{ padding:'16px 24px', fontFamily:"'Bebas Neue', sans-serif", fontSize:'10px', letterSpacing:'4px', color:'#555', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>{period.toUpperCase()}</div>
              {routines[period].map((r, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 24px', borderBottom: i < routines[period].length-1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                  <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'12px', letterSpacing:'2px', color:'#F0EDE8' }}>{r.n}</span>
                  <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'10px', color:'#C9A44A', opacity:.6 }}>{r.streak}</span>
                    <div onClick={() => setRoutines(prev => ({ ...prev, [period]: prev[period].map((x,j) => j===i ? {...x,done:!x.done} : x) }))} style={{ width:'26px', height:'26px', border:`1.5px solid ${r.done ? '#C9A44A' : 'rgba(255,255,255,0.1)'}`, borderRadius:'8px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', background: r.done ? '#C9A44A' : 'transparent', transition:'all .2s' }}>
                      {r.done && <svg width="9" height="9" viewBox="0 0 10 10"><polyline points="1,5 4,8 9,2" fill="none" stroke="#0D0D0D" strokeWidth="2" strokeLinecap="round"/></svg>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* POMODORO */}
      <div style={{ marginBottom:'64px' }}>
        <div style={s.sHead}>
          <span style={{ fontSize:'16px' }}>⏱</span>
          <span style={s.sTitle}>Pomodoro</span>
          <div style={s.sLine}></div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 240px', gap:'12px' }}>
          <div style={{ ...s.card, padding:'40px 32px', textAlign:'center' }}>
            <div style={{ display:'flex', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'8px', overflow:'hidden', marginBottom:'32px' }}>
              {[['focus','Focus'],['short','Pause courte'],['long','Pause longue']].map(([k,l]) => (
                <button key={k} onClick={() => { setPomoPhase(k); setPomoRunning(false); setPomoSec((k==='focus'?pomoVals.f:k==='short'?pomoVals.s:pomoVals.l)*60) }} style={{ flex:1, fontFamily:"'Bebas Neue', sans-serif", fontSize:'9px', letterSpacing:'2px', color: pomoPhase===k ? '#C9A44A' : '#555', background: pomoPhase===k ? 'rgba(201,164,74,0.1)' : 'transparent', border:'none', padding:'10px 4px', cursor:'pointer' }}>{l}</button>
              ))}
            </div>
            <div style={{ position:'relative', width:'170px', height:'170px', margin:'0 auto 20px' }}>
              <svg width="170" height="170" viewBox="0 0 170 170" style={{ position:'absolute', inset:0, transform:'rotate(-90deg)' }}>
                <circle cx="85" cy="85" r="74" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="3"/>
                <circle cx="85" cy="85" r="74" fill="none" stroke="#C9A44A" strokeWidth="3" strokeLinecap="round" strokeDasharray="465" strokeDashoffset={pomoProg}/>
              </svg>
              <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'44px', letterSpacing:'3px', color:'#F0EDE8' }}>{pomoTime}</div>
                <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'9px', letterSpacing:'3px', color:'#555', marginTop:'2px' }}>{pomoPhase.toUpperCase()}</div>
              </div>
            </div>
            <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'10px', letterSpacing:'2px', color:'#C9A44A', marginBottom:'20px', opacity:.7 }}>Session {pomoSess} / 4</div>
            <div style={{ display:'flex', gap:'8px', justifyContent:'center', marginBottom:'18px' }}>
              <button onClick={() => setPomoRunning(r => !r)} style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'10px', letterSpacing:'2px', padding:'11px 22px', background:'#C9A44A', border:'1px solid #C9A44A', color:'#0D0D0D', cursor:'pointer', borderRadius:'8px' }}>{pomoRunning ? '⏸ Pause' : '▶ Démarrer'}</button>
              <button onClick={() => { setPomoRunning(false); setPomoSec((pomoPhase==='focus'?pomoVals.f:pomoPhase==='short'?pomoVals.s:pomoVals.l)*60) }} style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'10px', letterSpacing:'2px', padding:'11px 18px', background:'transparent', border:'1px solid rgba(255,255,255,0.06)', color:'#555', cursor:'pointer', borderRadius:'8px' }}>↺</button>
              <button onClick={() => { setPomoRunning(false); setPomoSess(s => Math.min(s+1,4)) }} style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'10px', letterSpacing:'2px', padding:'11px 18px', background:'transparent', border:'1px solid rgba(255,255,255,0.06)', color:'#555', cursor:'pointer', borderRadius:'8px' }}>⏭</button>
            </div>
            <div style={{ display:'flex', gap:'6px', justifyContent:'center' }}>
              {Array(4).fill(null).map((_,i) => <div key={i} style={{ width:'6px', height:'6px', borderRadius:'50%', background: i < pomoSess ? '#C9A44A' : '#1A1A1A', border:'1px solid rgba(255,255,255,0.06)' }} />)}
            </div>
          </div>
          <div style={{ ...s.card, padding:'28px', display:'flex', flexDirection:'column', gap:'24px' }}>
            {[['f','Focus (min)'],['s','Pause courte'],['l','Pause longue']].map(([k,l]) => (
              <div key={k}>
                <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'9px', letterSpacing:'3px', color:'#555', marginBottom:'8px' }}>{l}</div>
                <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
                  <button onClick={() => setPomoVals(v => ({...v,[k]:Math.max(1,v[k]-1)})) } style={{ width:'26px', height:'26px', background:'#1A1A1A', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'6px', color:'#555', cursor:'pointer', fontSize:'13px' }}>−</button>
                  <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'20px', color:'#F0EDE8', minWidth:'28px', textAlign:'center' }}>{pomoVals[k]}</div>
                  <button onClick={() => setPomoVals(v => ({...v,[k]:v[k]+1}))} style={{ width:'26px', height:'26px', background:'#1A1A1A', border:'1px solid rgba(255,255,255,0.06)', borderRadius:'6px', color:'#555', cursor:'pointer', fontSize:'13px' }}>+</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NOTES */}
      <div style={{ marginBottom:'64px' }}>
        <div style={s.sHead}>
          <span style={{ fontSize:'16px' }}>✏️</span>
          <span style={s.sTitle}>Notes personnelles</span>
          <div style={s.sLine}></div>
        </div>
        <div style={s.card}>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Tes réflexions, insights, ce qui émerge pendant le programme..." style={{ width:'100%', background:'transparent', border:'none', color:'#F0EDE8', fontFamily:"'Inter', sans-serif", fontSize:'14px', fontWeight:300, padding:'28px', resize:'none', outline:'none', lineHeight:1.9, minHeight:'180px' }} />
        </div>
      </div>

      {/* RESSOURCES */}
      <div style={{ marginBottom:'64px' }}>
        <div style={s.sHead}>
          <span style={{ fontSize:'16px' }}>🔗</span>
          <span style={s.sTitle}>Ressources & documents</span>
          <div style={s.sLine}></div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
          <div style={s.card}>
            <div style={{ padding:'16px 22px', fontFamily:"'Bebas Neue', sans-serif", fontSize:'10px', letterSpacing:'4px', color:'#555', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>Communauté</div>
            {config.ressources.communaute.map(r => (
              <a key={r.label} href={r.url} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'15px 22px', borderBottom:'1px solid rgba(255,255,255,0.03)', textDecoration:'none' }}>
                <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'12px', letterSpacing:'2px', color:'#F0EDE8' }}>{r.label}</span>
                <span style={{ fontSize:'12px', color:'#444' }}>↗</span>
              </a>
            ))}
          </div>
          <div style={s.card}>
            <div style={{ padding:'16px 22px', fontFamily:"'Bebas Neue', sans-serif", fontSize:'10px', letterSpacing:'4px', color:'#555', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>Mon contrat</div>
            <div style={{ padding:'22px' }}>
              <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'9px', letterSpacing:'3px', color:'#C9A44A', opacity:.7, marginBottom:'6px' }}>Signé le {clientData?.signatureDate || '—'}</div>
              <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'18px', letterSpacing:'3px', color:'#F0EDE8', marginBottom:'3px' }}>{clientData?.infos?.prenom || ''} {clientData?.infos?.nom || ''}</div>
              <div style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'9px', letterSpacing:'2px', color:'#555', marginBottom:'18px' }}>Gentleman Létal Club — {config.programme}</div>
              <button style={{ width:'100%', padding:'11px', background:'transparent', border:'1px solid rgba(201,164,74,0.3)', borderRadius:'8px', color:'#C9A44A', fontFamily:"'Bebas Neue', sans-serif", fontSize:'10px', letterSpacing:'3px', cursor:'pointer' }}>Télécharger</button>
            </div>
          </div>
          <div style={s.card}>
            <div style={{ padding:'16px 22px', fontFamily:"'Bebas Neue', sans-serif", fontSize:'10px', letterSpacing:'4px', color:'#555', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>Ressources</div>
            {config.ressources.programme.map(r => (
              <a key={r.label} href={r.url} target="_blank" rel="noreferrer" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'15px 22px', borderBottom:'1px solid rgba(255,255,255,0.03)', textDecoration:'none' }}>
                <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'12px', letterSpacing:'2px', color:'#F0EDE8' }}>{r.label}</span>
                <span style={{ fontSize:'12px', color:'#444' }}>↗</span>
              </a>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}