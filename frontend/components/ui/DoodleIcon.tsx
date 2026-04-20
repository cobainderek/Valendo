'use client'

interface DoodleIconProps {
  name: string
  size?: number
  color?: string
  strokeColor?: string
}

export function DoodleIcon({
  name,
  size = 36,
  color,
  strokeColor = '#1A1A2E',
}: DoodleIconProps) {
  const s = size
  const sw = 3
  const common = {
    width: s,
    height: s,
    viewBox: '0 0 48 48',
    fill: 'none',
    stroke: strokeColor,
    strokeWidth: sw,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

  switch (name) {
    case 'sword':
      return (
        <svg {...common}>
          <path d="M 30 8 l 10 10 l -4 4 l -10 -10 z" fill={color || '#7C3AED'} />
          <path d="M 26 12 l -16 16 l 4 4 l 16 -16" fill={color || '#EDE9FE'} />
          <path d="M 10 28 l -4 6 l 2 4 l 6 -4" fill={color || '#E8601C'} />
          <path d="M 14 32 l 4 4" />
        </svg>
      )
    case 'microscope':
      return (
        <svg {...common}>
          <circle cx="22" cy="14" r="5" fill={color || '#DCFCE7'} />
          <path d="M 22 19 l -3 10 l 6 0 z" fill={color || '#059669'} />
          <path d="M 16 34 h 20" />
          <path d="M 14 40 h 24 l 2 -4 h -28 z" fill={color || '#059669'} />
          <path d="M 28 8 l 8 -2" />
        </svg>
      )
    case 'compass':
      return (
        <svg {...common}>
          <circle cx="24" cy="24" r="16" fill={color || '#FEF3C7'} />
          <path d="M 24 12 l 4 12 l -4 12 l -4 -12 z" fill={color || '#D97706'} />
          <circle cx="24" cy="24" r="2" fill={strokeColor} />
        </svg>
      )
    case 'atom':
      return (
        <svg {...common}>
          <ellipse cx="24" cy="24" rx="16" ry="6" fill={color || '#EDE9FE'} />
          <ellipse cx="24" cy="24" rx="16" ry="6" transform="rotate(60 24 24)" />
          <ellipse cx="24" cy="24" rx="16" ry="6" transform="rotate(-60 24 24)" />
          <circle cx="24" cy="24" r="3" fill={color || '#7C3AED'} />
        </svg>
      )
    case 'ruler':
      return (
        <svg {...common}>
          <path d="M 10 10 l 28 28 l -4 4 l -28 -28 z" fill={color || '#FCE7F3'} />
          <path d="M 14 14 l 2 4 M 18 18 l 3 3 M 22 22 l 2 4 M 26 26 l 3 3 M 30 30 l 2 4" />
          <path d="M 34 14 h 4 l 0 8" />
        </svg>
      )
    case 'folder':
      return (
        <svg {...common}>
          <path d="M 8 14 l 0 24 l 32 0 l 0 -20 l -16 0 l -4 -4 z" fill={color || '#DBEAFE'} />
          <path d="M 14 22 h 20 M 14 28 h 14" />
        </svg>
      )
    case 'flame':
      return (
        <svg {...common}>
          <path d="M 24 6 q 12 10 10 20 q 2 -4 6 -4 q 0 12 -16 16 q -16 -4 -16 -16 q 4 0 6 4 q -4 -10 10 -20 z" fill={color || '#F5C518'} />
        </svg>
      )
    case 'bolt':
      return (
        <svg {...common}>
          <path d="M 26 6 l -12 20 l 8 0 l -4 16 l 14 -22 l -8 0 l 6 -14 z" fill={color || '#F5C518'} />
        </svg>
      )
    case 'trophy':
      return (
        <svg {...common}>
          <path d="M 14 8 h 20 v 10 q 0 10 -10 10 q -10 0 -10 -10 z" fill={color || '#F5C518'} />
          <path d="M 14 12 q -6 0 -6 6 q 0 6 6 8" />
          <path d="M 34 12 q 6 0 6 6 q 0 6 -6 8" />
          <path d="M 20 28 l 0 6 l 8 0 l 0 -6" />
          <rect x="14" y="34" width="20" height="6" fill={color || '#E8601C'} />
        </svg>
      )
    case 'swords':
      return (
        <svg {...common}>
          <path d="M 8 8 l 20 20 l -3 3 l -20 -20 z" fill={color || '#7C3AED'} />
          <path d="M 40 8 l -20 20 l 3 3 l 20 -20 z" fill={color || '#E8601C'} />
          <path d="M 6 36 l 6 6 M 36 36 l 6 6" />
        </svg>
      )
    case 'mail':
      return (
        <svg {...common}>
          <rect x="6" y="12" width="36" height="24" rx="2" fill={color || '#FFF'} />
          <path d="M 6 14 l 18 14 l 18 -14" />
        </svg>
      )
    case 'lock':
      return (
        <svg {...common}>
          <rect x="10" y="22" width="28" height="20" rx="3" fill={color || '#FFF'} />
          <path d="M 16 22 v -6 q 0 -8 8 -8 q 8 0 8 8 v 6" />
          <circle cx="24" cy="32" r="2.5" fill={strokeColor} />
        </svg>
      )
    case 'user':
      return (
        <svg {...common}>
          <circle cx="24" cy="18" r="7" fill={color || '#FFF'} />
          <path d="M 10 40 q 0 -12 14 -12 q 14 0 14 12" fill={color || '#FFF'} />
        </svg>
      )
    case 'tag':
      return (
        <svg {...common}>
          <path d="M 8 8 h 16 l 16 16 l -16 16 l -16 -16 z" fill={color || '#FFF'} />
          <circle cx="16" cy="16" r="2" fill={strokeColor} />
        </svg>
      )
    case 'google':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48">
          <path fill="#4285F4" d="M44 24c0-1.5-.1-2.9-.4-4.3H24v8.1h11.3c-.5 2.7-2 4.9-4.2 6.4v5.4h6.8c4-3.7 6.3-9.1 6.3-15.6z" />
          <path fill="#34A853" d="M24 44c5.7 0 10.5-1.9 14-5.1l-6.8-5.4c-1.9 1.3-4.3 2.1-7.2 2.1-5.5 0-10.2-3.7-11.9-8.7H5.1v5.5C8.5 39.6 15.7 44 24 44z" />
          <path fill="#FBBC05" d="M12.1 26.9c-.4-1.3-.6-2.6-.6-4s.2-2.7.6-4v-5.5H5.1C3.7 16.6 3 20.2 3 24s.7 7.4 2.1 10.6l7-5.5z" />
          <path fill="#EA4335" d="M24 10.7c3.1 0 5.9 1.1 8.1 3.1l6-6C34.5 4.2 29.7 2 24 2 15.7 2 8.5 6.4 5.1 13.4l7 5.5C13.8 14.4 18.5 10.7 24 10.7z" />
        </svg>
      )
    case 'search':
      return (
        <svg {...common}>
          <circle cx="20" cy="20" r="12" fill={color || '#FFF'} />
          <path d="M 30 30 l 10 10" />
        </svg>
      )
    case 'plus':
      return (
        <svg {...common}>
          <path d="M 24 10 v 28 M 10 24 h 28" />
        </svg>
      )
    case 'play':
      return (
        <svg {...common}>
          <path d="M 14 10 l 24 14 l -24 14 z" fill={color || '#F5C518'} />
        </svg>
      )
    case 'people':
      return (
        <svg {...common}>
          <circle cx="17" cy="18" r="6" fill={color || '#FFF'} />
          <circle cx="33" cy="20" r="5" fill={color || '#FFF'} />
          <path d="M 6 40 q 0 -10 11 -10 q 11 0 11 10" fill={color || '#FFF'} />
          <path d="M 28 40 q 0 -8 10 -8 q 8 0 8 8" fill={color || '#FFF'} />
        </svg>
      )
    default:
      return null
  }
}
