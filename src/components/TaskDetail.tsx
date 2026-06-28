import { useEffect, useRef, useState } from 'react'
import {
  Calendar,
  Check,
  ChevronDown,
  ExternalLink,
  FileText,
  Image,
  MoreHorizontal,
  Pencil,
  Share2,
  Trash2,
  Upload,
  User,
  X,
} from 'lucide-react'
import type { Task, TaskStatus } from '../types'
import { COLUMNS, getDodProgress, PRIORITY_CONFIG } from '../types'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ACCEPTED_TYPES =
  'image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv,.png,.jpg,.jpeg,.gif,.webp'

type ActivityTab = 'all' | 'comments' | 'history'

interface TaskDetailProps {
  task: Task | null
  defaultReporter: string
  onClose: () => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  onAddDailyUpdate: (taskId: string, text: string) => void
  onToggleDod: (taskId: string, index: number) => void
  onStatusChange: (taskId: string, status: TaskStatus) => void
  onAddLinkedItem: (
    taskId: string,
    item: { name: string; fileName: string; fileType: string; fileData: string },
  ) => void
  onRemoveLinkedItem: (taskId: string, itemId: string) => void
}

export function TaskDetail({
  task,
  defaultReporter,
  onClose,
  onEdit,
  onDelete,
  onAddDailyUpdate,
  onToggleDod,
  onStatusChange,
  onAddLinkedItem,
  onRemoveLinkedItem,
}: TaskDetailProps) {
  const [activeTab, setActiveTab] = useState<ActivityTab>('comments')
  const [commentText, setCommentText] = useState('')
  const [commentFocused, setCommentFocused] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setCommentText('')
    setCommentFocused(false)
    setActiveTab('comments')
  }, [task?.id])

  if (!task) return null

  const priority = PRIORITY_CONFIG[task.priority]
  const statusLabel = COLUMNS.find((c) => c.id === task.status)?.title ?? task.status
  const dodPct = getDodProgress(task)
  const authorName = task.assignee || task.reporter || defaultReporter

  const handleDelete = () => {
    if (confirm(`Delete ${task.key}: "${task.title}"?`)) {
      onDelete(task.id)
      onClose()
    }
  }

  const handlePostComment = () => {
    if (!commentText.trim()) return
    onAddDailyUpdate(task.id, commentText.trim())
    setCommentText('')
    setCommentFocused(false)
  }

  const applyQuickComment = (template: string) => {
    setCommentText(template)
    setCommentFocused(true)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !task) return
    setUploadError('')

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File must be under 2MB.')
      e.target.value = ''
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const fileData = reader.result as string
      const name = file.name.replace(/\.[^.]+$/, '') || file.name
      onAddLinkedItem(task.id, {
        name,
        fileName: file.name,
        fileType: file.type || 'application/octet-stream',
        fileData,
      })
      e.target.value = ''
    }
    reader.onerror = () => setUploadError('Failed to read file.')
    reader.readAsDataURL(file)
  }

  const relativeTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`
    const days = Math.floor(hrs / 24)
    if (days === 1) return 'yesterday'
    if (days < 7) return `${days} days ago`
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 overflow-y-auto">
      <div className="absolute inset-0 bg-black/65" onClick={onClose} />
      <div className="relative glass-modal rounded-xl shadow-2xl w-full max-w-5xl border border-white/12 mb-8">
        {/* Top toolbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
          <div className="flex items-center gap-2 text-sm text-muted">
            <span>Terrain</span>
            <span>/</span>
            <span className="text-text font-medium">{task.key}</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="p-2 rounded-lg hover:bg-card text-muted cursor-pointer" title="Share">
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(task)}
              className="p-2 rounded-lg hover:bg-card text-muted hover:text-text cursor-pointer"
              title="Edit"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 rounded-lg hover:bg-red-50 text-muted hover:text-red-600 cursor-pointer"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-card text-muted cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Main content */}
          <div className="flex-1 p-6 lg:border-r border-border min-w-0">
            <h1 className="text-2xl font-semibold text-text mb-5 leading-tight">{task.title}</h1>

            {task.description && (
              <section className="mb-6">
                <h3 className="text-sm font-semibold text-text mb-2">Description</h3>
                <p className="text-sm text-text leading-relaxed whitespace-pre-wrap glass-inner p-4">
                  {task.description}
                </p>
              </section>
            )}

            {task.definitionOfDone.length > 0 && (
              <section className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-text">Definition of Done (DoD)</h3>
                  <span className="text-xs text-muted">{dodPct}% complete</span>
                </div>
                <div className="h-1.5 bg-border rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-accent rounded-full transition-all"
                    style={{ width: `${dodPct}%` }}
                  />
                </div>
                <ul className="space-y-1 glass-inner p-4">
                  {task.definitionOfDone.map((item, i) => (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => onToggleDod(task.id, i)}
                        className="flex items-start gap-2.5 text-sm w-full text-left py-1 cursor-pointer group"
                      >
                        <span
                          className={`w-4 h-4 mt-0.5 rounded border flex items-center justify-center shrink-0 transition-colors ${
                            task.dodCompleted[i]
                          ? 'bg-accent border-accent text-white'
                          : 'border-border group-hover:border-border-strong'
                          }`}
                        >
                          {task.dodCompleted[i] && <Check className="w-2.5 h-2.5" />}
                        </span>
                        <span
                          className={
                            task.dodCompleted[i] ? 'line-through text-muted' : 'text-text'
                          }
                        >
                          {item}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="mb-6">
              <h3 className="text-sm font-semibold text-text mb-2">Linked work items</h3>
              <p className="text-xs text-muted mb-3">
                Attach screenshots, documents, or related files to this task.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 text-sm text-muted hover:text-text border border-amber-300/80 rounded-lg px-3 py-2 w-full cursor-pointer hover:bg-amber-50/50 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload screenshot or document
              </button>

              {uploadError && <p className="text-xs text-red-500 mt-2">{uploadError}</p>}

              {(task.linkedItems ?? []).length > 0 && (
                <ul className="mt-3 space-y-2">
                  {task.linkedItems.map((item) => {
                    const isImage = item.fileType.startsWith('image/')
                    return (
                      <li
                        key={item.id}
                        className="flex items-center gap-3 p-3 rounded-lg glass-inner"
                      >
                        {isImage ? (
                          <img
                            src={item.fileData}
                            alt={item.name}
                            className="w-12 h-12 rounded-lg object-cover shrink-0 border border-border"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-green-bg flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-green-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text truncate">{item.name}</p>
                          <p className="text-[11px] text-muted truncate">{item.fileName}</p>
                        </div>
                        <a
                          href={item.fileData}
                          download={item.fileName}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-green-light cursor-pointer"
                          title="Download"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        {isImage && (
                          <a
                            href={item.fileData}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg hover:bg-white/10 text-muted cursor-pointer"
                            title="Preview"
                          >
                            <Image className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => onRemoveLinkedItem(task.id, item.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-muted hover:text-red-500 cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </li>
                    )
                  })}
                </ul>
              )}
            </section>

            {/* Activity / Comments — Jira style */}
            <section>
              <h3 className="text-base font-semibold text-text mb-4">Activity</h3>

              <div className="flex gap-1 border-b border-border mb-5">
                {(
                  [
                    { id: 'all', label: 'All' },
                    { id: 'comments', label: 'Comments' },
                    { id: 'history', label: 'History' },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
                      activeTab === tab.id
                        ? 'border-jira-blue text-jira-blue'
                        : 'border-transparent text-muted hover:text-text'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Comment input */}
              <div className="flex gap-3 mb-6">
                <Avatar name={authorName} />
                <div className="flex-1">
                  <div
                    className={`glass-inner transition-all ${
                      commentFocused
                        ? 'border-green-light ring-2 ring-green-light/20'
                        : 'hover:border-white/20'
                    }`}
                  >
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onFocus={() => setCommentFocused(true)}
                      placeholder="Add a comment..."
                      rows={commentFocused ? 3 : 1}
                      className="w-full px-3 py-2.5 text-sm text-white bg-transparent resize-none focus:outline-none rounded-lg placeholder:text-white/40"
                    />
                    {commentFocused && (
                      <div className="px-3 pb-2 flex flex-wrap gap-2">
                        <QuickPill
                          label="Status update..."
                          onClick={() =>
                            applyQuickComment('Status update: ')
                          }
                        />
                        <QuickPill
                          label="Thanks..."
                          onClick={() => applyQuickComment('Thanks! ')}
                        />
                        <QuickPill
                          label="Daily progress..."
                          onClick={() =>
                            applyQuickComment('Daily update: ')
                          }
                        />
                      </div>
                    )}
                  </div>

                  {commentFocused && (
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => {
                          setCommentText('')
                          setCommentFocused(false)
                        }}
                        className="px-3 py-1.5 text-sm text-muted hover:text-text cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handlePostComment}
                        disabled={!commentText.trim()}
                        className="px-4 py-1.5 text-sm font-medium text-white bg-jira-blue rounded-md hover:bg-jira-blue-dark disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Comment
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Comment list */}
              {(activeTab === 'all' || activeTab === 'comments') && (
                <div className="space-y-5">
                  {[...task.dailyUpdates].reverse().map((update) => (
                    <div key={update.id} className="flex gap-3">
                      <Avatar name={authorName} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-text">{authorName}</span>
                          <span className="text-xs text-muted">
                            {relativeTime(update.createdAt)}
                          </span>
                          <span className="text-[10px] text-muted glass-inner px-1.5 py-0.5 rounded">
                            Daily update
                          </span>
                        </div>
                        <p className="text-sm text-text leading-relaxed whitespace-pre-wrap">
                          {update.text}
                        </p>
                      </div>
                    </div>
                  ))}
                  {task.dailyUpdates.length === 0 && (
                    <p className="text-sm text-muted text-center py-4">
                      No comments yet. Add your first daily update above.
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-3">
                  <HistoryItem
                    text={`Task created by ${task.reporter}`}
                    time={relativeTime(task.createdAt)}
                  />
                  {(task.statusHistory ?? []).map((entry, i) => (
                    <HistoryItem
                      key={`${entry.status}-${entry.enteredAt}-${i}`}
                      text={`Status changed to ${COLUMNS.find((c) => c.id === entry.status)?.title ?? entry.status}`}
                      time={relativeTime(entry.enteredAt)}
                    />
                  ))}
                  {task.dailyUpdates.map((u) => (
                    <HistoryItem
                      key={u.id}
                      text={`Daily update added: "${u.text.slice(0, 60)}${u.text.length > 60 ? '...' : ''}"`}
                      time={relativeTime(u.createdAt)}
                    />
                  ))}
                  {(task.linkedItems ?? []).map((item) => (
                    <HistoryItem
                      key={item.id}
                      text={`File attached: ${item.fileName}`}
                      time={relativeTime(item.uploadedAt)}
                    />
                  ))}
                  <HistoryItem text="Last updated" time={relativeTime(task.updatedAt)} />
                </div>
              )}
            </section>
          </div>

          {/* Right sidebar — Details */}
          <div className="w-full lg:w-[280px] shrink-0 p-5 glass-modal border-l border-white/10">
            <div className="relative mb-4">
              <button
                onClick={() => setStatusOpen(!statusOpen)}
                className="w-full flex items-center justify-between px-4 py-2 text-sm font-semibold text-white bg-jira-blue rounded-lg cursor-pointer hover:bg-jira-blue-dark transition-colors"
              >
                {statusLabel}
                <ChevronDown className="w-4 h-4" />
              </button>
              {statusOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 glass-inner shadow-lg z-10 overflow-hidden">
                  {COLUMNS.map((col) => (
                    <button
                      key={col.id}
                      onClick={() => {
                        onStatusChange(task.id, col.id)
                        setStatusOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-card cursor-pointer ${
                        task.status === col.id ? 'font-semibold text-jira-blue' : 'text-text'
                      }`}
                    >
                      {col.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <details open className="group">
              <summary className="flex items-center justify-between text-sm font-semibold text-text cursor-pointer list-none mb-3">
                Details
                <MoreHorizontal className="w-4 h-4 text-muted" />
              </summary>

              <div className="space-y-4">
                <SidebarField label="Assignee">
                  {task.assignee ? (
                    <div className="flex items-center gap-2">
                      <Avatar name={task.assignee} size="sm" />
                      <span className="text-sm text-text">{task.assignee}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted">Unassigned</span>
                  )}
                </SidebarField>

                <SidebarField label="Reporter">
                  <div className="flex items-center gap-2">
                    <Avatar name={task.reporter} size="sm" color="blue" />
                    <span className="text-sm text-text">{task.reporter}</span>
                  </div>
                </SidebarField>

                <SidebarField label="Priority">
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ color: priority.color, backgroundColor: priority.bg }}
                  >
                    {priority.label}
                  </span>
                </SidebarField>

                <SidebarField label="Labels">
                  {task.labels.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {task.labels.map((l) => (
                        <span
                          key={l}
                          className="text-xs px-2 py-0.5 rounded bg-elevated border border-border text-text"
                        >
                          {l}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-sm text-muted">Add labels</span>
                  )}
                </SidebarField>

                <SidebarField label="Deadline">
                  {task.deadline ? (
                    <span className="text-sm text-text flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-muted" />
                      {formatDate(task.deadline + 'T12:00:00')}
                      {task.reminderEnabled && (
                        <span className="text-[10px] text-green-light ml-1">· reminder on</span>
                      )}
                    </span>
                  ) : (
                    <span className="text-sm text-muted">No deadline</span>
                  )}
                </SidebarField>

                <SidebarField label="Created">
                  <span className="text-sm text-text flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-muted" />
                    {formatDate(task.createdAt)}
                  </span>
                </SidebarField>

                <SidebarField label="Updated">
                  <span className="text-sm text-text flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-muted" />
                    {formatDate(task.updatedAt)}
                  </span>
                </SidebarField>
              </div>
            </details>
          </div>
        </div>
      </div>
    </div>
  )
}

function Avatar({
  name,
  size = 'md',
  color = 'red',
}: {
  name: string
  size?: 'sm' | 'md'
  color?: 'red' | 'blue'
}) {
  const colors = {
    red: 'bg-red-500',
    blue: 'bg-blue-500',
  }
  const sizes = {
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
  }
  return (
    <div
      className={`${sizes[size]} ${colors[color]} rounded-full text-white flex items-center justify-center font-bold shrink-0`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

function QuickPill({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-xs px-2.5 py-1 rounded-full border border-border text-muted hover:bg-card hover:text-text transition-colors cursor-pointer"
    >
      {label}
    </button>
  )
}

function HistoryItem({ text, time }: { text: string; time: string }) {
  return (
    <div className="flex items-start gap-2 text-sm">
      <User className="w-4 h-4 text-muted mt-0.5 shrink-0" />
      <div>
        <p className="text-text">{text}</p>
        <p className="text-xs text-muted">{time}</p>
      </div>
    </div>
  )
}

function SidebarField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-muted mb-1">{label}</p>
      {children}
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
