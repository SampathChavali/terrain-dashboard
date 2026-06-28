import { Draggable } from '@hello-pangea/dnd'
import { ArrowRight, User } from 'lucide-react'
import type { Task } from '../types'
import { getDodProgress, PRIORITY_CONFIG } from '../types'

interface TaskCardProps {
  task: Task
  index: number
  onClick: () => void
  onMoveToInProgress?: (taskId: string) => void
}

export function TaskCard({ task, index, onClick, onMoveToInProgress }: TaskCardProps) {
  const priority = PRIORITY_CONFIG[task.priority]
  const dodPct = getDodProgress(task)

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`
            glass border border-white/50 rounded-xl p-3.5 cursor-pointer
            hover:border-green-pale/80 hover:shadow-lg transition-all
            ${snapshot.isDragging ? 'shadow-lg rotate-1 opacity-90' : ''}
          `}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-[11px] font-medium text-muted">{task.key}</span>
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ color: priority.color, backgroundColor: priority.bg }}
            >
              {priority.label}
            </span>
          </div>

          <h3 className="text-sm font-medium text-text leading-snug mb-3">{task.title}</h3>

          {task.status === 'in_progress' && task.definitionOfDone.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] text-muted">DoD</span>
                <span className="text-[10px] text-muted">{dodPct}%</span>
              </div>
              <div className="h-1 bg-elevated rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-primary rounded-full transition-all"
                  style={{ width: `${dodPct}%` }}
                />
              </div>
            </div>
          )}

          {task.status === 'todo' && onMoveToInProgress && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onMoveToInProgress(task.id)
              }}
              className="w-full flex items-center justify-center gap-1.5 mb-3 py-1.5 text-[11px] font-medium btn-move"
            >
              Move to In Progress
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          <div className="flex items-center justify-between text-xs text-muted">
            <div className="flex items-center gap-1">
              <User className="w-3 h-3" />
              <span className="truncate max-w-[80px]">{task.reporter}</span>
            </div>
            {task.dailyUpdates.length > 0 && (
              <span className="text-[10px] text-green-primary font-medium">
                {task.dailyUpdates.length} updates
              </span>
            )}
          </div>
        </div>
      )}
    </Draggable>
  )
}
