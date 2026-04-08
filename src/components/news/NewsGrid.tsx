import { useState, useEffect } from 'react'
import type { NewsItem } from '@/api/news'

// Placeholder gradient thumbnails by topic
function TopicColor(title: string, game: string): string {
  const t = title.toLowerCase()
  const g = game === 'cs' ? '#f0b429' : '#c84b31'
  if (t.includes('patch') || t.includes('update')) return '#38a169'
  if (t.includes('major') || t.includes('tournament') || t.includes('ti')) return '#805ad5'
  if (t.includes('hero')) return '#3182ce'
  return g
}

interface NewsGridProps {
  // Mode 1: self-fetching
  fetcher?: () => Promise<NewsItem[]>
  game?: string
  count?: number
  accentColor?: string
  homeUrl?: string
  // Mode 2: controlled
  items?: NewsItem[]
  isLoading?: boolean
  error?: unknown
}

export function NewsGrid({ fetcher, game = 'dota', count = 6, accentColor, homeUrl, items: controlledItems, isLoading: controlledLoading, error: controlledError }: NewsGridProps) {
  const [items, setItems] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(fetcher ? true : false)
  const [err, setErr] = useState(false)

  useEffect(() => {
    if (!fetcher) return
    let dead = false
    setLoading(true); setErr(false)
    fetcher().then(d => { if (!dead) { setItems(d); setLoading(false) } })
             .catch(() => { if (!dead) { setErr(true); setLoading(false) } })
    return () => { dead = true }
  }, [fetcher])

  const displayItems = fetcher ? items : (controlledItems ?? [])
  const isLoading = fetcher ? loading : (controlledLoading ?? false)
  const isError   = fetcher ? err : !!controlledError
  const accent    = accentColor || (game === 'cs' ? '#f0b429' : '#c84b31')
  const displayCount = Math.min(count, displayItems.length)

  if (isLoading) return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
      {[...Array(count)].map((_,i) => (
        <div key={i} style={{ height:240, background:'var(--bg-2)', border:'1px solid var(--border-1)', borderRadius:12, overflow:'hidden', animation:'pulse 1.5s infinite' }}>
          <div style={{ height:140, background:'var(--bg-3)' }} />
          <div style={{ padding:14 }}>
            <div style={{ height:12, background:'var(--bg-3)', borderRadius:4, marginBottom:8, width:'80%' }} />
            <div style={{ height:10, background:'var(--bg-3)', borderRadius:4, width:'60%' }} />
          </div>
        </div>
      ))}
    </div>
  )

  if (isError) return (
    <div style={{ padding:'30px 0', textAlign:'center', color:'var(--text-3)', fontFamily:'var(--font-mono)', fontSize:12 }}>
      ⚠️ Failed to load news
      {homeUrl && <> · <a href={homeUrl} target="_blank" rel="noopener noreferrer" style={{ color:accent }}>open directly</a></>}
    </div>
  )

  if (displayItems.length === 0) return (
    <div style={{ padding:'30px 0', textAlign:'center', color:'var(--text-3)', fontFamily:'var(--font-mono)', fontSize:12 }}>
      // no news yet
    </div>
  )

  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:16 }}>
      {displayItems.slice(0, displayCount).map(item => (
        <NewsCard key={item.id} item={item} accent={accent} game={game} />
      ))}
    </div>
  )
}

function NewsCard({ item, accent, game }: { item: NewsItem; accent: string; game: string }) {
  const [thumbOk, setThumbOk] = useState(true)
  const topicColor = TopicColor(item.title, game)

  const ago = (() => {
    const d = (Date.now() - item.date.getTime()) / 1000
    if (d < 3600) return `${Math.floor(d/60)}m ago`
    if (d < 86400) return `${Math.floor(d/3600)}h ago`
    return `${Math.floor(d/86400)}d ago`
  })()

  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none', display:'block' }}
      onMouseEnter={e => { const el = e.currentTarget; el.style.transform='translateY(-3px)'; el.style.boxShadow=`0 8px 25px ${accent}20` }}
      onMouseLeave={e => { const el = e.currentTarget; el.style.transform='translateY(0)'; el.style.boxShadow='none' }}
    >
      <div style={{ background:'var(--bg-2)', border:'1px solid var(--border-1)', borderRadius:12, overflow:'hidden', transition:'transform 0.18s, box-shadow 0.18s, border-color 0.18s', height:'100%' }}
        onMouseEnter={e => (e.currentTarget.style.borderColor=`${accent}40`)}
        onMouseLeave={e => (e.currentTarget.style.borderColor='var(--border-1)')}
      >
        {/* Thumbnail */}
        <div style={{ height:150, overflow:'hidden', position:'relative', background:`linear-gradient(135deg, ${topicColor}20, var(--bg-4))` }}>
          {item.thumbnail && thumbOk ? (
            <img src={item.thumbnail} alt={item.title}
              style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.3s' }}
              onError={() => setThumbOk(false)}
              onMouseEnter={e => (e.currentTarget.style.transform='scale(1.05)')}
              onMouseLeave={e => (e.currentTarget.style.transform='scale(1)')}
            />
          ) : (
            /* Decorative fallback */
            <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:8 }}>
              <div style={{ fontSize:40 }}>{game==='cs'?'🔫':'⚔️'}</div>
              <div style={{ fontFamily:'var(--font-display)', fontSize:11, color:accent, opacity:0.6, letterSpacing:'0.1em' }}>
                {game==='cs'?'CS2':'DOTA 2'} NEWS
              </div>
            </div>
          )}
          {/* Source badge */}
          <div style={{ position:'absolute', bottom:8, right:8, fontSize:8, padding:'2px 7px', borderRadius:4, background:'rgba(0,0,0,0.7)', color:'#fff', fontFamily:'var(--font-mono)', letterSpacing:'0.06em', backdropFilter:'blur(4px)' }}>
            {item.source?.toUpperCase() || 'STEAM'}
          </div>
          {/* Time badge */}
          <div style={{ position:'absolute', top:8, left:8, fontSize:9, padding:'2px 7px', borderRadius:4, background:'rgba(0,0,0,0.65)', color:'var(--text-2)', fontFamily:'var(--font-mono)', backdropFilter:'blur(4px)' }}>
            {ago}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding:'12px 14px' }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:13, fontWeight:600, color:'var(--text-0)', lineHeight:1.4, marginBottom:8, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as any, overflow:'hidden' }}>
            {item.title}
          </div>
          <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-3)', lineHeight:1.5, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as any, overflow:'hidden' }}>
            {item.summary}
          </div>
          <div style={{ marginTop:10, fontSize:10, color:accent, fontFamily:'var(--font-mono)', fontWeight:700 }}>
            Read →
          </div>
        </div>
      </div>
    </a>
  )
}
