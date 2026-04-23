'use client'

interface ValdoProps {
  size?: number
  expression?: 'idle' | 'cheer' | 'think' | 'confused' | 'sleep'
  accessory?: 'book' | 'trophy' | 'pencil' | 'whistle' | null
  tilt?: number
  whistling?: boolean
}

export function Valdo({
  size = 220,
  expression = 'idle',
  accessory = 'book',
  tilt = -4,
  whistling = false,
}: ValdoProps) {
  const w = size
  const h = size * 1.15

  const renderEyes = () => {
    if (expression === 'sleep') {
      return (
        <g stroke="#1A1A2E" strokeWidth="4" fill="none" strokeLinecap="round">
          <path d="M 78 112 q 12 6 24 0" />
          <path d="M 138 112 q 12 6 24 0" />
        </g>
      )
    }
    if (expression === 'cheer') {
      return (
        <g stroke="#1A1A2E" strokeWidth="4" fill="none" strokeLinecap="round">
          <path d="M 76 115 q 12 -12 26 0" />
          <path d="M 138 115 q 12 -12 26 0" />
        </g>
      )
    }
    if (expression === 'confused') {
      return (
        <g>
          <circle cx="90" cy="112" r="19" fill="#FFF" stroke="#1A1A2E" strokeWidth="4" />
          <circle cx="150" cy="112" r="19" fill="#FFF" stroke="#1A1A2E" strokeWidth="4" />
          <path d="M 109 112 q 11 -4 22 0" stroke="#1A1A2E" strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="90" cy="114" r="5" fill="#1A1A2E" />
          <circle cx="148" cy="110" r="5" fill="#1A1A2E" />
          <circle cx="91.5" cy="112.5" r="1.6" fill="#FFF" />
          <circle cx="149.5" cy="108.5" r="1.6" fill="#FFF" />
        </g>
      )
    }
    // idle / think — round glasses
    return (
      <g>
        <circle cx="90" cy="112" r="19" fill="#FFF" stroke="#1A1A2E" strokeWidth="4" />
        <circle cx="150" cy="112" r="19" fill="#FFF" stroke="#1A1A2E" strokeWidth="4" />
        <path d="M 109 112 q 11 -4 22 0" stroke="#1A1A2E" strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="92" cy="113" r="5" fill="#1A1A2E" />
        <circle cx="152" cy="113" r="5" fill="#1A1A2E" />
        <circle cx="93.5" cy="111.5" r="1.8" fill="#FFF" />
        <circle cx="153.5" cy="111.5" r="1.8" fill="#FFF" />
      </g>
    )
  }

  const renderAccessory = () => {
    if (accessory === 'book') {
      return (
        <g transform="translate(60, 200) rotate(-6)">
          <rect x="0" y="0" width="120" height="70" rx="6" fill="#F5C518" stroke="#1A1A2E" strokeWidth="3.5" />
          <rect x="4" y="4" width="112" height="62" rx="4" fill="none" stroke="#0D3080" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M 20 22 h 80 M 20 34 h 60 M 20 46 h 75" stroke="#0D3080" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      )
    }
    if (accessory === 'trophy') {
      return (
        <g transform="translate(74, 200) rotate(-4)">
          <path d="M 20 0 h 60 v 28 q 0 22 -30 22 q -30 0 -30 -22 z" fill="#F5C518" stroke="#1A1A2E" strokeWidth="3.5" />
          <path d="M 5 5 q -8 14 5 24 q 8 6 12 0" fill="none" stroke="#1A1A2E" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M 95 5 q 8 14 -5 24 q -8 6 -12 0" fill="none" stroke="#1A1A2E" strokeWidth="3.5" strokeLinecap="round" />
          <rect x="36" y="50" width="28" height="10" fill="#E8601C" stroke="#1A1A2E" strokeWidth="3" />
          <rect x="28" y="58" width="44" height="10" rx="2" fill="#E8601C" stroke="#1A1A2E" strokeWidth="3" />
          <text x="50" y="26" textAnchor="middle" fontFamily="Nunito" fontWeight="900" fontSize="18" fill="#0D3080">1</text>
        </g>
      )
    }
    if (accessory === 'whistle') {
      // Apito pendurado por cordão no pescoço + "TUIT" animado quando whistling
      return (
        <g>
          {/* Cordão */}
          <path
            d="M 95 175 q 25 -8 50 0"
            stroke="#1A1A2E"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          {/* Apito */}
          <g transform="translate(110, 170)">
            <rect
              x="0"
              y="0"
              width="28"
              height="14"
              rx="4"
              fill="#F5C518"
              stroke="#1A1A2E"
              strokeWidth="2.5"
            />
            <circle cx="22" cy="7" r="3" fill="#1A1A2E" />
            <path d="M 28 4 l 6 -2 l 0 10 l -6 -2 z" fill="#F5C518" stroke="#1A1A2E" strokeWidth="2.5" strokeLinejoin="round" />
          </g>
          {/* TUIT — som do apito */}
          {whistling && (
            <g className="valdo-whistle-puff">
              <path
                d="M 150 168 q 14 -6 26 4 q 10 10 4 22"
                fill="none"
                stroke="#1A1A2E"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="3 5"
              />
              <text
                x="178"
                y="176"
                fontFamily="Caveat, cursive"
                fontWeight="700"
                fontSize="22"
                fill="#E74C3C"
                transform="rotate(-8 178 176)"
              >
                tuit!
              </text>
            </g>
          )}
        </g>
      )
    }
    if (accessory === 'pencil') {
      return (
        <g transform="translate(64, 205) rotate(-12)">
          <rect x="0" y="0" width="16" height="110" fill="#F5C518" stroke="#1A1A2E" strokeWidth="3" />
          <path d="M 0 0 l 8 -18 l 8 18 z" fill="#E8601C" stroke="#1A1A2E" strokeWidth="3" strokeLinejoin="round" />
          <path d="M 4 -9 l 8 0" stroke="#1A1A2E" strokeWidth="2.5" />
          <rect x="0" y="100" width="16" height="10" fill="#EC4899" stroke="#1A1A2E" strokeWidth="3" />
        </g>
      )
    }
    return null
  }

  return (
    <svg
      width={w}
      height={h}
      viewBox="0 0 240 275"
      style={{ transform: `rotate(${tilt}deg)`, transformOrigin: 'center', overflow: 'visible' }}
    >
      {/* Shadow ground */}
      <ellipse cx="120" cy="260" rx="70" ry="8" fill="#1A1A2E" opacity="0.12" />

      {/* Feet */}
      <g stroke="#1A1A2E" strokeWidth="3.5" fill="#E8601C" strokeLinejoin="round">
        <path d="M 95 248 l -8 6 m 8 -6 l -2 10 m 2 -10 l 6 8" fill="none" strokeLinecap="round" />
        <path d="M 145 248 l -8 6 m 8 -6 l -2 10 m 2 -10 l 6 8" fill="none" strokeLinecap="round" />
      </g>

      {/* Body */}
      <path
        d="M 120 40
           C 70 40, 42 80, 44 140
           C 46 205, 80 248, 120 248
           C 160 248, 194 205, 196 140
           C 198 80, 170 40, 120 40 Z"
        fill="#1B4FBE"
        stroke="#1A1A2E"
        strokeWidth="4"
      />

      {/* Belly cream */}
      <path
        d="M 80 135
           C 78 180, 94 228, 120 230
           C 146 228, 162 180, 160 135
           C 158 120, 140 115, 120 115
           C 100 115, 82 120, 80 135 Z"
        fill="#FFF8E7"
        stroke="#1A1A2E"
        strokeWidth="3"
      />

      {/* Belly detail lines */}
      <g stroke="#1A1A2E" strokeWidth="2" fill="none" opacity="0.55" strokeLinecap="round">
        <path d="M 95 160 q 6 5 12 0" />
        <path d="M 115 160 q 6 5 12 0" />
        <path d="M 135 160 q 6 5 12 0" />
        <path d="M 102 178 q 6 5 12 0" />
        <path d="M 125 178 q 6 5 12 0" />
        <path d="M 110 196 q 6 5 12 0" />
        <path d="M 128 196 q 6 5 12 0" />
      </g>

      {/* Ear tufts */}
      <path d="M 70 50 l -4 -20 l 18 14" fill="#1B4FBE" stroke="#1A1A2E" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M 170 50 l 4 -20 l -18 14" fill="#1B4FBE" stroke="#1A1A2E" strokeWidth="3.5" strokeLinejoin="round" />

      {/* Face mask */}
      <ellipse cx="120" cy="115" rx="55" ry="40" fill="#D9E6FF" stroke="#1A1A2E" strokeWidth="3" />

      {/* Eyes */}
      {renderEyes()}

      {/* Beak */}
      <path
        d="M 112 138 l 8 16 l 8 -16 q -8 -4 -16 0 z"
        fill="#F5C518"
        stroke="#1A1A2E"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Cheek blush */}
      <ellipse cx="75" cy="138" rx="8" ry="5" fill="#E8601C" opacity="0.5" />
      <ellipse cx="165" cy="138" rx="8" ry="5" fill="#E8601C" opacity="0.5" />

      {/* Wings */}
      <path d="M 48 140 q -10 30 10 70 q 10 10 22 2" fill="#1B4FBE" stroke="#1A1A2E" strokeWidth="4" strokeLinejoin="round" />
      <path d="M 192 140 q 10 30 -10 70 q -10 10 -22 2" fill="#1B4FBE" stroke="#1A1A2E" strokeWidth="4" strokeLinejoin="round" />

      {/* Wing feathers */}
      <g stroke="#0D3080" strokeWidth="2.5" fill="none" strokeLinecap="round">
        <path d="M 58 170 q 4 6 10 4" />
        <path d="M 58 185 q 4 6 10 4" />
        <path d="M 60 200 q 4 6 10 4" />
        <path d="M 182 170 q -4 6 -10 4" />
        <path d="M 182 185 q -4 6 -10 4" />
        <path d="M 180 200 q -4 6 -10 4" />
      </g>

      {/* Accessory */}
      {renderAccessory()}
    </svg>
  )
}
