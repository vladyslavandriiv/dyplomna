import { useState, useEffect, useRef } from 'react'
import type { ProPlayer } from '@/types'

function initials(nick: string) {
  return nick.replace(/[^a-zA-Z0-9]/g, '').slice(0, 2).toUpperCase() || '??'
}
function initialsColor(nick: string) {
  const colors = ['#c84b31','#3182ce','#38a169','#805ad5','#d69e2e','#dd6b20','#e53e3e','#319795']
  let h = 0
  for (let i = 0; i < nick.length; i++) h = (h * 31 + nick.charCodeAt(i)) & 0xffff
  return colors[h % colors.length]
}

// Cache so we don't re-fetch on every render
const avatarCache = new Map<string, string>()

// Fetch real avatar from OpenDota → returns Steam CDN URL, no CORS issues
async function fetchAvatar(accountId: number): Promise<string | null> {
  const cacheKey = String(accountId)
  if (avatarCache.has(cacheKey)) return avatarCache.get(cacheKey)!
  try {
    const r = await fetch(`https://api.opendota.com/api/players/${accountId}`, {
      signal: AbortSignal.timeout ? AbortSignal.timeout(8000) : (() => {
        const c = new AbortController(); setTimeout(() => c.abort(), 8000); return c.signal
      })()
    })
    if (!r.ok) return null
    const j = await r.json()
    const url: string | undefined = j?.profile?.avatarfull
    if (url && url.startsWith('http')) {
      avatarCache.set(cacheKey, url)
      return url
    }
  } catch { /* ignore */ }
  return null
}

function steam64toAccountId(steam64: string): number | null {
  try { return Number(BigInt(steam64) - BigInt('76561197960265728')) }
  catch { return null }
}

const LINK_ICON: Record<string, string> = {
  TWITTER: '𝕏', TWITCH: '📺', STEAM: '🎮', FACEIT: '⚡', YOUTUBE: '▶️',
  HLTV: '🎯', DOTABUFF: '📊', OPENDOTA: '🔭', LIQUIPEDIA: '📖', LIQUIDPEDIA: '📖',
}
const LINK_COLOR: Record<string, string> = {
  TWITTER: '#1da1f2', TWITCH: '#9146ff', STEAM: '#9aa8b2', FACEIT: '#ff5500',
  YOUTUBE: '#ff0000', HLTV: '#ff8c00', DOTABUFF: '#e84057', OPENDOTA: '#63b3ed',
  LIQUIPEDIA: '#4caf50', LIQUIDPEDIA: '#4caf50',
}

export function ProCard({ p }: { p: ProPlayer }) {
  const [avatar, setAvatar] = useState<string | null>(null)
  const [imgFailed, setImgFailed] = useState(false)
  const [loading, setLoading] = useState(true)
  const [hovLink, setHovLink] = useState<string | null>(null)
  const mounted = useRef(true)

  // Get accountId from steamId or from STEAM link
  const steamLink = p.links?.find(l => l.type === 'STEAM' || l.label === 'STEAM')
  const steam64 = p.steamId || steamLink?.url?.match(/\/profiles\/(\d+)/)?.[1] || null
  const accountId = steam64 ? steam64toAccountId(steam64) : null

  useEffect(() => {
    mounted.current = true
    if (!accountId) { setLoading(false); return }
    fetchAvatar(accountId).then(url => {
      if (mounted.current) { setAvatar(url); setLoading(false) }
    })
    return () => { mounted.current = false }
  }, [accountId])

  const displayImg = avatar && !imgFailed ? avatar : null
  const color = p.game === 'cs' ? '#f0b429' : '#c84b31'
  const accent = p.accent || color
  const bg = initialsColor(p.nickname)

  return (
    <div
      style={{ background:'var(--bg-2)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-lg)', overflow:'hidden', transition:'transform 0.2s, border-color 0.2s, box-shadow 0.2s' }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.borderColor=`${accent}55`; e.currentTarget.style.boxShadow=`0 14px 36px ${accent}20` }}
      onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.borderColor='var(--border-1)'; e.currentTarget.style.boxShadow='none' }}
    >
      {/* Avatar */}
      <div style={{ height:130, background:`linear-gradient(135deg, ${accent}20 0%, ${accent}05 100%)`, position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
        {displayImg ? (
          <img src={displayImg} alt={p.nickname}
            style={{ width:88, height:88, borderRadius:'50%', objectFit:'cover', border:`3px solid ${accent}`, boxShadow:`0 0 28px ${accent}55`, position:'relative', zIndex:1 }}
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div style={{ width:88, height:88, borderRadius:'50%', background:`linear-gradient(135deg,${bg},${bg}99)`, display:'flex', alignItems:'center', justifyContent:'center', border:`3px solid ${accent}`, boxShadow:`0 0 28px ${accent}55`, position:'relative', zIndex:1 }}>
            {loading
              ? <div style={{ width:28, height:28, border:`3px solid ${accent}`, borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
              : <span style={{ fontFamily:'var(--font-display)', fontSize:26, fontWeight:900, color:'#fff' }}>{initials(p.nickname)}</span>
            }
          </div>
        )}
        {/* Glow ring */}
        <div style={{ position:'absolute', width:104, height:104, borderRadius:'50%', background:`radial-gradient(circle, ${accent}15, transparent 70%)`, pointerEvents:'none' }} />

        <div style={{ position:'absolute', top:8, right:8, fontSize:9, padding:'2px 8px', borderRadius:4, background: p.game==='cs'?'rgba(240,180,41,0.15)':'rgba(200,75,49,0.15)', border:`1px solid ${color}40`, color, fontFamily:'var(--font-mono)', fontWeight:700, letterSpacing:'0.08em' }}>
          {p.game === 'cs' ? 'CS2' : 'DOTA 2'}
        </div>
        {p.country && <div style={{ position:'absolute', top:8, left:10, fontSize:18 }}>{p.country}</div>}
      </div>

      {/* Info */}
      <div style={{ padding:'14px 15px 13px' }}>
        <div style={{ fontFamily:'var(--font-display)', fontSize:17, fontWeight:700, color:'var(--text-0)', letterSpacing:'0.03em', marginBottom:2 }}>{p.nickname}</div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:accent, marginBottom:1, fontWeight:600 }}>{p.fullName || p.realName}</div>
        <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-3)', marginBottom:10 }}>
          {p.team}{p.role ? ` · ${p.role}` : ''}
        </div>

        {(p.rating || p.mmr) && (
          <div style={{ display:'flex', gap:6, marginBottom:10 }}>
            {p.rating && (
              <div style={{ flex:1, padding:'5px 8px', background:`${color}0d`, border:`1px solid ${color}20`, borderRadius:6, textAlign:'center' }}>
                <div style={{ fontSize:8, color:'var(--text-3)', fontFamily:'var(--font-mono)', letterSpacing:'0.08em', marginBottom:2 }}>{p.ratingLabel || 'RATING'}</div>
                <div style={{ fontSize:14, fontWeight:800, color, fontFamily:'var(--font-display)' }}>{p.rating}</div>
              </div>
            )}
          </div>
        )}

        {p.extra && (
          <div style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text-3)', marginBottom:10, lineHeight:1.5, borderLeft:`2px solid ${accent}30`, paddingLeft:8 }}>
            {p.extra}
          </div>
        )}

        <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
          {p.links?.map((link, i) => {
            const key = link.type || link.label || ''
            const lc = LINK_COLOR[key] || link.color || '#888'
            const icon = LINK_ICON[key] || '🔗'
            const isHov = hovLink === `${key}-${i}`
            return (
              <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                onMouseEnter={() => setHovLink(`${key}-${i}`)}
                onMouseLeave={() => setHovLink(null)}
                title={link.label || key}
                style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'4px 8px', borderRadius:5,
                  background: isHov ? `${lc}25` : `${lc}0e`,
                  border: `1px solid ${isHov ? lc+'70' : lc+'30'}`,
                  color: lc, textDecoration:'none', fontSize:10, fontFamily:'var(--font-mono)', fontWeight:700, transition:'all 0.12s' }}>
                <span style={{ fontSize:11 }}>{icon}</span>
                {link.label && <span>{link.label}</span>}
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
