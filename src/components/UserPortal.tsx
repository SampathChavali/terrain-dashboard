import { LogOut, Send } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Task } from '../types'
import { getDodProgress } from '../types'

interface UserPortalProps {
  userName: string
  tasks: Task[]
  onAddDailyUpdate: (taskId: string, text: string) => void
  onLogout: () => void
}

export function UserPortal({ userName, tasks, onAddDailyUpdate, onLogout }: UserPortalProps) {
  const myTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.status === 'in_progress' &&
          (t.assignee.toLowerCase() === userName.toLowerCase() ||
            t.reporter.toLowerCase() === userName.toLowerCase() ||
            !t.assignee),
      ),
    [tasks, userName],
  )

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [updateText, setUpdateText] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const selected = myTasks.find((t) => t.id === selectedId) ?? myTasks[0] ?? null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected || !updateText.trim()) return
    onAddDailyUpdate(selected.id, updateText.trim())
    setUpdateText('')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="min-h-screen bg-page">
      <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-text">Daily Update Portal</h1>
          <p className="text-sm text-muted">Signed in as {userName}</p>
        </div>
        <button onClick={onLogout} className="btn-outline text-sm">
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </header>

      <main className="max-w-2xl mx-auto p-6 space-y-6">
        {myTasks.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-muted">No in-progress tasks assigned to you yet.</p>
            <p className="text-xs text-muted mt-2">Contact your admin to get tasks assigned.</p>
          </div>
        ) : (
          <>
            <div className="card">
              <h2 className="font-semibold text-text mb-3">Your active tasks</h2>
              <div className="space-y-2">
                {myTasks.map((task) => {
                  const pct = getDodProgress(task)
                  const isActive = selected?.id === task.id
                  return (
                    <button
                      key={task.id}
                      onClick={() => setSelectedId(task.id)}
                      className={`w-full text-left p-3 rounded-xl transition-colors cursor-pointer ${
                        isActive ? 'bg-green-bg border border-green-pale' : 'hover:bg-elevated'
                      }`}
                    >
                      <p className="text-sm font-medium text-text">{task.title}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-green-primary rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-muted">{pct}% DoD</span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {selected && (
              <form onSubmit={handleSubmit} className="card space-y-4">
                <div>
                  <h2 className="font-semibold text-text">Today&apos;s update</h2>
                  <p className="text-xs text-muted mt-1">
                    Task: {selected.title} ({selected.key})
                  </p>
                </div>
                <textarea
                  value={updateText}
                  onChange={(e) => setUpdateText(e.target.value)}
                  placeholder="What did you accomplish today? Any blockers?"
                  rows={4}
                  className="input-field resize-none"
                />
                <button
                  type="submit"
                  disabled={!updateText.trim()}
                  className="btn-primary w-full justify-center disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  Submit Daily Update
                </button>
                {submitted && (
                  <p className="text-sm text-green-primary text-center font-medium">
                    Update submitted successfully!
                  </p>
                )}
              </form>
            )}

            {selected && selected.dailyUpdates.length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-text mb-3">Previous updates</h3>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {[...selected.dailyUpdates].reverse().map((u) => (
                    <div key={u.id} className="border-l-2 border-green-accent pl-3">
                      <p className="text-[11px] text-muted">{u.date}</p>
                      <p className="text-sm text-text">{u.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
