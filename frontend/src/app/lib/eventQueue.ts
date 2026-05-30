const API_URL = process.env.NEXT_PUBLIC_API_URL

interface QueuedEvent {
  post_id: number
  event_type: "view" | "like"
  duration_ms?: number
}

const queue: QueuedEvent[] = []
let timer: ReturnType<typeof setTimeout> | null = null

const BATCH_SIZE = 5
const FLUSH_INTERVAL_MS = 5000

function flush() {
  if (queue.length === 0) return
  if (timer) { clearTimeout(timer); timer = null }
  const batch = queue.splice(0)
  fetch(`${API_URL}/api/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(batch),
    keepalive: true,
  }).catch(() => {})
}

function scheduleFlush() {
  if (timer) return
  timer = setTimeout(flush, FLUSH_INTERVAL_MS)
}

export function queueEvent(event: QueuedEvent) {
  queue.push(event)
  if (queue.length >= BATCH_SIZE) {
    flush()
  } else {
    scheduleFlush()
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush()
  })
  window.addEventListener("beforeunload", flush)
}
