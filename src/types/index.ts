// ── Player ──────────────────────────────────────────────────────────
export interface PlayerProfile {
  account_id: number
  personaname: string
  avatarfull: string
  avatarmedium: string
  loccountrycode?: string
  plus?: boolean
  is_contributor?: boolean
}

export interface Player {
  profile: PlayerProfile
  rank_tier?: number
  leaderboard_rank?: number
  mmr_estimate?: { estimate: number }
}

export interface WinLoss {
  win: number
  lose: number
}

// ── Match ────────────────────────────────────────────────────────────
export interface RecentMatch {
  match_id: number
  player_slot: number
  radiant_win: boolean
  duration: number
  game_mode: number
  lobby_type: number
  hero_id: number
  start_time: number
  kills: number
  deaths: number
  assists: number
  xp_per_min: number
  gold_per_min: number
  last_hits: number
  denies: number
  hero_damage: number
  tower_damage: number
  hero_healing: number
  skill?: number
  party_size?: number
}

export interface MatchDetail extends RecentMatch {
  players: MatchPlayer[]
  dire_score: number
  radiant_score: number
  draft_timings?: unknown[]
  teamfights?: unknown[]
  objectives?: unknown[]
  radiant_team?: { name: string; tag: string }
  dire_team?: { name: string; tag: string }
}

export interface MatchPlayer {
  account_id?: number
  player_slot: number
  hero_id: number
  kills: number
  deaths: number
  assists: number
  last_hits: number
  gold_per_min: number
  xp_per_min: number
  net_worth: number
  hero_damage: number
  tower_damage: number
  personaname?: string
  rank_tier?: number
}

// ── Hero ─────────────────────────────────────────────────────────────
export interface PlayerHero {
  hero_id: number
  last_played: number
  games: number
  win: number
  with_games: number
  with_win: number
  against_games: number
  against_win: number
  kda?: number
}

export interface HeroStat {
  id: number
  localized_name: string
  primary_attr: 'str' | 'agi' | 'int' | 'all'
  attack_type: 'Melee' | 'Ranged'
  roles: string[]
  img: string
  icon: string
  base_health: number
  base_attack_min: number
  base_attack_max: number
  base_str: number
  base_agi: number
  base_int: number
  str_gain: number
  agi_gain: number
  int_gain: number
  pro_win: number
  pro_pick: number
  pro_ban: number
  '1_pick': number; '1_win': number
  '2_pick': number; '2_win': number
  '3_pick': number; '3_win': number
  '4_pick': number; '4_win': number
  '5_pick': number; '5_win': number
  '6_pick': number; '6_win': number
  '7_pick': number; '7_win': number
  '8_pick': number; '8_win': number
}

// ── Leaderboard ──────────────────────────────────────────────────────
export interface LeaderboardEntry {
  account_id: number
  name?: string
  avatar?: string
  rank_tier?: number
  solo_competitive_rank?: number
  country_code?: string
}

// ── UI ───────────────────────────────────────────────────────────────
export type Game = 'dota' | 'cs'
export type RankTier = number


// ── Pro Players ─────────────────────────────────────────────────────
export interface ProPlayerLink {
  type: string
  label?: string
  url: string
  color?: string
  bg?: string
  border?: string
}
export interface ProPlayer {
  nickname: string
  fullName?: string
  realName?: string
  country?: string
  team?: string
  role?: string
  rating?: string
  ratingLabel?: string
  mmr?: number
  accent?: string
  extra?: string
  game?: string
  photo?: string | null
  steamId?: string
  links: ProPlayerLink[]
}
