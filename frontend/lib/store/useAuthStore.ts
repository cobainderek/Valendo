import { create } from 'zustand'
import type { User } from '@/services/auth'
import { disconnectSockets } from '@/services/socket'

export type { User }

interface AuthState {
  token: string | null
  user: User | null
  login: (token: string, user: User) => void
  logout: () => void
  isLoggedIn: () => boolean
}

function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('user')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
  user: getStoredUser(),

  login: (token: string, user: User) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ token, user })
  },

  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    // Derruba as conexões WebSocket autenticadas pra não vazar sessão antiga.
    disconnectSockets()
    set({ token: null, user: null })
  },

  isLoggedIn: () => !!get().token,
}))
