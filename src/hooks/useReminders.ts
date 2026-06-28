import { useCallback, useEffect, useRef, useState } from 'react'

export interface ReminderConfig {
  enabled: boolean
  title: string
  startTime: string
  endTime: string
  notifyDesktop: boolean
  taskId?: string
}

const REMINDER_KEY = 'personal-jira-reminders'

const defaultReminder: ReminderConfig = {
  enabled: false,
  title: 'Meeting with Arc Company',
  startTime: '14:00',
  endTime: '16:00',
  notifyDesktop: false,
}

function loadReminder(): ReminderConfig {
  try {
    const raw = localStorage.getItem(REMINDER_KEY)
    if (!raw) return defaultReminder
    return { ...defaultReminder, ...JSON.parse(raw) }
  } catch {
    return defaultReminder
  }
}

function saveReminder(config: ReminderConfig) {
  localStorage.setItem(REMINDER_KEY, JSON.stringify(config))
}

function parseTimeToday(time: string): Date {
  const [h, m] = time.split(':').map(Number)
  const d = new Date()
  d.setHours(h, m, 0, 0)
  return d
}

function formatTime12(time: string): string {
  const [h, m] = time.split(':').map(Number)
  const period = h >= 12 ? 'pm' : 'am'
  const hour = h % 12 || 12
  return `${hour.toString().padStart(2, '0')}.${m.toString().padStart(2, '0')} ${period}`
}

export function useReminders() {
  const [reminder, setReminderState] = useState<ReminderConfig>(loadReminder)
  const firedRef = useRef<string | null>(null)

  const setReminder = useCallback((updates: Partial<ReminderConfig>) => {
    setReminderState((prev) => {
      const next = { ...prev, ...updates }
      saveReminder(next)
      return next
    })
  }, [])

  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) return 'unsupported' as const
    if (Notification.permission === 'granted') return 'granted' as const
    if (Notification.permission === 'denied') return 'denied' as const
    const result = await Notification.requestPermission()
    return result
  }, [])

  const showDesktopNotification = useCallback((title: string, body: string) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    new Notification(title, { body, icon: '/favicon.ico' })
  }, [])

  useEffect(() => {
    if (!reminder.enabled || !reminder.notifyDesktop) return

    const check = () => {
      const now = new Date()
      const start = parseTimeToday(reminder.startTime)
      const key = `${reminder.title}-${reminder.startTime}-${now.toDateString()}`

      if (now >= start && firedRef.current !== key) {
        firedRef.current = key
        showDesktopNotification(reminder.title, `Starts at ${formatTime12(reminder.startTime)}`)
      }
    }

    const id = setInterval(check, 30_000)
    check()
    return () => clearInterval(id)
  }, [reminder, showDesktopNotification])

  return {
    reminder,
    setReminder,
    requestNotificationPermission,
    showDesktopNotification,
    formatTime12,
  }
}
