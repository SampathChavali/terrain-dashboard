import { useEffect, useRef } from 'react'
import type { Task } from '../types'

const FIRED_KEY = 'personal-jira-reminder-fired'

function loadFired(): Set<string> {
  try {
    const raw = localStorage.getItem(FIRED_KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch {
    return new Set()
  }
}

function saveFired(keys: Set<string>) {
  localStorage.setItem(FIRED_KEY, JSON.stringify([...keys]))
}

function parseDeadlineReminder(task: Task): Date | null {
  if (!task.deadline || !task.reminderEnabled) return null
  const [y, m, d] = task.deadline.split('-').map(Number)
  if (!y || !m || !d) return null
  const [h, min] = (task.reminderTime ?? '09:00').split(':').map(Number)
  return new Date(y, m - 1, d, h ?? 9, min ?? 0, 0, 0)
}

function formatDeadlineLabel(deadline: string): string {
  const [y, m, d] = deadline.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!('Notification' in window)) return 'unsupported'
  if (Notification.permission === 'granted') return 'granted'
  if (Notification.permission === 'denied') return 'denied'
  return Notification.requestPermission()
}

export function showTerrainNotification(title: string, body: string) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return

  const icon = `${import.meta.env.BASE_URL}terrain-icon.svg`
  const options: NotificationOptions = {
    body,
    icon,
    badge: icon,
    tag: `terrain-${title}`,
  }

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    void navigator.serviceWorker.ready.then((reg) => {
      reg.showNotification(title, options)
    })
    return
  }

  new Notification(title, options)
}

/** Fire desktop / mobile notifications for task deadlines */
export function useTaskDeadlineNotifications(tasks: Task[]) {
  const firedRef = useRef<Set<string>>(loadFired())

  useEffect(() => {
    const check = () => {
      const now = new Date()

      for (const task of tasks) {
        if (task.status === 'done' || !task.deadline || !task.reminderEnabled) continue

        const reminderAt = parseDeadlineReminder(task)
        if (!reminderAt || now < reminderAt) continue

        const fireKey = `${task.id}-${task.deadline}-${task.reminderTime ?? '09:00'}`
        if (firedRef.current.has(fireKey)) continue

        showTerrainNotification(
          `Terrain: ${task.title}`,
          `Deadline today (${formatDeadlineLabel(task.deadline)}) — ${task.key}`,
        )

        firedRef.current.add(fireKey)
        saveFired(firedRef.current)
      }
    }

    const id = setInterval(check, 30_000)
    check()
    return () => clearInterval(id)
  }, [tasks])
}
