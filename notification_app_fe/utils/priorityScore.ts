// same scoring logic from stage 1, reused here for frontend priority page

export interface Notification {
  ID: string;
  Type: "Placement" | "Result" | "Event";
  Message: string;
  Timestamp: string;
}

const TYPE_WEIGHT: Record<string, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

export function computeScore(
  n: Notification,
  minTime: number,
  maxTime: number
): number {
  const typeScore = TYPE_WEIGHT[n.Type] ?? 0;
  const ts = new Date(n.Timestamp).getTime();
  if (isNaN(ts)) return typeScore * 0.6;
  const recency = maxTime === minTime ? 1 : (ts - minTime) / (maxTime - minTime);
  return typeScore * 0.6 + recency * 0.4;
}

export function getTopN(notifications: Notification[], n: number): Notification[] {
  const timestamps = notifications.map(n => new Date(n.Timestamp).getTime());
  const minTime = Math.min(...timestamps);
  const maxTime = Math.max(...timestamps);

  return [...notifications]
    .map(notif => ({ ...notif, score: computeScore(notif, minTime, maxTime) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}