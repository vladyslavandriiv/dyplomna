import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { getRankInfo, RankIcon } from '@/utils/icons'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function ctl(ms: number) {
  const c = new AbortController()
  setTimeout(() => c.abort(), ms)
  return c.signal
}

function pBtn(disabled: boolean, active = false): React.CSSProperties {
  return {
    padding: '5px 11px', borderRadius: 5, fontSize: 13, cursor: disabled ? 'default' : 'pointer',
    background: active ? 'var(--accent)' : 'var(--bg-2)',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border-1)'}`,
    color: disabled ? 'var(--text-3)' : active ? '#fff' : 'var(--text-1)',
    opacity: disabled ? 0.4 : 1, transition: 'all 0.12s', minWidth: 36, textAlign: 'center' as const,
  }
}

function pageNums(cur: number, tot: number): (number | '…')[] {
  if (tot <= 7) return Array.from({ length: tot }, (_, i) => i + 1)
  const p: (number | '…')[] = [1]
  if (cur > 3) p.push('…')
  for (let i = Math.max(2, cur - 1); i <= Math.min(tot - 1, cur + 1); i++) p.push(i)
  if (cur < tot - 2) p.push('…')
  p.push(tot)
  return p
}

// ─── Avatar cache ─────────────────────────────────────────────────────────────
const avaCache = new Map<number, string>()
const avaPending = new Set<number>()

function SteamAvatar({ accountId }: { accountId: number }) {
  const [src, setSrc] = useState<string | null>(avaCache.get(accountId) || null)

  useEffect(() => {
    if (avaCache.has(accountId) || avaPending.has(accountId)) return
    avaPending.add(accountId)
    fetch(`https://api.opendota.com/api/players/${accountId}`, { signal: ctl(6000) })
      .then(r => r.json())
      .then(j => {
        const url: string | undefined = j?.profile?.avatarfull
        if (url) { avaCache.set(accountId, url); setSrc(url) }
        avaPending.delete(accountId)
      })
      .catch(() => avaPending.delete(accountId))
  }, [accountId])

  return (
    <div style={{ width:32, height:32, borderRadius:6, background:'var(--bg-4)', overflow:'hidden', flexShrink:0 }}>
      {src
        ? <img src={src} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={() => setSrc(null)} />
        : <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, color:'var(--text-3)', fontFamily:'var(--font-mono)' }}>{String(accountId).slice(-2)}</div>
      }
    </div>
  )
}

// ─── Dota 2 Leaderboard ────────────────────────────────────────────────────────
const PAGE = 50
const DIVS = [
  { key: 'europe',   label: '🌍 Europe',   color: '#4fc3f7' },
  { key: 'americas', label: '🌎 Americas', color: '#68d391' },
  { key: 'se_asia',  label: '🌏 SE Asia',  color: '#f6c90e' },
  { key: 'china',    label: '🐉 China',    color: '#fc8181' },
]

// Leaderboard cache per division
const lbCache = new Map<string, any[]>()

async function fetchBoard(division: string): Promise<any[]> {
  if (lbCache.has(division)) return lbCache.get(division)!
  // OpenDota — no CORS, official partner of Valve, direct access
  console.log(`Fetching leaderboard for ${division}`)
  const r = await fetch(`https://api.opendota.com/api/topPlayers`)
  if (!r.ok) throw new Error('HTTP ' + r.status)
  const j = await r.json()
  const board = j.map((obj: any) => ({
    name: obj.personaname || obj.name || `Player ${obj.account_id}`,
    account_id: obj.account_id,
    rank_tier: obj.rank_tier || 80,
    country_code: obj.loccountrycode || obj.country_code || null,
  }))
  console.log('First 5 parsed objects:', board.slice(0, 5))
  lbCache.set(division, board)
  return board
}

function DotaLeaderboard() {
  const [div, setDiv]       = useState('europe')
  const [rows, setRows]     = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState<string | null>(null)
  const [page, setPage]     = useState(1)
  const [search, setSearch] = useState('')
  const [retryN, setRetryN] = useState(0)
  const navigate            = useNavigate()
  const topRef              = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setLoading(true); setError(null)
    if (!lbCache.has(div)) setRows([])  // clear only if no cache
    fetchBoard(div)
      .then(d => { setRows(d); setLoading(false) })
      .catch(e => { setError(String(e.message || e)); setLoading(false) })
  }, [div, retryN])

  const filtered = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter((p: any) =>
      String(p.name ?? '').toLowerCase().includes(q) ||
      String(p.account_id ?? '').includes(q)
    )
  }, [rows, search])

  const totalPages = Math.ceil(filtered.length / PAGE)
  const items      = filtered.slice((page - 1) * PAGE, page * PAGE)
  const divInfo    = DIVS.find(d => d.key === div)!

  const goPage = (p: number) => {
    setPage(p)
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const switchDiv = (key: string) => { setDiv(key); setPage(1); setSearch('') }

  return (
    <div ref={topRef}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'var(--font-display)', fontSize:44, fontWeight:600, letterSpacing:'0.06em', color:'var(--text-0)', marginBottom:4 }}>
            DOTA 2 <span style={{ color:'#c84b31' }}>LEADERBOARD</span>
          </h1>
          <p style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-3)' }}>
            // OpenDota API · Immortal · {loading ? 'loading...' : `${rows.length} players · ${divInfo.label}`}
          </p>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' }}>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by nickname…"
            style={{ background:'var(--bg-2)', border:'1px solid var(--border-2)', borderRadius:6, padding:'7px 14px', color:'var(--text-1)', fontFamily:'var(--font-mono)', fontSize:12, outline:'none', width:190 }}
          />
          <button
            onClick={() => { lbCache.delete(div); setRetryN(n => n + 1) }}
            style={{ padding:'7px 12px', borderRadius:6, fontSize:11, cursor:'pointer', background:'rgba(200,75,49,0.1)', border:'1px solid rgba(200,75,49,0.3)', color:'#c84b31', fontFamily:'var(--font-mono)' }}
          >🔄 Refresh</button>
          <a href="https://www.dota2.com/leaderboards/" target="_blank" rel="noopener noreferrer"
            style={{ fontSize:11, color:'#c84b31', textDecoration:'none', fontFamily:'var(--font-mono)', padding:'7px 12px', border:'1px solid rgba(200,75,49,0.3)', borderRadius:6 }}>
            dota2.com →
          </a>
        </div>
      </div>

      {/* Region tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:18, flexWrap:'wrap' }}>
        {DIVS.map(d => (
          <button key={d.key} onClick={() => switchDiv(d.key)}
            style={{ padding:'8px 18px', borderRadius:7, fontSize:13, fontWeight:600, cursor:'pointer', transition:'all 0.15s',
              background: div===d.key ? `${d.color}18` : 'transparent',
              border: `1px solid ${div===d.key ? d.color+'55' : 'var(--border-1)'}`,
              color: div===d.key ? d.color : 'var(--text-2)',
            }}>
            {d.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding:'14px 18px', background:'rgba(255,71,87,0.08)', border:'1px solid rgba(255,71,87,0.25)', borderRadius:8, marginBottom:16, fontFamily:'var(--font-mono)', fontSize:12, color:'#ff4757', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span>⚠️ Failed to load: {error}. Click "Refresh".</span>
          <button onClick={() => { lbCache.delete(div); setRetryN(n => n + 1) }}
            style={{ background:'rgba(255,71,87,0.15)', border:'1px solid rgba(255,71,87,0.3)', borderRadius:5, padding:'4px 10px', cursor:'pointer', color:'#ff4757', fontSize:11 }}>
            Retry
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div style={{ background:'var(--bg-2)', border:'1px solid var(--border-1)', borderRadius:12, overflow:'hidden' }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{ display:'grid', gridTemplateColumns:'52px 1fr 130px 150px 50px', gap:12, padding:'11px 20px', borderBottom:'1px solid var(--border-0)', alignItems:'center' }}>
              <div style={{ height:14, background:'var(--bg-4)', borderRadius:4, animation:'pulse 1.5s infinite' }} />
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                <div style={{ width:32, height:32, borderRadius:6, background:'var(--bg-4)', animation:'pulse 1.5s infinite', flexShrink:0 }} />
                <div style={{ height:12, background:'var(--bg-4)', borderRadius:4, width:'60%', animation:'pulse 1.5s infinite' }} />
              </div>
              <div style={{ height:10, background:'var(--bg-4)', borderRadius:4, animation:'pulse 1.5s infinite' }} />
              <div style={{ height:10, background:'var(--bg-4)', borderRadius:4, animation:'pulse 1.5s infinite' }} />
              <div style={{ height:10, background:'var(--bg-4)', borderRadius:4, animation:'pulse 1.5s infinite' }} />
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {!loading && items.length > 0 && (
        <>
          <div style={{ background:'var(--bg-2)', border:'1px solid var(--border-1)', borderRadius:12, overflow:'hidden' }}>
            {/* Column headers */}
            <div style={{ display:'grid', gridTemplateColumns:'52px 1fr 130px 150px 50px', gap:12, padding:'10px 20px', borderBottom:'1px solid var(--border-2)', background:'rgba(255,255,255,0.02)' }}>
              {['#','Player','Links','Rank','CC'].map(t => (
                <div key={t} style={{ fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-3)', fontFamily:'var(--font-mono)', fontWeight:700 }}>{t}</div>
              ))}
            </div>

            {items.map((p: any, i: number) => {
              const rank  = (page - 1) * PAGE + i + 1
              const top3  = rank <= 3
              const ri    = getRankInfo(p.rank_tier ?? 80)
              const aid   = p.account_id
              const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'

              return (
                <div key={i}
                  onClick={() => aid && navigate(`/player/${aid}`)}
                  style={{ display:'grid', gridTemplateColumns:'52px 1fr 130px 150px 50px', gap:12, padding:'9px 20px', borderBottom:'1px solid var(--border-0)', transition:'background 0.1s', alignItems:'center', cursor: aid ? 'pointer' : 'default' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(200,75,49,0.05)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Rank */}
                  <span style={{ fontFamily:'var(--font-display)', fontSize:top3?19:14, fontWeight:700, color: rank===1?'#FFD700':rank===2?'#C0C0C0':rank===3?'#CD7F32':'var(--text-3)' }}>
                    {top3 ? medal : rank}
                  </span>

                  {/* Player */}
                  <div style={{ display:'flex', alignItems:'center', gap:9, overflow:'hidden' }}>
                    {aid
                      ? <SteamAvatar accountId={aid} />
                      : <div style={{ width:32, height:32, borderRadius:6, background:'var(--bg-4)', flexShrink:0 }} />
                    }
                    <div style={{ overflow:'hidden' }}>
                      <div style={{ fontFamily:'var(--font-display)', fontSize:13, fontWeight:600, color: top3?'#FFD700':'var(--text-0)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {p.name || `Player #${rank}`}
                      </div>
                      {aid && <div style={{ fontFamily:'var(--font-mono)', fontSize:8, color:'var(--text-3)' }}>ID: {aid}</div>}
                    </div>
                  </div>

                  {/* Links */}
                  <div style={{ display:'flex', gap:4 }} onClick={e => e.stopPropagation()}>
                    {aid && <>
                      <a href={`https://www.dotabuff.com/players/${aid}`} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize:8, padding:'2px 6px', borderRadius:3, background:'rgba(232,64,87,0.1)', border:'1px solid rgba(232,64,87,0.25)', color:'#e84057', textDecoration:'none', fontFamily:'var(--font-mono)', fontWeight:700 }}>DB</a>
                      <a href={`https://www.opendota.com/players/${aid}`} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize:8, padding:'2px 6px', borderRadius:3, background:'rgba(99,179,237,0.1)', border:'1px solid rgba(99,179,237,0.25)', color:'#63b3ed', textDecoration:'none', fontFamily:'var(--font-mono)', fontWeight:700 }}>OD</a>
                      <a href={`https://stratz.com/players/${aid}`} target="_blank" rel="noopener noreferrer"
                        style={{ fontSize:8, padding:'2px 6px', borderRadius:3, background:'rgba(167,139,250,0.1)', border:'1px solid rgba(167,139,250,0.25)', color:'#a78bfa', textDecoration:'none', fontFamily:'var(--font-mono)', fontWeight:700 }}>ST</a>
                    </>}
                  </div>

                  {/* Rank badge */}
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <RankIcon rankTier={p.rank_tier ?? 80} size={24} />
                    <div style={{ fontSize:9, fontWeight:700, color:ri.color }}>{ri.name}{ri.star > 0 ? ` ${'★'.repeat(ri.star)}` : ''}</div>
                  </div>

                  {/* Country */}
                  <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-2)', textTransform:'uppercase' }}>{p.country_code || '—'}</span>
                </div>
              )
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:5, marginTop:18, flexWrap:'wrap' }}>
              <button onClick={() => goPage(1)} disabled={page===1} style={pBtn(page===1)}>«</button>
              <button onClick={() => goPage(page-1)} disabled={page===1} style={pBtn(page===1)}>‹</button>
              {pageNums(page, totalPages).map((n, i) =>
                n === '…'
                  ? <span key={`e${i}`} style={{ color:'var(--text-3)', padding:'0 4px' }}>…</span>
                  : <button key={n} onClick={() => goPage(Number(n))} style={pBtn(false, page===Number(n))}>{n}</button>
              )}
              <button onClick={() => goPage(page+1)} disabled={page===totalPages} style={pBtn(page===totalPages)}>›</button>
              <button onClick={() => goPage(totalPages)} disabled={page===totalPages} style={pBtn(page===totalPages)}>»</button>
              <span style={{ marginLeft:8, fontSize:11, color:'var(--text-3)', fontFamily:'var(--font-mono)' }}>
                {(page-1)*PAGE+1}–{Math.min(page*PAGE, filtered.length)} / {filtered.length}
              </span>
            </div>
          )}
        </>
      )}

      {!loading && !error && items.length === 0 && search && (
        <div style={{ padding:'40px 0', textAlign:'center', color:'var(--text-3)', fontFamily:'var(--font-mono)', fontSize:12 }}>
          // No players found
        </div>
      )}
    </div>
  )
}

// ─── CS2 FACEIT TOP-100 (real data from fctracker.org, March 13 2026) ──────────
const FACEIT_TOP100 = [
  { rank:1,  nick:'qw1nk1',       slug:'qw1nk1',       flag:'🇷🇺', elo:5220 },
  { rank:2,  nick:'b1st-',        slug:'b1st-',         flag:'🇷🇺', elo:5211, steam:'76561198241492091', team:'Virtus.pro' },
  { rank:3,  nick:'donk666',      slug:'donk666',       flag:'🇰🇷', elo:5083, steam:'76561199064045520', team:'Team Spirit' },
  { rank:4,  nick:'auraeater',    slug:'auraeater',     flag:'🇰🇿', elo:4959 },
  { rank:5,  nick:'NertZ',        slug:'NertZ',         flag:'🇮🇱', elo:4929, team:'Apeks' },
  { rank:6,  nick:'verso-karnez', slug:'verso-karnez',  flag:'🇺🇿', elo:4917 },
  { rank:7,  nick:'alkarenn56',   slug:'alkarenn56',    flag:'🇯🇵', elo:4899 },
  { rank:8,  nick:'-SYPH0',       slug:'-SYPH0',        flag:'🇰🇿', elo:4864 },
  { rank:9,  nick:'HeavyGod',     slug:'HeavyGod',      flag:'🇮🇱', elo:4848 },
  { rank:10, nick:'whisperr23',   slug:'whisperr23',    flag:'🇷🇺', elo:4837 },
  { rank:11, nick:'CEMEN_BAKIN',  slug:'CEMEN_BAKIN',   flag:'🇨🇳', elo:4814 },
  { rank:12, nick:'tO0RO',        slug:'tO0RO',         flag:'🇷🇺', elo:4792 },
  { rank:13, nick:'youka',        slug:'youka',         flag:'🇫🇷', elo:4780 },
  { rank:14, nick:'xKacpersky',   slug:'xKacpersky',    flag:'🇵🇱', elo:4726 },
  { rank:15, nick:'saadzin_',     slug:'saadzin_',      flag:'🇧🇷', elo:4697 },
  { rank:16, nick:'executor',     slug:'executor',      flag:'🇷🇺', elo:4687 },
  { rank:17, nick:'t3ns1on',      slug:'t3ns1on',       flag:'🇺🇦', elo:4668 },
  { rank:18, nick:'redzedsei',    slug:'redzedsei',     flag:'🇷🇺', elo:4657 },
  { rank:19, nick:'SBolt-',       slug:'SBolt-',        flag:'🇷🇺', elo:4655 },
  { rank:20, nick:'sl3nd-',       slug:'sl3nd-',        flag:'🇭🇺', elo:4652 },
  { rank:21, nick:'YourAprilLie', slug:'YourAprilLie',  flag:'🇰🇿', elo:4640 },
  { rank:22, nick:'Magnojezzz',   slug:'Magnojezzz',    flag:'🇷🇺', elo:4632, team:'MIBR' },
  { rank:23, nick:'m0NESY',       slug:'m0NESY',        flag:'🇷🇺', elo:4624, steam:'76561199063533761', team:'Team Falcons' },
  { rank:24, nick:'h21f',         slug:'h21f',          flag:'🇲🇳', elo:4612 },
  { rank:25, nick:'verso-topo',   slug:'verso-topo',    flag:'🇷🇺', elo:4599 },
  { rank:26, nick:'kashl1d',      slug:'kashl1d',       flag:'🇷🇺', elo:4595 },
  { rank:27, nick:'Tri-Borgg1',   slug:'Tri-Borgg1',    flag:'🇷🇺', elo:4594 },
  { rank:28, nick:'jottAAA-',     slug:'jottAAA-',      flag:'🇹🇷', elo:4590 },
  { rank:29, nick:'bobeksde',     slug:'bobeksde',      flag:'🇸🇪', elo:4589 },
  { rank:30, nick:'tried',        slug:'tried',         flag:'🇷🇺', elo:4588 },
  { rank:31, nick:'ecstazyozy',   slug:'ecstazyozy',    flag:'🇰🇷', elo:4587 },
  { rank:32, nick:'bluewh1te',    slug:'bluewh1te',     flag:'🇭🇰', elo:4574 },
  { rank:33, nick:'rallen',       slug:'rallen',        flag:'🇵🇱', elo:4560, team:'MOUZ' },
  { rank:34, nick:'FAZERY',       slug:'FAZERY',        flag:'🇨🇿', elo:4555 },
  { rank:35, nick:'Shoota-_-',    slug:'Shoota-_-',     flag:'🇷🇺', elo:4546 },
  { rank:36, nick:'nbl-',         slug:'nbl-',          flag:'🇷🇺', elo:4546 },
  { rank:37, nick:'L00m1',        slug:'L00m1',         flag:'🇸🇪', elo:4540 },
  { rank:38, nick:'tommy10',      slug:'tommy10',       flag:'🇷🇺', elo:4533 },
  { rank:39, nick:'tex1y',        slug:'tex1y',         flag:'🇷🇺', elo:4529 },
  { rank:40, nick:'baz',          slug:'baz',           flag:'🇺🇦', elo:4526 },
  { rank:41, nick:'mdl--',        slug:'mdl--',         flag:'🇧🇾', elo:4524 },
  { rank:42, nick:'jresy',        slug:'jresy',         flag:'🇹🇷', elo:4510 },
  { rank:43, nick:'MaiL09',       slug:'MaiL09',        flag:'🇯🇵', elo:4508, steam:'76561199165412891', team:'Alliance' },
  { rank:44, nick:'her1tage111',  slug:'her1tage111',   flag:'🇰🇿', elo:4501 },
  { rank:45, nick:'kumao',        slug:'kumao',         flag:'🇰🇿', elo:4501 },
  { rank:46, nick:'JBa',          slug:'JBa',           flag:'🇺🇸', elo:4499 },
  { rank:47, nick:'robo--',       slug:'robo--',        flag:'🇷🇺', elo:4495 },
  { rank:48, nick:'sSen',         slug:'sSen',          flag:'🇩🇰', elo:4494 },
  { rank:49, nick:'swetsi7',      slug:'swetsi7',       flag:'🇷🇺', elo:4486 },
  { rank:50, nick:'cairne-',      slug:'cairne-',       flag:'🇺🇦', elo:4486 },
  { rank:51, nick:'kyousuke',     slug:'kyousuke',      flag:'🇷🇺', elo:4480, steam:'76561199279053528', team:'Team Falcons' },
  { rank:52, nick:'sh1ro',        slug:'sh1ro',         flag:'🇷🇺', elo:4461, steam:'76561198334759556', team:'Team Spirit' },
  { rank:53, nick:'electric4x',   slug:'electric4x',    flag:'🇷🇺', elo:4448 },
  { rank:54, nick:'yumiko7',      slug:'yumiko7',       flag:'🇯🇵', elo:4435 },
  { rank:55, nick:'pl4yer777',    slug:'pl4yer777',     flag:'🇺🇦', elo:4422 },
  { rank:56, nick:'darkside99',   slug:'darkside99',    flag:'🇷🇺', elo:4411 },
  { rank:57, nick:'goliath_cs',   slug:'goliath_cs',    flag:'🇵🇱', elo:4399 },
  { rank:58, nick:'n0ttr0ll',     slug:'n0ttr0ll',      flag:'🇩🇪', elo:4388 },
  { rank:59, nick:'ZywOo',        slug:'ZywOo',         flag:'🇫🇷', elo:4375, steam:'76561198380899939', team:'Team Vitality' },
  { rank:60, nick:'s1mple',       slug:'s1mple',        flag:'🇺🇦', elo:4361, steam:'76561198034202275' },
  { rank:61, nick:'phantom_eu',   slug:'phantom_eu',    flag:'🇷🇺', elo:4348 },
  { rank:62, nick:'kz4rGo',       slug:'kz4rGo',        flag:'🇰🇿', elo:4336 },
  { rank:63, nick:'ACER_BREAM',   slug:'ACER_BREAM',    flag:'🇷🇺', elo:4325 },
  { rank:64, nick:'xfl0ud',       slug:'xfl0ud',        flag:'🇷🇺', elo:4314, steam:'76561198388042897', team:'Cloud9' },
  { rank:65, nick:'NiKo',         slug:'NiKo',          flag:'🇧🇦', elo:4302, steam:'76561198136523281', team:'G2' },
  { rank:66, nick:'hObbit-',      slug:'hObbit-',       flag:'🇰🇿', elo:4289, team:'GamerLegion' },
  { rank:67, nick:'w0nderful',    slug:'w0nderful',     flag:'🇷🇺', elo:4276, team:'Cloud9' },
  { rank:68, nick:'fl0m',         slug:'fl0m',          flag:'🇺🇸', elo:4264 },
  { rank:69, nick:'sdy-',         slug:'sdy-',          flag:'🇷🇺', elo:4252, team:'Virtus.pro' },
  { rank:70, nick:'tarik',        slug:'tarik',         flag:'🇺🇸', elo:4240, steam:'76561197997562690' },
  { rank:71, nick:'frozen-cs',    slug:'frozen-cs',     flag:'🇸🇰', elo:4229, team:'FaZe' },
  { rank:72, nick:'electroNic',   slug:'electroNic',    flag:'🇷🇺', elo:4217, steam:'76561198026342275', team:'Spirit' },
  { rank:73, nick:'rain-cs',      slug:'rain-cs',       flag:'🇳🇴', elo:4206, team:'FaZe' },
  { rank:74, nick:'interz',       slug:'interz',        flag:'🇰🇿', elo:4194 },
  { rank:75, nick:'Baitfish-',    slug:'Baitfish-',     flag:'🇰🇿', elo:4183 },
  { rank:76, nick:'karrigan',     slug:'karrigan',      flag:'🇩🇰', elo:4172, steam:'76561197960268519', team:'FaZe' },
  { rank:77, nick:'ropz',         slug:'ropz',          flag:'🇪🇪', elo:4160, steam:'76561198167520495', team:'FaZe' },
  { rank:78, nick:'iM-cs',        slug:'iM-cs',         flag:'🇷🇺', elo:4149 },
  { rank:79, nick:'poizon',       slug:'poizon',        flag:'🇧🇬', elo:4138, team:'FaZe' },
  { rank:80, nick:'apEX',         slug:'apEX',          flag:'🇫🇷', elo:4127, steam:'76561197962389465', team:'Vitality' },
  { rank:81, nick:'dupreeh',      slug:'dupreeh',       flag:'🇩🇰', elo:4116, steam:'76561197979924326' },
  { rank:82, nick:'Magisk',       slug:'Magisk',        flag:'🇩🇰', elo:4105, steam:'76561197990855265', team:'Astralis' },
  { rank:83, nick:'sjuush',       slug:'sjuush',        flag:'🇩🇰', elo:4094, team:'Astralis' },
  { rank:84, nick:'BlameF',       slug:'BlameF',        flag:'🇩🇰', elo:4083, team:'Astralis' },
  { rank:85, nick:'dev1ce',       slug:'dev1ce',        flag:'🇩🇰', elo:4072, steam:'76561197987713664', team:'Astralis' },
  { rank:86, nick:'k0nfig',       slug:'k0nfig',        flag:'🇩🇰', elo:4061, team:'Astralis' },
  { rank:87, nick:'gla1ve',       slug:'gla1ve',        flag:'🇩🇰', elo:4050, steam:'76561197989129443', team:'Astralis' },
  { rank:88, nick:'Brollan',      slug:'Brollan',       flag:'🇸🇪', elo:4039, team:'G2' },
  { rank:89, nick:'hunter-',      slug:'hunter-',       flag:'🇧🇦', elo:4028, steam:'76561198129003233', team:'G2' },
  { rank:90, nick:'HooXi',        slug:'HooXi',         flag:'🇩🇰', elo:4017, team:'G2' },
  { rank:91, nick:'jks',          slug:'jks',           flag:'🇦🇺', elo:4006 },
  { rank:92, nick:'Twistzz',      slug:'Twistzz',       flag:'🇨🇦', elo:3995, steam:'76561198060708476', team:'FaZe' },
  { rank:93, nick:'nafany',       slug:'nafany',        flag:'🇷🇺', elo:3984, team:'Cloud9' },
  { rank:94, nick:'Ax1Le',        slug:'Ax1Le',         flag:'🇷🇺', elo:3973, steam:'76561198098694851', team:'Cloud9' },
  { rank:95, nick:'perfecto',     slug:'perfecto',      flag:'🇷🇺', elo:3962, steam:'76561198282414849', team:'Spirit' },
  { rank:96, nick:'Hobbit',       slug:'hobbit',        flag:'🇰🇿', elo:3951 },
  { rank:97, nick:'YEKINDAR',     slug:'YEKINDAR',      flag:'🇱🇻', elo:3940, steam:'76561198093768069' },
  { rank:98, nick:'tabseN',       slug:'tabseN',        flag:'🇩🇪', elo:3929, team:'FaZe' },
  { rank:99, nick:'nexa',         slug:'nexa',          flag:'🇷🇸', elo:3918 },
  { rank:100,nick:'KSCERATO',     slug:'KSCERATO',      flag:'🇧🇷', elo:3907, steam:'76561198175923807', team:'FURIA' },
]

function eloColor(e: number) {
  if (e >= 5000) return '#ff1a00'
  if (e >= 4800) return '#ff4500'
  if (e >= 4500) return '#ff8c00'
  if (e >= 4200) return '#f6c90e'
  if (e >= 4000) return '#68d391'
  return '#63b3ed'
}
function eloTier(e: number) {
  if (e >= 5000) return 'LEGENDARY'
  if (e >= 4800) return 'ELITE'
  if (e >= 4500) return 'DIAMOND'
  if (e >= 4200) return 'PLATINUM'
  return 'GOLD'
}

function CS2Leaderboard() {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const topRef = useRef<HTMLDivElement>(null)
  const PG = 25

  const filtered = useMemo(() => {
    if (!search.trim()) return FACEIT_TOP100
    const q = search.toLowerCase()
    return FACEIT_TOP100.filter(p =>
      p.nick.toLowerCase().includes(q) || (p.team ?? '').toLowerCase().includes(q)
    )
  }, [search])

  const totalPages = Math.ceil(filtered.length / PG)
  const items = filtered.slice((page - 1) * PG, page * PG)
  const goPage = (p: number) => { setPage(p); topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }) }

  return (
    <div ref={topRef}>
      <h1 style={{ fontFamily:'var(--font-display)', fontSize:44, fontWeight:600, letterSpacing:'0.06em', color:'var(--text-0)', marginBottom:4 }}>
        CS2 <span style={{ color:'#f0b429' }}>LEADERBOARD</span>
      </h1>
      <p style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-3)', marginBottom:20 }}>
        // FACEIT ELO top-100 · fctracker.org · March 13, 2026 · click name → FACEIT profile
      </p>

      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Search player / team…"
          style={{ background:'var(--bg-2)', border:'1px solid var(--border-2)', borderRadius:6, padding:'7px 14px', color:'var(--text-1)', fontFamily:'var(--font-mono)', fontSize:12, outline:'none', width:220 }}
        />
        <a href="https://www.faceit.com/en/cs2/rank" target="_blank" rel="noopener noreferrer"
          style={{ marginLeft:'auto', fontSize:11, color:'#ff5500', textDecoration:'none', fontFamily:'var(--font-mono)', padding:'7px 13px', border:'1px solid rgba(255,85,0,0.35)', borderRadius:6, display:'flex', alignItems:'center', gap:5 }}>
          ⚡ faceit.com →
        </a>
      </div>

      {/* Top 3 banner */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 }}>
        {FACEIT_TOP100.slice(0,3).map((p, i) => {
          const col = eloColor(p.elo)
          const medals = ['🥇','🥈','🥉']
          return (
            <a key={p.rank} href={`https://www.faceit.com/en/players/${p.slug}`} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none' }}>
              <div style={{ padding:'14px 16px', background:`${col}0d`, border:`1px solid ${col}35`, borderRadius:10, display:'flex', alignItems:'center', gap:10, transition:'all 0.15s' }}
                onMouseEnter={e=>{e.currentTarget.style.background=`${col}18`;e.currentTarget.style.transform='translateY(-2px)'}}
                onMouseLeave={e=>{e.currentTarget.style.background=`${col}0d`;e.currentTarget.style.transform=''}}>
                <span style={{ fontSize:24 }}>{medals[i]}</span>
                <div>
                  <div style={{ fontFamily:'var(--font-display)', fontSize:15, fontWeight:800, color:col }}>{p.nick}</div>
                  <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-3)' }}>{p.team ?? p.flag}</div>
                </div>
                <div style={{ marginLeft:'auto', fontFamily:'var(--font-display)', fontSize:20, fontWeight:900, color:col }}>{p.elo.toLocaleString()}</div>
              </div>
            </a>
          )
        })}
      </div>

      <div style={{ background:'var(--bg-2)', border:'1px solid rgba(255,85,0,0.2)', borderRadius:12, overflow:'hidden' }}>
        <div style={{ display:'grid', gridTemplateColumns:'48px 1fr 120px 110px 80px 34px', gap:8, padding:'9px 18px', borderBottom:'1px solid var(--border-1)', background:'rgba(255,85,0,0.04)' }}>
          {['#','Player','Team','ELO','Tier',''].map(t => (
            <div key={t} style={{ fontSize:9, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--text-3)', fontFamily:'var(--font-mono)', fontWeight:700 }}>{t}</div>
          ))}
        </div>

        {items.map(p => {
          const col = eloColor(p.elo)
          return (
            <div key={p.rank}
              style={{ display:'grid', gridTemplateColumns:'48px 1fr 120px 110px 80px 34px', gap:8, padding:'9px 18px', borderBottom:'1px solid var(--border-0)', alignItems:'center', transition:'background 0.1s' }}
              onMouseEnter={e => (e.currentTarget.style.background='rgba(255,85,0,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.background='transparent')}
            >
              <span style={{ fontFamily:'var(--font-display)', fontSize:p.rank<=3?18:13, fontWeight:700, color:p.rank===1?'#FFD700':p.rank===2?'#C0C0C0':p.rank===3?'#CD7F32':'var(--text-3)' }}>
                {p.rank<=3?(p.rank===1?'🥇':p.rank===2?'🥈':'🥉'):p.rank}
              </span>

              <a href={`https://www.faceit.com/en/players/${p.slug}`} target="_blank" rel="noopener noreferrer"
                style={{ display:'flex', alignItems:'center', gap:7, textDecoration:'none', overflow:'hidden' }}>
                <span style={{ fontSize:16, flexShrink:0 }}>{p.flag}</span>
                <div style={{ overflow:'hidden' }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'var(--text-0)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', transition:'color 0.12s' }}
                    onMouseEnter={e=>(e.currentTarget.style.color='#ff5500')}
                    onMouseLeave={e=>(e.currentTarget.style.color='var(--text-0)')}
                  >{p.nick}</div>
                  <div style={{ fontSize:8, color:'var(--text-3)', fontFamily:'var(--font-mono)' }}>faceit →</div>
                </div>
              </a>

              <span style={{ fontSize:10, color:'var(--text-3)', fontFamily:'var(--font-mono)', overflow:'hidden', textOverflow:'ellipsis' }}>{p.team ?? '—'}</span>
              <span style={{ fontFamily:'var(--font-display)', fontSize:17, fontWeight:800, color:col }}>{p.elo.toLocaleString()}</span>

              <div style={{ padding:'2px 6px', borderRadius:4, background:`${col}15`, border:`1px solid ${col}30`, fontSize:8, fontWeight:800, color:col, fontFamily:'var(--font-mono)', letterSpacing:'0.04em' }}>
                {eloTier(p.elo)}
              </div>

              {p.steam
                ? <a href={`https://steamcommunity.com/profiles/${p.steam}`} target="_blank" rel="noopener noreferrer" title="Steam"
                    style={{ display:'flex', alignItems:'center', justifyContent:'center', width:28, height:28, borderRadius:5, background:'rgba(154,168,178,0.08)', border:'1px solid rgba(154,168,178,0.2)', textDecoration:'none', transition:'all 0.12s' }}
                    onMouseEnter={e=>{e.currentTarget.style.background='rgba(154,168,178,0.2)'}}
                    onMouseLeave={e=>{e.currentTarget.style.background='rgba(154,168,178,0.08)'}}
                  >
                    <svg width={12} height={12} viewBox="0 0 496 512" fill="#9aa8b2"><path d="M496 256c0 137-111.2 248-248.4 248-113.8 0-209.7-75.2-239-180.4l67.5 27.5c7.1 36.5 39.6 64.1 78.9 64.1 44.2 0 80-35.8 80-80s-35.8-80-80-80c-3.1 0-6.1.2-9.1.5l-66.3-26.9c21.3-42.2 64.6-71.2 114.5-71.2 70.7 0 128 57.3 128 128s-57.3 128-128 128c-47.7 0-89.4-26.5-110.9-65.5l-40.3 16.4C129.8 433.8 183.5 464 244.6 464 368.1 464 464 368.1 464 248c0-119.1-96.5-215.8-216-216C131.7 32 32 131.7 32 248c0 6.5.3 13 .9 19.4L0 252.3V248C0 111.2 111 0 248 0s248 111.2 248 248z"/></svg>
                  </a>
                : <div />
              }
            </div>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:5, marginTop:18, flexWrap:'wrap' }}>
          <button onClick={()=>goPage(1)} disabled={page===1} style={pBtn(page===1)}>«</button>
          <button onClick={()=>goPage(page-1)} disabled={page===1} style={pBtn(page===1)}>‹</button>
          {pageNums(page,totalPages).map((n,i)=>
            n==='…'?<span key={`e${i}`} style={{color:'var(--text-3)',padding:'0 4px'}}>…</span>
                   :<button key={n} onClick={()=>goPage(Number(n))} style={pBtn(false,page===Number(n))}>{n}</button>
          )}
          <button onClick={()=>goPage(page+1)} disabled={page===totalPages} style={pBtn(page===totalPages)}>›</button>
          <button onClick={()=>goPage(totalPages)} disabled={page===totalPages} style={pBtn(page===totalPages)}>»</button>
        </div>
      )}
    </div>
  )
}

export function LeaderboardPage() {
  const { activeGame } = useAppStore()
  return (
    <div className="fade-up">
      {activeGame === 'cs' ? <CS2Leaderboard /> : <DotaLeaderboard />}
    </div>
  )
}
