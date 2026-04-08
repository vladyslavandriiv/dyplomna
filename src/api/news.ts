// News API — fetches from Steam news with real thumbnail extraction

export interface NewsItem {
  id: string
  gid?: string
  title: string
  url: string
  date: Date
  summary: string
  contents?: string
  feedlabel?: string
  thumbnail: string | null
  source: string
}

const CLAN_IMG = 'https://cdn.akamai.steamstatic.com/steamcommunity/public/images/clans/'

const DOTA_THUMBS = [
  'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/home/slide/screenshot1.jpg',
  'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/home/slide/screenshot2.jpg',
  'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/home/slide/screenshot3.jpg',
  'https://cdn.akamai.steamstatic.com/steam/apps/570/capsule_616x353.jpg',
]
const CS_THUMBS = [
  'https://cdn.akamai.steamstatic.com/steam/apps/730/capsule_616x353.jpg',
  'https://cdn.akamai.steamstatic.com/steam/apps/730/ss_34090fc19b9f9cb647a1b29a36633e8b47b0e1ff.jpg',
  'https://cdn.akamai.steamstatic.com/steam/apps/730/ss_1e57ad0d3a3b28b6cbae68b7d8eebd3f69dc2282.jpg',
]

let dotaIdx = 0, csIdx = 0
const nextDota = () => DOTA_THUMBS[dotaIdx++ % DOTA_THUMBS.length]
const nextCs = () => CS_THUMBS[csIdx++ % CS_THUMBS.length]

function fT(url: string, ms = 12000): Promise<Response> {
  const c = new AbortController()
  const t = setTimeout(() => c.abort(), ms)
  return fetch(url, { signal: c.signal }).finally(() => clearTimeout(t))
}

function extractImg(text: string): string | null {
  if (!text) return null
  const clan = text.match(/\{STEAM_CLAN_IMAGE\}\/([^\s\]"'<>]+)/i)
  if (clan) return CLAN_IMG + clan[1]
  const direct = text.match(/https?:\/\/[^\s"'<>\]]+\.(jpg|jpeg|png|webp)(\?[^\s"'<>\]]*)?/i)
  if (direct) return direct[0]
  return null
}

async function fetchSteamNews(appId: number, count = 10): Promise<NewsItem[]> {
  const isDota = appId === 570
  const apiUrl = `https://api.steampowered.com/ISteamNews/GetNewsForApp/v2/?appid=${appId}&count=${count}&maxlength=2000&format=json`

  const tryParse = (j: any): NewsItem[] | null => {
    const items = j?.appnews?.newsitems
    if (!Array.isArray(items) || items.length === 0) return null
    return items.map((item: any, i: number) => {
      const body = (item.contents ?? '') + ' ' + (item.feedlabel ?? '')
      let thumb = extractImg(body)
      if (!thumb) thumb = isDota ? nextDota() : nextCs()
      const summary = body
        .replace(/\{STEAM_CLAN_IMAGE\}\/[^\s\]]+/g, '')
        .replace(/\[[^\]]+\]/g, '')
        .replace(/<[^>]+>/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/\s+/g, ' ').trim().slice(0, 200)
      return {
        id: item.gid || String(i),
        gid: item.gid || String(i),
        title: item.title || 'News',
        url: item.url || `https://store.steampowered.com/news/app/${appId}`,
        date: new Date((item.date || 0) * 1000),
        summary: summary + (summary.length >= 200 ? '...' : ''),
        contents: item.contents || '',
        feedlabel: item.feedlabel || item.feedname || '',
        thumbnail: thumb,
        source: item.feedname || 'steam',
      }
    })
  }

  const tryFetch = async (url: string): Promise<NewsItem[] | null> => {
    try {
      const r = await fT(url)
      if (!r.ok) return null
      const j = await r.json()
      return tryParse(j)
    } catch { return null }
  }

  const direct = await tryFetch(apiUrl)
  if (direct) return direct

  for (const px of [
    `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`,
    `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`,
  ]) {
    const res = await tryFetch(px)
    if (res) return res
  }
  return []
}

export async function fetchDota2News(count = 8): Promise<NewsItem[]> {
  dotaIdx = 0; return fetchSteamNews(570, count)
}
export async function fetchCS2News(count = 8): Promise<NewsItem[]> {
  csIdx = 0; return fetchSteamNews(730, count)
}
// classifyDotaNews moved to bottom
// classifyCS2News moved to bottom

// Utility helpers used by HomePage
export function stripHtml(html: string, maxLen = 200): string {
  return (html || '')
    .replace(/\{[^}]+\}/g, '')
    .replace(/\[[^\]]+\]/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/https?:\/\/\S+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen)
}

export function timeAgoRu(date: Date): string {
  const s = (Date.now() - date.getTime()) / 1000
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

// Classify a single news item — returns {label, color} for display
export function classifyDotaNews(item: NewsItem): { label: string; color: string } {
  const t = (item.title ?? '').toLowerCase()
  if (t.includes('patch') || t.includes('7.4') || t.includes('update')) return { label: 'PATCH', color: '#38a169' }
  if (t.includes('ti') || t.includes('international') || t.includes('tournament')) return { label: 'TOURNAMENT', color: '#805ad5' }
  if (t.includes('hero')) return { label: 'HERO', color: '#3182ce' }
  if (t.includes('season') || t.includes('battlepass')) return { label: 'SEASON', color: '#d69e2e' }
  return { label: 'NEWS', color: '#c84b31' }
}
export function classifyCS2News(item: NewsItem): { label: string; color: string } {
  const t = (item.title ?? '').toLowerCase()
  if (t.includes('patch') || t.includes('update') || t.includes('release')) return { label: 'UPDATE', color: '#38a169' }
  if (t.includes('major') || t.includes('tournament') || t.includes('blast') || t.includes('esl')) return { label: 'TOURNAMENT', color: '#805ad5' }
  if (t.includes('operation') || t.includes('case') || t.includes('skin')) return { label: 'CONTENT', color: '#d69e2e' }
  return { label: 'NEWS', color: '#f0b429' }
}