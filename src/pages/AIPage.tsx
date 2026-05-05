import { useState } from 'react'
import { loadFullPlayer } from '@/api/opendota'
import { fetchPlayerAdvice, PlayerAdvicePayload, PlayerAdviceResult } from '@/api/ai'
import { steamIdToAccountId } from '@/utils/helpers'
import { getHeroName } from '@/utils/icons'

function formatTopHeroes(heroStats: any[]) {
  if (!heroStats?.length) return 'No hero stats available.'
  const top = [...heroStats]
    .sort((a, b) => (b.games || 0) - (a.games || 0))
    .slice(0, 4)
  return top.map((h, idx) => {
    const win = h.win ?? 0
    const games = h.games ?? 0
    const wr = games ? ((win / games) * 100).toFixed(1) : '0.0'
    return `#${idx + 1} ${getHeroName(h.hero_id)} (${games} games, ${wr}% WR)`
  }).join(', ')
}

function buildHeroSummary(heroStats: any[]) {
  if (!heroStats?.length) return 'No hero stats.'
  const top = [...heroStats].sort((a, b) => (b.games || 0) - (a.games || 0)).slice(0, 6)
  return top.map(h => {
    const games = h.games ?? 0
    const win = h.win ?? 0
    const wr = games ? ((win / games) * 100).toFixed(1) : '0.0'
    return `${getHeroName(h.hero_id)}: ${games} games, ${win} wins, ${wr}% WR.`
  }).join(' ')
}

export function AIPage() {
  const [input, setInput] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error' | 'done'>('idle')
  const [output, setOutput] = useState<string>('')
  const [provider, setProvider] = useState<string>('')
  const [errorText, setErrorText] = useState<string>('')

  const handleAnalyze = async () => {
    setStatus('loading')
    setOutput('')
    setErrorText('')

    try {
      const rawId = input.trim()
      if (!rawId) {
        throw new Error('Введите Steam64 ID или OpenDota account ID.')
      }
      const accountId = rawId.length === 17 ? steamIdToAccountId(rawId) : rawId
      const player = await loadFullPlayer(accountId)
      const win = player.wl?.win ?? 0
      const lose = player.wl?.lose ?? 0

      const payload: PlayerAdvicePayload = {
        accountId,
        playerName: player.player?.profile?.personaname || `Player ${accountId}`,
        win,
        lose,
        rankTier: player.player?.rank_tier,
        mmrEstimate: player.player?.mmr_estimate?.estimate,
        topHeroes: formatTopHeroes(player.heroStats),
        heroSummary: buildHeroSummary(player.heroStats),
      }

      const result: PlayerAdviceResult = await fetchPlayerAdvice(payload)
      setOutput(result.text)
      setProvider(result.provider)
      setStatus('done')
    } catch (err) {
      setStatus('error')
      setErrorText(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <div className="fade-up" style={{ maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, letterSpacing: '0.08em', color: 'var(--text-0)', margin: 0 }}>AI Player Coach</h1>
        <p style={{ marginTop: 10, fontSize: 13, color: 'var(--text-3)', lineHeight: 1.7, maxWidth: 680 }}>
          Аналізуй ID гравця, щоб отримати рекомендації по профілю та поточній статистиці.
          Це простий AI-асистент, який бере дані OpenDota і формує поради на основі профілю.
        </p>
      </div>

      <div style={{ display: 'grid', gap: 14, marginBottom: 24 }}>
        <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-md)', padding: 18 }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', marginBottom: 12 }}>ВХІДНІ ДАНІ ПРОФІЛЮ</div>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Steam64 ID або OpenDota account ID"
            style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1px solid var(--border-1)', background: 'var(--bg-3)', color: 'var(--text-0)', fontSize: 13, outline: 'none' }}
          />
          <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <button onClick={handleAnalyze} disabled={status === 'loading'}
              style={{ padding: '12px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 700, background: 'var(--accent)', color: '#000', transition: 'transform 0.15s', boxShadow: '0 12px 24px rgba(80,180,255,0.12)' }}>
              {status === 'loading' ? 'Аналізується…' : 'Отримати пораду AI'}
            </button>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Потрібен ключ NVIDIA / Free LLM / Gemini / Anthropic / OpenAI у .env</span>
          </div>
        </div>

        {status === 'error' && (
          <div style={{ padding: 18, borderRadius: 'var(--radius-md)', background: 'rgba(255,95,92,0.12)', border: '1px solid rgba(255,95,92,0.2)', color: '#ff6b6b' }}>
            Помилка: {errorText}
          </div>
        )}

        {status !== 'idle' && output && (
          <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-md)', padding: 18 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              🤖 AI Advice {provider && <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 400 }}>({provider})</span>}
            </div>
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7, fontSize: 14, color: 'var(--text-1)' }}>
              {output}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gap: 12, fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>
        <div>Приклад: 76561198312345678 або 123456789.</div>
        <div>AI використовує дані OpenDota і дає рекомендації по профілю на основі статистики.</div>
      </div>
    </div>
  )
}
