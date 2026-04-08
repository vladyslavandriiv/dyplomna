import { useMemo, useState } from 'react'
import type { HeroStat } from '@/types'
import { ATTR_MAP } from '@/utils/constants'
import { calcWR, wrColor } from '@/utils/helpers'
import { useHeroStats } from '@/hooks/useData'
import { LoadingState, ErrorState, WRBar } from '@/components/ui'
import { HeroIcon } from '@/utils/icons'

type MetaSort = 'proWr' | 'proPick' | 'proBan' | 'pubWr'

export function MetaPage() {
  const { data, isLoading, error } = useHeroStats()
  const [sort, setSort] = useState<MetaSort>('proPick')

  const byAttr = useMemo(() => {
    if (!data) return {}
    const map: Record<string, HeroStat[]> = { str: [], agi: [], int: [], all: [] }

    const active = data
      .filter(h => h.pro_pick >= 3)
      .sort((a, b) => {
        if (sort === 'proWr')   return calcWR(b.pro_win, b.pro_pick) - calcWR(a.pro_win, a.pro_pick)
        if (sort === 'proPick') return b.pro_pick - a.pro_pick
        if (sort === 'proBan')  return b.pro_ban - a.pro_ban
        if (sort === 'pubWr')   return calcWR(b['8_win'], b['8_pick']) - calcWR(a['8_win'], a['8_pick'])
        return 0
      })
      .slice(0, 40)

    active.forEach(h => {
      const k = h.primary_attr as string
      if (map[k]) map[k].push(h)
    })
    return map
  }, [data, sort])

  if (isLoading && !data) return <LoadingState message="Analyzing metagame..." />
  if (error) return <ErrorState message={String(error)} />

  const totalPro = Object.values(byAttr).flat().length

  return (
    <div className="fade-up">
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 48, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--text-0)', marginBottom: 4 }}>
        META <span style={{ color: 'var(--accent)' }}>ANALYSIS</span>
      </h1>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)', marginBottom: 24 }}>
        // pro scene · {totalPro} active heroes
      </p>

      {/* Sort controls */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
        {([
          ['proPick', 'Pro Picks'],
          ['proWr',   'Pro WR'],
          ['proBan',  'Pro Bans'],
          ['pubWr',   'Pub WR'],
        ] as [MetaSort, string][]).map(([key, label]) => (
          <button key={key} onClick={() => setSort(key)} style={{
            padding: '6px 14px', borderRadius: 'var(--radius-sm)',
            fontSize: 12, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase',
            border: '1px solid var(--border-1)', cursor: 'pointer', transition: 'all 0.15s',
            background: sort === key ? 'var(--accent-muted)' : 'transparent',
            color: sort === key ? 'var(--accent)' : 'var(--text-2)',
            borderColor: sort === key ? 'rgba(79,142,255,0.3)' : 'var(--border-1)',
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* Sections by attr */}
      {Object.entries(ATTR_MAP).map(([attrKey, attrInfo]) => {
        const heroes = byAttr[attrKey]
        if (!heroes?.length) return null
        return (
          <div key={attrKey} style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: attrInfo.color }}>
                {attrInfo.label}
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--border-0)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)' }}>{heroes.length}</span>
            </div>

            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border-1)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
              <MetaHeader />
              {heroes.map(h => <MetaRow key={h.id} hero={h} />)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const COL = '36px 1fr 80px 80px 80px 110px 110px'

function MetaHeader() {
  const s: React.CSSProperties = { fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-3)', fontFamily: 'var(--font-mono)' }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: COL, gap: 14, padding: '8px 18px', borderBottom: '1px solid var(--border-2)' }}>
      <div />
      <div style={s}>Hero</div>
      <div style={s}>Picks</div>
      <div style={s}>Bans</div>
      <div style={s}>Contests</div>
      <div style={s}>Pro WR</div>
      <div style={s}>Pub WR (D+)</div>
    </div>
  )
}

function MetaRow({ hero }: { hero: HeroStat }) {
  const proWr = calcWR(hero.pro_win, hero.pro_pick)
  const pubWr = calcWR(hero['8_win'], hero['8_pick'])
  const contests = hero.pro_pick + (hero.pro_ban || 0)

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: COL, gap: 14, padding: '11px 18px',
      borderBottom: '1px solid var(--border-0)', alignItems: 'center',
      transition: 'background 0.12s',
    }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
      onMouseLeave={e => (e.currentTarget.style.background = '')}
    >
      <HeroIcon heroId={hero.id} size={28} />
      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-0)' }}>{hero.localized_name}</span>

      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>{hero.pro_pick}</span>

      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-2)' }}>{hero.pro_ban}</span>

      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--gold)' }}>{contests}</span>

      <WRBar wr={proWr} />

      <WRBar wr={pubWr} />
    </div>
  )
}
