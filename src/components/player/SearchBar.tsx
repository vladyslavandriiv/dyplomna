import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'
import { DOTA_DEMOS, CS_DEMOS } from '@/utils/constants'
import { steamIdToAccountId } from '@/utils/helpers'

export function SearchBar() {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { activeGame, searchHistory } = useAppStore()

  const demos = activeGame === 'dota' ? DOTA_DEMOS : CS_DEMOS

  const doSearch = (raw?: string) => {
    const input = (raw ?? value).trim()
    if (!input) return
    const id = steamIdToAccountId(input)
    if (!id) return
    navigate(`/player/${id}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') doSearch()
  }

  const showDropdown = focused && searchHistory.filter(h => h.game === activeGame).length > 0 && !value

  return (
    <div style={{ maxWidth: 560, position: 'relative' }}>
      {/* Headline */}
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 52, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-0)', lineHeight: 1, marginBottom: 6 }}>
        {activeGame === 'dota' ? 'DOTA 2' : 'CS2'} <span style={{ color: 'var(--accent)' }}>ANALYTICS</span>
      </h1>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)', marginBottom: 22 }}>
        // enter Steam ID or Account ID
      </p>

      {/* Input row */}
      <div style={{ display: 'flex', gap: 10, position: 'relative' }}>
        <input
          ref={inputRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={activeGame === 'dota' ? '70388657 or 76561198...' : '76561198034202275'}
          style={{
            flex: 1, background: 'var(--bg-2)',
            border: `1px solid ${focused ? 'var(--accent)' : 'var(--border-2)'}`,
            borderRadius: 'var(--radius-md)', padding: '12px 16px',
            color: 'var(--text-1)', fontFamily: 'var(--font-mono)', fontSize: 13,
            outline: 'none',
            boxShadow: focused ? '0 0 0 2px rgba(79,142,255,0.1)' : 'none',
            transition: 'all 0.2s',
          }}
        />
        <button
          onClick={() => doSearch()}
          style={{
            background: 'var(--accent)', border: 'none', borderRadius: 'var(--radius-md)',
            padding: '12px 24px', color: '#fff', fontWeight: 700, fontSize: 13,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            transition: 'all 0.15s', whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#3a7aff')}
          onMouseLeave={e => (e.currentTarget.style.background = 'var(--accent)')}
        >
          FIND →
        </button>
      </div>

      {/* History dropdown */}
      {showDropdown && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, right: 60,
          background: 'var(--bg-3)', border: '1px solid var(--border-2)',
          borderRadius: 'var(--radius-md)', marginTop: 4, zIndex: 50,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)', overflow: 'hidden',
        }}>
          <div style={{ padding: '6px 12px', fontSize: 10, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', borderBottom: '1px solid var(--border-1)' }}>
            HISTORY
          </div>
          {searchHistory.filter(h => h.game === activeGame).map(h => (
            <button key={h.id} onClick={() => { setValue(h.id); doSearch(h.id) }} style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', background: 'none', border: 'none',
              color: 'var(--text-1)', cursor: 'pointer', textAlign: 'left',
              transition: 'background 0.12s', fontSize: 13,
            }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'none')}
            >
              {h.avatar && <img src={h.avatar} alt="" style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'cover' }} />}
              <span style={{ flex: 1 }}>{h.name}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>{h.id}</span>
            </button>
          ))}
        </div>
      )}

      {/* Quick demos */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }}>// examples:</span>
        {demos.map(({ name, id }) => (
          <button key={id} onClick={() => { setValue(id); doSearch(id) }} style={{
            padding: '3px 10px', borderRadius: 4,
            fontSize: 11, fontFamily: 'var(--font-mono)',
            background: 'rgba(79,142,255,0.07)', border: '1px solid rgba(79,142,255,0.2)',
            color: '#7ab4ff', cursor: 'pointer', transition: 'all 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(79,142,255,0.15)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(79,142,255,0.07)')}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  )
}
