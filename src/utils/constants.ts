// Demo players
export const DOTA_DEMOS = [
  { name: 'Dendi',    id: '70388657'   },
  { name: 'Miracle-', id: '105248644'  },
  { name: 'Yatoro',   id: '321580662'  },
  { name: 'Collapse', id: '340603632'  },
]

export const CS_DEMOS = [
  { name: 's1mple', id: '76561198034202275' },
  { name: 'ZywOo',  id: '76561198380899939' },
  { name: 'donk',   id: '76561199064045520' },
  { name: 'NiKo',   id: '76561198136523281' },
]

// Game modes
export const GAME_MODES: Record<number, string> = {
  1: 'All Pick', 2: 'Captains Mode', 3: 'Random Draft', 4: 'Single Draft',
  5: 'All Random', 7: 'Diretide', 8: 'Reverse CM', 16: 'Captains Draft',
  22: 'Ranked All Pick', 23: 'Turbo', 24: 'Deadpool',
}

export const ATTR_MAP: Record<string, string> = {
  str: 'STR', agi: 'AGI', int: 'INT', all: 'UNI',
}

// OpenDota heroStats rank bracket fields
// rank_tier: 1=Herald 2=Guardian 3=Crusader 4=Archon 5=Legend 6=Ancient 7=Divine 8=Immortal
// 9=Titan (Immortal Top-1000 / Leaderboard — OpenDota uses 8 for all Immortal but we show separately)
export const RANK_BRACKETS = [
  { id: 1, name: 'Herald',   color: '#9E7B5C', short: 'Herald',   icon: '🪨' },
  { id: 2, name: 'Guardian', color: '#9DB0BB', short: 'Guardian', icon: '🛡️' },
  { id: 3, name: 'Crusader', color: '#84C99E', short: 'Crusader', icon: '⚔️' },
  { id: 4, name: 'Archon',   color: '#73B7C1', short: 'Archon',   icon: '🏹' },
  { id: 5, name: 'Legend',   color: '#A9A566', short: 'Legend',   icon: '📜' },
  { id: 6, name: 'Ancient',  color: '#718EC3', short: 'Ancient',  icon: '🔱' },
  { id: 7, name: 'Divine',   color: '#B589D6', short: 'Divine',   icon: '✨' },
  { id: 8, name: 'Immortal', color: '#C9844A', short: 'Immortal', icon: '♾️' },
  // Titan = Immortal Top-1000 (same API data as immortal, visually separate)
  { id: 9, name: 'Titan',    color: '#e5c46b', short: 'Titan',    icon: '👑' },
]

// Dota 2 patches — CURRENT: 7.40c (January 2026)
// 7.40d expected in early March 2026 (per insiders)
export const DOTA_PATCHES = [
  { version: '7.40c', date: '2026-01-22', label: '7.40c (current)', isCurrent: true  },
  { version: '7.40b', date: '2025-12-28', label: '7.40b',           isCurrent: false },
  { version: '7.40',  date: '2025-12-16', label: '7.40 (Largo)',    isCurrent: false },
  { version: '7.39e', date: '2025-10-09', label: '7.39e',           isCurrent: false },
  { version: '7.39',  date: '2025-09-12', label: '7.39',            isCurrent: false },
  { version: '7.38b', date: '2025-07-15', label: '7.38b',           isCurrent: false },
  { version: '7.38',  date: '2025-06-27', label: '7.38',            isCurrent: false },
]

export const CURRENT_PATCH = '7.40c'
export const CURRENT_PATCH_DATE = '2026-01-22'
export const CURRENT_PATCH_NOTES_URL = 'https://www.dota2.com/patches/7.40c'

// Auto-detection of the current patch via Steam news API
// Patch is loaded dynamically in the useCurrentPatch() hook

export const HERO_NAMES: Record<number, string> = {
  1:'Anti-Mage', 2:'Axe', 3:'Bane', 4:'Bloodseeker', 5:'Crystal Maiden',
  6:'Drow Ranger', 7:'Earthshaker', 8:'Juggernaut', 9:'Mirana', 10:'Morphling',
  11:'Shadow Fiend', 12:'Phantom Lancer', 13:'Puck', 14:'Pudge', 15:'Razor',
  16:'Sand King', 17:'Storm Spirit', 18:'Sven', 19:'Tiny', 20:'Vengeful Spirit',
  21:'Windranger', 22:'Zeus', 23:'Kunkka', 25:'Lina', 26:'Lion',
  27:'Shadow Shaman', 28:'Slardar', 29:'Tidehunter', 30:'Witch Doctor',
  31:'Lich', 32:'Riki', 33:'Enigma', 34:'Tinker', 35:'Sniper',
  36:'Necrophos', 37:'Warlock', 38:'Beastmaster', 39:'Queen of Pain',
  40:'Venomancer', 41:'Faceless Void', 42:'Wraith King', 43:'Death Prophet',
  44:'Phantom Assassin', 45:'Pugna', 46:'Templar Assassin', 47:'Viper',
  48:'Luna', 49:'Dragon Knight', 50:'Dazzle', 51:'Clockwerk',
  52:'Leshrac', 53:"Nature's Prophet", 54:'Lifestealer', 55:'Dark Seer',
  56:'Clinkz', 57:'Omniknight', 58:'Enchantress', 59:'Huskar',
  60:'Night Stalker', 61:'Broodmother', 62:'Bounty Hunter', 63:'Weaver',
  64:'Jakiro', 65:'Batrider', 66:'Chen', 67:'Spectre',
  68:'Ancient Apparition', 69:'Doom', 70:'Ursa', 71:'Spirit Breaker',
  72:'Gyrocopter', 73:'Alchemist', 74:'Invoker', 75:'Silencer',
  76:'Outworld Destroyer', 77:'Lycan', 78:'Brewmaster', 79:'Shadow Demon',
  80:'Lone Druid', 81:'Chaos Knight', 82:'Meepo', 83:'Treant Protector',
  84:'Ogre Magi', 85:'Undying', 86:'Rubick', 87:'Disruptor',
  88:'Nyx Assassin', 89:'Naga Siren', 90:'Keeper of the Light', 91:'Io',
  92:'Visage', 93:'Slark', 94:'Medusa', 95:'Troll Warlord',
  96:'Centaur Warrunner', 97:'Magnus', 98:'Timbersaw', 99:'Bristleback',
  100:'Tusk', 101:'Skywrath Mage', 102:'Abaddon', 103:'Elder Titan',
  104:'Legion Commander', 105:'Techies', 106:'Ember Spirit', 107:'Earth Spirit',
  108:'Underlord', 109:'Terrorblade', 110:'Phoenix', 111:'Oracle',
  112:'Winter Wyvern', 113:'Arc Warden', 114:'Monkey King',
  119:'Dark Willow', 120:'Pangolier', 121:'Grimstroke', 123:'Hoodwink',
  126:'Void Spirit', 128:'Snapfire', 129:'Mars', 135:'Dawnbreaker',
  136:'Marci', 137:'Primal Beast', 138:'Muerta', 145:'Kez', 148:'Ringmaster', 149:'Largo',
}
