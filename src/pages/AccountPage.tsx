import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { getSteamLoginUrl } from '@/api/steam'
import { RankIcon, getRankInfo } from '@/utils/icons'
import { usePlayerFull } from '@/hooks/useData'
import { calcWR, fmtNum } from '@/utils/helpers'
import { StatCard, LoadingState } from '@/components/ui'
import { HERO_NAMES } from '@/utils/constants'

function SteamLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.606 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.497 1.009 2.455-.397.957-1.497 1.41-2.455 1.012zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.662 0 3.015-1.35 3.015-3.015zm-5.273.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.252 0-2.265-1.014-2.265-2.265z"/>
    </svg>
  )
}

function NotLoggedIn() {
  const handleLogin = () => {
    window.location.href = getSteamLoginUrl()
  }

  return (
    <div className="fade-up" style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', minHeight: '60vh', textAlign: 'center',
    }}>
      <div style={{
        fontFamily: 'var(--font-display)', fontSize: 80, fontWeight: 600,
        letterSpacing: '0.1em', lineHeight: 1,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.01) 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        backgroundClip: 'text', marginBottom: 24, userSelect: 'none',
      }}>
        ACCOUNT
      </div>

      <p style={{ color: 'var(--text-2)', fontSize: 15, marginBottom: 8 }}>
        Sign in via Steam to view your stats
      </p>
      <p style={{ color: 'var(--text-3)', fontSize: 12, fontFamily: 'var(--font-mono)', marginBottom: 32 }}>
        // your Dota 2 and CS2 data will be linked automatically
      </p>

      <button
        onClick={handleLogin}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 12,
          background: 'linear-gradient(135deg, #1b2838, #2a475e)',
          border: '1px solid rgba(102,178,226,0.3)',
          borderRadius: 'var(--radius-md)', padding: '14px 28px',
          color: '#c6d4df', fontSize: 15, fontWeight: 700,
          letterSpacing: '0.06em', cursor: 'pointer',
          transition: 'all 0.2s', boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #2a3f55, #3a6080)'
          e.currentTarget.style.boxShadow = '0 6px 28px rgba(102,178,226,0.2)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'linear-gradient(135deg, #1b2838, #2a475e)'
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.4)'
        }}
      >
        <SteamLogo />
        Sign in via Steam
      </button>

      <div style={{ marginTop: 56, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, maxWidth: 600 }}>
        {[
          { icon: '📊', title: 'Your Stats',     desc: 'Win rate, KDA, top heroes — all in one place' },
          { icon: '🎮', title: 'Dota 2 + CS2',   desc: 'Both accounts linked automatically via Steam' },
          { icon: '🔔', title: 'Match History',  desc: 'Recent games always at hand' },
        ].map(({ icon, title, desc }) => (
          <div key={title} style={{
            background: 'var(--bg-2)', border: '1px solid var(--border-1)',
            borderRadius: 'var(--radius-md)', padding: '18px 16px', textAlign: 'left',
          }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-0)', marginBottom: 4 }}>{title}</div>
            <div style={{ fontSize: 11, color: 'var(--text-3)', lineHeight: 1.5 }}>{desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function LoggedInDashboard() {
  const { steamUser, logout } = useAppStore()
  const navigate = useNavigate()
  const { data, isLoading } = usePlayerFull(steamUser?.accountId ?? null)

  if (!steamUser) return null

  const rank = getRankInfo(data?.player?.rank_tier)
  const totalGames = (data?.wl?.win ?? 0) + (data?.wl?.lose ?? 0)
  const wr = calcWR(data?.wl?.win ?? 0, totalGames)

  const goProfile = () => navigate(`/player/${steamUser.accountId}`)
  const goMatch = (id: number) => window.open(`https://www.opendota.com/matches/${id}`, '_blank')

  return (
    <div className="fade-up">
      <h1 style={{
        fontFamily: 'var(--font-display)', fontSize: 42, fontWeight: 600,
        letterSpacing: '0.08em', color: 'var(--text-0)', marginBottom: 24,
      }}>
        MY <span style={{ color: 'var(--accent)' }}>ACCOUNT</span>
      </h1>

      {/* Profile card */}
      <div style={{
        background: 'var(--bg-2)', border: '1px solid var(--border-1)',
        borderRadius: 'var(--radius-lg)', padding: '28px', marginBottom: 24,
        display: 'flex', gap: 24, alignItems: 'flex-start',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 50%, rgba(79,142,255,0.04) 0%, transparent 60%)', pointerEvents: 'none' }} />

        {/* Avatar */}
        <div style={{ position: 'relative' }}>
          {steamUser.avatarfull
            ? <img src={steamUser.avatarfull} alt="" style={{ width: 90, height: 90, borderRadius: 12, border: '2px solid var(--border-2)', objectFit: 'cover' }} />
            : <div style={{ width: 90, height: 90, borderRadius: 12, background: 'var(--bg-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>👤</div>
          }
        </div>

        {/* Info */}
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-0)', marginBottom: 6 }}>
            {steamUser.personaname}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 3, background: 'rgba(200,75,49,0.12)', border: '1px solid rgba(200,75,49,0.3)', color: '#c84b31', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>DOTA 2</span>
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 3, background: 'rgba(240,180,41,0.1)', border: '1px solid rgba(240,180,41,0.3)', color: '#f0b429', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>CS2</span>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 2 }}>STEAM ID</div>
              <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-2)' }}>{steamUser.accountId}</div>
            </div>
            {data?.player?.mmr_estimate?.estimate && (
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 2 }}>MMR</div>
                <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>~{fmtNum(data.player.mmr_estimate.estimate)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Rank */}
        {data?.player && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <RankIcon rankTier={data.player.rank_tier} size={56} />
            <span style={{ fontSize: 12, fontWeight: 700, color: rank.color }}>
              {rank.name}{rank.star ? ` ${rank.star}` : ''}
            </span>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
          <button
            onClick={goProfile}
            style={{
              background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius-sm)',
              padding: '8px 16px', color: '#fff', fontSize: 12, fontWeight: 700,
              letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
            }}
          >
            My Profile →
          </button>
          <button
            onClick={logout}
            style={{
              background: 'transparent', border: '1px solid var(--border-2)',
              borderRadius: 'var(--radius-sm)', padding: '8px 16px',
              color: 'var(--text-3)', fontSize: 12, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(255,71,87,0.4)'
              e.currentTarget.style.color = 'var(--red)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-2)'
              e.currentTarget.style.color = 'var(--text-3)'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {isLoading && <LoadingState message="Loading stats..." />}

      {data && (
        <>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.1em', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 14 }}>
            DOTA 2 — Statistics
          </div>
          <div className="stats-grid-4" style={{ marginBottom: 28 }}>
            <StatCard label="Total Games" value={fmtNum(totalGames)} />
            <StatCard label="Wins"        value={fmtNum(data.wl?.win ?? 0)}  accentColor="var(--green)" />
            <StatCard label="Losses"      value={fmtNum(data.wl?.lose ?? 0)} accentColor="var(--red)" />
            <StatCard label="Win Rate"    value={`${wr}%`} accentColor={wr >= 50 ? 'var(--green)' : 'var(--red)'} />
          </div>

          {(data.matches?.length ?? 0) > 0 && (
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, letterSpacing: '0.1em', color: 'var(--text-3)', textTransform: 'uppercase', marginBottom: 14 }}>
                Recent Matches
              </div>
              <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                {data.matches.slice(0, 5).map(m => {
                  const won = (m.player_slot < 128) === m.radiant_win
                  const matchId = m.match_id
                  return (
                    <div
                      key={matchId}
                      onClick={() => goMatch(matchId)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '12px 16px', borderBottom: '1px solid var(--border-0)',
                        cursor: 'pointer',
                        borderLeft: `3px solid ${won ? 'var(--green)' : 'var(--red)'}`,
                        background: won ? 'rgba(34,212,138,0.03)' : 'rgba(255,71,87,0.03)',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = won ? 'rgba(34,212,138,0.07)' : 'rgba(255,71,87,0.07)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = won ? 'rgba(34,212,138,0.03)' : 'rgba(255,71,87,0.03)' }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 700, color: won ? 'var(--green)' : 'var(--red)', width: 36 }}>
                        {won ? 'WIN' : 'LOSS'}
                      </span>
                      <span style={{ fontSize: 13, flex: 1, color: 'var(--text-1)' }}>
                        {HERO_NAMES[m.hero_id] || `Hero ${m.hero_id}`}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>
                        {m.kills}/{m.deaths}/{m.assists}
                      </span>
                    </div>
                  )
                })}
              </div>
              <button
                onClick={goProfile}
                style={{
                  marginTop: 10, background: 'transparent',
                  border: '1px solid var(--border-2)', borderRadius: 'var(--radius-sm)',
                  padding: '7px 14px', color: 'var(--text-2)', fontSize: 12,
                  cursor: 'pointer', fontWeight: 600, letterSpacing: '0.06em',
                }}
              >
                All Matches →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export function AccountPage() {
  const { steamUser } = useAppStore()
  return steamUser ? <LoggedInDashboard /> : <NotLoggedIn />
}
