import { useEffect, useState } from 'react'
import { Bell, Calendar, X } from 'lucide-react'
import type { Task, TaskPriority, TaskStatus } from '../types'
import { COLUMNS, PRIORITY_CONFIG } from '../types'
import { requestNotificationPermission } from '../hooks/useTaskDeadlineNotifications'

interface TaskModalProps {
  open: boolean
  mode: 'create' | 'edit'
  task?: Task
  defaultReporter: string
  defaultStatus?: TaskStatus
  onClose: () => void
  onSave: (data: {
    title: string
    description: string
    priority: TaskPriority
    reporter: string
    assignee: string
    labels: string[]
    status: TaskStatus
    definitionOfDone: string[]
    deadline: string
    reminderEnabled: boolean
    reminderTime: string
  }) => void
}

export function TaskModal({
  open,
  mode,
  task,
  defaultReporter,
  defaultStatus = 'todo',
  onClose,
  onSave,
}: TaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [reporter, setReporter] = useState(defaultReporter)
  const [assignee, setAssignee] = useState('')
  const [labelsInput, setLabelsInput] = useState('')
  const [dodInput, setDodInput] = useState('')
  const [status, setStatus] = useState<TaskStatus>(defaultStatus)
  const [deadline, setDeadline] = useState('')
  const [reminderEnabled, setReminderEnabled] = useState(false)
  const [reminderTime, setReminderTime] = useState('09:00')

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && task) {
      setTitle(task.title)
      setDescription(task.description)
      setPriority(task.priority)
      setReporter(task.reporter)
      setAssignee(task.assignee)
      setLabelsInput(task.labels.join(', '))
      setDodInput(task.definitionOfDone.join('\n'))
      setStatus(task.status)
      setDeadline(task.deadline ?? '')
      setReminderEnabled(task.reminderEnabled ?? false)
      setReminderTime(task.reminderTime ?? '09:00')
    } else {
      setTitle('')
      setDescription('')
      setPriority('medium')
      setReporter(defaultReporter)
      setAssignee('')
      setLabelsInput('')
      setDodInput('')
      setStatus(defaultStatus)
      setDeadline('')
      setReminderEnabled(false)
      setReminderTime('09:00')
    }
  }, [open, mode, task, defaultReporter, defaultStatus])

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    if (reminderEnabled && deadline) {
      const perm = await requestNotificationPermission()
      if (perm === 'denied') {
        alert('Notifications are blocked. Enable them in browser settings to get deadline reminders.')
      }
    }

    const labels = labelsInput
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean)

    const definitionOfDone = dodInput
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)

    onSave({
      title: title.trim(),
      description: description.trim(),
      priority,
      reporter: reporter.trim() || defaultReporter,
      assignee: assignee.trim(),
      labels,
      status,
      definitionOfDone,
      deadline,
      reminderEnabled: reminderEnabled && Boolean(deadline),
      reminderTime,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative modal-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">
              {mode === 'create' ? 'Create Task' : `Edit ${task?.key}`}
            </h2>
            {mode === 'edit' && task ? (
              <p className="text-xs modal-muted mt-0.5">
                Created {new Date(task.createdAt).toLocaleString()}
              </p>
            ) : (
              <p className="text-xs modal-muted mt-0.5">Set a deadline to get reminders</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <Field label="Title" required>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="login-input"
              autoFocus
            />
          </Field>

          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={3}
              className="login-input resize-none"
            />
          </Field>

          {/* Deadline & reminder — same dark glass as login */}
          <div className="modal-reminder-box space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Calendar className="w-4 h-4 text-green-light" />
              Deadline &amp; reminder
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Deadline date">
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="login-input"
                />
              </Field>
              <Field label="Reminder time">
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="login-input"
                  disabled={!deadline}
                />
              </Field>
            </div>

            <label className="flex items-start gap-2 text-sm text-white/85 cursor-pointer">
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                disabled={!deadline}
                className="mt-0.5 rounded border-white/30"
              />
              <span>
                <span className="flex items-center gap-1.5 font-medium">
                  <Bell className="w-4 h-4 text-green-light" />
                  Notify me on deadline
                </span>
                <span className="block text-xs modal-muted mt-0.5">
                  Popup on laptop; on phone add Terrain to Home Screen first
                </span>
              </span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Reporter" required>
              <input
                type="text"
                value={reporter}
                onChange={(e) => setReporter(e.target.value)}
                placeholder="Who reported this?"
                className="login-input"
              />
            </Field>
            <Field label="Assignee">
              <input
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Who is working on this?"
                className="login-input"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Priority">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="login-input"
              >
                {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
                  <option key={key} value={key}>
                    {cfg.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="login-input"
              >
                {COLUMNS.map((col) => (
                  <option key={col.id} value={col.id}>
                    {col.title}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Definition of Done (one per line)">
            <textarea
              value={dodInput}
              onChange={(e) => setDodInput(e.target.value)}
              placeholder={'Code reviewed\nTests passing\nDeployed to staging'}
              rows={3}
              className="login-input resize-none"
            />
          </Field>

          <Field label="Labels">
            <input
              type="text"
              value={labelsInput}
              onChange={(e) => setLabelsInput(e.target.value)}
              placeholder="bug, feature, urgent (comma separated)"
              className="login-input"
            />
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="modal-btn-ghost">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="login-btn disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mode === 'create' ? 'Create Task' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="login-field-box">
      <label className="block text-sm mb-1.5 modal-label">
        {label}
        {required && <span className="text-red-300 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}
