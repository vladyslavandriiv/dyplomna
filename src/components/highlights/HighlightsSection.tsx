import { useState } from 'react'

interface VideoItem {
  id: string; title: string; channel: string; views: string; duration: string
  thumb: string; url: string; tag: string; tagColor: string
}

const DOTA_VIDEOS: VideoItem[] = [
  { id:'d1', title:'TI14 Grand Final — Team Falcons vs Tundra | Incredible Comeback', channel:'DOTA 2', views:'2.1M', duration:'18:44',
    thumb:'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/home/slide/screenshot2.jpg',
    url:'https://www.youtube.com/results?search_query=TI14+2025+grand+final+dota+2', tag:'TI14 2025', tagColor:'#22c55e' },
  { id:'d2', title:'Miracle- 30 Kills on Invoker — PGL Wallachia S4 Best Play', channel:'DotA2 Pro Tracker', views:'890K', duration:'12:21',
    thumb:'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/invoker.png',
    url:'https://www.youtube.com/results?search_query=Miracle+invoker+highlights+2025+dota2', tag:'PGL Wallachia', tagColor:'#c84b31' },
  { id:'d3', title:'Yatoro 17,000 MMR World Record — All Kills Highlight Reel', channel:'Dota2 Highlights TV', views:'1.4M', duration:'09:55',
    thumb:'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/home/slide/screenshot3.jpg',
    url:'https://www.youtube.com/results?search_query=yatoro+17000+mmr+dota+2+record', tag:'17K MMR', tagColor:'#FFD700' },
  { id:'d4', title:'ESL One Birmingham 2025 — Best Moments & Extended Highlights', channel:'ESL Dota2', views:'650K', duration:'22:10',
    thumb:'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/home/slide/screenshot1.jpg',
    url:'https://www.youtube.com/results?search_query=ESL+One+Birmingham+2025+dota2+highlights', tag:'ESL One', tagColor:'#4fc3f7' },
  { id:'d5', title:'ATF Bristleback 40+ Kills — Unbeatable Offlane Performance 2025', channel:'Dota2 Pro Clips', views:'480K', duration:'08:33',
    thumb:'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/bristleback.png',
    url:'https://www.youtube.com/results?search_query=ATF+bristleback+dota2+highlights+2025', tag:'Pro Play', tagColor:'#f97316' },
  { id:'d6', title:'Patch 7.40 Largo & Ringmaster — First Pro Games Tournament Highlights', channel:'WhatIsTV Dota 2', views:'1.1M', duration:'16:07',
    thumb:'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/home/slide/screenshot2.jpg',
    url:'https://www.youtube.com/results?search_query=Largo+Ringmaster+patch+7.40+dota2+tournament', tag:'Patch 7.40', tagColor:'#a78bfa' },
]

const CS2_VIDEOS: VideoItem[] = [
  { id:'c1', title:'donk 5K ACE — IEM Dallas 2025 Team Spirit vs FaZe | Insane Clutch', channel:'FACEIT CS2', views:'3.2M', duration:'02:15',
    thumb:'https://cdn.akamai.steamstatic.com/steam/apps/730/capsule_616x353.jpg',
    url:'https://www.youtube.com/results?search_query=donk+ace+iem+dallas+2025+cs2', tag:'IEM Dallas 2025', tagColor:'#ff5500' },
  { id:'c2', title:'PGL Major Copenhagen 2024 — Best Frags & Tournament Highlights', channel:'HLTV', views:'4.8M', duration:'19:32',
    thumb:'https://cdn.akamai.steamstatic.com/steam/apps/730/ss_34090fc19b9f9cb647a1b29a36633e8b47b0e1ff.jpg',
    url:'https://www.youtube.com/results?search_query=PGL+Major+CS2+Copenhagen+2024+best+highlights', tag:'PGL Major', tagColor:'#f0b429' },
  { id:'c3', title:'ZywOo 4K AWP Clutch — Team Vitality vs G2 IEM Katowice 2025', channel:'CS2 Highlights', views:'2.4M', duration:'03:42',
    thumb:'https://cdn.akamai.steamstatic.com/steam/apps/730/ss_1e57ad0d3a3b28b6cbae68b7d8eebd3f69dc2282.jpg',
    url:'https://www.youtube.com/results?search_query=ZywOo+clutch+iem+katowice+2025+cs2', tag:'IEM Katowice', tagColor:'#63b3ed' },
  { id:'c4', title:'m0NESY 1v5 Pistol Clutch — BLAST Premier Grand Final 2025', channel:'BLAST Premier', views:'1.7M', duration:'01:55',
    thumb:'https://cdn.akamai.steamstatic.com/steam/apps/730/capsule_616x353.jpg',
    url:'https://www.youtube.com/results?search_query=m0NESY+clutch+BLAST+premier+2025', tag:'BLAST Premier', tagColor:'#a78bfa' },
  { id:'c5', title:'NiKo 30 Frags Perfect Match — G2 Grand Final Best Performance', channel:'CS2 Pro Highlights', views:'980K', duration:'11:23',
    thumb:'https://cdn.akamai.steamstatic.com/steam/apps/730/ss_7c22f7cdecfa4e3ba4b44c3e48a71c8eb7b7b71d.jpg',
    url:'https://www.youtube.com/results?search_query=NiKo+G2+cs2+2025+best+frags', tag:'G2 Esports', tagColor:'#48bb78' },
  { id:'c6', title:'ESL Pro League Season 21 — All ACEs & Best Plays | Extended Cut', channel:'ESL CS2', views:'2.9M', duration:'24:17',
    thumb:'https://cdn.akamai.steamstatic.com/steam/apps/730/ss_34090fc19b9f9cb647a1b29a36633e8b47b0e1ff.jpg',
    url:'https://www.youtube.com/results?search_query=ESL+Pro+League+Season+21+CS2+best+aces', tag:'ESL Pro League', tagColor:'#68d391' },
]

function VideoCard({ v }: { v: VideoItem }) {
  const [hov, setHov] = useState(false)
  return (
    <a href={v.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration:'none' }}>
      <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
        style={{ background:'var(--bg-2)', border:`1px solid ${hov?v.tagColor+'50':'var(--border-1)'}`, borderRadius:10, overflow:'hidden',
          transition:'all 0.18s', transform:hov?'translateY(-3px)':'none', boxShadow:hov?`0 10px 28px ${v.tagColor}18`:'none' }}>
        <div style={{ height:148, position:'relative', overflow:'hidden', background:'var(--bg-4)' }}>
          <img src={v.thumb} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', transition:'transform 0.3s', transform:hov?'scale(1.06)':'scale(1)' }} onError={e=>{e.currentTarget.style.opacity='0'}} />
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:hov?'rgba(0,0,0,0.4)':'rgba(0,0,0,0.18)', transition:'background 0.18s' }}>
            <div style={{ width:46, height:46, borderRadius:'50%', background:hov?'rgba(255,0,0,0.95)':'rgba(255,0,0,0.75)', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.18s', transform:hov?'scale(1.1)':'scale(1)' }}>
              <div style={{ width:0, height:0, borderTop:'9px solid transparent', borderBottom:'9px solid transparent', borderLeft:'16px solid #fff', marginLeft:3 }} />
            </div>
          </div>
          <div style={{ position:'absolute', bottom:6, right:6, background:'rgba(0,0,0,0.88)', color:'#fff', fontSize:9, fontFamily:'var(--font-mono)', padding:'2px 6px', borderRadius:3, fontWeight:700 }}>{v.duration}</div>
          <div style={{ position:'absolute', top:7, left:7, background:`${v.tagColor}dd`, color:'#fff', fontSize:8, fontFamily:'var(--font-mono)', fontWeight:700, padding:'2px 7px', borderRadius:4, letterSpacing:'0.05em' }}>{v.tag}</div>
          <div style={{ position:'absolute', top:7, right:7, background:'rgba(255,0,0,0.88)', borderRadius:3, padding:'2px 6px', fontSize:8, color:'#fff', fontFamily:'var(--font-mono)', fontWeight:700 }}>YT</div>
        </div>
        <div style={{ padding:'10px 12px' }}>
          <div style={{ fontFamily:'var(--font-display)', fontSize:12, fontWeight:600, color:'var(--text-0)', lineHeight:1.4, marginBottom:6, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' as const, overflow:'hidden' }}>{v.title}</div>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text-3)' }}>{v.channel}</span>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:9, color:v.tagColor, fontWeight:700 }}>{v.views}</span>
          </div>
        </div>
      </div>
    </a>
  )
}

export function HighlightsSection({ game, accent }: { game: 'dota' | 'cs'; accent?: string }) {
  const videos = game === 'cs' ? CS2_VIDEOS : DOTA_VIDEOS
  const color = accent || (game === 'cs' ? '#f0b429' : '#c84b31')
  const searchUrl = game === 'cs'
    ? 'https://www.youtube.com/results?search_query=CS2+pro+tournament+highlights+2025'
    : 'https://www.youtube.com/results?search_query=Dota+2+TI+tournament+highlights+2025'

  return (
    <div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:14 }}>
        {videos.map(v => <VideoCard key={v.id} v={v} />)}
      </div>
      <div style={{ textAlign:'center', marginTop:18 }}>
        <a href={searchUrl} target="_blank" rel="noopener noreferrer"
          style={{ display:'inline-flex', alignItems:'center', gap:8, padding:'9px 24px', borderRadius:8, background:`${color}10`, border:`1px solid ${color}30`, color, textDecoration:'none', fontFamily:'var(--font-mono)', fontSize:11, fontWeight:700, letterSpacing:'0.08em', transition:'all 0.15s' }}
          onMouseEnter={e=>{e.currentTarget.style.background=`${color}20`;e.currentTarget.style.borderColor=`${color}60`}}
          onMouseLeave={e=>{e.currentTarget.style.background=`${color}10`;e.currentTarget.style.borderColor=`${color}30`}}
        >▶ MORE HIGHLIGHTS ON YOUTUBE →</a>
      </div>
    </div>
  )
}
