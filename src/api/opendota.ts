// Proxy helper
const PROXY = (url: string) =>
  `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`

const OD = 'https://api.opendota.com/api'

async function od<T>(path: string): Promise<T> {
  const r = await fetch(`${OD}${path}`)
  if (!r.ok) throw new Error(`OpenDota ${r.status}: ${path}`)
  return r.json()
}

// ─── Player ───────────────────────────────────────────────────────────────
export interface PlayerSummary {
  profile: { account_id: number; personaname: string; avatarfull: string; profileurl: string; steamid: string; loccountrycode?: string }
  mmr_estimate?: { estimate: number }
  rank_tier?: number
  leaderboard_rank?: number
}

export async function loadFullPlayer(id: string) {
  const [player, wl, recentMatches, heroStats] = await Promise.all([
    od<PlayerSummary>(`/players/${id}`),
    od<{ win: number; lose: number }>(`/players/${id}/wl`),
    od<any[]>(`/players/${id}/recentMatches`),
    od<any[]>(`/players/${id}/heroes`),
  ])
  return { player, wl, recentMatches, heroStats }
}

// ─── Steam XML profile (for avatar without API key) ───────────────────────
export async function fetchSteamXmlProfile(steamId64: string): Promise<{
  avatarfull: string; personaname: string; profileurl: string
} | null> {
  try {
    const url = `https://steamcommunity.com/profiles/${steamId64}?xml=1`
    const r = await fetch(PROXY(url))
    const j = await r.json()
    const xml = j.contents as string
    const avatar  = xml.match(/<avatarFull>\s*<!\[CDATA\[(.*?)\]\]>/)?.[1] || xml.match(/<avatarFull>(.*?)<\/avatarFull>/)?.[1] || ''
    const name    = xml.match(/<steamID>\s*<!\[CDATA\[(.*?)\]\]>/)?.[1]   || xml.match(/<steamID>(.*?)<\/steamID>/)?.[1]       || steamId64
    const profile = xml.match(/<customURL>\s*<!\[CDATA\[(.*?)\]\]>/)?.[1] || ''
    return { avatarfull: avatar, personaname: name, profileurl: profile ? `https://steamcommunity.com/id/${profile}` : `https://steamcommunity.com/profiles/${steamId64}` }
  } catch {
    return null
  }
}

// ─── Heroes ───────────────────────────────────────────────────────────────
export async function getHeroStats() {
  return od<any[]>('/heroStats')
}

export async function getHeroList() {
  return od<any[]>('/heroes')
}

// ─── Meta ─────────────────────────────────────────────────────────────────
export async function getProMatches() {
  return od<any[]>('/proMatches')
}

export async function getHeroMatchups(heroId: number) {
  return od<any[]>(`/heroes/${heroId}/matchups`)
}

// ─── Leaderboard ──────────────────────────────────────────────────────────
export async function getLeaderboardByRegion(region: string) {
  // Primary: dota2.com
  try {
    const url = `https://www.dota2.com/webapi/ILeaderboard/GetDivisionLeaderboard/v0001?division=${region}&leaderboard=0`
    const r = await fetch(PROXY(url))
    const j = await r.json()
    const data = JSON.parse(j.contents)
    if (data?.leaderboard?.length) return data.leaderboard
  } catch {}
  // Fallback: OpenDota
  return od<any[]>(`/leaderboard?division=${region}`)
}

// ─── Teams ────────────────────────────────────────────────────────────────
export async function getTeams() {
  return od<any[]>('/teams')
}

// ─── Player Peers ─────────────────────────────────────────────────────────
export async function getPlayerPeers(id: string) {
  return od<any[]>(`/players/${id}/peers`)
}

// ─── Search Players ───────────────────────────────────────────────────────
export async function searchPlayers(query: string) {
  return od<any[]>(`/search?q=${encodeURIComponent(query)}`)
}

// ─── Match Detail ─────────────────────────────────────────────────────────
export async function getMatch(id: string) {
  return od<any>(`/matches/${id}`)
}

// ─── Current Patch ────────────────────────────────────────────────────────
export interface PatchInfo {
  version: string
  date: string
  url: string
}

export async function getCurrentPatch(): Promise<PatchInfo> {
  return {
    version: '7.40c',
    date: 'Jan 22 2026',
    url: 'https://www.dota2.com/patches/740c',
  }
}
