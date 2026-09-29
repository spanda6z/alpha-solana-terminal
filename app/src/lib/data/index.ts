import { fetchNewPairEvents } from "./dex";
import { fetchSwapEvents } from "./helius";
import { fetchAuthorityEvents } from "./rpc";
import { dedupeEvents, sourceStatuses } from "./normalize";
import type { DataLayerSnapshot } from "./types";

export async function getDataLayerSnapshot(limit = 40): Promise<DataLayerSnapshot> {
  const pairs = await fetchNewPairEvents(Math.max(limit, 40));
  const mints = pairs.map((event) => event.mint).filter(Boolean) as string[];
  const [swaps, authorities] = await Promise.all([fetchSwapEvents(mints), fetchAuthorityEvents(mints)]);
  const events = dedupeEvents([...pairs, ...swaps, ...authorities]);
  return { events: events.slice(0, limit), sources: sourceStatuses(), generatedAt: Date.now() };
}
