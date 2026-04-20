'use client'

interface LogoMarkProps {
  size?: number
}

export function LogoMark({ size = 44 }: LogoMarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" style={{ transform: 'rotate(-4deg)' }}>
      <rect x="4" y="4" width="40" height="40" rx="10" fill="#1B4FBE" stroke="#1A1A2E" strokeWidth="3" />
      <text x="24" y="33" textAnchor="middle" fontFamily="Nunito" fontWeight="900" fontSize="24" fill="#F5C518">V</text>
      <circle cx="38" cy="10" r="4" fill="#F5C518" stroke="#1A1A2E" strokeWidth="2" />
    </svg>
  )
}
