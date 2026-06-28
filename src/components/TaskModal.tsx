import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import type { Task, TaskPriority, TaskStatus } from '../types'
import { COLUMNS, PRIORITY_CONFIG } from '../types'

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
    } else {
      setTitle('')
      setDescription('')
      setPriority('medium')
      setReporter(defaultReporter)
      setAssignee('')
      setLabelsInput('')
      setDodInput('')
      setStatus(defaultStatus)
    }
  }, [open, mode, task, defaultReporter, defaultStatus])

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

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
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-text">
            {mode === 'create' ? 'Create Task' : `Edit ${task?.key}`}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-card text-muted cursor-pointer"
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
              className="input-field"
              autoFocus
            />
          </Field>

          <Field label="Description">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={3}
              className="input-field resize-none"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Reporter" required>
              <input
                type="text"
                value={reporter}
                onChange={(e) => setReporter(e.target.value)}
                placeholder="Who reported this?"
                className="input-field"
              />
            </Field>

            <Field label="Assignee">
              <input
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Who is working on this?"
                className="input-field"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Priority">
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="input-field"
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
                className="input-field"
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
              placeholder={"Code reviewed\nTests passing\nDeployed to staging"}
              rows={3}
              className="input-field resize-none"
            />
          </Field>

          <Field label="Labels">
            <input
              type="text"
              value={labelsInput}
              onChange={(e) => setLabelsInput(e.target.value)}
              placeholder="bug, feature, urgent (comma separated)"
              className="input-field"
            />
          </Field>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
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
    <label className="block">
      <span className="text-xs font-medium text-muted uppercase tracking-wide">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  )
}
