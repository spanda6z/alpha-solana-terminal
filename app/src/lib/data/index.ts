import { fetchNewPairEvents } from "./dex";
import { dedupeEvents, sourceStatuses } from "./normalize";
import type { DataLayerSnapshot } from "./types";

export async function getDataLayerSnapshot(limit = 40): Promise<DataLayerSnapshot> {
  const events = await fetchNewPairEvents(limit);
  return {
    events: dedupeEvents(events),
    sources: sourceStatuses(),
    generatedAt: Date.now(),
  };
}
