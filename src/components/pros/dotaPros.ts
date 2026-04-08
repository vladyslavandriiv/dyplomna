import type { ProPlayer } from '@/types'

const DB = { color: '#e84057', bg: 'rgba(232,64,87,0.08)',   border: 'rgba(232,64,87,0.25)'  }
const OD = { color: '#63b3ed', bg: 'rgba(99,179,237,0.08)',  border: 'rgba(99,179,237,0.25)' }
const LP = { color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.25)'}
const ST = { color: '#9aa8b2', bg: 'rgba(154,168,178,0.07)', border: 'rgba(154,168,178,0.2)' }
const TW = { color: '#1da1f2', bg: 'rgba(29,161,242,0.08)',  border: 'rgba(29,161,242,0.25)' }
const TCH = { color: '#9146ff', bg: 'rgba(145,70,255,0.08)', border: 'rgba(145,70,255,0.25)' }
const L = (label: string, url: string, c: typeof DB) => ({ label, url, ...c })

export const DOTA_PROS: ProPlayer[] = [
  {
    game:'dota', nickname:'Miracle-', fullName:'Amer Al-Barkawi', country:'🇯🇴',
    team:'Nigma Galaxy', rating:'12,000+', ratingLabel:'PEAK MMR', role:'Mid (Pos 2)',
    accent:'#4fc3f7', extra:'🏆 TI7 · First 9000 MMR in history · 2× Major champion',
    steamId:'76561198065514372',
    photo: undefined,
    links:[
      L('DOTABUFF','https://www.dotabuff.com/players/105248644',DB),
      L('OPENDOTA','https://www.opendota.com/players/105248644',OD),
      L('LIQUIPEDIA','https://liquipedia.net/dota2/Miracle-',LP),
      L('TWITTER','https://x.com/MiracleRightHO',TW),
      L('TWITCH','https://www.twitch.tv/miraclerighthere',TCH),
      L('STEAM','https://steamcommunity.com/profiles/76561198065514372',ST),
    ],
  },
  {
    game:'dota', nickname:'N0tail', fullName:'Johan Sundstein', country:'🇩🇰',
    team:'OG', rating:'10,000+', ratingLabel:'PEAK MMR', role:'Support (Pos 5)',
    accent:'#f6e05e', extra:'🏆🏆 TI8+TI9 · First two-time TI champion',
    steamId:'76561198047978279',
    photo: undefined,
    links:[
      L('DOTABUFF','https://www.dotabuff.com/players/87278757',DB),
      L('OPENDOTA','https://www.opendota.com/players/87278757',OD),
      L('LIQUIPEDIA','https://liquipedia.net/dota2/N0tail',LP),
      L('TWITTER','https://x.com/n0tail',TW),
      L('STEAM','https://steamcommunity.com/profiles/76561198047978279',ST),
    ],
  },
  {
    game:'dota', nickname:'Puppey', fullName:'Clement Ivanov', country:'🇪🇪',
    team:'Team Secret', rating:'10,000+', ratingLabel:'PEAK MMR', role:'Support / Captain',
    accent:'#fc8181', extra:'🏆 TI1 · Only player at every TI · Founder of Team Secret',
    steamId:'76561197976263456',
    photo: undefined,
    links:[
      L('DOTABUFF','https://www.dotabuff.com/players/15885202',DB),
      L('OPENDOTA','https://www.opendota.com/players/15885202',OD),
      L('LIQUIPEDIA','https://liquipedia.net/dota2/Puppey',LP),
      L('TWITTER','https://x.com/PuppeyDota2',TW),
      L('STEAM','https://steamcommunity.com/profiles/76561197976263456',ST),
    ],
  },
  {
    game:'dota', nickname:'Dendi', fullName:'Danil Ishutin', country:'🇺🇦',
    team:'B8', rating:'9,000+', ratingLabel:'PEAK MMR', role:'Mid (Pos 2)',
    accent:'#fbd38d', extra:'🏆 TI1 · Symbol of the NAVI era · Fan favorite worldwide',
    steamId:'76561198031551584',
    photo: undefined,
    links:[
      L('DOTABUFF','https://www.dotabuff.com/players/70388657',DB),
      L('OPENDOTA','https://www.opendota.com/players/70388657',OD),
      L('LIQUIPEDIA','https://liquipedia.net/dota2/Dendi',LP),
      L('TWITTER','https://x.com/Dendi1926',TW),
      L('TWITCH','https://www.twitch.tv/dendi1926',TCH),
      L('STEAM','https://steamcommunity.com/profiles/76561198031551584',ST),
    ],
  },
  {
    game:'dota', nickname:'Yatoro', fullName:'Ilya Mulyarchuk', country:'🇺🇦',
    team:'Team Spirit', rating:'17,000+', ratingLabel:'MMR RECORD', role:'Carry (Pos 1)',
    accent:'#48bb78', extra:'🏆 TI10 · World record 17k MMR · Best carry of the CIS generation',
    steamId:'76561198281846390',
    photo: undefined,
    links:[
      L('DOTABUFF','https://www.dotabuff.com/players/321580662',DB),
      L('OPENDOTA','https://www.opendota.com/players/321580662',OD),
      L('LIQUIPEDIA','https://liquipedia.net/dota2/Yatoro',LP),
      L('TWITTER','https://x.com/yatorodota',TW),
      L('STEAM','https://steamcommunity.com/profiles/76561198281846390',ST),
    ],
  },
  {
    game:'dota', nickname:'Collapse', fullName:'Magomed Khalilov', country:'🇷🇺',
    team:'Team Spirit', rating:'12,000+', ratingLabel:'PEAK MMR', role:'Offlane (Pos 3)',
    accent:'#9f7aea', extra:'🏆 TI10 · Legendary Faceless Void Chronosphere · Best offlaner at TI10',
    steamId:'76561198300869360',
    photo: undefined,
    links:[
      L('DOTABUFF','https://www.dotabuff.com/players/340603632',DB),
      L('OPENDOTA','https://www.opendota.com/players/340603632',OD),
      L('LIQUIPEDIA','https://liquipedia.net/dota2/Collapse',LP),
      L('STEAM','https://steamcommunity.com/profiles/76561198300869360',ST),
    ],
  },
  {
    game:'dota', nickname:'TORONTOTOKYO', fullName:'Alexander Kherasimenko', country:'🇷🇺',
    team:'Team Spirit', rating:'11,000+', ratingLabel:'PEAK MMR', role:'Mid (Pos 2)',
    accent:'#63b3ed', extra:'🏆 TI10 · Spirit mid. Aggressive style of TI10 champion',
    steamId:'76561198398575812',
    photo: undefined,
    links:[
      L('DOTABUFF','https://www.dotabuff.com/players/438581212',DB),
      L('OPENDOTA','https://www.opendota.com/players/438581212',OD),
      L('LIQUIPEDIA','https://liquipedia.net/dota2/TORONTOTOKYO',LP),
      L('STEAM','https://steamcommunity.com/profiles/76561198398575812',ST),
    ],
  },
  {
    game:'dota', nickname:'SumaiL', fullName:'Sumail Hassan', country:'🇵🇰',
    team:'EG', rating:'11,000+', ratingLabel:'PEAK MMR', role:'Mid (Pos 2)',
    accent:'#63b3ed', extra:'🏆 TI5 · Youngest TI champion · Won at age 15 · EG phenomenon',
    steamId:'76561198088186962',
    photo: undefined,
    links:[
      L('DOTABUFF','https://www.dotabuff.com/players/128027657',DB),
      L('OPENDOTA','https://www.opendota.com/players/128027657',OD),
      L('LIQUIPEDIA','https://liquipedia.net/dota2/SumaiL',LP),
      L('TWITTER','https://x.com/SumaaaaiL',TW),
      L('STEAM','https://steamcommunity.com/profiles/76561198088186962',ST),
    ],
  },
  {
    game:'dota', nickname:'Arteezy', fullName:'Artour Babaev', country:'🇺🇿',
    team:'Evil Geniuses', rating:'9,500+', ratingLabel:'PEAK MMR', role:'Carry (Pos 1)',
    accent:'#e53e3e', extra:'One of the best carries in history · Long-time EG leader',
    steamId:'76561197991344490',
    photo: undefined,
    links:[
      L('DOTABUFF','https://www.dotabuff.com/players/31261933',DB),
      L('OPENDOTA','https://www.opendota.com/players/31261933',OD),
      L('LIQUIPEDIA','https://liquipedia.net/dota2/Arteezy',LP),
      L('TWITTER','https://x.com/Arteezy',TW),
      L('TWITCH','https://www.twitch.tv/arteezy',TCH),
      L('STEAM','https://steamcommunity.com/profiles/76561197991344490',ST),
    ],
  },
  {
    game:'dota', nickname:'skiter', fullName:'Anton Shked', country:'🇸🇰',
    team:'Team Falcons', rating:'11,500+', ratingLabel:'PEAK MMR', role:'Carry (Pos 1)',
    accent:'#22c55e', extra:'🏆 TI11 (Tundra) · 🏆 TI14 (Falcons) · Two-time TI champion',
    steamId:'76561198139012824',
    photo: undefined,
    links:[
      L('DOTABUFF','https://www.dotabuff.com/players/178744095',DB),
      L('OPENDOTA','https://www.opendota.com/players/178744095',OD),
      L('LIQUIPEDIA','https://liquipedia.net/dota2/Skiter',LP),
      L('TWITTER','https://x.com/skiter_dota',TW),
      L('STEAM','https://steamcommunity.com/profiles/76561198139012824',ST),
    ],
  },
  {
    game:'dota', nickname:'ATF', fullName:'Amir Al-Barkawi', country:'🇯🇴',
    team:'Team Falcons', rating:'12,000+', ratingLabel:'PEAK MMR', role:'Offlane (Pos 3)',
    accent:'#f97316', extra:'🏆 TI14 · Best offlaner 2024-2025 · Brother of Miracle-',
    steamId:'76561198258748985',
    photo: undefined,
    links:[
      L('DOTABUFF','https://www.dotabuff.com/players/298484257',DB),
      L('OPENDOTA','https://www.opendota.com/players/298484257',OD),
      L('LIQUIPEDIA','https://liquipedia.net/dota2/ATF',LP),
      L('STEAM','https://steamcommunity.com/profiles/76561198258748985',ST),
    ],
  },
  {
    game:'dota', nickname:'Cr1t-', fullName:'Andreas Nielsen', country:'🇩🇰',
    team:'Team Falcons', rating:'10,000+', ratingLabel:'PEAK MMR', role:'Support (Pos 4)',
    accent:'#f0b429', extra:'🏆 TI14 · Elite position 4 · Former EG/OG/EG',
    steamId:'76561198041842627',
    photo: undefined,
    links:[
      L('DOTABUFF','https://www.dotabuff.com/players/82262664',DB),
      L('OPENDOTA','https://www.opendota.com/players/82262664',OD),
      L('LIQUIPEDIA','https://liquipedia.net/dota2/Cr1t-',LP),
      L('TWITTER','https://x.com/Cr1tdota',TW),
      L('STEAM','https://steamcommunity.com/profiles/76561198041842627',ST),
    ],
  },
]
