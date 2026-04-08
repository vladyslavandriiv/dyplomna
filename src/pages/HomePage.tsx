import { useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useAppStore } from '@/store/appStore'
import { DOTA_DEMOS, CS_DEMOS } from '@/utils/constants'
import { steamIdToAccountId } from '@/utils/helpers'
import {
  fetchDota2News, fetchCS2News,
  classifyDotaNews, classifyCS2News,
  stripHtml, timeAgoRu, type NewsItem,
} from '@/api/news'
import { DOTA_PROS, type DotaPro } from '@/data/dotaPros'

// Avatar cache for HomePage
const _avaCache: Record<string, string> = {}

async function loadAvatarByAccountId(accountId: number): Promise<string | null> {
  const key = String(accountId)
  if (_avaCache[key]) return _avaCache[key]
  try {
    const r = await fetch(`https://api.opendota.com/api/players/${accountId}`, {
      signal: (() => { const c = new AbortController(); setTimeout(() => c.abort(), 8000); return c.signal })()
    })
    if (!r.ok) return null
    const j = await r.json()
    const url = j?.profile?.avatarfull
    if (url) { _avaCache[key] = url; return url }
  } catch { /* ignore */ }
  return null
}

function steam64ToAccountId(s64: string): number | null {
  try { return Number(BigInt(s64) - BigInt('76561197960265728')) } catch { return null }
}

// ─────────────────────────────────────────────────────────────────────
// Shared: News hook
// ─────────────────────────────────────────────────────────────────────
function useNews(game: 'dota' | 'cs') {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  useEffect(() => {
    setLoading(true); setError(false); setNews([])
    const fn = game === 'dota' ? fetchDota2News : fetchCS2News
    fn(10).then(items => { setNews(items); setLoading(false) })
           .catch(() => { setError(true); setLoading(false) })
  }, [game])
  return { news, loading, error }
}

// ─────────────────────────────────────────────────────────────────────
// Shared: News Card
// ─────────────────────────────────────────────────────────────────────
function NewsCard({ item, featured, game }: { item: NewsItem; featured?: boolean; game: 'dota'|'cs' }) {
  const [hov, setHov] = useState(false)
  const [imgErr, setImgErr] = useState(false)
  const classify = game === 'dota' ? classifyDotaNews : classifyCS2News
  const { label, color } = classify(item)
  const thumb = item.thumbnail || ''
  const text = stripHtml(item.contents, featured ? 200 : 110)

  return (
    <a href={item.url} target="_blank" rel="noopener noreferrer"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', flexDirection: 'column', textDecoration: 'none',
        background: hov ? 'rgba(255,255,255,0.045)' : 'var(--bg-2)',
        border: `1px solid ${hov ? color + '44' : 'var(--border-1)'}`,
        borderRadius: 'var(--radius-md)', overflow: 'hidden',
        transition: 'all 0.18s', transform: hov ? 'translateY(-3px)' : 'none',
        boxShadow: hov ? `0 10px 32px ${color}18` : 'none',
        gridColumn: featured ? 'span 2' : 'span 1', cursor: 'pointer',
      }}
    >
      {thumb && !imgErr ? (
        <div style={{ width: '100%', height: featured ? 200 : 130, overflow: 'hidden', flexShrink: 0, background: 'var(--bg-3)' }}>
          <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s', transform: hov ? 'scale(1.05)' : 'scale(1)' }} onError={() => setImgErr(true)} />
        </div>
      ) : (
        <div style={{ height: 4, background: `linear-gradient(90deg, ${color}, transparent)`, flexShrink: 0 }} />
      )}
      <div style={{ padding: featured ? '18px 20px' : '14px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', fontFamily: 'var(--font-mono)', color, padding: '2px 7px', borderRadius: 3, background: `${color}14`, border: `1px solid ${color}28` }}>{label}</span>
          <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{timeAgoRu(item.date)}</span>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 500, fontSize: featured ? 18 : 14, letterSpacing: '0.02em', color: hov ? 'var(--text-0)' : 'var(--text-1)', lineHeight: 1.35, marginBottom: 8, flex: 1, transition: 'color 0.15s' }}>
          {item.title}
        </div>
        {text && (
          <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.55, marginBottom: 10 }}>
            {text}{(item.contents?.length ?? 0) > (featured ? 200 : 110) && '…'}
          </div>
        )}
        <div style={{ fontSize: 10, color, fontFamily: 'var(--font-mono)', opacity: hov ? 1 : 0.3, transition: 'opacity 0.2s', marginTop: 'auto' }}>
          read → {item.feedlabel && <span style={{ opacity: 0.6 }}>· {item.feedlabel}</span>}
        </div>
      </div>
    </a>
  )
}

function NewsGrid({ game }: { game: 'dota' | 'cs' }) {
  const { news, loading, error } = useNews(game)
  const newsUrl = game === 'dota' ? 'https://www.dota2.com/news' : 'https://www.counter-strike.net/news'

  if (loading) return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
      {[1,2,3,4,5,6].map(i => (
        <div key={i} className="skeleton" style={{ height: i === 1 ? 300 : 200, borderRadius: 'var(--radius-md)', gridColumn: i === 1 ? 'span 2' : 'span 1' }} />
      ))}
    </div>
  )
  if (error || news.length === 0) return (
    <div style={{ padding: '28px', textAlign: 'center', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 12, background: 'var(--bg-2)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-md)' }}>
      // failed to load news · <a href={newsUrl} target="_blank" style={{ color: 'var(--accent)', textDecoration: 'none' }}>open site →</a>
    </div>
  )
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, alignItems: 'start' }}>
      {news.slice(0, 8).map((item, i) => (
        <NewsCard key={item.gid || i} item={item} featured={i === 0} game={game} />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Dota 2 Pro Card
// ─────────────────────────────────────────────────────────────────────
function DotaProCard({ p }: { p: DotaPro }) {
  const [hov, setHov] = useState(false)
  const [imgErr, setImgErr] = useState(false)
  const [steamAvatar, setSteamAvatar] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const steam64 = p.steam?.match(/\/profiles\/(\d+)/)?.[1]
    if (!steam64) return
    const aid = steam64ToAccountId(steam64)
    if (!aid) return
    loadAvatarByAccountId(aid).then(url => { if (url) setSteamAvatar(url) })
  }, [p.steam])

  const displayPhoto = steamAvatar || (imgErr ? null : (p.photo || null))

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'var(--bg-3)' : 'var(--bg-2)',
        border: `1px solid ${hov ? p.accent + '55' : 'var(--border-1)'}`,
        borderRadius: 'var(--radius-md)', overflow: 'hidden',
        transition: 'all 0.18s', transform: hov ? 'translateY(-3px)' : 'none',
        boxShadow: hov ? `0 10px 32px ${p.accent}20` : 'none',
      }}
    >
      <div style={{ height: 3, background: `linear-gradient(90deg, ${p.accent}, transparent)` }} />
      <div style={{ padding: '16px' }}>

        {/* Header */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
          {/* Photo */}
          <div style={{ width: 70, height: 70, borderRadius: 10, flexShrink: 0, background: `linear-gradient(135deg,${p.accent}22,var(--bg-4))`, border: `1px solid ${p.accent}33`, overflow: 'hidden' }}>
            {!imgErr ? (
              <img src={displayPhoto!} alt={p.nickname} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }} onError={() => setImgErr(true)} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: p.accent }}>
                {p.nickname.slice(0,2).toUpperCase()}
              </div>
            )}
          </div>

          {/* Names */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 1 }}>
              <span style={{ fontSize: 14 }}>{p.country}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: hov ? p.accent : 'var(--text-0)', transition: 'color 0.15s', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nickname}</span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 5 }}>{p.fullName}</div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', padding: '1px 6px', borderRadius: 3, background: `${p.accent}18`, border: `1px solid ${p.accent}33`, color: p.accent, fontFamily: 'var(--font-mono)' }}>{p.team}</span>
              <span style={{ fontSize: 9, fontWeight: 700, padding: '1px 6px', borderRadius: 3, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-1)', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{p.role}</span>
            </div>
          </div>

          {/* Rating */}
          <div style={{ flexShrink: 0, background: `${p.accent}12`, border: `1px solid ${p.accent}30`, borderRadius: 8, padding: '5px 9px', textAlign: 'center' }}>
            <div style={{ fontSize: 8, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: 1 }}>{p.ratingLabel}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: p.rating.length > 7 ? 10 : 14, fontWeight: 700, color: p.accent, lineHeight: 1.2 }}>{p.rating}</div>
          </div>
        </div>

        {/* Bio */}
        <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.55, marginBottom: 12, minHeight: 34 }}>
          {p.bio}
        </div>

        {/* Links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
          {[
            { label: 'OpenDota', url: p.opendota,   color: '#4f8eff', bg: 'rgba(79,142,255,0.08)',  border: 'rgba(79,142,255,0.25)'  },
            { label: 'Dotabuff', url: p.dotabuff,   color: '#f5a623', bg: 'rgba(245,166,35,0.08)',  border: 'rgba(245,166,35,0.25)'  },
            { label: 'Liquipedia',url: p.liquipedia, color: '#63b3ed', bg: 'rgba(99,179,237,0.08)',  border: 'rgba(99,179,237,0.25)'  },
            { label: 'Steam',    url: p.steam,      color: '#a0aec0', bg: 'rgba(160,174,192,0.07)', border: 'rgba(160,174,192,0.2)'  },
          ].map(link => (
            <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px 4px', borderRadius: 5, textDecoration: 'none', background: link.bg, border: `1px solid ${link.border}`, color: link.color, fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', fontFamily: 'var(--font-mono)', transition: 'opacity 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
            >{link.label}</a>
          ))}
        </div>

        {/* View profile button */}
        {p.accountId && (
          <button
            onClick={() => navigate(`/player/${p.accountId}`)}
            style={{ width: '100%', marginTop: 8, padding: '7px', background: `${p.accent}14`, border: `1px solid ${p.accent}30`, borderRadius: 6, color: p.accent, fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.15s', letterSpacing: '0.06em' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = `${p.accent}28` }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = `${p.accent}14` }}
          >
            View profile →
          </button>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Search Hero
// ─────────────────────────────────────────────────────────────────────
function SearchHero({ game }: { game: 'dota' | 'cs' }) {
  const navigate = useNavigate()
  const { searchHistory } = useAppStore()
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const demos = game === 'dota' ? DOTA_DEMOS : CS_DEMOS
  const recent = searchHistory.filter(h => h.game === game).slice(0, 5)

  const isDota = game === 'dota'
  const accentColor = isDota ? 'var(--accent)' : '#f0b429'
  const glowColor   = isDota ? 'rgba(79,142,255,0.08)' : 'rgba(240,180,41,0.07)'

  const doSearch = (raw?: string) => {
    const input = (raw ?? value).trim()
    if (!input) return
    const id = steamIdToAccountId(input)
    if (id) navigate(`/player/${id}`)
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      textAlign: 'center', padding: '48px 0 40px', position: 'relative',
      borderBottom: '1px solid var(--border-0)',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 0%, ${glowColor} 0%, transparent 65%)`, pointerEvents: 'none' }} />

      {/* Logo */}
      <div style={{ position: 'relative', marginBottom: 8 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 76, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--text-0)', lineHeight: 1, margin: 0 }}>
          {isDota ? (
            <>DOTA<span style={{ color: accentColor }}>SCOPE</span></>
          ) : (
            <>CS2<span style={{ color: accentColor }}>SCOPE</span></>
          )}
        </h1>
        {/* Game badge */}
        <span style={{
          position: 'absolute', top: -8, right: -60,
          fontSize: 10, fontWeight: 800, letterSpacing: '0.1em',
          padding: '3px 8px', borderRadius: 4,
          background: isDota ? 'rgba(200,75,49,0.15)' : 'rgba(240,180,41,0.12)',
          border: `1px solid ${isDota ? 'rgba(200,75,49,0.4)' : 'rgba(240,180,41,0.35)'}`,
          color: isDota ? '#c84b31' : '#f0b429',
          fontFamily: 'var(--font-mono)',
        }}>
          {isDota ? 'DOTA 2' : 'CS2'}
        </span>
      </div>

      <div style={{ width: 100, height: 1, background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`, marginBottom: 12 }} />
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)', marginBottom: 32, letterSpacing: '0.06em' }}>
        {isDota
          ? '// stats · heroes · meta · leaderboards · pro-players'
          : '// profiles · tournaments · teams · CS2 pro scene'}
      </p>

      <div style={{ width: '100%', maxWidth: 520, position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex' }}>
          <input
            ref={inputRef} value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
            onFocus={() => setFocused(true)}
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            placeholder={isDota ? 'Steam ID, Account ID or nickname...' : 'Steam ID or CS2 nickname...'}
            style={{
              flex: 1, background: 'var(--bg-2)',
              border: `1px solid ${focused ? accentColor : 'var(--border-2)'}`,
              borderRight: 'none', borderRadius: 'var(--radius-md) 0 0 var(--radius-md)',
              padding: '13px 18px', color: 'var(--text-1)', fontFamily: 'var(--font-mono)',
              fontSize: 14, outline: 'none', transition: 'border-color 0.2s',
            }}
          />
          <button
            onClick={() => doSearch()}
            style={{
              background: isDota ? 'var(--accent)' : '#f0b429',
              border: 'none', borderRadius: '0 var(--radius-md) var(--radius-md) 0',
              padding: '13px 24px', color: isDota ? '#fff' : '#1a1a1a',
              fontWeight: 700, fontSize: 14, letterSpacing: '0.06em', cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85' }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
          >FIND →</button>
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', alignSelf: 'center' }}>examples:</span>
          {demos.map(({ name, id }) => (
            <button key={id} onClick={() => { setValue(id); doSearch(id) }} style={{
              padding: '3px 10px', borderRadius: 4, fontSize: 11, fontFamily: 'var(--font-mono)',
              background: `${isDota ? 'rgba(79,142,255,0.07)' : 'rgba(240,180,41,0.07)'}`,
              border: `1px solid ${isDota ? 'rgba(79,142,255,0.2)' : 'rgba(240,180,41,0.2)'}`,
              color: isDota ? '#7ab4ff' : '#f0b429', cursor: 'pointer', transition: 'all 0.15s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
            >{name}</button>
          ))}
        </div>
      </div>

      {recent.length > 0 && (
        <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', alignSelf: 'center' }}>recent:</span>
          {recent.map(h => (
            <button key={h.id} onClick={() => navigate(`/player/${h.id}`)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'var(--bg-2)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-sm)', color: 'var(--text-1)', cursor: 'pointer', fontSize: 12, transition: 'all 0.15s' }}>
              {h.avatar && <img src={h.avatar} alt="" style={{ width: 18, height: 18, borderRadius: 3 }} />}
              {h.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// Section header
// ─────────────────────────────────────────────────────────────────────
function SectionTitle({ title, accent, link, linkText }: { title: string; accent: string; link?: string; linkText?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, letterSpacing: '0.1em', color: 'var(--text-2)', textTransform: 'uppercase', flexShrink: 0, margin: 0 }}>
        {title.split(' ').map((word, i) => (
          <span key={i} style={{ color: i === title.split(' ').length - 1 ? accent : 'var(--text-2)' }}>{word} </span>
        ))}
      </h2>
      <div style={{ flex: 1, height: 1, background: 'var(--border-0)' }} />
      {link && (
        <a href={link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textDecoration: 'none', flexShrink: 0 }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = accent }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-3)' }}
        >{linkText || 'all →'}</a>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// DOTA 2 HOME
// ─────────────────────────────────────────────────────────────────────
function DotaHome() {
  return (
    <div>
      <SearchHero game="dota" />

      {/* Quick nav */}
      <div style={{ marginTop: 36, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 40 }}>
        {[
          { icon: '⚔️',  label: 'Heroes',      desc: '138+ heroes · WR · picks',        link: '/heroes',      accent: '#4f8eff' },
          { icon: '🏆',  label: 'Leaderboard',  desc: 'Top 1000 Immortal by region',  link: '/leaderboard', accent: '#f5a623' },
          { icon: '📈',  label: 'Meta',         desc: 'Pro picks, bans, WR',           link: '/meta',        accent: '#22d48a' },
          { icon: '🔍',  label: 'Player search', desc: 'Stats by Steam ID',            link: '/',            accent: '#a78bfa' },
        ].map(({ icon, label, desc, link, accent }) => (
          <a key={label} href={link} style={{ textDecoration: 'none' }}>
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-md)', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s', cursor: 'pointer' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = accent + '44'; el.style.background = 'var(--bg-3)'; el.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'var(--border-1)'; el.style.background = 'var(--bg-2)'; el.style.transform = '' }}
            >
              <span style={{ fontSize: 22 }}>{icon}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: 'var(--text-0)', letterSpacing: '0.04em' }}>{label}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 2 }}>{desc}</div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* News */}
      <SectionTitle title="DOTA 2 NEWS" accent="var(--accent)" link="https://www.dota2.com/news" linkText="all news →" />
      <div style={{ marginBottom: 48 }}>
        <NewsGrid game="dota" />
      </div>

      {/* Pro players */}
      <SectionTitle title="PRO PLAYERS DOTA 2" accent="var(--accent)" link="https://liquipedia.net/dota2/Portal:Players" linkText="all players →" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 48 }}>
        {DOTA_PROS.map(p => <DotaProCard key={p.nickname} p={p} />)}
      </div>

      {/* TI winners timeline */}
      <SectionTitle title="CHAMPIONS OF THE INTERNATIONAL" accent="#f5a623" link="https://liquipedia.net/dota2/The_International" linkText="TI history →" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
        {[
          { year: 'TI1 2011',  team: 'Natus Vincere',   players: 'Dendi, Puppey, XBOCT',         color: '#f5a623' },
          { year: 'TI2 2012',  team: 'Invictus Gaming', players: 'YYF, Faith, Zhou',              color: '#e53e3e' },
          { year: 'TI3 2013',  team: 'Alliance',        players: 'Loda, AdmiralBulldog, EGM',    color: '#48bb78' },
          { year: 'TI4 2014',  team: 'Newbee',          players: 'Hao, Banana, Mu',               color: '#ed8936' },
          { year: 'TI5 2015',  team: 'Evil Geniuses',   players: 'SumaiL, PPD, Universe',        color: '#4299e1' },
          { year: 'TI6 2016',  team: 'Wings Gaming',    players: 'Shadow, bLink, iceice',         color: '#9f7aea' },
          { year: 'TI7 2017',  team: 'Team Liquid',     players: 'Miracle-, MinD_ContRoL, KuroKy',color: '#009edd' },
          { year: 'TI8 2018',  team: 'OG',              players: 'N0tail, ana, JerAx',            color: '#00aaff' },
          { year: 'TI9 2019',  team: 'OG',              players: 'N0tail, ana, Topson',           color: '#00aaff' },
          { year: 'TI10 2021', team: 'Team Spirit',     players: 'Yatoro, Collapse, TORONTOTOKYO',color: '#00ff88' },
          { year: 'TI11 2022', team: 'Tundra Esports',  players: 'Nine, Skiter, 33',              color: '#f6e05e' },
          { year: 'TI12 2023', team: 'Team Liquid',     players: 'Miracle-, Boxi, miCKe',         color: '#009edd' },
        ].map(({ year, team, players, color }) => (
          <div key={year} style={{ background: 'var(--bg-2)', border: `1px solid ${color}22`, borderRadius: 8, padding: '12px 14px', borderLeft: `3px solid ${color}` }}>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 3 }}>{year}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color, fontFamily: 'var(--font-display)', letterSpacing: '0.04em', marginBottom: 3 }}>{team}</div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', lineHeight: 1.4 }}>{players}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// CS2 HOME
// ─────────────────────────────────────────────────────────────────────
// CS2 pros from PlayerPage (duplicating key data inline for homepage)
const CS2_HOME_PROS = [
  { nickname:'donk',       fullName:'Danil Kashatkoff',  country:'🇷🇺', team:'Spirit',   rating:'1.33', role:'Rifler',    accent:'#48bb78', hltv:'https://www.hltv.org/player/23468/donk',       faceit:'https://www.faceit.com/en/players/donk',       photo:'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg' },
  { nickname:'ZywOo',      fullName:'Mathieu Herbaut',   country:'🇫🇷', team:'Vitality', rating:'1.35', role:'AWPer',     accent:'#ffdd57', hltv:'https://www.hltv.org/player/11893/zywoo',      faceit:'https://www.faceit.com/en/players/ZywOo',      photo:'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg' },
  { nickname:'s1mple',     fullName:'Aleksandr Kostylev',country:'🇺🇦', team:'NAVI',     rating:'1.28', role:'AWPer',     accent:'#f5a623', hltv:'https://www.hltv.org/player/7998/s1mple',      faceit:'https://www.faceit.com/en/players/s1mple',     photo:'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg' },
  { nickname:'NiKo',       fullName:'Nikola Kovač',      country:'🇧🇦', team:'G2',       rating:'1.24', role:'Rifler',    accent:'#26d07c', hltv:'https://www.hltv.org/player/3741/niko',        faceit:'https://www.faceit.com/en/players/NiKo',       photo:'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg' },
  { nickname:'sh1ro',      fullName:'Dmitriy Sokolov',   country:'🇷🇺', team:'Cloud9',   rating:'1.22', role:'AWPer',     accent:'#63b3ed', hltv:'https://www.hltv.org/player/18068/sh1ro',      faceit:'https://www.faceit.com/en/players/sh1ro',      photo:'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg' },
  { nickname:'ropz',       fullName:'Robin Kool',        country:'🇪🇪', team:'FaZe',     rating:'1.20', role:'Rifler',    accent:'#9f7aea', hltv:'https://www.hltv.org/player/11816/ropz',       faceit:'https://www.faceit.com/en/players/ropz',       photo:'https://avatars.steamstatic.com/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg' },
]

function CS2ProMini({ p }: { p: typeof CS2_HOME_PROS[0] }) {
  const [hov, setHov] = useState(false)
  const [imgErr, setImgErr] = useState(false)
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ background: hov ? 'var(--bg-3)' : 'var(--bg-2)', border: `1px solid ${hov ? p.accent + '55' : 'var(--border-1)'}`, borderRadius: 'var(--radius-md)', overflow: 'hidden', transition: 'all 0.18s', transform: hov ? 'translateY(-2px)' : 'none', boxShadow: hov ? `0 8px 24px ${p.accent}18` : 'none' }}>
      <div style={{ height: 3, background: `linear-gradient(90deg,${p.accent},transparent)` }} />
      <div style={{ padding: '14px' }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10 }}>
          <div style={{ width: 56, height: 56, borderRadius: 8, flexShrink: 0, background: `linear-gradient(135deg,${p.accent}22,var(--bg-4))`, border: `1px solid ${p.accent}33`, overflow: 'hidden' }}>
            {(!imgErr && p.photo)
              ? <img src={p.photo!} alt={p.nickname} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} onError={() => setImgErr(true)} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: p.accent }}>{p.nickname.slice(0,2).toUpperCase()}</div>
            }
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ fontSize: 13 }}>{p.country}</span>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: hov ? p.accent : 'var(--text-0)', transition: 'color 0.15s' }}>{p.nickname}</span>
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-2)', marginBottom: 3 }}>{p.fullName}</div>
            <div style={{ display: 'flex', gap: 4 }}>
              <span style={{ fontSize: 8, fontWeight: 800, padding: '1px 5px', borderRadius: 3, background: `${p.accent}18`, border: `1px solid ${p.accent}33`, color: p.accent, fontFamily: 'var(--font-mono)' }}>{p.team}</span>
              <span style={{ fontSize: 8, fontWeight: 700, padding: '1px 5px', borderRadius: 3, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-1)', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{p.role}</span>
            </div>
          </div>
          <div style={{ flexShrink: 0, background: `${p.accent}12`, border: `1px solid ${p.accent}30`, borderRadius: 7, padding: '4px 8px', textAlign: 'center' }}>
            <div style={{ fontSize: 7, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>RATING</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: p.accent }}>{p.rating}</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {[
            { label: 'HLTV',   url: p.hltv,   color: '#ff8c00', bg: 'rgba(255,140,0,0.08)',  border: 'rgba(255,140,0,0.25)'  },
            { label: 'FACEIT', url: p.faceit, color: '#ff5500', bg: 'rgba(255,85,0,0.08)',   border: 'rgba(255,85,0,0.25)'   },
          ].map(link => (
            <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '5px', borderRadius: 5, textDecoration: 'none', background: link.bg, border: `1px solid ${link.border}`, color: link.color, fontSize: 9, fontWeight: 800, letterSpacing: '0.07em', fontFamily: 'var(--font-mono)', transition: 'opacity 0.15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.7' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
            >{link.label} →</a>
          ))}
        </div>
      </div>
    </div>
  )
}

function CS2Home() {
  const CS2_PLATFORMS = [
    { icon: '🎯', name: 'HLTV.org',      desc: 'Rankings, matches, stats',     color: '#ff8c00', bg: 'rgba(255,140,0,0.08)',   border: 'rgba(255,140,0,0.25)',   url: 'https://www.hltv.org' },
    { icon: '🔥', name: 'FACEIT',         desc: 'Ranked matches and tournaments', color: '#ff5500', bg: 'rgba(255,85,0,0.08)',    border: 'rgba(255,85,0,0.25)',    url: 'https://www.faceit.com/en/cs2/find-a-player' },
    { icon: '💧', name: 'Liquipedia CS2', desc: 'All tournaments and teams',    color: '#63b3ed', bg: 'rgba(99,179,237,0.08)',  border: 'rgba(99,179,237,0.25)',  url: 'https://liquipedia.net/counterstrike/Main_Page' },
    { icon: '📊', name: 'csgostats.gg',   desc: 'Detailed statistics',          color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.25)', url: 'https://csgostats.gg' },
    { icon: '🧠', name: 'Leetify',        desc: 'Analytics and AI tips',        color: '#34d399', bg: 'rgba(52,211,153,0.08)',  border: 'rgba(52,211,153,0.25)',  url: 'https://leetify.com' },
    { icon: '🌐', name: 'CS2 Official',   desc: 'Official CS2 website',         color: '#f0b429', bg: 'rgba(240,180,41,0.08)',  border: 'rgba(240,180,41,0.25)',  url: 'https://www.counter-strike.net' },
  ]

  return (
    <div>
      <SearchHero game="cs" />

      {/* Platform links */}
      <div style={{ marginTop: 36 }}>
        <SectionTitle title="CS2 PLATFORMS" accent="#f0b429" />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 40 }}>
          {CS2_PLATFORMS.map(p => (
            <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <div style={{ background: p.bg, border: `1px solid ${p.border}`, borderRadius: 'var(--radius-md)', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 12, transition: 'all 0.15s', cursor: 'pointer' }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = `0 6px 20px ${p.color}20` }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.transform = ''; el.style.boxShadow = '' }}
              >
                <span style={{ fontSize: 24 }}>{p.icon}</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 600, color: p.color, letterSpacing: '0.03em' }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{p.desc}</div>
                </div>
                <span style={{ marginLeft: 'auto', color: p.color, opacity: 0.5 }}>→</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* CS2 News */}
      <SectionTitle title="CS2 NEWS" accent="#f0b429" link="https://www.counter-strike.net/news" linkText="all news →" />
      <div style={{ marginBottom: 48 }}>
        <NewsGrid game="cs" />
      </div>

      {/* CS2 Pro players preview */}
      <SectionTitle title="TOP PLAYERS CS2" accent="#f0b429" link="/player/0" linkText="all profiles →" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 48 }}>
        {CS2_HOME_PROS.map(p => <CS2ProMini key={p.nickname} p={p} />)}
      </div>

      {/* CS2 Major Winners */}
      <SectionTitle title="MAJOR CHAMPIONS" accent="#f0b429" link="https://liquipedia.net/counterstrike/Majors" linkText="majors history →" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {[
          { year: 'Paris 2023',     team: 'Vitality',     players: 'ZywOo, apEX, Magisk',         color: '#ffdd57' },
          { year: 'Copenhagen 2024',team: 'NaVi',         players: 'w0nderful, iM, b1t',          color: '#f5a623' },
          { year: 'Austin 2025',    team: 'Team Vitality', players: 'ZywOo, flameZ, mezii',       color: '#ffdd57' },
          { year: 'Shanghai 2024',  team: 'FaZe Clan',    players: 'ropz, broky, Twistzz',        color: '#9f7aea' },
          { year: 'Paris 2023',     team: 'GamerLegion',  players: 'NertZ, Frankie, misutaaa',    color: '#48bb78' },
          { year: 'Antwerp 2022',   team: 'Natus Vincere',players: 's1mple, electronic, b1t',     color: '#f5a623' },
          { year: 'PGL Antwerp',    team: 'FAZE CLAN',    players: 'karrigan, ropz, broky',       color: '#9f7aea' },
          { year: 'Stockholm 2021', team: 'NaVi',         players: 's1mple, b1t, electronic',     color: '#f5a623' },
        ].map(({ year, team, players, color }, i) => (
          <div key={i} style={{ background: 'var(--bg-2)', border: `1px solid ${color}22`, borderRadius: 8, padding: '12px 14px', borderLeft: `3px solid ${color}` }}>
            <div style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', letterSpacing: '0.08em', marginBottom: 3 }}>{year}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color, fontFamily: 'var(--font-display)', letterSpacing: '0.04em', marginBottom: 3 }}>{team}</div>
            <div style={{ fontSize: 10, color: 'var(--text-3)', lineHeight: 1.4 }}>{players}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────
// ROOT: switches between Dota and CS2
// ─────────────────────────────────────────────────────────────────────
export function HomePage() {
  const { activeGame } = useAppStore()
  return activeGame === 'dota' ? <DotaHome /> : <CS2Home />
}
