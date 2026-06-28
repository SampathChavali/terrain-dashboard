import { useCallback, useEffect, useState } from 'react'

const TRACKER_KEY = 'personal-jira-time-tracker'

interface TrackerState {
  elapsedMs: number
  running: boolean
  startedAt: number | null
}

function loadTracker(): TrackerState {
  try {
    const raw = localStorage.getItem(TRACKER_KEY)
    if (!raw) return { elapsedMs: 0, running: false, startedAt: null }
    return JSON.parse(raw)
  } catch {
    return { elapsedMs: 0, running: false, startedAt: null }
  }
}

function saveTracker(state: TrackerState) {
  localStorage.setItem(TRACKER_KEY, JSON.stringify(state))
}

function formatElapsed(ms: number): string {
  const total = Math.floor(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return [h, m, s].map((n) => n.toString().padStart(2, '0')).join(':')
}

export function useTimeTracker() {
  const [tracker, setTracker] = useState<TrackerState>(loadTracker)
  const [display, setDisplay] = useState(() => formatElapsed(loadTracker().elapsedMs))

  const getCurrentMs = useCallback(() => {
    if (tracker.running && tracker.startedAt) {
      return tracker.elapsedMs + (Date.now() - tracker.startedAt)
    }
    return tracker.elapsedMs
  }, [tracker])

  useEffect(() => {
    saveTracker(tracker)
  }, [tracker])

  useEffect(() => {
    if (!tracker.running) {
      setDisplay(formatElapsed(tracker.elapsedMs))
      return
    }
    const id = setInterval(() => {
      setDisplay(formatElapsed(getCurrentMs()))
    }, 1000)
    return () => clearInterval(id)
  }, [tracker.running, tracker.elapsedMs, tracker.startedAt, getCurrentMs])

  const start = useCallback(() => {
    setTracker((prev) => {
      if (prev.running) return prev
      return { ...prev, running: true, startedAt: Date.now() }
    })
  }, [])

  const pause = useCallback(() => {
    setTracker((prev) => {
      if (!prev.running || !prev.startedAt) return prev
      return {
        elapsedMs: prev.elapsedMs + (Date.now() - prev.startedAt),
        running: false,
        startedAt: null,
      }
    })
  }, [])

  const stop = useCallback(() => {
    setTracker({ elapsedMs: 0, running: false, startedAt: null })
    setDisplay('00:00:00')
  }, [])

  const toggle = useCallback(() => {
    if (tracker.running) pause()
    else start()
  }, [tracker.running, pause, start])

  return { display, running: tracker.running, start, pause, stop, toggle }
}
