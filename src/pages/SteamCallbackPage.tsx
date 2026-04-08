import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { parseSteamIdFromCallback, fetchSteamProfile } from '@/api/steam'
import { useAppStore } from '@/store/appStore'

export function SteamCallbackPage() {
  const navigate = useNavigate()
  const { setSteamUser } = useAppStore()
  const [status, setStatus] = useState<'loading' | 'error'>('loading')

  useEffect(() => {
    const url = window.location.href
    const steamId = parseSteamIdFromCallback(url)

    if (!steamId) {
      setStatus('error')
      setTimeout(() => navigate('/'), 3000)
      return
    }

    fetchSteamProfile(steamId).then(user => {
      if (user) {
        setSteamUser(user)
        navigate('/account')
      } else {
        setStatus('error')
        setTimeout(() => navigate('/'), 3000)
      }
    })
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
      {status === 'loading' ? (
        <>
          <div style={{ width: 36, height: 36, border: '2px solid var(--border-1)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--text-3)' }}>
            Connecting Steam account...
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 32 }}>⚠️</div>
          <div style={{ color: 'var(--red)', fontFamily: 'var(--font-mono)', fontSize: 13 }}>
            Authorization error — redirecting to home...
          </div>
        </>
      )}
    </div>
  )
}
