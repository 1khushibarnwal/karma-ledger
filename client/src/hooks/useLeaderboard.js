import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getLeaderboard } from "../services/api";

export const leaderboardKey = ["leaderboard"];

/**
 * Shared across the home preview and the full ledger page, so navigating
 * between them doesn't refetch or flash an empty table.
 */
export function useLeaderboard() {
  return useQuery({
    queryKey: leaderboardKey,
    queryFn: getLeaderboard,
    staleTime: 30_000,
    retry: 1,
  });
}

export function useRefreshLeaderboard() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: leaderboardKey });
}
