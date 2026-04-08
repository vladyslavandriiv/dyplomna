import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { loadFullPlayer } from '@/api/opendota'
import { PlayerHeader } from '@/components/player/PlayerHeader'
import { MatchesTable } from '@/components/player/MatchesTable'
import { PlayerCharts } from '@/components/player/PlayerCharts'
import { useAppStore } from '@/store/appStore'

// Icon-only link button like on Dotabuff
interface ProfileLink { href: string; label: string; color: string; bg: string; icon: React.ReactNode }

function ProfileLinkBtn({ link }: { link: ProfileLink }) {
  const [hov, setHov] = useState(false)
  return (
    <a href={link.href} target="_blank" rel="noopener noreferrer"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      title={link.label}
      style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'7px 13px', borderRadius:7, border:`1px solid ${hov ? link.color + '55' : link.color + '22'}`, background: hov ? link.bg : 'transparent', color: link.color, textDecoration:'none', fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700, letterSpacing:'0.05em', transition:'all 0.15s', whiteSpace:'nowrap' }}
    >
      {link.icon}
      {link.label}
    </a>
  )
}

// SVG icons
const Icons = {
  steam: (
    <svg width="14" height="14" viewBox="0 0 233 233" fill="currentColor" style={{ flexShrink:0 }}>
      <path d="M116.7 0C52.2 0 0 52.2 0 116.7c0 56.1 39.6 103 92.7 114L147 171.4c.2-1.7.3-3.4.3-5.1 0-27.6-22.4-50-50-50-22.5 0-41.6 14.9-47.8 35.4L6.9 128.4C9.4 58.5 60.3 0 116.7 0z"/>
      <path d="M97.5 166.3c0 16.7 13.5 30.2 30.2 30.2s30.2-13.5 30.2-30.2-13.5-30.2-30.2-30.2-30.2 13.5-30.2 30.2z"/>
      <path d="M173.3 97.2c0-21.5-17.5-39-39-39s-39 17.5-39 39 17.5 39 39 39 39-17.5 39-39zm-65.5 0c0-14.6 11.9-26.5 26.5-26.5s26.5 11.9 26.5 26.5-11.9 26.5-26.5 26.5-26.5-11.9-26.5-26.5z"/>
    </svg>
  ),
  chart: <span style={{ fontSize:12 }}>📊</span>,
  graph: <span style={{ fontSize:12 }}>📈</span>,
  globe: <span style={{ fontSize:12 }}>🌐</span>,
  target: <span style={{ fontSize:12 }}>🎯</span>,
}

type Tab = 'overview' | 'matches' | 'heroes'

export function PlayerPage() {
  const { id } = useParams<{ id: string }>()
  const { addToHistory } = useAppStore()
  const [activeTab, setActiveTab] = useState<Tab>('overview')

  const { data, isLoading, error } = useQuery({
    queryKey: ['player', id],
    queryFn: () => loadFullPlayer(id!),
    enabled: !!id,
    staleTime: 2 * 60 * 1000,
  })

  useEffect(() => {
    if (data?.player?.profile) {
      const { account_id, personaname, avatarfull } = data.player.profile
      addToHistory({ id: String(account_id), name: personaname, avatar: avatarfull, game: 'dota' })
    }
  }, [data])

  if (isLoading) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'80px 0', gap:16 }}>
      <div style={{ width:44, height:44, border:'2px solid var(--accent)', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <div style={{ fontFamily:'var(--font-mono)', color:'var(--text-3)', fontSize:12 }}>loading profile...</div>
    </div>
  )

  if (error || !data) return (
    <div style={{ padding:'60px 0', textAlign:'center', color:'var(--text-3)', fontFamily:'var(--font-mono)', fontSize:13 }}>
      ⚠️ Player not found or profile is private
    </div>
  )

  const { player, wl, recentMatches, heroStats } = data
  const accountId = player?.profile?.account_id ?? 0
  const steamId64 = player?.profile?.steamid || (accountId ? String(BigInt(accountId) + BigInt('76561197960265728')) : '')

  const profileLinks: ProfileLink[] = [
    { href: `https://steamcommunity.com/profiles/${steamId64}`, label: 'Steam', color: '#9aa8b2', bg: 'rgba(154,168,178,0.08)', icon: Icons.steam },
    { href: `https://www.dotabuff.com/players/${accountId}`, label: 'Dotabuff', color: '#e84057', bg: 'rgba(232,64,87,0.08)', icon: Icons.chart },
    { href: `https://www.opendota.com/players/${accountId}`, label: 'OpenDota', color: '#63b3ed', bg: 'rgba(99,179,237,0.08)', icon: Icons.graph },
    { href: `https://stratz.com/players/${accountId}`, label: 'Stratz', color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', icon: Icons.globe },
    { href: `https://dota2protracker.com/player/${accountId}`, label: 'D2PT', color: '#48bb78', bg: 'rgba(72,187,120,0.08)', icon: Icons.target },
  ]

  return (
    <div className="fade-up">
      <PlayerHeader player={player} wl={wl} />

      {/* External profile links — Dotabuff style */}
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:20, padding:'10px 14px', background:'var(--bg-2)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)', alignItems:'center' }}>
        <span style={{ fontSize:9, color:'var(--text-3)', fontFamily:'var(--font-mono)', letterSpacing:'0.1em', textTransform:'uppercase', marginRight:4 }}>Profile on:</span>
        {profileLinks.map(l => <ProfileLinkBtn key={l.label} link={l} />)}
        <div style={{ marginLeft:'auto', fontSize:10, color:'var(--text-3)', fontFamily:'var(--font-mono)', display:'flex', alignItems:'center', gap:8 }}>
          <span>ID: {accountId}</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <a href={`https://steamcommunity.com/profiles/${steamId64}`} target="_blank" rel="noopener noreferrer"
            style={{ display:'inline-flex', alignItems:'center', gap:4, color:'#9aa8b2', textDecoration:'none', fontSize:10 }}
            title="Open Steam"
          >
            {Icons.steam} {steamId64.slice(-8)}
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:2, marginBottom:20, background:'var(--bg-3)', border:'1px solid var(--border-1)', borderRadius:9, padding:3, width:'fit-content' }}>
        {(['overview','matches','heroes'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding:'7px 22px', borderRadius:7, border:'none', cursor:'pointer', fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700, letterSpacing:'0.06em', background: activeTab === tab ? 'var(--accent)' : 'transparent', color: activeTab === tab ? '#000' : 'var(--text-3)', transition:'all 0.15s', textTransform:'uppercase' }}>
            {tab === 'overview' ? 'Overview' : tab === 'matches' ? 'Matches' : 'Heroes'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <PlayerCharts recentMatches={recentMatches} heroStats={heroStats} player={player} />}
      {activeTab === 'matches'  && <MatchesTable matches={recentMatches} />}
      {activeTab === 'heroes'   && (
        <div style={{ background:'var(--bg-2)', border:'1px solid var(--border-1)', borderRadius:'var(--radius-md)', overflow:'hidden' }}>
          <div style={{ padding:'10px 16px', borderBottom:'1px solid var(--border-1)', fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-3)', display:'flex', justifyContent:'space-between' }}>
            <span>Hero stats · {heroStats.length} played</span>
            <a href={`https://www.dotabuff.com/players/${accountId}/heroes`} target="_blank" rel="noopener noreferrer"
              style={{ color:'#e84057', textDecoration:'none', fontSize:11 }}
              onMouseEnter={e => e.currentTarget.style.opacity='0.7'}
              onMouseLeave={e => e.currentTarget.style.opacity='1'}
            >
              Dotabuff →
            </a>
          </div>
          {[...heroStats].sort((a: any, b: any) => b.games - a.games).slice(0, 50).map((h: any) => {
            const wr = h.games > 0 ? (h.win / h.games * 100) : 0
            const wrC = wr >= 55 ? '#22d48a' : wr >= 50 ? '#a9c464' : wr >= 45 ? '#f5a623' : '#ff4757'
            return (
              <div key={h.hero_id} style={{ display:'grid', gridTemplateColumns:'200px 80px 90px 1fr 70px', padding:'6px 16px', borderBottom:'1px solid var(--border-0)', gap:12, alignItems:'center', transition:'background 0.1s' }}
                onMouseEnter={e => (e.currentTarget.style.background='rgba(255,255,255,0.02)')}
                onMouseLeave={e => (e.currentTarget.style.background='transparent')}
              >
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <img src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/icons/${h.hero_id}.png`} alt="" style={{ width:22, height:22, borderRadius:3 }} onError={e => { (e.currentTarget as HTMLImageElement).style.display='none' }} />
                  <span style={{ fontSize:12, color:'var(--text-1)', fontWeight:500 }}>{h.localized_name || `Hero #${h.hero_id}`}</span>
                </div>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-2)' }}>{h.games} games</span>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:wrC, fontWeight:700 }}>{wr.toFixed(1)}%</span>
                <div style={{ height:4, background:'var(--bg-4)', borderRadius:2, overflow:'hidden' }}>
                  <div style={{ width:`${Math.min(100,wr)}%`, height:'100%', background:wrC, borderRadius:2, transition:'width 0.4s' }} />
                </div>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-3)', textAlign:'right' }}>
                  {typeof h.kda === 'number' ? h.kda.toFixed(2) : '—'} KDA
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
