import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Game } from '@/types'

export interface SteamUser {
  steamId: string       // 64-bit
  accountId: string     // 32-bit (for OpenDota)
  personaname: string
  avatarfull: string
  profileurl: string
  dotaLinked: boolean
  csLinked: boolean
}

interface AppStore {
  activeGame: Game
  setGame: (g: Game) => void

  steamUser: SteamUser | null
  setSteamUser: (u: SteamUser | null) => void
  logout: () => void

  searchHistory: { id: string; name: string; avatar?: string; game: Game }[]
  addToHistory: (entry: { id: string; name: string; avatar?: string; game: Game }) => void
  clearHistory: () => void

  lastPlayerId: string | null
  setLastPlayerId: (id: string | null) => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      activeGame: 'dota',
      setGame: (g) => set({ activeGame: g }),

      steamUser: null,
      setSteamUser: (u) => set({ steamUser: u }),
      logout: () => set({ steamUser: null }),

      searchHistory: [],
      addToHistory: (entry) => {
        const history = get().searchHistory
        const filtered = history.filter(h => h.id !== entry.id || h.game !== entry.game)
        set({ searchHistory: [entry, ...filtered].slice(0, 10) })
      },
      clearHistory: () => set({ searchHistory: [] }),

      lastPlayerId: null,
      setLastPlayerId: (id) => set({ lastPlayerId: id }),
    }),
    { name: 'dotascope-v2' }
  )
)
