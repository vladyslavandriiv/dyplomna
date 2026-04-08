import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { CS_DEMOS } from '@/utils/constants'
import { fetchCS2News } from '@/api/news'
import { HighlightsSection } from '@/components/highlights/HighlightsSection'
import { NewsGrid } from '@/components/news/NewsGrid'
import { ProCard } from '@/components/pros/ProCard'
import { CS2_PROS } from '@/components/pros/cs2Pros'

function SH({ title, accent, link, linkLabel }: { title: string; accent: string; link?: string; linkLabel?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
      <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 500, letterSpacing: '0.1em', color: 'var(--text-2)', textTransform: 'uppercase', flexShrink: 0, margin: 0 }}>
        {title.split('|').map((p, i) => i === 0 ? p : <span key={i} style={{ color: accent }}>{p}</span>)}
      </h2>
      <div style={{ flex: 1, height: 1, background: 'var(--border-0)' }} />
      {link && <a href={link} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textDecoration: 'none', flexShrink: 0, transition: 'color 0.15s' }}
        onMouseEnter={e => (e.currentTarget.style.color = accent)}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
      >{linkLabel || 'all →'}</a>}
    </div>
  )
}

// CS2 Major History with full rosters
const MAJOR_HISTORY = [
  { year: '2014', name: 'EMS Katowice',   winner: 'Virtus.pro',    prize: '$250K',   color: '#fbd38d', roster: ['TaZ','NEO','pasha','byali','Snax'] },
  { year: '2014', name: 'EMS Cologne',    winner: 'fnatic',        prize: '$250K',   color: '#ff8c00', roster: ['olofmeister','flusha','KRIMZ','JW','pronax'] },
  { year: '2015', name: 'DH Winter',      winner: 'LDLC',          prize: '$250K',   color: '#fbd38d', roster: ['Happy','NBK','kioShiMa','SmithZz','apEX'] },
  { year: '2016', name: 'MLG Columbus',   winner: 'Luminosity',    prize: '$500K',   color: '#68d391', roster: ['FalleN','coldzera','fer','fnx','TACO'] },
  { year: '2016', name: 'ESL Cologne',    winner: 'Astralis',      prize: '$500K',   color: '#e53e3e', roster: ['dupreeh','Xyp9x','device','karrigan','cajunb'] },
  { year: '2017', name: 'PGL Krakow',     winner: 'Astralis',      prize: '$500K',   color: '#e53e3e', roster: ['dupreeh','Xyp9x','device','gla1ve','Magisk'] },
  { year: '2018', name: 'ELEAGUE Boston', winner: 'Cloud9',        prize: '$500K',   color: '#63b3ed', roster: ['Skadoodle','autimatic','tarik','RUSH','Stewie2K'] },
  { year: '2018', name: 'FACEIT London',  winner: 'Astralis',      prize: '$500K',   color: '#e53e3e', roster: ['dupreeh','Xyp9x','device','gla1ve','Magisk'] },
  { year: '2019', name: 'IEM Katowice',   winner: 'Astralis',      prize: '$500K',   color: '#e53e3e', roster: ['dupreeh','Xyp9x','device','gla1ve','Magisk'] },
  { year: '2021', name: 'PGL Stockholm',  winner: 'Natus Vincere',  prize: '$1M',    color: '#f5a623', roster: ['s1mple','electronic','Boombl4','Perfecto','b1t'] },
  { year: '2022', name: 'PGL Antwerp',    winner: 'FaZe Clan',      prize: '$1M',    color: '#9f7aea', roster: ['karrigan','broky','ropz','Twistzz','rain'] },
  { year: '2022', name: 'IEM Rio',        winner: 'Outsiders',      prize: '$1M',    color: '#a78bfa', roster: ['YEKINDAR','Qikert','jame','Forester','n0rb3r7'] },
  { year: '2023', name: 'BLAST Paris',    winner: 'Team Vitality',  prize: '$1.25M', color: '#ffdd57', roster: ['ZywOo','apEX','Magisk','Spinx','flameZ'] },
  { year: '2024', name: 'PGL Copenhagen', winner: 'Natus Vincere',  prize: '$1.25M', color: '#f5a623', roster: ['jL','electronic','Perfecto','iM','b1t'] },
  { year: '2024', name: 'PGL Shanghai',   winner: 'Team Spirit',    prize: '$1.25M', color: '#48bb78', roster: ['donk','sh1ro','zont1x','chopper','magixx'] },
  { year: '2025', name: 'BLAST Austin',   winner: 'Team Vitality',  prize: '$1.25M', color: '#ffdd57', roster: ['ZywOo','flameZ','Spinx','mezii','apEX'] },
  { year: '2025', name: 'SL Budapest',    winner: 'Team Vitality',  prize: '$1.25M', color: '#ffdd57', roster: ['ZywOo','flameZ','Spinx','mezii','ropz'] },
]

function MajorCard({ m }: { m: typeof MAJOR_HISTORY[0] }) {
  const [hov, setHov] = useState(false)
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? 'var(--bg-3)' : 'var(--bg-2)', border: `1px solid ${hov ? m.color + '50' : m.color + '20'}`, borderRadius: 'var(--radius-md)', padding: '13px 14px', transition: 'all 0.18s', transform: hov ? 'translateY(-2px)' : 'none', boxShadow: hov ? `0 8px 24px ${m.color}18` : 'none' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-3)' }}>{m.year} · {m.name}</span>
        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: m.color, fontWeight: 700 }}>{m.prize}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: m.color, marginBottom: 8 }}>🏆 {m.winner}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {m.roster.map(p => (
          <span key={p} style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: `${m.color}10`, border: `1px solid ${m.color}22`, color: 'var(--text-2)', fontFamily: 'var(--font-mono)' }}>{p}</span>
        ))}
      </div>
    </div>
  )
}

const PLATFORMS = [
  { name: 'HLTV.org',       desc: 'Rankings, matches, CS2 news',       icon: '🎯', color: '#ff8c00', url: 'https://www.hltv.org' },
  { name: 'FACEIT',         desc: 'Ranked matches and tournaments',     icon: '🔥', color: '#ff5500', url: 'https://www.faceit.com/en/cs2' },
  { name: 'csgostats.gg',   desc: 'Detailed personal stats',           icon: '📊', color: '#a78bfa', url: 'https://csgostats.gg' },
  { name: 'Leetify',        desc: 'Position and utility analytics',    icon: '🧠', color: '#34d399', url: 'https://leetify.com' },
  { name: 'Liquipedia CS2', desc: 'Pro-scene wiki, teams, tournaments', icon: '📖', color: '#63b3ed', url: 'https://liquipedia.net/counterstrike' },
  { name: 'BLAST.tv',       desc: 'BLAST Premier and Austin Major',    icon: '💥', color: '#f6e05e', url: 'https://blast.tv/cs2' },
  { name: 'PGL Major',      desc: 'PGL Copenhagen / Shanghai Major',   icon: '🏆', color: '#fc8181', url: 'https://pglesports.com' },
  { name: 'Steam CS2',      desc: 'Official CS2 page',                 icon: '💻', color: '#9aa8b2', url: 'https://store.steampowered.com/app/730' },
]

function SearchPanel() {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const doSearch = (raw?: string) => { const v = (raw ?? value).trim(); if (!v) return; navigate(`/player/${v}`) }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(240,180,41,0.07) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '48px 0 40px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
          <span style={{ fontSize: 52, filter: 'drop-shadow(0 0 20px rgba(240,180,41,0.5))' }}>🎮</span>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 68, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-0)', lineHeight: 1, margin: 0 }}>
            CS2<span style={{ color: '#f0b429' }}>SCOPE</span>
          </h1>
        </div>
        <div style={{ width: 80, height: 2, background: 'linear-gradient(90deg, transparent, #f0b429, transparent)', marginBottom: 10 }} />
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)', marginBottom: 28, letterSpacing: '0.06em' }}>// pro-scene · majors · rankings · players</p>
        <div style={{ width: '100%', maxWidth: 520 }}>
          <div style={{ display: 'flex', boxShadow: focused ? '0 0 0 3px rgba(240,180,41,0.12)' : 'none', borderRadius: 'var(--radius-md)', transition: 'box-shadow 0.2s' }}>
            <input ref={inputRef} value={value} onChange={e => setValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && doSearch()} onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder="Steam ID64 or player nickname..."
              style={{ flex: 1, background: 'var(--bg-2)', border: `1px solid ${focused ? '#f0b429' : 'var(--border-2)'}`, borderRight: 'none', borderRadius: 'var(--radius-md) 0 0 var(--radius-md)', padding: '13px 18px', color: 'var(--text-1)', fontFamily: 'var(--font-mono)', fontSize: 14, outline: 'none', transition: 'border-color 0.2s' }}
            />
            <button onClick={() => doSearch()} style={{ background: 'linear-gradient(135deg, #f0b429 0%, #ffd24d 100%)', border: 'none', borderRadius: '0 var(--radius-md) var(--radius-md) 0', padding: '13px 24px', color: '#0a0a0a', fontWeight: 800, fontSize: 13, letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.1)')}
              onMouseLeave={e => (e.currentTarget.style.filter = 'brightness(1)')}
            >SEARCH →</button>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 10, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>pro-players:</span>
            {CS_DEMOS.map(({ name, id }) => (
              <button key={id} onClick={() => { setValue(id); doSearch(id) }} style={{ padding: '3px 10px', borderRadius: 4, fontSize: 11, fontFamily: 'var(--font-mono)', background: 'rgba(240,180,41,0.08)', border: '1px solid rgba(240,180,41,0.2)', color: '#f0b429', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(240,180,41,0.18)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(240,180,41,0.08)')}
              >{name}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function CS2HomePage() {
  return (
    <div className="fade-up">
      <SearchPanel />

      {/* Platforms */}
      <SH title="PLATFORMS AND |RESOURCES CS2" accent="#f0b429" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 44 }}>
        {PLATFORMS.map(p => (
          <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
            <div style={{ background: 'var(--bg-2)', border: `1px solid ${p.color}22`, borderRadius: 'var(--radius-md)', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.15s' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = p.color + '55'; el.style.background = 'var(--bg-3)'; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = `0 8px 20px ${p.color}18` }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = p.color + '22'; el.style.background = 'var(--bg-2)'; el.style.transform = ''; el.style.boxShadow = '' }}
            >
              <span style={{ fontSize: 24 }}>{p.icon}</span>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: p.color }}>{p.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 1 }}>{p.desc}</div>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* News */}
      <SH title="CS2 |NEWS" accent="#f0b429" link="https://www.counter-strike.net/news" linkLabel="cs.net →" />
      <div style={{ marginBottom: 52 }}>
        <NewsGrid fetcher={fetchCS2News} homeUrl="https://www.counter-strike.net/news" accentColor="#f0b429" count={9} />
      </div>

      {/* Pro players */}
      <SH title="TOP PRO |PLAYERS CS2" accent="#f0b429" link="https://www.hltv.org/stats" linkLabel="hltv.org/stats →" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 52 }}>
        {CS2_PROS.map(p => <ProCard key={p.nickname} p={p} />)}
      </div>

      {/* Major history */}
      <SH title="HISTORY OF |CS MAJORS" accent="#f0b429" link="https://liquipedia.net/counterstrike/Majors" linkLabel="all majors →" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(185px, 1fr))', gap: 9, marginBottom: 52 }}>
        {MAJOR_HISTORY.map(m => <MajorCard key={`${m.year}-${m.name}`} m={m} />)}
      </div>

      {/* Highlights */}
      <SH title="BEST |HIGHLIGHTS CS2" accent="#f0b429" link="https://www.youtube.com/results?search_query=CS2+tournament+highlights+2025" linkLabel="YouTube →" />
      <div style={{ marginBottom: 52 }}>
        <HighlightsSection game="cs" accent="#f0b429" />
      </div>
    </div>
  )
}
