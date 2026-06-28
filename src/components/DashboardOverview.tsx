import {
  ArrowUpRight,
  Bell,
  ChevronDown,
  Link2,
  Pause,
  Plus,
  Square,
  TrendingUp,
  Video,
} from 'lucide-react'
import { useState } from 'react'
import { useReminders } from '../hooks/useReminders'
import { useTimeTracker } from '../hooks/useTimeTracker'
import type { Project, Task } from '../types'

interface DashboardOverviewProps {
  stats: {
    total: number
    scheduled: number
    inProgress: number
    released: number
    totalUpdates: number
  }
  weeklyChart: import('../types').ChartDay[]
  completionRate: number
  recentTasks: Task[]
  projects: Project[]
  onTaskClick: (task: Task) => void
  onCreateClick: () => void
  onCreateProject: (name: string, taskIds: string[]) => void
  onImportData: () => void
}

const TASK_ICON_COLORS = ['#3b82f6', '#14b8a6', '#84cc16', '#eab308', '#a855f7']

export function DashboardOverview({
  stats,
  weeklyChart,
  completionRate,
  recentTasks,
  projects,
  onTaskClick,
  onCreateClick,
  onCreateProject,
  onImportData,
}: DashboardOverviewProps) {
  const inProgressTasks = recentTasks.filter((t) => t.status === 'in_progress')
  const maxChart = Math.max(...weeklyChart.map((d) => d.value), 1)
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']
  const { reminder, setReminder, requestNotificationPermission, formatTime12 } = useReminders()
  const { display, toggle, stop } = useTimeTracker()
  const [showReminderSettings, setShowReminderSettings] = useState(false)
  const [newProjectName, setNewProjectName] = useState('')
  const [showProjectForm, setShowProjectForm] = useState(false)

  const formatDue = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const handleEnableDesktopReminder = async () => {
    const permission = await requestNotificationPermission()
    if (permission === 'granted') {
      setReminder({ notifyDesktop: true, enabled: true })
    } else if (permission === 'denied') {
      alert('Desktop notifications are blocked. Enable them in your browser settings.')
    }
  }

  const reminderTitle = reminder.title || inProgressTasks[0]?.title || 'Meeting with Arc Company'

  return (
    <div className="h-full flex flex-col gap-3 min-h-0">
      {/* Header */}
      <div className="shrink-0 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-text leading-tight">Dashboard</h1>
          <p className="text-xs text-muted">Plan, prioritize, and accomplish your tasks with ease.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onImportData} className="btn-outline text-xs py-1.5 px-3">Import Data</button>
          <button onClick={onCreateClick} className="btn-primary text-xs py-1.5 px-3">
            <Plus className="w-3.5 h-3.5" />
            Add Project
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="shrink-0 grid grid-cols-4 gap-3">
        <div className="card-green-compact">
          <div className="flex items-start justify-between mb-2">
            <span className="text-[11px] text-white/80">Total Projects</span>
            <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center">
              <ArrowUpRight className="w-3 h-3 text-white/90" />
            </span>
          </div>
          <p className="text-2xl font-bold mb-1">{stats.total}</p>
          <div className="flex items-center gap-1 text-[10px] text-white/70">
            <TrendingUp className="w-3 h-3" />
            Increased from last month
          </div>
        </div>
        <StatCard label="Ended Projects" value={stats.released} subtitle="Increased from last month" />
        <StatCard label="Running Projects" value={stats.inProgress} subtitle="Increased from last month" />
        <StatCard label="Pending Project" value={stats.scheduled} subtitle="On Discuss" />
      </div>

      {/* Middle + bottom rows fill remaining height */}
      <div className="flex-1 min-h-0 grid grid-rows-2 gap-3">
        {/* Middle row */}
        <div className="min-h-0 grid grid-cols-12 gap-3">
          <div className="col-span-5 card-compact flex flex-col min-h-0">
            <div className="shrink-0 flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-text">Project Analytics</h3>
              <button className="flex items-center gap-1 text-[10px] text-muted border border-green-pale rounded-md px-2 py-0.5">
                Weekly <ChevronDown className="w-2.5 h-2.5" />
              </button>
            </div>
            <div className="flex-1 min-h-0 flex items-end justify-between gap-1.5">
              {weeklyChart.map((day, i) => {
                const h = Math.max((day.value / maxChart) * 100, 15)
                const isHighlight = day.value === maxChart && day.value > 0
                const isStriped = !isHighlight && i % 3 === 2
                const barClass = isHighlight
                  ? 'bg-green-primary'
                  : isStriped
                    ? 'bar-striped'
                    : i % 3 === 1
                      ? 'bg-green-light'
                      : 'bg-green-pale'
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1 relative h-full justify-end">
                    {isHighlight && (
                      <span className="absolute -top-5 text-[9px] font-semibold bg-green-primary text-white px-1.5 py-0.5 rounded">
                        {completionRate}%
                      </span>
                    )}
                    <div
                      className={`w-full max-w-[24px] rounded-full ${barClass}`}
                      style={{ height: `${h}%`, minHeight: '12px' }}
                    />
                    <span className="text-[9px] text-muted">{dayLabels[i]}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="col-span-3 card-compact flex flex-col min-h-0">
            <div className="shrink-0 flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-text">Reminders</h3>
              <button
                onClick={() => setShowReminderSettings(!showReminderSettings)}
                className="p-1 rounded-md hover:bg-elevated cursor-pointer"
              >
                <Bell className={`w-3.5 h-3.5 ${reminder.notifyDesktop ? 'text-green-primary' : 'text-muted'}`} />
              </button>
            </div>
            {showReminderSettings ? (
              <div className="flex-1 space-y-2 text-xs overflow-hidden">
                <input
                  type="text"
                  value={reminder.title}
                  onChange={(e) => setReminder({ title: e.target.value })}
                  className="input-field text-xs py-1.5"
                />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reminder.notifyDesktop}
                    onChange={(e) => {
                      if (e.target.checked) handleEnableDesktopReminder()
                      else setReminder({ notifyDesktop: false })
                    }}
                    className="accent-green-primary"
                  />
                  Desktop notification
                </label>
                <button
                  onClick={() => setShowReminderSettings(false)}
                  className="text-[10px] text-green-primary font-medium cursor-pointer"
                >
                  Save
                </button>
              </div>
            ) : (
              <>
                <p className="text-xs font-medium text-text truncate">{reminderTitle}</p>
                <p className="text-[10px] text-muted">
                  {formatTime12(reminder.startTime)} - {formatTime12(reminder.endTime)}
                </p>
                <button
                  onClick={() => inProgressTasks[0] && onTaskClick(inProgressTasks[0])}
                  className="mt-auto flex items-center justify-center gap-1.5 w-full py-2 bg-green-primary hover:bg-green-dark text-white text-xs font-semibold rounded-full cursor-pointer"
                >
                  <Video className="w-3.5 h-3.5" />
                  Start Meeting
                </button>
              </>
            )}
          </div>

          <div className="col-span-4 card-compact flex flex-col min-h-0">
            <div className="shrink-0 flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-text">Project</h3>
              <button onClick={onCreateClick} className="btn-primary text-[10px] py-1 px-2">
                <Plus className="w-3 h-3" /> New
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden space-y-0.5">
              {recentTasks.slice(0, 4).map((task, i) => (
                <button
                  key={task.id}
                  onClick={() => onTaskClick(task)}
                  className="w-full flex items-center gap-2 text-left hover:bg-elevated rounded-lg p-1.5 cursor-pointer"
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: TASK_ICON_COLORS[i % TASK_ICON_COLORS.length] + '22' }}
                  >
                    <Square
                      className="w-3 h-3"
                      style={{ color: TASK_ICON_COLORS[i % TASK_ICON_COLORS.length] }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text truncate">{task.title}</p>
                    <p className="text-[9px] text-muted">Due: {formatDue(task.updatedAt)}</p>
                  </div>
                </button>
              ))}
              {recentTasks.length === 0 && (
                <p className="text-xs text-muted text-center py-2">No projects yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="min-h-0 grid grid-cols-12 gap-3">
          <div className="col-span-5 card-compact flex flex-col min-h-0 overflow-hidden">
            <div className="shrink-0 flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-text">Team Collaboration</h3>
              <button onClick={onCreateClick} className="btn-outline text-[10px] py-1 px-2">
                <Plus className="w-3 h-3" /> Add Member
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden space-y-1.5">
              {inProgressTasks.slice(0, 2).map((task) => {
                const name = task.assignee || task.reporter
                const statusClass =
                  task.status === 'in_progress' ? 'status-progress' : 'status-pending'
                return (
                  <button
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className="w-full flex items-center gap-2 text-left hover:bg-elevated rounded-lg p-1.5 cursor-pointer"
                  >
                    <div className="w-7 h-7 rounded-full bg-green-bg text-green-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-text truncate">{name}</p>
                      <p className="text-[9px] text-muted truncate">Working on {task.title}</p>
                    </div>
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full shrink-0 ${statusClass}`}>
                      In Progress
                    </span>
                  </button>
                )
              })}
              <div className="border-t border-border pt-1.5 mt-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-[10px] font-semibold text-text flex items-center gap-1">
                    <Link2 className="w-3 h-3 text-green-primary" />
                    Project Collaboration
                  </h4>
                  <button
                    onClick={() => setShowProjectForm(!showProjectForm)}
                    className="text-[9px] text-green-primary font-medium cursor-pointer"
                  >
                    + Link
                  </button>
                </div>
                {showProjectForm && (
                  <div className="flex gap-1 mb-1">
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Group name"
                      className="input-field text-[10px] py-1 flex-1"
                    />
                    <button
                      onClick={() => {
                        if (newProjectName.trim()) {
                          onCreateProject(newProjectName.trim(), inProgressTasks.slice(0, 2).map((t) => t.id))
                          setNewProjectName('')
                          setShowProjectForm(false)
                        }
                      }}
                      className="btn-primary text-[9px] px-2 shrink-0"
                    >
                      Add
                    </button>
                  </div>
                )}
                {projects.slice(0, 1).map((project) => (
                  <div key={project.id} className="p-1.5 bg-elevated rounded-lg">
                    <p className="text-[10px] font-semibold text-text">{project.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-span-3 card-compact flex flex-col items-center min-h-0">
            <h3 className="text-sm font-semibold text-text self-start mb-1 w-full">Project Progress</h3>
            <div className="flex-1 flex flex-col items-center justify-center">
              <ProgressGauge percent={completionRate} />
              <div className="flex gap-2 mt-1 text-[9px]">
                <LegendDot color="#1b4332" label="Completed" />
                <LegendDot color="#40916c" label="In Progress" />
                <LegendDot color="#e5e7eb" label="Pending" striped />
              </div>
            </div>
          </div>

          <div className="col-span-4 card-green-dark flex flex-col items-center justify-center min-h-0 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 pointer-events-none">
              <svg viewBox="0 0 400 200" className="w-full h-full" preserveAspectRatio="none">
                <path d="M0,80 Q100,40 200,80 T400,80 L400,200 L0,200 Z" fill="#74c69d" />
                <path d="M0,120 Q120,90 240,120 T400,120 L400,200 L0,200 Z" fill="#40916c" />
              </svg>
            </div>
            <div className="relative text-center">
              <p className="text-[10px] text-white/70 mb-1">Time Tracker</p>
              <p className="text-2xl font-bold tracking-widest mb-3 font-mono">{display}</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={toggle}
                  className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center cursor-pointer"
                >
                  <Pause className="w-4 h-4 text-white" />
                </button>
                <button
                  onClick={stop}
                  className="w-9 h-9 rounded-full bg-red-400/80 hover:bg-red-400 flex items-center justify-center cursor-pointer"
                >
                  <Square className="w-3 h-3 fill-white text-white" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, subtitle }: { label: string; value: number; subtitle: string }) {
  return (
    <div className="card-compact">
      <div className="flex items-start justify-between mb-2">
        <span className="text-[11px] text-muted">{label}</span>
        <span className="w-6 h-6 rounded-full bg-elevated flex items-center justify-center">
          <ArrowUpRight className="w-3 h-3 text-muted" />
        </span>
      </div>
      <p className="text-2xl font-bold text-text mb-1">{value}</p>
      <div className="flex items-center gap-1 text-[10px] text-green-accent">
        <TrendingUp className="w-3 h-3" />
        {subtitle}
      </div>
    </div>
  )
}

function ProgressGauge({ percent }: { percent: number }) {
  const r = 55
  const circ = Math.PI * r
  const filled = (percent / 100) * circ
  return (
    <div className="relative">
      <svg width="150" height="82" viewBox="0 0 150 82">
        <path d="M 20 72 A 55 55 0 0 1 130 72" fill="none" stroke="#e5e7eb" strokeWidth="12" strokeLinecap="round" />
        <path
          d="M 20 72 A 55 55 0 0 1 130 72"
          fill="none"
          stroke="#1b4332"
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circ}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-0">
        <span className="text-xl font-bold text-text">{percent}%</span>
        <span className="text-[9px] text-muted">Project Ended</span>
      </div>
    </div>
  )
}

function LegendDot({ color, label, striped }: { color: string; label: string; striped?: boolean }) {
  return (
    <div className="flex items-center gap-1">
      <span
        className="w-2 h-2 rounded-full"
        style={{
          background: striped
            ? 'repeating-linear-gradient(45deg, #e5e7eb, #e5e7eb 2px, #fff 2px, #fff 4px)'
            : color,
        }}
      />
      <span className="text-muted">{label}</span>
    </div>
  )
}
