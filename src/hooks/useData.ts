import { useQuery } from '@tanstack/react-query'
import {
  loadFullPlayer,
  getPlayerPeers,
  getHeroStats,
  getLeaderboardByRegion,
  searchPlayers,
  getMatch,
  getCurrentPatch,
  type PatchInfo,
} from '@/api/opendota'

export function usePlayerFull(id: string | null) {
  return useQuery({
    queryKey: ['player', 'full', id],
    queryFn: () => loadFullPlayer(id!),
    enabled: !!id && id.length > 0,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  })
}

export function usePlayerPeers(id: string | null) {
  console.log(id)
  return useQuery({
    queryKey: ['player', 'peers', id],
    queryFn: () => getPlayerPeers(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export function useHeroStats() {
  return useQuery({
    queryKey: ['heroStats'],
    queryFn: getHeroStats,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 1,
  })
}

export function useLeaderboard(division = 'europe') {
  return useQuery({
    queryKey: ['leaderboard', division],
    queryFn: () => getLeaderboardByRegion(division),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function usePlayerSearch(query: string) {
  return useQuery({
    queryKey: ['search', query],
    queryFn: () => searchPlayers(query),
    enabled: query.length >= 2,
    staleTime: 30 * 1000,
  })
}

export function useMatchDetail(id: string | null) {
  return useQuery({
    queryKey: ['match', id],
    queryFn: () => getMatch(id!),
    enabled: !!id,
    staleTime: 60 * 60 * 1000,
  })
}

// ── Current patch (fetched live from Steam News) ──────────────────────
export function useCurrentPatch() {
  return useQuery({
    queryKey: ['currentPatch'],
    queryFn: getCurrentPatch,
    staleTime: 60 * 60 * 1000,   // refresh every hour
    gcTime: 2 * 60 * 60 * 1000,
  })
}
