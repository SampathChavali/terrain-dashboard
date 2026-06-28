import { Check, Plus, Send } from 'lucide-react'
import { useState } from 'react'
import type { Task } from '../types'
import { getDodProgress, PRIORITY_CONFIG } from '../types'

interface ProgressPanelProps {
  tasks: Task[]
  selectedTaskId: string | null
  onSelectTask: (id: string) => void
  onToggleDod: (taskId: string, index: number) => void
  onAddDod: (taskId: string, text: string) => void
  onAddDailyUpdate: (taskId: string, text: string) => void
}

export function ProgressPanel({
  tasks,
  selectedTaskId,
  onSelectTask,
  onToggleDod,
  onAddDod,
  onAddDailyUpdate,
}: ProgressPanelProps) {
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress')
  const selected =
    inProgressTasks.find((t) => t.id === selectedTaskId) ?? inProgressTasks[0] ?? null

  const [newDod, setNewDod] = useState('')
  const [dailyText, setDailyText] = useState('')

  if (inProgressTasks.length === 0) {
    return (
      <div className="card text-center py-16">
        <p className="text-muted text-sm">No tasks in progress yet.</p>
        <p className="text-muted text-xs mt-1">
          Move a scheduled task to In Progress to track DoD and daily updates.
        </p>
      </div>
    )
  }

  const progress = selected ? getDodProgress(selected) : 0
  const priority = selected ? PRIORITY_CONFIG[selected.priority] : null

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
      <div className="xl:col-span-1 card">
        <h3 className="text-base font-semibold text-text mb-4">Tasks in progress</h3>
        <div className="space-y-2">
          {inProgressTasks.map((task) => {
            const pct = getDodProgress(task)
            const isSelected = selected?.id === task.id
            return (
              <button
                key={task.id}
                onClick={() => onSelectTask(task.id)}
                className={`w-full text-left p-3 rounded-xl transition-colors cursor-pointer ${
                  isSelected ? 'bg-elevated border border-border' : 'hover:bg-card-hover bg-transparent'
                }`}
              >
                <p className="text-sm font-medium text-text truncate">{task.title}</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-primary rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted">{pct}%</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {selected && (
        <div className="xl:col-span-2 space-y-5">
          <div className="card">
            <div className="flex items-start justify-between mb-4">
              <div>
                <span className="text-xs text-muted">{selected.key}</span>
                <h2 className="text-lg font-semibold text-text mt-0.5">{selected.title}</h2>
              </div>
              {priority && (
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ color: priority.color, backgroundColor: priority.bg }}
                >
                  {priority.label}
                </span>
              )}
            </div>

            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text">Definition of Done (DoD)</h3>
              <span className="text-xs text-muted">{progress}% complete</span>
            </div>

            <div className="h-2 bg-border rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-green-primary rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="space-y-2 mb-4">
              {selected.definitionOfDone.map((item, i) => (
                <label
                  key={i}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-card-hover cursor-pointer"
                >
                  <button
                    type="button"
                    onClick={() => onToggleDod(selected.id, i)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                      selected.dodCompleted[i]
                        ? 'bg-green-primary border-green-primary text-white'
                        : 'border-border'
                    }`}
                  >
                    {selected.dodCompleted[i] && <Check className="w-3 h-3" />}
                  </button>
                  <span
                    className={`text-sm ${
                      selected.dodCompleted[i] ? 'line-through text-muted' : 'text-text'
                    }`}
                  >
                    {item}
                  </span>
                </label>
              ))}
              {selected.definitionOfDone.length === 0 && (
                <p className="text-xs text-muted py-2">No DoD items yet. Add criteria below.</p>
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                onAddDod(selected.id, newDod)
                setNewDod('')
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={newDod}
                onChange={(e) => setNewDod(e.target.value)}
                placeholder="Add DoD criteria..."
                className="input-field flex-1"
              />
              <button type="submit" className="btn-ghost shrink-0">
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="card">
            <h3 className="text-sm font-semibold text-text mb-4">Daily Update</h3>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                onAddDailyUpdate(selected.id, dailyText)
                setDailyText('')
              }}
              className="flex gap-2 mb-5"
            >
              <input
                type="text"
                value={dailyText}
                onChange={(e) => setDailyText(e.target.value)}
                placeholder="What did you accomplish today?"
                className="input-field flex-1"
              />
              <button type="submit" className="btn-primary shrink-0">
                <Send className="w-4 h-4" />
                Post
              </button>
            </form>

            <div className="space-y-3 max-h-[320px] overflow-y-auto">
              {[...selected.dailyUpdates].reverse().map((update) => (
                <div
                  key={update.id}
                  className="p-3 bg-elevated rounded-xl border border-border"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold text-green-primary">
                      {new Date(update.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="text-[10px] text-muted">
                      {new Date(update.createdAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-text">{update.text}</p>
                </div>
              ))}
              {selected.dailyUpdates.length === 0 && (
                <p className="text-xs text-muted text-center py-6">
                  No daily updates yet. Post your first update above — the chart will move!
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
