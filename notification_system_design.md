# Notification System Design

## Stage 1 - Priority Inbox

### Why I built it this way

Users were getting too many notifications and missing important ones. So the ask was simple - show the top N most important unread notifications first. I had to figure out what "important" means and how to rank them.


### How I decided priority

Two things matter for a notification - what type it is and when it came in.

**Type matters more.** A placement notification is way more urgent than a college event. So I assigned weights manually(Placement=3,Result=2,Event=1)

**Recency also matters** but not as much. If two placements come in, the newer one should show first. I normalized timestamps to a 0-1 scale so I could mix it with the type weight without one dominating the other.

```
recencyScore = (thisTime - oldestTime) / (newestTime - oldestTime)
```

Then the final score:

```
score = typeWeight * 0.6 + recencyScore * 0.4
```

I went with 60-40 split because type should win most of the time. Recency is just a tiebreaker basically.



### The heap part - why not just sort

My first instinct was to sort everything and take top N. That works fine for a one-time fetch. But notifications keep coming in continuously. Sorting the whole list every time a new notification arrives is wasteful - O(N log N) each time.

So I used a min-heap of size N instead. The idea is simple - keep only the top N in the heap at any point. The heap's minimum is always the weakest notification currently in top N.

When a new one comes in:
if heap not full yet, then just add it
if heap full and new score beats the minimum then, kick out the minimum, add the new one
if heap full and new score is worse then,ignore it

Each insert is O(log N) which is much better when notifications are streaming in frequently.



### What I would improve with more time

1. The 60-40 weight split is hardcoded right now. Ideally this should come from a config so product can tune it without touching code
2. Recency normalization breaks if all notifications have the exact same timestamp (division by zero). I handled it with a fallback but a better approach would be using relative age in seconds
3. Right now I'm fetching all notifications and ranking client side. With a real database, this ranking should ideally happen at the query level