import type { SteamUser } from '@/store/appStore'

// ─────────────────────────────────────────────────────────────────────
// Steam OpenID Login
//
// Flow:
//   1. Redirect user → Steam login page (openid endpoint)
//   2. Steam redirects back → /auth/steam/callback?openid.identity=...
//   3. We parse steamId from openid.identity URL
//   4. Fetch Steam profile via public API (no key needed for basic profile)
//
// For production: validate OpenID signature server-side.
// For frontend-only: we trust the returned steamId (sufficient for analytics).
// ─────────────────────────────────────────────────────────────────────

const STEAM_OPENID = 'https://steamcommunity.com/openid/login'
const APP_URL = window.location.origin

export function getSteamLoginUrl(): string {
  const params = new URLSearchParams({
    'openid.ns':         'http://specs.openid.net/auth/2.0',
    'openid.mode':       'checkid_setup',
    'openid.return_to':  `${APP_URL}/auth/steam/callback`,
    'openid.realm':      APP_URL,
    'openid.identity':   'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  })
  return `${STEAM_OPENID}?${params.toString()}`
}

// Parse steamId from OpenID callback URL
export function parseSteamIdFromCallback(url: string): string | null {
  try {
    const u = new URL(url)
    const identity = u.searchParams.get('openid.identity') || u.searchParams.get('openid.claimed_id')
    if (!identity) return null
    // identity = https://steamcommunity.com/openid/id/76561198XXXXXXXXX
    const match = identity.match(/\/id\/(\d{17})$/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

// Convert 64-bit Steam ID → 32-bit account ID
export function steamId64to32(id64: string): string {
  return (BigInt(id64) - BigInt('76561197960265728')).toString()
}

// Fetch Steam profile via allorigins proxy (no API key needed for public profiles)
export async function fetchSteamProfile(steamId64: string): Promise<SteamUser | null> {
  try {
    // Use Steam's public profile XML (no key required)
    const xmlUrl = `https://steamcommunity.com/profiles/${steamId64}?xml=1`
    const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(xmlUrl)}`
    const res = await fetch(proxy)
    const text = await res.text()

    const parser = new DOMParser()
    const doc = parser.parseFromString(text, 'text/xml')

    const personaname = doc.querySelector('steamID')?.textContent || 'Unknown'
    const avatarfull   = doc.querySelector('avatarFull')?.textContent || ''
    const profileurl   = doc.querySelector('profileURL')?.textContent || `https://steamcommunity.com/profiles/${steamId64}`

    return {
      steamId: steamId64,
      accountId: steamId64to32(steamId64),
      personaname,
      avatarfull,
      profileurl,
      dotaLinked: true,
      csLinked: true,
    }
  } catch {
    // Fallback: return minimal user if profile fetch fails
    return {
      steamId: steamId64,
      accountId: steamId64to32(steamId64),
      personaname: `User ${steamId64.slice(-6)}`,
      avatarfull: '',
      profileurl: `https://steamcommunity.com/profiles/${steamId64}`,
      dotaLinked: true,
      csLinked: true,
    }
  }
}
