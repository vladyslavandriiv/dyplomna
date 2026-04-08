import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { DOTA_DEMOS } from '@/utils/constants'
import { steamIdToAccountId } from '@/utils/helpers'
import { fetchDota2News } from '@/api/news'
import { HighlightsSection } from '@/components/highlights/HighlightsSection'
import { NewsGrid } from '@/components/news/NewsGrid'
import { ProCard } from '@/components/pros/ProCard'
import { DOTA_PROS } from '@/components/pros/dotaPros'
import { useCurrentPatch } from '@/hooks/useData'

// ── Full TI History with complete rosters ─────────────────────────────
const TI_HISTORY = [
  {
    year: 'TI1 2011', name: 'Natus Vincere', prize: '$1,000,000', color: '#fbd38d',
    roster: [
      { nick: 'Dendi',          role: 'Mid',     flag: '🇺🇦' },
      { nick: 'Puppey',         role: 'Support', flag: '🇪🇪' },
      { nick: 'XBOCT',          role: 'Carry',   flag: '🇺🇦' },
      { nick: 'LightOfHeaven',  role: 'Support', flag: '🇷🇺' },
      { nick: 'ArtStyle',       role: 'Offlane', flag: '🇺🇦' },
    ],
  },
  {
    year: 'TI2 2012', name: 'Invictus Gaming', prize: '$1,000,000', color: '#f6ad55',
    roster: [
      { nick: 'Ferrari_430', role: 'Carry',   flag: '🇨🇳' },
      { nick: 'YYF',         role: 'Offlane', flag: '🇨🇳' },
      { nick: 'ChuaN',       role: 'Support', flag: '🇨🇳' },
      { nick: 'Faith',       role: 'Support', flag: '🇨🇳' },
      { nick: 'Zhou',        role: 'Mid',     flag: '🇨🇳' },
    ],
  },
  {
    year: 'TI3 2013', name: 'Alliance', prize: '$2,874,000', color: '#68d391',
    roster: [
      { nick: 'Loda',          role: 'Carry',   flag: '🇸🇪' },
      { nick: 's4',            role: 'Mid',     flag: '🇸🇪' },
      { nick: 'Akke',          role: 'Support', flag: '🇸🇪' },
      { nick: 'AdmiralBulldog',role: 'Offlane', flag: '🇸🇪' },
      { nick: 'EGM',           role: 'Support', flag: '🇸🇪' },
    ],
  },
  {
    year: 'TI4 2014', name: 'Newbee', prize: '$5,028,308', color: '#fbd38d',
    roster: [
      { nick: 'Hao',     role: 'Carry',   flag: '🇨🇳' },
      { nick: 'Mu',      role: 'Mid',     flag: '🇨🇳' },
      { nick: 'SanSheng',role: 'Support', flag: '🇨🇳' },
      { nick: 'xiao8',   role: 'IGL',     flag: '🇨🇳' },
      { nick: 'Banana',  role: 'Support', flag: '🇨🇳' },
    ],
  },
  {
    year: 'TI5 2015', name: 'Evil Geniuses', prize: '$6,634,600', color: '#63b3ed',
    roster: [
      { nick: 'SumaiL',   role: 'Mid',     flag: '🇵🇰' },
      { nick: 'Fear',     role: 'Carry',   flag: '🇺🇸' },
      { nick: 'ppd',      role: 'IGL',     flag: '🇺🇸' },
      { nick: 'Aui_2000', role: 'Support', flag: '🇨🇦' },
      { nick: 'UNiVeRsE', role: 'Offlane', flag: '🇺🇸' },
    ],
  },
  {
    year: 'TI6 2016', name: 'Wings Gaming', prize: '$9,139,002', color: '#a78bfa',
    roster: [
      { nick: 'shadow',    role: 'Carry',   flag: '🇨🇳' },
      { nick: "y`",        role: 'Mid',     flag: '🇨🇳' },
      { nick: 'bLink',     role: 'Support', flag: '🇨🇳' },
      { nick: 'iceice',    role: 'Offlane', flag: '🇨🇳' },
      { nick: 'Faith_bian',role: 'Support', flag: '🇨🇳' },
    ],
  },
  {
    year: 'TI7 2017', name: 'Team Liquid', prize: '$10,862,683', color: '#4fc3f7',
    roster: [
      { nick: 'Miracle-',      role: 'Mid',     flag: '🇯🇴' },
      { nick: 'MATUMBAMAN',    role: 'Carry',   flag: '🇫🇮' },
      { nick: 'KuroKy',        role: 'IGL',     flag: '🇩🇪' },
      { nick: 'MinD_ContRoL',  role: 'Offlane', flag: '🇧🇬' },
      { nick: 'GH',            role: 'Support', flag: '🇸🇦' },
    ],
  },
  {
    year: 'TI8 2018', name: 'OG', prize: '$11,234,158', color: '#f6e05e',
    roster: [
      { nick: 'ana',    role: 'Carry',   flag: '🇦🇺' },
      { nick: 'Ceb',    role: 'Offlane', flag: '🇫🇷' },
      { nick: 'N0tail', role: 'IGL',     flag: '🇩🇰' },
      { nick: 'Topson', role: 'Mid',     flag: '🇫🇮' },
      { nick: 'JerAx',  role: 'Support', flag: '🇫🇮' },
    ],
  },
  {
    year: 'TI9 2019', name: 'OG', prize: '$15,620,181', color: '#f6e05e',
    roster: [
      { nick: 'ana',    role: 'Carry',   flag: '🇦🇺' },
      { nick: 'Ceb',    role: 'Offlane', flag: '🇫🇷' },
      { nick: 'N0tail', role: 'IGL',     flag: '🇩🇰' },
      { nick: 'Topson', role: 'Mid',     flag: '🇫🇮' },
      { nick: 'JerAx',  role: 'Support', flag: '🇫🇮' },
    ],
  },
  {
    year: 'TI10 2021', name: 'Team Spirit', prize: '$18,208,300', color: '#48bb78',
    roster: [
      { nick: 'Yatoro',        role: 'Carry',   flag: '🇺🇦' },
      { nick: 'TORONTOTOKYO',  role: 'Mid',     flag: '🇷🇺' },
      { nick: 'Collapse',      role: 'Offlane', flag: '🇷🇺' },
      { nick: 'Mira',          role: 'Support', flag: '🇷🇺' },
      { nick: 'Miposhka',      role: 'IGL',     flag: '🇺🇦' },
    ],
  },
  {
    year: 'TI11 2022', name: 'Tundra Esports', prize: '$8,490,400', color: '#a78bfa',
    roster: [
      { nick: 'skiter',   role: 'Carry',   flag: '🇸🇪' },
      { nick: 'Nine',     role: 'Mid',     flag: '🇦🇹' },
      { nick: '33',       role: 'Offlane', flag: '🇳🇴' },
      { nick: 'Saksa',    role: 'Support', flag: '🇩🇰' },
      { nick: 'Sneyking', role: 'Support', flag: '🇩🇰' },
    ],
  },
  {
    year: 'TI12 2023', name: 'Gaimin Gladiators', prize: '$4,950,000', color: '#f97316',
    roster: [
      { nick: 'Skiter',      role: 'Carry',   flag: '🇸🇰' },
      { nick: 'Ace',         role: 'Mid',     flag: '🇸🇪' },
      { nick: 'tOfu',        role: 'Offlane', flag: '🇸🇬' },
      { nick: 'Quinn',       role: 'Support', flag: '🇺🇸' },
      { nick: 'Seleri',      role: 'IGL',     flag: '🇩🇪' },
    ],
  },
  {
    year: 'TI13 2024', name: 'Team Liquid', prize: '$1,153,268', color: '#4fc3f7',
    roster: [
      { nick: 'miCKe',   role: 'Carry',   flag: '🇸🇪' },
      { nick: 'Nisha',   role: 'Mid',     flag: '🇵🇱' },
      { nick: '33',      role: 'Offlane', flag: '🇳🇴' },
      { nick: 'Boxi',    role: 'Support', flag: '🇸🇪' },
      { nick: 'Insania', role: 'IGL',     flag: '🇸🇪' },
    ],
  },
  {
    year: 'TI14 2025', name: 'Team Falcons', prize: '$1,224,761', color: '#22c55e',
    roster: [
      { nick: 'skiter',   role: 'Carry',   flag: '🇸🇰' },
      { nick: 'Malr1ne',  role: 'Mid',     flag: '🇷🇺' },
      { nick: 'ATF',      role: 'Offlane', flag: '🇯🇴' },
      { nick: 'Cr1t-',    role: 'Support', flag: '🇩🇰' },
      { nick: 'Sneyking', role: 'IGL',     flag: '🇺🇸' },
    ],
  },
]

function TICard({ ti }: { ti: typeof TI_HISTORY[0] }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'var(--bg-3)' : 'var(--bg-2)',
        border: `1px solid ${hov ? ti.color + '50' : ti.color + '20'}`,
        borderRadius: 'var(--radius-md)', padding: '14px 15px',
        transition: 'all 0.18s', transform: hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? `0 8px 24px ${ti.color}18` : 'none',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 7 }}>
        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--text-3)', letterSpacing: '0.08em' }}>{ti.year}</span>
        <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: ti.color, fontWeight: 700 }}>{ti.prize}</span>
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: ti.color, marginBottom: 9, letterSpacing: '0.02em' }}>
        🏆 {ti.name}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {ti.roster.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ fontSize: 11 }}>{p.flag}</span>
            <span style={{ fontSize: 11, fontWeight: 600, color: hov ? 'var(--text-1)' : 'var(--text-2)', fontFamily: 'var(--font-mono)', flex: 1 }}>{p.nick}</span>
            <span style={{ fontSize: 9, color: 'var(--text-3)', background: 'rgba(255,255,255,0.04)', padding: '1px 5px', borderRadius: 3, fontFamily: 'var(--font-mono)' }}>{p.role}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

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

function SearchHero() {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const navigate = useNavigate()
  const { searchHistory } = useAppStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const recent = searchHistory.filter(h => h.game === 'dota').slice(0, 5)
  const doSearch = (raw?: string) => { const v = (raw ?? value).trim(); if (!v) return; navigate(`/player/${steamIdToAccountId(v)}`) }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(200,75,49,0.1) 0%, transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '48px 0 40px', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
          <img src="https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/global/dota2_logo_symbol.png" alt="" style={{ width: 52, height: 52, objectFit: 'contain', filter: 'drop-shadow(0 0 20px rgba(200,75,49,0.6))' }} onError={e => (e.currentTarget.style.display = 'none')} />
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 68, fontWeight: 600, letterSpacing: '0.1em', color: 'var(--text-0)', lineHeight: 1, margin: 0 }}>
            DOTA<span style={{ color: '#c84b31' }}>SCOPE</span>
          </h1>
        </div>
        <div style={{ width: 80, height: 2, background: 'linear-gradient(90deg, transparent, #c84b31, transparent)', marginBottom: 10 }} />
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)', marginBottom: 28, letterSpacing: '0.06em' }}>// stats · meta · leaderboards · pro-scene</p>
        <div style={{ width: '100%', maxWidth: 520 }}>
          <div style={{ display: 'flex', boxShadow: focused ? '0 0 0 3px rgba(200,75,49,0.15)' : 'none', borderRadius: 'var(--radius-md)', transition: 'box-shadow 0.2s' }}>
            <input ref={inputRef} value={value} onChange={e => setValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && doSearch()} onFocus={() => setFocused(true)} onBlur={() => setTimeout(() => setFocused(false), 150)}
              placeholder="Steam ID, Account ID or nickname..."
              style={{ flex: 1, background: 'var(--bg-2)', border: `1px solid ${focused ? '#c84b31' : 'var(--border-2)'}`, borderRight: 'none', borderRadius: 'var(--radius-md) 0 0 var(--radius-md)', padding: '13px 18px', color: 'var(--text-1)', fontFamily: 'var(--font-mono)', fontSize: 14, outline: 'none', transition: 'border-color 0.2s' }}
            />
            <button onClick={() => doSearch()} style={{ background: 'linear-gradient(135deg, #c84b31 0%, #e05535 100%)', border: 'none', borderRadius: '0 var(--radius-md) var(--radius-md) 0', padding: '13px 24px', color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: '0.08em', cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.15)')}
              onMouseLeave={e => (e.currentTarget.style.filter = 'brightness(1)')}
            >SEARCH →</button>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 10, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>examples:</span>
            {DOTA_DEMOS.map(({ name, id }) => (
              <button key={id} onClick={() => { setValue(id); doSearch(id) }} style={{ padding: '3px 10px', borderRadius: 4, fontSize: 11, fontFamily: 'var(--font-mono)', background: 'rgba(200,75,49,0.08)', border: '1px solid rgba(200,75,49,0.2)', color: '#e07a5f', cursor: 'pointer', transition: 'all 0.15s' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(200,75,49,0.18)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(200,75,49,0.08)')}
              >{name}</button>
            ))}
          </div>
          {recent.length > 0 && (
            <div style={{ display: 'flex', gap: 6, marginTop: 8, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>recent:</span>
              {recent.map(h => (
                <button key={h.id} onClick={() => navigate(`/player/${h.id}`)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', background: 'var(--bg-2)', border: '1px solid var(--border-1)', borderRadius: 4, color: 'var(--text-1)', cursor: 'pointer', fontSize: 11 }}>
                  {h.avatar && <img src={h.avatar} alt="" style={{ width: 16, height: 16, borderRadius: 2 }} />}
                  {h.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function QuickNav() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 44 }}>
      {[
        { icon: '⚔️', label: 'Heroes',      desc: '138+ heroes · WR · picks · bans',    link: '/heroes'      },
        { icon: '🏆', label: 'Leaderboard', desc: 'Top 1000 Immortal across 4 regions', link: '/leaderboard' },
        { icon: '📈', label: 'Meta',        desc: 'Pro picks / bans / WR · Patch 7.40', link: '/meta'        },
      ].map(({ icon, label, desc, link }) => (
        <a key={label} href={link} style={{ textDecoration: 'none' }}>
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-md)', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.15s' }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'rgba(200,75,49,0.4)'; el.style.background = 'var(--bg-3)'; el.style.transform = 'translateY(-2px)'; el.style.boxShadow = '0 6px 20px rgba(200,75,49,0.12)' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = 'var(--border-1)'; el.style.background = 'var(--bg-2)'; el.style.transform = ''; el.style.boxShadow = '' }}
          >
            <span style={{ fontSize: 28 }}>{icon}</span>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'var(--text-0)' }}>{label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{desc}</div>
            </div>
            <span style={{ color: 'var(--text-3)', marginLeft: 'auto', fontSize: 16 }}>→</span>
          </div>
        </a>
      ))}
    </div>
  )
}

export function DotaHomePage() {
  return (
    <div className="fade-up">
      <SearchHero />
      <QuickNav />

      <SH title="DOTA 2 |NEWS" accent="#c84b31" link="https://www.dota2.com/news" linkLabel="dota2.com →" />
      <div style={{ marginBottom: 52 }}>
        <NewsGrid fetcher={fetchDota2News} homeUrl="https://www.dota2.com/news" accentColor="#c84b31" count={9} />
      </div>

      <SH title="PRO |PLAYERS DOTA 2" accent="#c84b31" link="https://liquipedia.net/dota2/Portal:Players" linkLabel="all players →" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 52 }}>
        {DOTA_PROS.map(p => <ProCard key={p.nickname} p={p} />)}
      </div>

      <SH title="CHAMPIONS |THE INTERNATIONAL" accent="#f5a623" link="https://liquipedia.net/dota2/The_International" linkLabel="TI history →" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10, marginBottom: 52 }}>
        {TI_HISTORY.map(ti => <TICard key={ti.year} ti={ti} />)}
      </div>

      <SH title="BEST |HIGHLIGHTS DOTA 2" accent="#c84b31" link="https://www.youtube.com/results?search_query=Dota+2+tournament+highlights+2025" linkLabel="YouTube →" />
      <div style={{ marginBottom: 52 }}>
        <HighlightsSection game="dota" accent="#c84b31" />
      </div>
    </div>
  )
}
