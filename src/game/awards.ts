import type { Award, RoundResult } from "./types";

/** Aggregates derived from full game history, keyed by playerId. */
interface Agg {
  order: string[];
  fooled: Record<string, number>;
  truths: Record<string, number>;
  gullible: Record<string, number>;
  bestLie: Record<string, number>;
  submitted: Record<string, number>;
  latencyTotal: Record<string, number>;
  latencyCount: Record<string, number>;
  /** `${author}>${voter}` → times voter fell for author's lie. */
  pairs: Record<string, number>;
}

function bump(rec: Record<string, number>, id: string, by = 1): void {
  rec[id] = (rec[id] ?? 0) + by;
}

function aggregate(history: RoundResult[]): Agg {
  const a: Agg = {
    order: [], fooled: {}, truths: {}, gullible: {}, bestLie: {},
    submitted: {}, latencyTotal: {}, latencyCount: {}, pairs: {},
  };
  const see = (id: string): void => {
    if (!a.order.includes(id)) a.order.push(id);
  };
  for (const r of history) {
    for (const [pid, ms] of Object.entries(r.latencies)) {
      see(pid);
      bump(a.submitted, pid);
      bump(a.latencyTotal, pid, ms);
      bump(a.latencyCount, pid);
    }
    for (const opt of r.options) {
      for (const author of opt.authorIds) see(author);
      if (opt.isTruth) {
        for (const v of opt.voterIds) { see(v); bump(a.truths, v); }
      } else {
        const fooledHere = opt.voterIds.length;
        for (const author of opt.authorIds) {
          bump(a.fooled, author, fooledHere);
          a.bestLie[author] = Math.max(a.bestLie[author] ?? 0, fooledHere);
        }
        for (const v of opt.voterIds) {
          see(v); bump(a.gullible, v);
          for (const author of opt.authorIds) bump(a.pairs, `${author}>${v}`);
        }
      }
    }
  }
  return a;
}

/** Single player with a strictly-greatest positive value, else null (ties/zero skipped). */
function topWinner(
  order: string[], rec: Record<string, number>, pick: "max" | "min" = "max",
): { id: string; value: number } | null {
  let best: string | null = null;
  let bestVal = pick === "max" ? -Infinity : Infinity;
  let tied = false;
  for (const id of order) {
    const v = rec[id] ?? 0;
    const better = pick === "max" ? v > bestVal : v < bestVal;
    if (better) { best = id; bestVal = v; tied = false; }
    else if (v === bestVal) tied = true;
  }
  if (best === null || tied || bestVal <= 0 || !isFinite(bestVal)) return null;
  return { id: best, value: bestVal };
}

function award(
  id: string, label: string,
  w: { id: string; value: number } | null, detail?: string,
): Award | null {
  return w ? { id, label, playerId: w.id, value: w.value, detail } : null;
}

/** Minimum spread (fastest→slowest avg) required for a meaningful speed contrast. */
const MIN_SPREAD_MS = 8000;

/**
 * Speed Demon (fastest avg) + Last-Second Larry (slowest avg), but only when the
 * contrast is real:
 *  - at least 3 players have submit data,
 *  - the spread between fastest and slowest avg is ≥ 25% of the answer timer,
 *    or ≥ 8s (whichever the data clears), and
 *  - Last-Second Larry additionally needs an avg ≥ 60% of the timer.
 * This prevents the "both 0.9s" nonsense where near-identical times still won a
 * stat-based pair of awards.
 */
function speedAwards(a: Agg, answerSeconds?: number): (Award | null)[] {
  const avg: Record<string, number> = {};
  const ids: string[] = [];
  for (const id of a.order) {
    if ((a.latencyCount[id] ?? 0) > 0) {
      avg[id] = a.latencyTotal[id] / a.latencyCount[id];
      ids.push(id);
    }
  }
  if (ids.length < 3) return [];

  const speed = topWinner(a.order, avg, "min");
  const larry = topWinner(a.order, avg, "max");
  // topWinner returns null on ties, so equal-value pairs are already excluded.
  if (!speed || !larry) return [];

  const spread = larry.value - speed.value;
  const timerMs = answerSeconds ? answerSeconds * 1000 : undefined;
  const spreadThreshold = Math.min(MIN_SPREAD_MS, timerMs ? timerMs * 0.25 : MIN_SPREAD_MS);
  if (spread < spreadThreshold) return [];

  const out: (Award | null)[] = [
    { id: "speed_demon", label: "Speed Demon", playerId: speed.id, value: Math.round(speed.value) },
  ];
  // Last-Second Larry only when they truly ran the clock down.
  const larryOk = timerMs ? larry.value >= timerMs * 0.6 : true;
  if (larryOk) {
    out.push({ id: "last_second", label: "Last-Second Larry", playerId: larry.id, value: Math.round(larry.value) });
  }
  return out;
}

/** Compute the SPEC award list. Only clear, non-zero winners are returned.
 *
 * `answerSeconds` (the round answer timer) gates the latency-based awards so we
 * never hand out "Speed Demon" / "Last-Second Larry" for near-identical times.
 */
export function computeAwards(history: RoundResult[], answerSeconds?: number): Award[] {
  const a = aggregate(history);
  const out: (Award | null)[] = [];

  out.push(award("biggest_liar", "Biggest Liar", topWinner(a.order, a.fooled)));
  out.push(award("lie_detector", "Human Lie Detector", topWinner(a.order, a.truths)));
  out.push(award("most_gullible", "Most Gullible", topWinner(a.order, a.gullible)));
  out.push(award("silver_tongue", "Silver Tongue", topWinner(a.order, a.bestLie)));

  // Honest to a Fault: submitted lies but fooled nobody; most lies submitted wins.
  const honestPool: Record<string, number> = {};
  for (const id of a.order) {
    if ((a.submitted[id] ?? 0) > 0 && (a.fooled[id] ?? 0) === 0) {
      honestPool[id] = a.submitted[id];
    }
  }
  out.push(award("honest", "Honest to a Fault", topWinner(a.order, honestPool)));

  for (const speedAward of speedAwards(a, answerSeconds)) out.push(speedAward);

  // Nemesis: the author→voter pair with the most fooling.
  let np: string | null = null, nv = 0, nTied = false;
  for (const key of Object.keys(a.pairs)) {
    const v = a.pairs[key];
    if (v > nv) { np = key; nv = v; nTied = false; }
    else if (v === nv) nTied = true;
  }
  if (np && !nTied && nv > 0) {
    const [author, voter] = np.split(">");
    out.push({ id: "nemesis", label: "Nemesis", playerId: author, secondaryPlayerId: voter, value: nv });
  }

  return out.filter((x): x is Award => x !== null);
}
