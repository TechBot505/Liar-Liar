/**
 * Competition ranking (1,2,2,4). Items MUST be pre-sorted by score descending.
 * Equal scores share the lowest rank of the tied group; the next distinct score
 * jumps by the number of tied items. Shared by the final standings and the
 * mid-game scoreboard so ranks (and tie handling) are identical everywhere.
 */
export function assignCompetitionRanks<T>(
  sortedDesc: readonly T[],
  scoreOf: (item: T) => number,
): number[] {
  let rank = 0;
  let prev: number | null = null;
  return sortedDesc.map((item, i) => {
    const score = scoreOf(item);
    if (prev === null || score !== prev) rank = i + 1;
    prev = score;
    return rank;
  });
}
