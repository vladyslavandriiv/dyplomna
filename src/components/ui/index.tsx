import React, { type CSSProperties, type ReactNode } from 'react'
import { wrColor } from '@/utils/helpers'

// ── Spinner ───────────────────────────────────────────────────────────
export function Spinner({ size = 28 }: { size?: number }) {
  return (
    <div style={{
      width: size, height: size,
      border: '2px solid var(--border-1)',
      borderTopColor: 'var(--accent)',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
      flexShrink: 0,
    }} />
  )
}

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', gap: 14 }}>
      <Spinner size={32} />
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-3)' }}>{message}</span>
    </div>
  )
}

export function ErrorState({ message, children }: { message: string; children?: React.ReactNode }) {
  return (
    <div style={{
      background: 'rgba(255,71,87,0.07)', border: '1px solid rgba(255,71,87,0.2)',
      borderRadius: 'var(--radius-md)', padding: '14px 18px',
      color: '#ff8a96', fontSize: 13, fontFamily: 'var(--font-mono)',
    }}>
      ⚠ {message}
      {children}
    </div>
  )
}

// ── StatCard ──────────────────────────────────────────────────────────
interface StatCardProps {
  label: string
  value: ReactNode
  sub?: string
  accentColor?: string
  style?: CSSProperties
}
export function StatCard({ label, value, sub, accentColor, style }: StatCardProps) {
  return (
    <div style={{
      background: 'var(--bg-2)', border: '1px solid var(--border-1)',
      borderRadius: 'var(--radius-md)', padding: '18px 20px',
      position: 'relative', overflow: 'hidden', ...style,
    }}>
      {accentColor && (
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 2,
          background: `linear-gradient(90deg, transparent, ${accentColor}88, transparent)`,
        }} />
      )}
      <div style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-3)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600, letterSpacing: '0.04em', lineHeight: 1, color: accentColor || 'var(--text-0)', animation: 'count-in 0.4s ease' }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 5 }}>{sub}</div>}
    </div>
  )
}

// ── WinRate bar ───────────────────────────────────────────────────────
export function WRBar({ wr, games }: { wr: number; games?: number }) {
  const color = wrColor(wr)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', minWidth: 60 }}>
        <div style={{ width: `${Math.min(wr, 100)}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.6s cubic-bezier(0.34,1.56,0.64,1)' }} />
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 500, color, width: 44, textAlign: 'right', flexShrink: 0 }}>
        {wr.toFixed(1)}%
      </span>
      {games !== undefined && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', width: 36, flexShrink: 0 }}>
          {games}g
        </span>
      )}
    </div>
  )
}

// ── Tag/Badge ─────────────────────────────────────────────────────────
type TagVariant = 'blue' | 'green' | 'red' | 'gold' | 'purple' | 'muted'
const TAG_STYLES: Record<TagVariant, { bg: string; border: string; color: string }> = {
  blue:   { bg: 'rgba(79,142,255,0.1)',  border: 'rgba(79,142,255,0.25)',  color: 'var(--accent)' },
  green:  { bg: 'rgba(34,212,138,0.1)',  border: 'rgba(34,212,138,0.25)',  color: 'var(--green)' },
  red:    { bg: 'rgba(255,71,87,0.1)',   border: 'rgba(255,71,87,0.25)',   color: 'var(--red)' },
  gold:   { bg: 'rgba(245,166,35,0.1)',  border: 'rgba(245,166,35,0.25)',  color: 'var(--gold)' },
  purple: { bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.25)', color: 'var(--purple)' },
  muted:  { bg: 'rgba(255,255,255,0.05)', border: 'var(--border-1)', color: 'var(--text-2)' },
}

export function Tag({ children, variant = 'blue' }: { children: ReactNode; variant?: TagVariant }) {
  const s = TAG_STYLES[variant]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 4,
      fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
      fontFamily: 'var(--font-mono)',
      background: s.bg, border: `1px solid ${s.border}`, color: s.color,
    }}>
      {children}
    </span>
  )
}

// ── Section header ────────────────────────────────────────────────────
export function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
      <span style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 500, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-2)', flexShrink: 0 }}>
        {title}
      </span>
      <div style={{ flex: 1, height: 1, background: 'var(--border-0)' }} />
      {count !== undefined && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-3)', background: 'var(--bg-2)', padding: '2px 8px', borderRadius: 4, border: '1px solid var(--border-1)' }}>
          {count}
        </span>
      )}
    </div>
  )
}

// ── Rank badge ────────────────────────────────────────────────────────
export function RankBadge({ name, star, color }: { name: string; star: number; color: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 12px', borderRadius: 6,
      fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
      background: `${color}18`, border: `1px solid ${color}33`, color,
    }}>
      {name}{star > 0 ? ` ${star}` : ''}
    </span>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────
export function Skeleton({ w = '100%', h = 16, style }: { w?: string | number; h?: string | number; style?: CSSProperties }) {
  return <div className="skeleton" style={{ width: w, height: h, ...style }} />
}

// ── Tabs ──────────────────────────────────────────────────────────────
interface TabsProps {
  tabs: { key: string; label: string }[]
  active: string
  onChange: (key: string) => void
}
export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div style={{ display: 'flex', gap: 2, borderBottom: '1px solid var(--border-1)', marginBottom: 24 }}>
      {tabs.map(t => (
        <button key={t.key} onClick={() => onChange(t.key)} style={{
          padding: '10px 18px', fontSize: 13, fontWeight: 500, letterSpacing: '0.06em',
          textTransform: 'uppercase', cursor: 'pointer', background: 'none', border: 'none',
          borderBottom: `2px solid ${active === t.key ? 'var(--accent)' : 'transparent'}`,
          color: active === t.key ? 'var(--accent)' : 'var(--text-2)',
          marginBottom: -1, transition: 'all 0.15s',
        }}>
          {t.label}
        </button>
      ))}
    </div>
  )
}
