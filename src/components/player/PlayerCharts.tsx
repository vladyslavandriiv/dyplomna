import type { RecentMatch, PlayerHero } from '@/types'
import { HERO_NAMES } from '@/utils/constants'
import { isWin, calcWR } from '@/utils/helpers'
import { WRBar, SectionHeader } from '@/components/ui'
import { HeroIcon } from '@/utils/icons'

export function KdaChart({ matches }: { matches: RecentMatch[] }) {
  const data = [...matches].reverse().slice(-20).map(m => {
    const won = isWin(m.player_slot, m.radiant_win)
    const kda = m.deaths === 0 ? 10 : (m.kills + m.assists) / m.deaths
    return { won, kda, match_id: m.match_id, hero_id: m.hero_id }
  })
  const max = Math.max(...data.map(d => d.kda), 1)

  return (
    <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-md)', padding: '16px 20px', marginBottom: 20 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-2)', marginBottom: 14 }}>
        KDA — last {data.length} matches
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 56 }}>
        {data.map((d, i) => {
          const h = Math.max(6, Math.round((d.kda / max) * 54))
          const color = d.won ? 'var(--green)' : 'var(--red)'
          return (
            <div key={i} title={`KDA: ${d.kda.toFixed(2)} — ${d.won ? 'Win' : 'Loss'}`}
              onClick={() => window.open(`https://www.opendota.com/matches/${d.match_id}`, '_blank')}
              style={{ flex: 1, height: h, minWidth: 8, background: color, opacity: 0.65, borderRadius: '2px 2px 0 0', cursor: 'pointer', transition: 'opacity 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0.65')}
            />
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
        {[['var(--green)', 'Win'], ['var(--red)', 'Loss']].map(([c, l]) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: 'var(--text-3)' }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: c as string, opacity: 0.65 }} />
            {l}
          </div>
        ))}
      </div>
    </div>
  )
}

export function WinStreak({ matches }: { matches: RecentMatch[] }) {
  let streak = 0
  let streakType: 'win' | 'loss' | null = null
  for (const m of matches) {
    const type = isWin(m.player_slot, m.radiant_win) ? 'win' : 'loss'
    if (streakType === null) { streakType = type; streak = 1 }
    else if (streakType === type) streak++
    else break
  }
  if (!streakType || streak < 2) return null
  const color = streakType === 'win' ? 'var(--green)' : 'var(--red)'
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 'var(--radius-sm)', background: `${color}10`, border: `1px solid ${color}28`, marginBottom: 16 }}>
      <span style={{ color, fontSize: 13, fontWeight: 600 }}>{streakType === 'win' ? '🔥 Win Streak' : '❄️ Losing Streak'}</span>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color }}>{streak}</span>
    </div>
  )
}

export function TopHeroes({ heroes }: { heroes: PlayerHero[] }) {
  const top = heroes.slice(0, 8)
  return (
    <div>
      <SectionHeader title="Top Heroes" />
      <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        {top.map((h, i) => {
          const wr = calcWR(h.win, h.games)
          const name = HERO_NAMES[h.hero_id] || `Hero ${h.hero_id}`
          return (
            <div key={h.hero_id} style={{
              display: 'grid', gridTemplateColumns: '22px 28px 1fr 40px 100px',
              alignItems: 'center', gap: 10, padding: '10px 14px',
              borderBottom: i < top.length - 1 ? '1px solid var(--border-0)' : 'none',
              transition: 'background 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
              onMouseLeave={e => (e.currentTarget.style.background = '')}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', textAlign: 'right' }}>{i + 1}</span>
              <HeroIcon heroId={h.hero_id} size={28} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)' }}>{name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>{h.games} games</div>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', textAlign: 'right' }}>{h.games}g</span>
              <WRBar wr={wr} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Composite wrapper used by PlayerPage ─────────────────────────────────
export function PlayerCharts({ recentMatches, heroStats }: {
  recentMatches: RecentMatch[]
  heroStats: PlayerHero[]
  player?: any
}) {
  return (
    <div>
      <WinStreak matches={recentMatches} />
      <KdaChart matches={recentMatches} />
      <TopHeroes heroes={heroStats} />
    </div>
  )
}
