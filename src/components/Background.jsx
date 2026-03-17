import { useEffect, useRef } from 'react'

export default function Background() {
  const particlesRef = useRef(null)
  const noiseRef = useRef(null)

  useEffect(() => {
    const pc = particlesRef.current
    const px = pc.getContext('2d')
    let pts = [], W, H, animId

    function rsz() {
      W = pc.width = window.innerWidth
      H = pc.height = document.body.scrollHeight || window.innerHeight
    }

    function initPts() {
      pts = []
      for (let i = 0; i < 90; i++) {
        pts.push({
          x: Math.random() * W, y: Math.random() * H,
          vx: (Math.random() - .5) * .22, vy: (Math.random() - .5) * .22,
          r: Math.random() * 1.1 + .3
        })
      }
    }

    function draw() {
      px.fillStyle = '#0D0D0D'
      px.fillRect(0, 0, W, H)
      pts.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy
        if (p.x < 0 || p.x > W) p.vx *= -1
        if (p.y < 0 || p.y > H) p.vy *= -1
        px.beginPath()
        px.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        px.fillStyle = 'rgba(201,164,74,0.55)'
        px.fill()
        pts.forEach((q, j) => {
          if (j <= i) return
          const dx = p.x - q.x, dy = p.y - q.y
          const d = Math.sqrt(dx * dx + dy * dy)
          if (d < 120) {
            px.beginPath()
            px.moveTo(p.x, p.y)
            px.lineTo(q.x, q.y)
            px.strokeStyle = `rgba(201,164,74,${.13 * (1 - d / 120)})`
            px.lineWidth = .5
            px.stroke()
          }
        })
      })
      animId = requestAnimationFrame(draw)
    }

    rsz(); initPts(); draw()
    window.addEventListener('resize', () => { rsz(); initPts() })

    // NOISE
    const nc = noiseRef.current
    const nx = nc.getContext('2d')
    let noiseId

    function buildNoise() {
      nc.width = window.innerWidth
      nc.height = window.innerHeight
      const id = nx.createImageData(nc.width, nc.height)
      const d = id.data
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() * 255
        d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255
      }
      nx.putImageData(id, 0, 0)
      noiseId = setTimeout(buildNoise, 80)
    }
    buildNoise()

    return () => {
      cancelAnimationFrame(animId)
      clearTimeout(noiseId)
    }
  }, [])

  return (
    <>
      <canvas ref={particlesRef} style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none'
      }} />
      <canvas ref={noiseRef} style={{
        position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none', opacity: .04
      }} />
    </>
  )
}