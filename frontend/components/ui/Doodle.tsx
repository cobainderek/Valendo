'use client'

import { CSSProperties } from 'react'

interface DoodleProps {
  kind: string
  size?: number
  color?: string
  rotate?: number
  style?: CSSProperties
}

export function Doodle({
  kind,
  size = 40,
  color = '#1A1A2E',
  rotate = 0,
  style = {},
}: DoodleProps) {
  const s = size
  // Stroke-only props (no fill)
  const stroke = {
    stroke: color,
    strokeWidth: 3,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  const wrap = (children: React.ReactNode, vb = '0 0 48 48') => (
    <svg width={s} height={s} viewBox={vb} style={{ transform: `rotate(${rotate}deg)`, ...style }}>
      {children}
    </svg>
  )

  switch (kind) {
    case 'star':
      return wrap(
        <path d="M 24 4 l 6 14 l 16 2 l -12 10 l 4 16 l -14 -8 l -14 8 l 4 -16 l -12 -10 l 16 -2 z" fill="#F5C518" {...stroke} />
      )
    case 'spark':
      return wrap(
        <path d="M 24 6 v 14 M 24 28 v 14 M 6 24 h 14 M 28 24 h 14" fill="none" {...stroke} />
      )
    case 'circle':
      return wrap(<circle cx="24" cy="24" r="16" fill="none" {...stroke} />)
    case 'squiggle':
      return wrap(<path d="M 4 24 q 10 -14 20 0 t 20 0" fill="none" {...stroke} />)
    case 'zigzag':
      return wrap(<path d="M 4 30 l 8 -12 l 8 12 l 8 -12 l 8 12 l 8 -12" fill="none" {...stroke} />)
    case 'dots':
      return wrap(
        <>
          <circle cx="12" cy="24" r="3" fill={color} />
          <circle cx="24" cy="24" r="3" fill={color} />
          <circle cx="36" cy="24" r="3" fill={color} />
        </>
      )
    case 'arrow':
      return wrap(
        <>
          <path d="M 6 24 q 14 -16 34 -4" fill="none" {...stroke} />
          <path d="M 40 20 l 0 6 l -6 0" fill="none" {...stroke} />
        </>
      )
    case 'heart':
      return wrap(
        <path d="M 24 40 q -18 -10 -18 -22 q 0 -8 8 -8 q 6 0 10 6 q 4 -6 10 -6 q 8 0 8 8 q 0 12 -18 22 z" fill="#E74C3C" {...stroke} />
      )
    case 'lightning':
      return wrap(
        <path d="M 26 4 l -12 22 l 8 0 l -4 18 l 14 -24 l -8 0 l 6 -16 z" fill="#F5C518" {...stroke} />
      )
    case 'vs':
      return wrap(
        <text x="24" y="32" textAnchor="middle" fontFamily="Nunito" fontWeight="900" fontSize="26" fill="#E8601C" stroke="#1A1A2E" strokeWidth="1.5">VS</text>
      )
    case 'cloud':
      return wrap(
        <path d="M 10 28 q -4 0 -4 -5 q 0 -5 6 -5 q 0 -8 10 -8 q 8 0 10 6 q 8 -2 10 6 q 2 6 -4 6 z" fill="#FFF" {...stroke} />
      )
    case 'trophy':
      return wrap(
        <>
          <path d="M 14 8 h 20 v 10 q 0 10 -10 10 q -10 0 -10 -10 z" fill="#F5C518" {...stroke} />
          <path d="M 14 12 q -6 0 -6 6 q 0 6 6 8" fill="none" {...stroke} />
          <path d="M 34 12 q 6 0 6 6 q 0 6 -6 8" fill="none" {...stroke} />
        </>
      )
    default:
      return null
  }
}
