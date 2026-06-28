export type TaskStatus = 'todo' | 'in_progress' | 'done'

export type TaskPriority = 'lowest' | 'low' | 'medium' | 'high' | 'highest'

export type AppView =
  | 'dashboard'
  | 'overview'
  | 'scheduled'
  | 'in_progress'
  | 'released'
  | 'progress'

export interface DailyUpdate {
  id: string
  date: string
  text: string
  createdAt: string
}

export interface StatusHistoryEntry {
  status: TaskStatus
  enteredAt: string
}

export interface LinkedWorkItem {
  id: string
  name: string
  fileName: string
  fileType: string
  fileData: string
  uploadedAt: string
}

export interface Task {
  id: string
  key: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  reporter: string
  assignee: string
  labels: string[]
  definitionOfDone: string[]
  dodCompleted: boolean[]
  dailyUpdates: DailyUpdate[]
  statusHistory: StatusHistoryEntry[]
  linkedItems: LinkedWorkItem[]
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  color: string
  taskIds: string[]
  members: string[]
}

export interface BoardState {
  tasks: Task[]
  projects: Project[]
  nextNumber: number
  projectKey: string
  defaultReporter: string
}

export interface ChartDay {
  date: string
  label: string
  value: number
  isToday: boolean
}

export const COLUMNS: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'todo', title: 'Scheduled', color: '#9ca3af' },
  { id: 'in_progress', title: 'In Progress', color: '#40916c' },
  { id: 'done', title: 'Released', color: '#1b4332' },
]

export const VIEW_TO_STATUS: Partial<Record<AppView, TaskStatus>> = {
  scheduled: 'todo',
  in_progress: 'in_progress',
  released: 'done',
}

export const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; color: string; bg: string }
> = {
  lowest: { label: 'Lowest', color: '#6b7280', bg: '#f3f4f6' },
  low: { label: 'Low', color: '#059669', bg: '#d1fae5' },
  medium: { label: 'Medium', color: '#d97706', bg: '#fef3c7' },
  high: { label: 'High', color: '#dc2626', bg: '#fee2e2' },
  highest: { label: 'Highest', color: '#dc2626', bg: '#fee2e2' },
}

export function normalizeTask(task: Partial<Task> & Pick<Task, 'id' | 'key' | 'title' | 'status' | 'priority' | 'reporter' | 'createdAt' | 'updatedAt'>): Task {
  const dod = task.definitionOfDone ?? []
  const completed = task.dodCompleted ?? dod.map(() => false)
  const statusHistory =
    task.statusHistory && task.statusHistory.length > 0
      ? task.statusHistory
      : [{ status: task.status, enteredAt: task.createdAt }]

  return {
    id: task.id,
    key: task.key,
    title: task.title,
    description: task.description ?? '',
    status: task.status,
    priority: task.priority,
    reporter: task.reporter,
    assignee: task.assignee ?? '',
    labels: task.labels ?? [],
    definitionOfDone: dod,
    dodCompleted: completed.length === dod.length ? completed : dod.map(() => false),
    dailyUpdates: task.dailyUpdates ?? [],
    statusHistory,
    linkedItems: task.linkedItems ?? [],
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  }
}

export function appendStatusHistory(
  task: Task,
  newStatus: TaskStatus,
  enteredAt: string,
): StatusHistoryEntry[] {
  const last = task.statusHistory[task.statusHistory.length - 1]
  if (last?.status === newStatus) return task.statusHistory
  return [...task.statusHistory, { status: newStatus, enteredAt }]
}

export function getWeeklyChartData(tasks: Task[]): ChartDay[] {
  const days: ChartDay[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const label = d.getDate().toString()

    let value = 0
    for (const task of tasks) {
      for (const update of task.dailyUpdates) {
        if (update.date === dateStr) value++
      }
      const completedToday = task.dodCompleted.filter(Boolean).length
      if (i === 0 && completedToday > 0) value += completedToday
    }

    days.push({
      date: dateStr,
      label,
      value,
      isToday: i === 0,
    })
  }

  return days
}

export function getTotalUpdates(tasks: Task[]): number {
  return tasks.reduce((sum, t) => sum + t.dailyUpdates.length, 0)
}

export function getDodProgress(task: Task): number {
  if (task.definitionOfDone.length === 0) return 0
  const done = task.dodCompleted.filter(Boolean).length
  return Math.round((done / task.definitionOfDone.length) * 100)
}
