import type { BoardState, Task, TaskStatus } from '../types'

export interface TaskReportRow {
  key: string
  title: string
  status: string
  reporter: string
  assignee: string
  createdAt: string
  scheduledAt: string
  inProgressAt: string
  completedAt: string
  daysInProgress: string
  totalDays: string
  dailyUpdates: number
  linkedFiles: number
}

function formatDateTime(iso: string | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDuration(ms: number): string {
  if (ms <= 0) return '0 minutes'
  const mins = Math.floor(ms / 60000)
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'}`
  const hrs = Math.floor(mins / 60)
  const remMins = mins % 60
  if (hrs < 24) {
    return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs} hour${hrs === 1 ? '' : 's'}`
  }
  const days = Math.floor(hrs / 24)
  const remHrs = hrs % 24
  return remHrs > 0 ? `${days}d ${remHrs}h` : `${days} day${days === 1 ? '' : 's'}`
}

function getStatusTime(task: Task, status: TaskStatus): string | undefined {
  const match = [...(task.statusHistory ?? [])].reverse().find((e) => e.status === status)
  return match?.enteredAt
}

export function buildTaskReport(tasks: Task[]): TaskReportRow[] {
  return tasks.map((task) => {
    const scheduledAt = task.createdAt
    const inProgressAt = getStatusTime(task, 'in_progress')
    const completedAt = getStatusTime(task, 'done')

    let daysInProgress = '—'
    if (inProgressAt) {
      const end = completedAt ? new Date(completedAt).getTime() : Date.now()
      daysInProgress = formatDuration(end - new Date(inProgressAt).getTime())
    }

    const totalMs = Date.now() - new Date(task.createdAt).getTime()
    const statusLabel =
      task.status === 'todo' ? 'Scheduled' : task.status === 'in_progress' ? 'In Progress' : 'Released'

    return {
      key: task.key,
      title: task.title,
      status: statusLabel,
      reporter: task.reporter,
      assignee: task.assignee || '—',
      createdAt: formatDateTime(task.createdAt),
      scheduledAt: formatDateTime(scheduledAt),
      inProgressAt: formatDateTime(inProgressAt),
      completedAt: formatDateTime(completedAt),
      daysInProgress,
      totalDays: formatDuration(totalMs),
      dailyUpdates: task.dailyUpdates.length,
      linkedFiles: (task.linkedItems ?? []).length,
    }
  })
}

export function downloadJsonReport(state: BoardState, username: string) {
  const payload = {
    exportedAt: new Date().toISOString(),
    exportedBy: username,
    projectKey: state.projectKey,
    summary: {
      totalTasks: state.tasks.length,
      scheduled: state.tasks.filter((t) => t.status === 'todo').length,
      inProgress: state.tasks.filter((t) => t.status === 'in_progress').length,
      released: state.tasks.filter((t) => t.status === 'done').length,
    },
    tasks: state.tasks.map((task) => ({
      ...task,
      timeline: buildTaskReport([task])[0],
    })),
    projects: state.projects,
  }

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
  triggerDownload(blob, `terrain-tasks-${username}-${dateStamp()}.json`)
}

export function downloadCsvReport(tasks: Task[], username: string) {
  const rows = buildTaskReport(tasks)
  const headers = [
    'Key',
    'Title',
    'Status',
    'Reporter',
    'Assignee',
    'Created',
    'Scheduled',
    'In Progress Started',
    'Completed',
    'Time In Progress',
    'Total Time Open',
    'Daily Updates',
    'Linked Files',
  ]

  const csvLines = [
    headers.join(','),
    ...rows.map((r) =>
      [
        r.key,
        quote(r.title),
        r.status,
        quote(r.reporter),
        quote(r.assignee),
        quote(r.createdAt),
        quote(r.scheduledAt),
        quote(r.inProgressAt),
        quote(r.completedAt),
        quote(r.daysInProgress),
        quote(r.totalDays),
        r.dailyUpdates,
        r.linkedFiles,
      ].join(','),
    ),
  ]

  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv' })
  triggerDownload(blob, `terrain-report-${username}-${dateStamp()}.csv`)
}

export function importBoardFromFile(
  file: File,
  onSuccess: (partial: Partial<BoardState>) => void,
  onError: (msg: string) => void,
) {
  const reader = new FileReader()
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result as string)
      const tasks = parsed.tasks ?? parsed
      if (!Array.isArray(tasks)) {
        onError('Invalid file format. Expected a tasks export from Terrain.')
        return
      }
      onSuccess({
        tasks,
        projects: parsed.projects ?? [],
        nextNumber: parsed.nextNumber ?? tasks.length + 1,
        projectKey: parsed.projectKey ?? 'PERS',
      })
    } catch {
      onError('Could not read file. Please upload a valid JSON export.')
    }
  }
  reader.onerror = () => onError('Failed to read file.')
  reader.readAsText(file)
}

function quote(value: string) {
  return `"${value.replace(/"/g, '""')}"`
}

function dateStamp() {
  return new Date().toISOString().slice(0, 10)
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
