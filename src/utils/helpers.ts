// ── Time ──────────────────────────────────────────────────────────────
export function timeAgo(unixTs: number): string {
  const diff = Date.now() / 1000 - unixTs
  if (diff < 60)    return 'just now'
  if (diff < 3600)  return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return new Date(unixTs * 1000).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ── Numbers ───────────────────────────────────────────────────────────
export function fmtNum(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K'
  return String(n)
}

export function fmtKda(kills: number, deaths: number, assists: number): string {
  if (deaths === 0) return '∞'
  return ((kills + assists) / deaths).toFixed(2)
}

export function kdaColor(kda: number | string): string {
  const v = parseFloat(String(kda))
  if (isNaN(v)) return '#f5a623'
  if (v >= 5)   return '#22d48a'
  if (v >= 3)   return '#22d48a'
  if (v >= 2)   return '#f5a623'
  return '#94a3b8'
}

export function wrColor(wr: number): string {
  if (wr >= 58) return '#22d48a'
  if (wr >= 52) return '#86efac'
  if (wr >= 48) return '#f5a623'
  return '#ff4757'
}

// ── Steam ID conversion ───────────────────────────────────────────────
export function steamIdToAccountId(input: string): string {
  const digits = input.replace(/\D/g, '')
  if (digits.length === 17) {
    // 64-bit → 32-bit
    return (BigInt(digits) - BigInt('76561197960265728')).toString()
  }
  return digits
}

// ── Match ─────────────────────────────────────────────────────────────
export function isWin(playerSlot: number, radiantWin: boolean): boolean {
  const isRadiant = playerSlot < 128
  return isRadiant === radiantWin
}

// ── Clamp ─────────────────────────────────────────────────────────────
export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val))
}

// ── Winrate ───────────────────────────────────────────────────────────
export function calcWR(wins: number, total: number): number {
  if (total === 0) return 0
  return Math.round((wins / total) * 1000) / 10
}
