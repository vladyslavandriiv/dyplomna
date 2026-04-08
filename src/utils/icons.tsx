import React from 'react'

// ── Hero slugs ─────────────────────────────────────────────────────────
const HERO_SLUGS: Record<number, string> = {
  1:'antimage',2:'axe',3:'bane',4:'bloodseeker',5:'crystal_maiden',
  6:'drow_ranger',7:'earthshaker',8:'juggernaut',9:'mirana',10:'morphling',
  11:'nevermore',12:'phantom_lancer',13:'puck',14:'pudge',15:'razor',
  16:'sand_king',17:'storm_spirit',18:'sven',19:'tiny',20:'vengefulspirit',
  21:'windrunner',22:'zuus',23:'kunkka',25:'lina',26:'lion',
  27:'shadow_shaman',28:'slardar',29:'tidehunter',30:'witch_doctor',
  31:'lich',32:'riki',33:'enigma',34:'tinker',35:'sniper',
  36:'necrolyte',37:'warlock',38:'beastmaster',39:'queenofpain',
  40:'venomancer',41:'faceless_void',42:'skeleton_king',43:'death_prophet',
  44:'phantom_assassin',45:'pugna',46:'templar_assassin',47:'viper',
  48:'luna',49:'dragon_knight',50:'dazzle',51:'rattletrap',52:'leshrac',
  53:'furion',54:'life_stealer',55:'dark_seer',56:'clinkz',
  57:'omniknight',58:'enchantress',59:'huskar',60:'night_stalker',
  61:'broodmother',62:'bounty_hunter',63:'weaver',64:'jakiro',
  65:'batrider',66:'chen',67:'spectre',68:'ancient_apparition',
  69:'doom_bringer',70:'ursa',71:'spirit_breaker',72:'gyrocopter',
  73:'alchemist',74:'invoker',75:'silencer',76:'obsidian_destroyer',
  77:'lycan',78:'brewmaster',79:'shadow_demon',80:'lone_druid',
  81:'chaos_knight',82:'meepo',83:'treant',84:'ogre_magi',
  85:'undying',86:'rubick',87:'disruptor',88:'nyx_assassin',
  89:'naga_siren',90:'keeper_of_the_light',91:'wisp',92:'visage',
  93:'slark',94:'medusa',95:'troll_warlord',96:'centaur',
  97:'magnus',98:'shredder',99:'bristleback',100:'tusk',
  101:'skywrath_mage',102:'abaddon',103:'elder_titan',104:'legion_commander',108:'underlord',
  106:'ember_spirit',107:'earth_spirit',109:'terrorblade',110:'phoenix',
  111:'oracle',112:'winter_wyvern',113:'arc_warden',114:'monkey_king',
  119:'dark_willow',120:'pangolier',121:'grimstroke',123:'hoodwink',
  126:'void_spirit',128:'snapfire',129:'mars',135:'dawnbreaker',
  136:'marci',137:'primal_beast',138:'muerta',
  145:'kez', 148:'ringmaster', 149:'largo',
}

// Alternative CDN bases for fallback
const CDN_BASES = [
  'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes',
  'https://cdn.akamai.steamstatic.com/apps/dota2/images/dota_react/heroes',
]

export function heroIconUrl(heroId: number, size: 'sm'|'lg' = 'sm'): string {
  const slug = HERO_SLUGS[heroId] || `npc_dota_hero_${heroId}`
  if (!slug) return ''
  const base = CDN_BASES[0]
  return size === 'lg' ? `${base}/${slug}.png` : `${base}/icons/${slug}.png`
}

export function heroIconUrlFallback(heroId: number, size: 'sm'|'lg' = 'sm'): string {
  const slug = HERO_SLUGS[heroId] || `npc_dota_hero_${heroId}`
  if (!slug) return ''
  const base = CDN_BASES[1]
  return size === 'lg' ? `${base}/${slug}.png` : `${base}/icons/${slug}.png`
}

// ── Rank system ───────────────────────────────────────────────────────
// Rank medal images hosted on OpenDota CDN — exact working URLs
// Format: https://www.opendota.com/assets/images/dota2/rank_icons/rank_icon_{tier}.png
// Stars:  https://www.opendota.com/assets/images/dota2/rank_icons/rank_star_{star}.png

export const RANK_DATA = [
  { tier: 0, name: 'Unranked',  color: '#6b7280', gradient: 'linear-gradient(135deg,#374151,#1f2937)' },
  { tier: 1, name: 'Herald',    color: '#9e9e9e', gradient: 'linear-gradient(135deg,#4a5568,#2d3748)' },
  { tier: 2, name: 'Guardian',  color: '#68d391', gradient: 'linear-gradient(135deg,#276749,#1c4532)' },
  { tier: 3, name: 'Crusader',  color: '#63b3ed', gradient: 'linear-gradient(135deg,#2b6cb0,#1a365d)' },
  { tier: 4, name: 'Archon',    color: '#b794f4', gradient: 'linear-gradient(135deg,#553c9a,#322659)' },
  { tier: 5, name: 'Legend',    color: '#fbd38d', gradient: 'linear-gradient(135deg,#c05621,#7b341e)' },
  { tier: 6, name: 'Ancient',   color: '#76e4f7', gradient: 'linear-gradient(135deg,#0987a0,#065666)' },
  { tier: 7, name: 'Divine',    color: '#f6e05e', gradient: 'linear-gradient(135deg,#b7791f,#744210)' },
  { tier: 8, name: 'Immortal',  color: '#fc8181', gradient: 'linear-gradient(135deg,#c53030,#742a2a)' },
]

export interface RankInfo {
  name: string; color: string; star: number; tier: number
  iconUrl: string; starUrl: string; gradient: string
}

export function getRankInfo(rankTier?: number): RankInfo {
  if (!rankTier) {
    const d = RANK_DATA[0]
    return { name: d.name, color: d.color, star: 0, tier: 0, iconUrl: '', starUrl: '', gradient: d.gradient }
  }
  const tier  = Math.floor(rankTier / 10)   // 1–8
  const star  = rankTier % 10               // 0–5
  const d     = RANK_DATA[Math.min(tier, 8)] || RANK_DATA[0]

  // OpenDota hosts rank images reliably
  const iconUrl = `https://www.opendota.com/assets/images/dota2/rank_icons/rank_icon_${tier}.png`
  const starUrl = star > 0 ? `https://www.opendota.com/assets/images/dota2/rank_icons/rank_star_${star}.png` : ''

  return { name: d.name, color: d.color, star, tier, iconUrl, starUrl, gradient: d.gradient }
}

// ── HeroIcon ───────────────────────────────────────────────────────────
export function HeroIcon({ heroId, size = 28, style }: { heroId: number; size?: number; style?: React.CSSProperties }) {
  const [attempt, setAttempt] = React.useState(0)
  const urls = [heroIconUrl(heroId, 'sm'), heroIconUrlFallback(heroId, 'sm')]
  const url = urls[attempt]
  if (!url || attempt >= urls.length) return (
    <div style={{ width: size, height: size, borderRadius: 4, background: 'var(--bg-4)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, color: 'var(--text-3)', fontWeight: 600, ...style }}>?</div>
  )
  return <img src={url} alt="" width={size} height={size} style={{ borderRadius: 4, objectFit: 'cover', flexShrink: 0, display: 'block', ...style }} onError={() => setAttempt(a => a + 1)} />
}

// ── RankIcon ───────────────────────────────────────────────────────────
export function RankIcon({ rankTier, size = 40 }: { rankTier?: number; size?: number }) {
  const rank = getRankInfo(rankTier)
  const [iconFailed, setIconFailed] = React.useState(false)
  const [starFailed, setStarFailed] = React.useState(false)

  // CSS fallback when image fails
  if (!rank.iconUrl || iconFailed) {
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: rank.gradient, border: `2px solid ${rank.color}55`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 10px ${rank.color}30`,
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: size * 0.38, fontWeight: 700, color: rank.color }}>
          {rank.tier > 0 ? rank.name[0] : '?'}
        </span>
      </div>
    )
  }

  return (
    <div style={{ width: size, height: size, flexShrink: 0, position: 'relative', display: 'inline-block' }}>
      {/* Base medal */}
      <img src={rank.iconUrl} alt={rank.name} width={size} height={size}
        style={{ objectFit: 'contain', display: 'block' }}
        onError={() => setIconFailed(true)}
      />
      {/* Star overlay */}
      {rank.star > 0 && rank.starUrl && !starFailed && (
        <img src={rank.starUrl} alt={`${rank.star}★`}
          style={{ position: 'absolute', bottom: -2, left: '50%', transform: 'translateX(-50%)', width: size * 0.65, objectFit: 'contain', pointerEvents: 'none' }}
          onError={() => setStarFailed(true)}
        />
      )}
      {/* Star CSS fallback */}
      {rank.star > 0 && (rank.starUrl === '' || starFailed) && (
        <div style={{
          position: 'absolute', bottom: -3, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--bg-2)', borderRadius: 8, padding: '1px 5px',
          fontSize: size * 0.22, fontWeight: 800, color: rank.color,
          fontFamily: 'var(--font-display)', border: `1px solid ${rank.color}44`,
          whiteSpace: 'nowrap',
        }}>
          {'★'.repeat(rank.star)}
        </div>
      )}
    </div>
  )
}
