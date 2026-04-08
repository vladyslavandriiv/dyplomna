import { useState, useMemo, useCallback, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getHeroStats } from '@/api/opendota'
import { fetchDota2News } from '@/api/news'
import { HeroIcon } from '@/utils/icons'
import { ATTR_MAP, RANK_BRACKETS, DOTA_PATCHES, CURRENT_PATCH, CURRENT_PATCH_NOTES_URL } from '@/utils/constants'
import type { HeroStat } from '@/types'

// Rank key mappings for OpenDota API heroStats fields
const RANK_WR_KEYS: Record<number, { games: string; wins: string }> = {
  1: { games: '1_pick', wins: '1_win' },
  2: { games: '2_pick', wins: '2_win' },
  3: { games: '3_pick', wins: '3_win' },
  4: { games: '4_pick', wins: '4_win' },
  5: { games: '5_pick', wins: '5_win' },
  6: { games: '6_pick', wins: '6_win' },
  7: { games: '7_pick', wins: '7_win' },
  8: { games: '8_pick', wins: '8_win' },
  9: { games: '8_pick', wins: '8_win' }, // Titan uses Immortal data
}

type SortKey = 'name' | 'wr' | 'picks' | 'pro_wr' | 'pro_picks' | 'pro_bans' | 'allWr'
type SortDir = 'asc' | 'desc'
type View = 'pub' | 'pro'

function wrColor(wr: number): string {
  if (wr >= 56) return '#22d48a'
  if (wr >= 53) return '#6fc97a'
  if (wr >= 50.5) return '#a9c464'
  if (wr >= 48) return '#f5a623'
  if (wr >= 45) return '#ff7043'
  return '#ff4757'
}

function WRBar({ wr, games }: { wr: number; games: number }) {
  const color = wrColor(wr)
  if (games === 0) return <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>—</span>
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{ width: 60, height: 5, background: 'var(--bg-4)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${Math.min(100, wr)}%`, height: '100%', background: color, borderRadius: 3, transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color, fontWeight: 700, minWidth: 44 }}>{wr.toFixed(1)}%</span>
    </div>
  )
}

function SortArrow({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span style={{ color: 'var(--text-3)', fontSize: 10 }}>↕</span>
  return <span style={{ color: 'var(--accent)', fontSize: 10 }}>{dir === 'desc' ? '↓' : '↑'}</span>
}

function Th({ label, sortK, current, dir, onSort }: { label: string; sortK: SortKey; current: SortKey; dir: SortDir; onSort: (k: SortKey) => void }) {
  const active = current === sortK
  return (
    <th onClick={() => onSort(sortK)} style={{ padding: '9px 10px', textAlign: 'left', cursor: 'pointer', userSelect: 'none', fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', color: active ? 'var(--accent)' : 'var(--text-3)', fontWeight: 700, background: active ? 'rgba(200,75,49,0.05)' : 'transparent', whiteSpace: 'nowrap', transition: 'color 0.15s' }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{label} <SortArrow active={active} dir={dir} /></span>
    </th>
  )
}

function TierBadge({ wr, games }: { wr: number; games: number }) {
  if (games < 30) return null
  const tiers = [
    { min: 56, label: 'S+', bg: 'rgba(34,212,138,0.18)', border: 'rgba(34,212,138,0.35)', color: '#22d48a' },
    { min: 53, label: 'S',  bg: 'rgba(34,212,138,0.12)', border: 'rgba(34,212,138,0.25)', color: '#6fc97a' },
    { min: 51, label: 'A',  bg: 'rgba(111,201,122,0.12)', border: 'rgba(111,201,122,0.25)', color: '#a9c464' },
    { min: 48, label: 'B',  bg: 'rgba(245,166,35,0.12)', border: 'rgba(245,166,35,0.25)', color: '#f5a623' },
    { min: 45, label: 'C',  bg: 'rgba(255,112,67,0.12)', border: 'rgba(255,112,67,0.25)', color: '#ff7043' },
    { min: 0,  label: 'D',  bg: 'rgba(255,71,87,0.10)',  border: 'rgba(255,71,87,0.25)', color: '#ff4757' },
  ]
  const tier = tiers.find(t => wr >= t.min) || tiers[tiers.length - 1]
  return (
    <span style={{ fontSize: 9, padding: '2px 6px', borderRadius: 3, background: tier.bg, border: `1px solid ${tier.border}`, color: tier.color, fontFamily: 'var(--font-mono)', fontWeight: 900, letterSpacing: '0.06em' }}>
      {tier.label}
    </span>
  )
}

// Live patch indicator — shows current patch from Steam news or fallback
function LivePatchBadge() {
  const [livePatch, setLivePatch] = useState(CURRENT_PATCH)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Try to get latest patch from Dota2 Steam news
    fetchDota2News(5).then(news => {
      for (const n of news) {
        const m = n.title?.match(/7\.\d+[a-z]?/i) || n.contents?.match(/Patch\s+(7\.\d+[a-z]?)/i)
        if (m) { setLivePatch(m[0].replace('Patch ', '')); break }
      }
      setLoaded(true)
    }).catch(() => setLoaded(true))
  }, [])

  const knownPatch = DOTA_PATCHES.find(p => p.version === livePatch)
  const label = knownPatch?.label || livePatch

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 12px', background: 'rgba(34,212,138,0.08)', border: '1px solid rgba(34,212,138,0.25)', borderRadius: 6 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22d48a', display: 'inline-block', animation: 'pulse-dot 2s infinite', flexShrink: 0 }} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: '#22d48a', letterSpacing: '0.06em' }}>
        PATCH {livePatch}
      </span>
      {!loaded && <span style={{ fontSize: 9, color: 'var(--text-3)' }}>...</span>}
      <a href={`https://www.dota2.com/patches/${livePatch}`} target="_blank" rel="noopener noreferrer"
        style={{ fontSize: 9, color: 'var(--text-3)', textDecoration: 'none', letterSpacing: '0.05em' }}
        onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
        onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
      >notes →</a>
    </div>
  )
}

interface EnrichedHero extends HeroStat {
  _wr: number; _picks: number; _pro_wr: number; _pro_picks: number; _pro_bans: number; _allWR: number; _allPicks: number
}

export function HeroesPage() {
  const { data: heroes = [], isLoading, error } = useQuery<HeroStat[]>({
    queryKey: ['heroStats'], queryFn: getHeroStats, staleTime: 5 * 60 * 1000,
  })

  const [attr, setAttr]               = useState<string>('all')
  const [search, setSearch]           = useState('')
  const [sortKey, setSortKey]         = useState<SortKey>('wr')
  const [sortDir, setSortDir]         = useState<SortDir>('desc')
  const [rankBracket, setRankBracket] = useState<number>(7)
  const [view, setView]               = useState<View>('pub')
  const [patch, setPatch]             = useState(DOTA_PATCHES[0].version)

  const toggleSort = useCallback((key: SortKey) => {
    if (key === sortKey) setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setSortKey(key); setSortDir('desc') }
  }, [sortKey])

  const filtered = useMemo<EnrichedHero[]>(() => {
    let list = [...heroes]
    if (attr !== 'all') list = list.filter(h => h.primary_attr === attr)
    if (search) list = list.filter(h => h.localized_name?.toLowerCase().includes(search.toLowerCase()))

    // Titan (id=9) uses same data as Immortal (id=8)
    const bracketId = rankBracket === 9 ? 8 : rankBracket
    const rk = RANK_WR_KEYS[bracketId]

    const enriched = list.map(h => {
      const picks   = rk ? Number((h as any)[rk.games] || 0) : 0
      const wins    = rk ? Number((h as any)[rk.wins]  || 0) : 0
      const wr      = picks > 0 ? (wins / picks) * 100 : 0
      const proPicks= h.pro_pick || 0
      const proWins = h.pro_win  || 0
      const proWR   = proPicks > 0 ? (proWins / proPicks) * 100 : 0
      // All brackets combined
      const allPicks = Object.entries(RANK_WR_KEYS).filter(([k]) => Number(k) <= 8).reduce((s, [, r]) => s + Number((h as any)[r.games] || 0), 0)
      const allWins  = Object.entries(RANK_WR_KEYS).filter(([k]) => Number(k) <= 8).reduce((s, [, r]) => s + Number((h as any)[r.wins]  || 0), 0)
      const allWR    = allPicks > 0 ? (allWins / allPicks) * 100 : 0
      return { ...h, _wr: wr, _picks: picks, _pro_wr: proWR, _pro_picks: proPicks, _pro_bans: h.pro_ban || 0, _allWR: allWR, _allPicks: allPicks }
    })

    const sk: SortKey = view === 'pro' && sortKey === 'wr' ? 'pro_wr' : view === 'pro' && sortKey === 'picks' ? 'pro_picks' : sortKey
    enriched.sort((a, b) => {
      if (sk === 'name') return sortDir === 'asc' ? (a.localized_name || '').localeCompare(b.localized_name || '') : (b.localized_name || '').localeCompare(a.localized_name || '')
      const map: Record<SortKey, number[]> = {
        name: [0, 0], wr: [a._wr, b._wr], picks: [a._picks, b._picks],
        pro_wr: [a._pro_wr, b._pro_wr], pro_picks: [a._pro_picks, b._pro_picks],
        pro_bans: [a._pro_bans, b._pro_bans], allWr: [a._allWR, b._allWR],
      }
      const [va, vb] = map[sk]
      return sortDir === 'desc' ? vb - va : va - vb
    })
    return enriched
  }, [heroes, attr, search, sortKey, sortDir, rankBracket, view])

  const curBracket = RANK_BRACKETS.find(r => r.id === rankBracket)

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8, flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-0)', margin: 0 }}>
            HERO <span style={{ color: '#4fc3f7' }}>DATABASE</span>
          </h1>
          <LivePatchBadge />
          <a href={CURRENT_PATCH_NOTES_URL} target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', textDecoration: 'none', marginLeft: 'auto', padding: '4px 10px', border: '1px solid var(--border-1)', borderRadius: 5 }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-3)')}
          >📋 Patch Notes →</a>
        </div>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', margin: 0 }}>
          // {filtered.length} heroes · OpenDota API data · updates every 5 min
        </p>
      </div>

      {/* Controls */}
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-md)', padding: '14px 16px', marginBottom: 14, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        {/* Pub / Pro toggle */}
        <div style={{ display: 'flex', background: 'var(--bg-4)', borderRadius: 6, padding: 2, gap: 2, flexShrink: 0 }}>
          {(['pub','pro'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding: '5px 16px', borderRadius: 5, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', transition: 'all 0.15s', background: view === v ? '#c84b31' : 'transparent', color: view === v ? '#fff' : 'var(--text-3)' }}>
              {v === 'pub' ? '🎮 PUBLIC' : '🏆 PRO SCENE'}
            </button>
          ))}
        </div>

        {/* Attr filter */}
        <div style={{ display: 'flex', gap: 4 }}>
          {[['all','All','#a78bfa'],['str','STR','#e05e3e'],['agi','AGI','#3ecc76'],['int','INT','#5b9cf6'],['all2','UNI','#9aa8b2']] .map(([v,l,c]) => {
            const active = v === 'all2' ? attr === 'all' && false : attr === v
            return (
              <button key={v} onClick={() => { if (v === 'all' || v === 'all2') setAttr('all'); else setAttr(v) }}
                style={{ padding: '4px 10px', borderRadius: 5, border: `1px solid ${attr === (v === 'all2' ? 'all' : v) ? c : 'transparent'}`, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', transition: 'all 0.15s', background: attr === (v === 'all2' ? 'all' : v) ? `${c}22` : 'var(--bg-4)', color: attr === (v === 'all2' ? 'all' : v) ? c : 'var(--text-3)' }}>
                {l}
              </button>
            )
          })}
        </div>

        {/* Patch selector */}
        <select value={patch} onChange={e => setPatch(e.target.value)}
          style={{ padding: '5px 10px', background: 'var(--bg-4)', border: '1px solid var(--border-2)', borderRadius: 5, color: DOTA_PATCHES.find(p2 => p2.version === patch)?.isCurrent ? '#22d48a' : 'var(--text-1)', fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'pointer', outline: 'none' }}>
          {DOTA_PATCHES.map(p2 => <option key={p2.version} value={p2.version}>{p2.label}</option>)}
        </select>

        {/* Search */}
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search hero..."
          style={{ flex: 1, minWidth: 140, padding: '5px 12px', background: 'var(--bg-4)', border: '1px solid var(--border-2)', borderRadius: 5, color: 'var(--text-1)', fontFamily: 'var(--font-mono)', fontSize: 11, outline: 'none' }}
        />
      </div>

      {/* Rank bracket pills (pub only) */}
      {view === 'pub' && (
        <div style={{ display: 'flex', gap: 5, marginBottom: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginRight: 2 }}>Rank:</span>
          {RANK_BRACKETS.map(r => (
            <button key={r.id} onClick={() => setRankBracket(r.id)}
              title={r.id === 9 ? 'Immortal Top-1000 (data = Immortal)' : undefined}
              style={{ padding: '3px 10px', borderRadius: 4, border: `1px solid ${rankBracket === r.id ? r.color : 'transparent'}`, cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', background: rankBracket === r.id ? `${r.color}18` : 'var(--bg-2)', color: rankBracket === r.id ? r.color : 'var(--text-3)', transition: 'all 0.15s' }}>
              {r.icon} {r.name}
            </button>
          ))}
        </div>
      )}

      {/* Stats context banner */}
      {view === 'pub' && curBracket && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', background: `${curBracket.color}08`, border: `1px solid ${curBracket.color}20`, borderRadius: 7, marginBottom: 12, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 18 }}>{curBracket.icon}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: curBracket.color, letterSpacing: '0.06em' }}>{curBracket.name.toUpperCase()}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)' }}>
            · WR calculated from {curBracket.name} rank games
            {curBracket.id === 9 ? ' (uses Immortal data, Titan = Top-1000 leaderboard)' : ''}
          </span>
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)' }}>
            Patch: <span style={{ color: '#22d48a' }}>{patch}</span>
            {patch !== CURRENT_PATCH && <span style={{ color: '#f5a623', marginLeft: 4 }}>⚠ outdated</span>}
          </span>
        </div>
      )}

      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {Array.from({ length: 14 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 42, borderRadius: 4, animationDelay: `${i * 0.04}s` }} />)}
        </div>
      )}
      {error && <div style={{ padding: 32, textAlign: 'center', color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>❌ Failed to load OpenDota API data</div>}

      {!isLoading && !error && (
        <div style={{ border: '1px solid var(--border-1)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-2)', borderBottom: '1px solid var(--border-1)' }}>
                <th style={{ padding: '9px 10px', textAlign: 'left', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.08em', width: 36 }}>#</th>
                <Th label="HERO"   sortK="name"      current={sortKey} dir={sortDir} onSort={toggleSort} />
                <th style={{ padding: '9px 10px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.08em', textAlign: 'left' }}>ATTR</th>
                {view === 'pub' ? (
                  <>
                    <Th label="WINRATE"   sortK="wr"        current={sortKey} dir={sortDir} onSort={toggleSort} />
                    <Th label="PICKRATE"  sortK="picks"     current={sortKey} dir={sortDir} onSort={toggleSort} />
                    <Th label="ALL WR"    sortK="allWr"     current={sortKey} dir={sortDir} onSort={toggleSort} />
                  </>
                ) : (
                  <>
                    <Th label="PRO WR"    sortK="pro_wr"    current={sortKey} dir={sortDir} onSort={toggleSort} />
                    <Th label="PRO PICKS" sortK="pro_picks" current={sortKey} dir={sortDir} onSort={toggleSort} />
                    <Th label="PRO BANS"  sortK="pro_bans"  current={sortKey} dir={sortDir} onSort={toggleSort} />
                  </>
                )}
                <th style={{ padding: '9px 10px', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', fontWeight: 700, letterSpacing: '0.08em', textAlign: 'left' }}>TIER</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((h, i) => {
                const isEven = i % 2 === 0
                const displayWR = view === 'pub' ? h._wr : h._pro_wr
                const displayGames = view === 'pub' ? h._picks : h._pro_picks
                return (
                  <tr key={h.id}
                    style={{ background: isEven ? 'transparent' : 'rgba(255,255,255,0.01)', borderBottom: '1px solid var(--border-0)', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.background = isEven ? 'transparent' : 'rgba(255,255,255,0.01)')}
                  >
                    <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', width: 36 }}>{i + 1}</td>
                    <td style={{ padding: '8px 10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <HeroIcon heroId={h.id} size={28} />
                        <div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: 'var(--text-0)', lineHeight: 1.2 }}>{h.localized_name}</div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-3)', lineHeight: 1 }}>{h.attack_type}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '8px 10px' }}>
                      {h.primary_attr && (
                        <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.08em', padding: '2px 7px', borderRadius: 3, fontFamily: 'var(--font-mono)',
                          color: h.primary_attr === 'str' ? '#e05e3e' : h.primary_attr === 'agi' ? '#3ecc76' : h.primary_attr === 'int' ? '#5b9cf6' : '#a78bfa',
                          background: h.primary_attr === 'str' ? 'rgba(224,94,62,0.12)' : h.primary_attr === 'agi' ? 'rgba(62,204,118,0.12)' : h.primary_attr === 'int' ? 'rgba(91,156,246,0.12)' : 'rgba(167,139,250,0.12)',
                          border: `1px solid ${h.primary_attr === 'str' ? 'rgba(224,94,62,0.25)' : h.primary_attr === 'agi' ? 'rgba(62,204,118,0.25)' : h.primary_attr === 'int' ? 'rgba(91,156,246,0.25)' : 'rgba(167,139,250,0.25)'}`
                        }}>
                          {ATTR_MAP[h.primary_attr] || h.primary_attr.toUpperCase()}
                        </span>
                      )}
                    </td>
                    {view === 'pub' ? (
                      <>
                        <td style={{ padding: '8px 10px' }}><WRBar wr={h._wr} games={h._picks} /></td>
                        <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-2)' }}>{h._picks > 0 ? h._picks.toLocaleString('en') : '—'}</td>
                        <td style={{ padding: '8px 10px' }}><WRBar wr={h._allWR} games={1} /></td>
                      </>
                    ) : (
                      <>
                        <td style={{ padding: '8px 10px' }}><WRBar wr={h._pro_wr} games={h._pro_picks} /></td>
                        <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-2)' }}>{h._pro_picks > 0 ? h._pro_picks : '—'}</td>
                        <td style={{ padding: '8px 10px', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-2)' }}>{h._pro_bans > 0 ? h._pro_bans : '—'}</td>
                      </>
                    )}
                    <td style={{ padding: '8px 10px' }}>
                      <TierBadge wr={displayWR} games={displayGames} />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div style={{ padding: '10px 16px', background: 'var(--bg-2)', borderTop: '1px solid var(--border-1)', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
            <span>Showing: <strong style={{ color: 'var(--text-1)' }}>{filtered.length}</strong> of {heroes.length} heroes</span>
            <span>
              Mode: <strong style={{ color: view === 'pub' ? '#4fc3f7' : '#f5a623' }}>{view === 'pub' ? 'Public' : 'Pro Scene'}</strong>
              {view === 'pub' && curBracket && <> · Rank: <strong style={{ color: curBracket.color }}>{curBracket.name}</strong></>}
              {' '} · OpenDota API
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
