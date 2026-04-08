import type { Player, WinLoss } from '@/types'
import { getRankInfo, RankIcon } from '@/utils/icons'
import { calcWR, fmtNum } from '@/utils/helpers'
import { Tag } from '@/components/ui'
import { useCurrentPatch } from '@/hooks/useData'

interface PlayerHeaderProps {
  player: Player
  wl: WinLoss
  game?: 'dota' | 'cs2'
}

function SteamButton({ steamId64, profileUrl }: { steamId64?: number; profileUrl?: string }) {
  // Build Steam profile URL
  const steamUrl = profileUrl || (steamId64 ? `https://steamcommunity.com/profiles/${steamId64}` : null)
  if (!steamUrl) return null

  return (
    <a href={steamUrl} target="_blank" rel="noopener noreferrer"
      title="Open Steam profile"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '8px 14px', borderRadius: 8,
        background: 'rgba(154,168,178,0.07)', border: '1px solid rgba(154,168,178,0.2)',
        color: '#9aa8b2', textDecoration: 'none', fontSize: 12,
        fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: '0.04em',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(154,168,178,0.15)'; e.currentTarget.style.borderColor = 'rgba(154,168,178,0.4)'; e.currentTarget.style.color = '#fff' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(154,168,178,0.07)'; e.currentTarget.style.borderColor = 'rgba(154,168,178,0.2)'; e.currentTarget.style.color = '#9aa8b2' }}
    >
      {/* Steam logo SVG (same as on Dotabuff) */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.606 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.455 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.252 0-2.265-1.014-2.265-2.265z"/>
      </svg>
      Steam Profile
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
      </svg>
    </a>
  )
}

export function PlayerHeader({ player, wl, game = 'dota' }: PlayerHeaderProps) {
  const { profile, rank_tier, leaderboard_rank, mmr_estimate } = player
  const { data: patch } = useCurrentPatch()
  const rank = getRankInfo(rank_tier)
  const totalGames = wl.win + wl.lose
  const wr = calcWR(wl.win, totalGames)

  // Build steam64 from account_id for Dota
  const steam64 = profile.account_id
    ? (BigInt(profile.account_id) + BigInt('76561197960265728')).toString()
    : undefined

  return (
    <div className="fade-up" style={{
      background: 'var(--bg-2)', border: '1px solid var(--border-1)',
      borderRadius: 'var(--radius-lg)', padding: '24px 28px',
      marginBottom: 24, position: 'relative', overflow: 'hidden',
    }}>
      {/* Rank color gradient */}
      <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: '40%', background: `radial-gradient(ellipse at 100% 50%, ${rank.color}08 0%, transparent 70%)`, pointerEvents: 'none' }} />

      <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        {/* Avatar */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img src={profile.avatarfull} alt={profile.personaname}
            onError={e => { (e.target as HTMLImageElement).src = 'https://steamcdn-a.akamaihd.net/steamcommunity/public/images/avatars/fe/fef49e7fa7e1997310d705b2a6158ff8dc1cdfeb_full.jpg' }}
            style={{ width: 88, height: 88, borderRadius: 'var(--radius-md)', objectFit: 'cover', border: `2px solid ${rank.color}40`, display: 'block' }}
          />
          {profile.plus && (
            <div style={{ position: 'absolute', bottom: -4, right: -4, background: 'var(--gold)', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, border: '2px solid var(--bg-2)', fontWeight: 900 }}>+</div>
          )}
          {/* Online indicator if profile public */}
          {profile.profileurl && (
            <div style={{ position: 'absolute', top: -4, right: -4, width: 12, height: 12, borderRadius: '50%', background: '#22d48a', border: '2px solid var(--bg-2)' }} title="Profile is public" />
          )}
        </div>

        {/* Main info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap', marginBottom: 10 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-0)', lineHeight: 1, margin: 0 }}>
              {profile.personaname}
            </h2>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', paddingTop: 4 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '3px 10px 3px 5px', borderRadius: 6, background: `${rank.color}15`, border: `1px solid ${rank.color}30` }}>
                <RankIcon rankTier={rank_tier} size={26} />
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: rank.color }}>
                  {rank.name}{rank.star > 0 ? ` ${rank.star}` : ''}
                </span>
              </div>
              {leaderboard_rank && <Tag variant="gold">TOP {leaderboard_rank}</Tag>}
              {profile.loccountrycode && <Tag variant="muted">{profile.loccountrycode.toUpperCase()}</Tag>}
              {wr >= 55 && <Tag variant="green">🔥 HOT</Tag>}
            </div>
          </div>

          {/* Stats row */}
          <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', marginBottom: 14 }}>
            <MetaItem label="Account ID" value={String(profile.account_id)} mono />
            {mmr_estimate?.estimate && <MetaItem label="Est. MMR" value={`~${fmtNum(mmr_estimate.estimate)}`} mono />}
            <MetaItem label="Total Games" value={fmtNum(totalGames)} mono />
            <MetaItem label="Win Rate" value={`${wr}%`} mono color={wr >= 50 ? 'var(--green)' : 'var(--red)'} />
            {patch && (
              <MetaItem label="Patch" value={patch?.version ?? '7.40c'} mono color="rgba(200,75,49,0.9)" />
            )}
          </div>

          {/* Action buttons row */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {/* Steam button — main CTA like on Dotabuff */}
            <SteamButton steamId64={Number(steam64)} profileUrl={profile.profileurl} />

            {/* Dotabuff link */}
            <a href={`https://www.dotabuff.com/players/${profile.account_id}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: 'rgba(232,64,87,0.08)', border: '1px solid rgba(232,64,87,0.25)', color: '#e84057', textDecoration: 'none', fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: '0.04em', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(232,64,87,0.18)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(232,64,87,0.08)' }}
            >
              <span style={{ fontWeight: 900, fontSize: 11 }}>DB</span>
              Dotabuff
            </a>

            {/* OpenDota link */}
            <a href={`https://www.opendota.com/players/${profile.account_id}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: 'rgba(99,179,237,0.08)', border: '1px solid rgba(99,179,237,0.25)', color: '#63b3ed', textDecoration: 'none', fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: '0.04em', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,179,237,0.18)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,179,237,0.08)' }}
            >
              <span style={{ fontWeight: 900, fontSize: 11 }}>OD</span>
              OpenDota
            </a>

            {/* Stratz link */}
            <a href={`https://stratz.com/players/${profile.account_id}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.25)', color: '#a78bfa', textDecoration: 'none', fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 600, letterSpacing: '0.04em', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.18)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(167,139,250,0.08)' }}
            >
              <span style={{ fontWeight: 900, fontSize: 11 }}>ST</span>
              Stratz
            </a>
          </div>
        </div>

        {/* W/L pills */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <Pill label="W" value={fmtNum(wl.win)} color="var(--green)" />
          <Pill label="L" value={fmtNum(wl.lose)} color="var(--red)" />
        </div>
      </div>
    </div>
  )
}

function MetaItem({ label, value, mono, color }: { label: string; value: string; mono?: boolean; color?: string }) {
  return (
    <div>
      <div style={{ fontSize: 9, color: 'var(--text-3)', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: color || 'var(--text-1)', fontFamily: mono ? 'var(--font-mono)' : undefined }}>{value}</div>
    </div>
  )
}

function Pill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ textAlign: 'center', background: `${color}10`, border: `1px solid ${color}28`, borderRadius: 'var(--radius-md)', padding: '10px 18px', minWidth: 64 }}>
      <div style={{ fontSize: 11, color, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600, color }}>{value}</div>
    </div>
  )
}
