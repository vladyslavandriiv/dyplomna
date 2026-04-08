import type { RecentMatch } from '@/types'
import { HERO_NAMES, GAME_MODES } from '@/utils/constants'
import { isWin, fmtKda, kdaColor, formatDuration, timeAgo } from '@/utils/helpers'
import { HeroIcon } from '@/utils/icons'

interface MatchesTableProps {
  matches: RecentMatch[]
  limit?: number
}

const COL = '32px 1fr 55px 110px 70px 64px 64px 76px 68px'

function MatchHeader() {
  const s: React.CSSProperties = {
    fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase',
    color: 'var(--text-3)', fontFamily: 'var(--font-mono)',
  }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: COL, gap: 10, padding: '6px 14px', borderBottom: '1px solid var(--border-1)', marginBottom: 4 }}>
      <div />
      <div style={s}>Hero</div>
      <div style={s}>Result</div>
      <div style={s}>K / D / A</div>
      <div style={{ ...s, textAlign: 'center' }}>KDA</div>
      <div style={{ ...s, textAlign: 'center' }}>Dur.</div>
      <div style={{ ...s, textAlign: 'center' }}>LH</div>
      <div style={{ ...s, textAlign: 'center' }}>XPM/GPM</div>
      <div style={{ ...s, textAlign: 'right' }}>When</div>
    </div>
  )
}

function MatchRow({ match }: { match: RecentMatch }) {
  const won = isWin(match.player_slot, match.radiant_win)
  const hero = HERO_NAMES[match.hero_id] || `Hero ${match.hero_id}`
  const kda = fmtKda(match.kills, match.deaths, match.assists)
  const kColor = kdaColor(kda)
  const accentColor = won ? 'var(--green)' : 'var(--red)'

  return (
    <div
      onClick={() => window.open(`https://www.opendota.com/matches/${match.match_id}`, '_blank')}
      style={{
        display: 'grid', gridTemplateColumns: COL, gap: 10,
        padding: '9px 14px', borderRadius: 'var(--radius-sm)',
        marginBottom: 2, cursor: 'pointer', alignItems: 'center',
        borderLeft: `3px solid ${accentColor}`,
        background: won ? 'rgba(34,212,138,0.03)' : 'rgba(255,71,87,0.03)',
        transition: 'background 0.15s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = won ? 'rgba(34,212,138,0.07)' : 'rgba(255,71,87,0.07)')}
      onMouseLeave={e => (e.currentTarget.style.background = won ? 'rgba(34,212,138,0.03)' : 'rgba(255,71,87,0.03)')}
    >
      <HeroIcon heroId={match.hero_id} size={28} />

      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {hero}
      </span>

      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', color: accentColor }}>
        {won ? 'WIN' : 'LOSS'}
      </span>

      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-1)' }}>
        {match.kills}
        <span style={{ color: 'var(--text-3)', margin: '0 2px' }}>/</span>
        <span style={{ color: 'var(--red)' }}>{match.deaths}</span>
        <span style={{ color: 'var(--text-3)', margin: '0 2px' }}>/</span>
        {match.assists}
      </span>

      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: kColor, textAlign: 'center' }}>
        {kda}
      </span>

      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-2)', textAlign: 'center' }}>
        {formatDuration(match.duration)}
      </span>

      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--gold)', textAlign: 'center' }}>
        {match.last_hits}
      </span>

      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', textAlign: 'center' }}>
        {match.xp_per_min}/{match.gold_per_min}
      </span>

      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', textAlign: 'right' }}>
        {timeAgo(match.start_time)}
      </span>
    </div>
  )
}

export function MatchesTable({ matches, limit }: MatchesTableProps) {
  const list = limit ? matches.slice(0, limit) : matches
  if (!list.length) {
    return (
      <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>
        No matches found
      </div>
    )
  }
  return (
    <div style={{ overflowX: 'auto' }}>
      <MatchHeader />
      {list.map(m => <MatchRow key={m.match_id} match={m} />)}
    </div>
  )
}
