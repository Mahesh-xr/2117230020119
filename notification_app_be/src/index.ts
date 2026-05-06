import { Log } from "../../logging_middleware/index";

// token from registration, keeping it here for now
const AUTH_TOKEN = process.env.ACCESS_TOKEN || "";

const API_URL = "http://20.207.122.201/evaluation-service/notifications";

// what a notification looks like from the API
interface Notification {
  ID: string;
  Type: "Placement" | "Result" | "Event";
  Message: string;
  Timestamp: string;
}

// placement is most important, event is least
// using these as weights in the score calculation
const TYPE_WEIGHT: Record<string, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

// calculates a score for each notification
// score depends on type importance (60%) and how recent it is (40%)
function getScore(n: Notification, minTime: number, maxTime: number): number {
  try {
    const typeScore = TYPE_WEIGHT[n.Type] ?? 0;

    const ts = new Date(n.Timestamp).getTime();

    // if timestamp is invalid, getTime() returns NaN
    if (isNaN(ts)) {
      Log("backend", "warn", "utils", `Invalid timestamp for notification ${n.ID}, defaulting recency to 0`);
      return typeScore * 0.6;
    }

    // normalize timestamp to 0-1 so recency is comparable with type weight
    // if all timestamps are same, just give full recency score
    const recency = maxTime === minTime ? 1 : (ts - minTime) / (maxTime - minTime);

    return typeScore * 0.6 + recency * 0.4;

  } catch (err) {
    Log("backend", "error", "utils", `Failed to compute score for notification ${n.ID}: ${err}`);
    return 0;
  }
}

async function getTopN(n: number): Promise<void> {
  try {
    await Log("backend", "info", "handler", `Fetching top ${n} notifications`);
     
    // hitting the notifications API
    let res: Response;
    try {
      res = await fetch(API_URL, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      });

      console.dir(`API response status: ${res.status}`);
    } catch (err) {
      await Log("backend", "fatal", "handler", `Network error while fetching notifications: ${err}`);
      return;
    }

    // check if API responded with non-200
    if (!res.ok) {
      await Log("backend", "error", "handler", `Notifications API returned status ${res.status}`);
      return;
    }

    let data: { notifications: Notification[] };
    try {
      data = await res.json();
    } catch (err) {
      await Log("backend", "error", "handler", `Failed to parse API response as JSON: ${err}`);
      return;
    }

    // safety check if notifications array is missing or empty
    if (!data.notifications || data.notifications.length === 0) {
      await Log("backend", "warn", "handler", "No notifications returned from API");
      return;
    }

    await Log("backend", "info", "handler", `Received ${data.notifications.length} notifications from API`);

    const notifications: Notification[] = data.notifications;

    // need min and max timestamps to normalize recency across all notifications
    const timestamps = notifications.map(n => new Date(n.Timestamp).getTime());
    const minTime = Math.min(...timestamps);
    const maxTime = Math.max(...timestamps);

    // attach score to each notification
    const scored = notifications.map(notif => ({
      ...notif,
      score: getScore(notif, minTime, maxTime),
    }));

    // sort highest score first and take top N
    // ideally this would use a min-heap for streaming data
    // but for a one-time fetch, sort + slice works fine
    const topN = scored
      .sort((a, b) => b.score - a.score)
      .slice(0, n);

    await Log("backend", "info", "handler", `Top ${n} notifications computed successfully`);

    // printing as table so output is easy to read in terminal
    console.table(topN.map(({ ID, Type, Message, Timestamp, score }) => ({
      ID, Type, Message, Timestamp, score: score.toFixed(3)
    })));

  } catch (err) {
    await Log("backend", "fatal", "handler", `Unexpected error in getTopN: ${err}`);
  }
}

// running with top 10 for now, can change this number as needed
getTopN(10);