import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { getSteamLoginUrl } from '@/api/steam'
import { useCurrentPatch } from '@/hooks/useData'

function NavPatchBadge({ accent }: { accent: string }) {
  const { data: patch } = useCurrentPatch()
  // patch is PatchInfo | undefined — guard before accessing properties
  if (!patch || typeof patch !== 'object') return null
  const version = patch.version ?? '7.40c'
  const patchUrl = patch.url ?? `https://www.dota2.com/patches/${version.replace(/\./g, '')}`
  return (
    <a href={patchUrl}
      target="_blank" rel="noopener noreferrer"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 5, background: `${accent}12`, border: `1px solid ${accent}30`, color: accent, fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.07em', textDecoration: 'none', flexShrink: 0 }}
      title={`Patch ${version} · ${patch.date ?? ''}`}
    >
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: accent, display: 'inline-block', opacity: 0.8 }} />
      PATCH {version}
    </a>
  )
}

const DOTA_LINKS = [
  { to: '/',            label: 'Home'        },
  { to: '/heroes',      label: 'Heroes'      },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/meta',        label: 'Meta'        },
  { to: '/ai',          label: 'AI Coach'    },
]
const CS2_LINKS = [
  { to: '/',            label: 'Home'        },
  { to: '/leaderboard', label: 'Leaderboard' },
  { to: '/ai',          label: 'AI Coach'    },
]

const DOTA_ACCENT = '#c84b31'
const CS2_ACCENT  = '#f0b429'

function SteamIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.606 0 11.979 0z"/>
    </svg>
  )
}

function UserDropdown({ onClose, accent }: { onClose: () => void; accent: string }) {
  const { steamUser, logout } = useAppStore()
  const navigate = useNavigate()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onClose() }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  if (!steamUser) return null

  return (
    <div ref={ref} style={{
      position: 'absolute', top: 'calc(100% + 8px)', right: 0,
      background: 'var(--bg-3)', border: '1px solid var(--border-2)',
      borderRadius: 'var(--radius-md)', minWidth: 220,
      boxShadow: '0 16px 48px rgba(0,0,0,0.55)', overflow: 'hidden', zIndex: 200,
    }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border-1)', display: 'flex', gap: 10, alignItems: 'center' }}>
        {steamUser.avatarfull
          ? <img src={steamUser.avatarfull} alt="" style={{ width: 38, height: 38, borderRadius: 7, objectFit: 'cover', border: '1px solid var(--border-2)' }} />
          : <div style={{ width: 38, height: 38, borderRadius: 7, background: 'var(--bg-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>👤</div>
        }
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-0)' }}>{steamUser.personaname}</div>
          <div style={{ fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>#{steamUser.accountId}</div>
        </div>
      </div>

      {[
        { icon: '🎮', label: 'My Profile',    fn: () => { navigate(`/player/${steamUser.accountId}`); onClose() } },
        { icon: '🔗', label: 'Steam Profile', fn: () => { window.open(steamUser.profileurl, '_blank'); onClose() } },
        { icon: '⚙️', label: 'Account',       fn: () => { navigate('/account'); onClose() } },
        null,
        { icon: '↩', label: 'Sign Out',      fn: () => { logout(); onClose() }, red: true },
      ].map((item, i) => {
        if (!item) return <div key={i} style={{ height: 1, background: 'var(--border-1)', margin: '4px 0' }} />
        return (
          <button key={i} onClick={item.fn} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'none', border: 'none', color: item.red ? 'var(--red)' : 'var(--text-1)', cursor: 'pointer', fontSize: 13, textAlign: 'left', transition: 'background 0.12s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'none')}
          >
            <span style={{ width: 18, textAlign: 'center' }}>{item.icon}</span>
            {item.label}
          </button>
        )
      })}
    </div>
  )
}

export function Navbar() {
  const location = useLocation()
  const { activeGame, setGame, steamUser } = useAppStore()
  const [dropOpen, setDropOpen] = useState(false)
  const accent = activeGame === 'dota' ? DOTA_ACCENT : CS2_ACCENT
  const navLinks = activeGame === 'dota' ? DOTA_LINKS : CS2_LINKS

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(5,7,14,0.98)', backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${accent}22`,
      display: 'flex', alignItems: 'center',
      padding: '0 24px', height: 'var(--nav-h)', gap: 20,
      transition: 'border-color 0.3s',
    }}>
      {/* Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none', flexShrink: 0 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: accent, animation: 'pulse-dot 2s ease-in-out infinite', transition: 'background 0.3s' }} />
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 600, letterSpacing: '0.14em', color: 'var(--text-0)' }}>
          {activeGame === 'dota' ? 'DOTA' : 'CS2'}
          <span style={{ color: accent, transition: 'color 0.3s' }}>SCOPE</span>
        </span>
      </Link>

      <div style={{ width: 1, height: 18, background: 'var(--border-1)', flexShrink: 0 }} />

      {/* Nav links */}
      <div style={{ display: 'flex', gap: 2, flex: 1 }}>
        {navLinks.map(({ to, label }) => {
          const active = location.pathname === to
          return (
            <Link key={`${activeGame}-${to}`} to={to} style={{
              padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
              letterSpacing: '0.06em', textTransform: 'uppercase', textDecoration: 'none',
              color: active ? accent : 'var(--text-2)',
              background: active ? `${accent}14` : 'transparent',
              border: `1px solid ${active ? accent + '33' : 'transparent'}`,
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--text-0)' }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = 'var(--text-2)' }}
            >{label}</Link>
          )
        })}
      </div>

      {/* Patch badge — only in Dota mode */}
      {activeGame === 'dota' && <NavPatchBadge accent={DOTA_ACCENT} />}

      {/* Game switch — tabs style */}
      <div style={{ display: 'flex', background: 'var(--bg-2)', border: '1px solid var(--border-1)', borderRadius: 8, padding: 3, gap: 3, flexShrink: 0 }}>
        <button onClick={() => setGame('dota')} style={{
          padding: '5px 14px', borderRadius: 6, fontSize: 11, fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.15s',
          background: activeGame === 'dota' ? `${DOTA_ACCENT}cc` : 'transparent',
          border: 'none',
          color: activeGame === 'dota' ? '#fff' : 'var(--text-3)',
          boxShadow: activeGame === 'dota' ? `0 0 12px ${DOTA_ACCENT}50` : 'none',
        }}>DOTA 2</button>
        <button onClick={() => setGame('cs')} style={{
          padding: '5px 14px', borderRadius: 6, fontSize: 11, fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer', transition: 'all 0.15s',
          background: activeGame === 'cs' ? `${CS2_ACCENT}cc` : 'transparent',
          border: 'none',
          color: activeGame === 'cs' ? '#0a0a0a' : 'var(--text-3)',
          boxShadow: activeGame === 'cs' ? `0 0 12px ${CS2_ACCENT}50` : 'none',
        }}>CS2</button>
      </div>

      <div style={{ width: 1, height: 18, background: 'var(--border-1)', flexShrink: 0 }} />

      {/* Auth */}
      <div style={{ flexShrink: 0, position: 'relative' }}>
        {steamUser ? (
          <button onClick={() => setDropOpen(v => !v)} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: dropOpen ? 'var(--bg-3)' : 'rgba(255,255,255,0.05)',
            border: `1px solid ${dropOpen ? 'var(--border-2)' : 'var(--border-1)'}`,
            borderRadius: 8, padding: '5px 10px 5px 6px', cursor: 'pointer', transition: 'all 0.15s',
          }}>
            {steamUser.avatarfull
              ? <img src={steamUser.avatarfull} alt="" style={{ width: 26, height: 26, borderRadius: 5, objectFit: 'cover' }} />
              : <div style={{ width: 26, height: 26, borderRadius: 5, background: 'var(--bg-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>👤</div>
            }
            <span style={{ fontSize: 12, color: 'var(--text-1)', fontWeight: 500, maxWidth: 110, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{steamUser.personaname}</span>
            <span style={{ color: 'var(--text-3)', fontSize: 9, display: 'block', transform: dropOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▾</span>
          </button>
        ) : (
          <button onClick={() => { window.location.href = getSteamLoginUrl() }} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(135deg, #1b2838 0%, #1e3a52 100%)',
            border: '1px solid rgba(102,178,226,0.45)',
            borderRadius: 8, padding: '7px 16px',
            color: '#c6d4df', fontSize: 12, fontWeight: 700,
            letterSpacing: '0.07em', textTransform: 'uppercase',
            cursor: 'pointer', transition: 'all 0.15s',
            boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
          }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #223347 0%, #284e6e 100%)'
              e.currentTarget.style.borderColor = 'rgba(102,178,226,0.7)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, #1b2838 0%, #1e3a52 100%)'
              e.currentTarget.style.borderColor = 'rgba(102,178,226,0.45)'
            }}
          >
            <SteamIcon />
            Sign in via Steam
          </button>
        )}
        {dropOpen && <UserDropdown onClose={() => setDropOpen(false)} accent={accent} />}
      </div>
    </nav>
  )
}
