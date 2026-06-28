import { Droppable } from '@hello-pangea/dnd'
import { Plus } from 'lucide-react'
import type { Task, TaskStatus } from '../types'
import { TaskCard } from './TaskCard'

interface ColumnProps {
  id: TaskStatus
  title: string
  color: string
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onAddClick: () => void
  onMoveToInProgress?: (taskId: string) => void
}

export function Column({
  id,
  title,
  color,
  tasks,
  onTaskClick,
  onAddClick,
  onMoveToInProgress,
}: ColumnProps) {
  return (
    <div className="flex flex-col min-w-[280px] max-w-[320px] flex-1">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
          <h2 className="text-sm font-semibold text-text">{title}</h2>
          <span className="text-xs text-muted bg-elevated px-2 py-0.5 rounded-full font-medium">
            {tasks.length}
          </span>
        </div>
        <button
          onClick={onAddClick}
          className="p-1.5 rounded-lg hover:bg-elevated text-muted hover:text-text transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              flex-1 flex flex-col gap-2.5 p-3 rounded-2xl min-h-[240px] transition-colors
              ${snapshot.isDraggingOver
                ? 'glass-green border-2 border-dashed border-green-pale/60'
                : 'glass border border-white/15'}
            `}
          >
            {tasks.map((task, index) => (
              <TaskCard
                key={task.id}
                task={task}
                index={index}
                onClick={() => onTaskClick(task)}
                onMoveToInProgress={id === 'todo' ? onMoveToInProgress : undefined}
              />
            ))}
            {provided.placeholder}
            {tasks.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex-1 flex items-center justify-center text-xs text-muted py-8">
                Drop tasks here or click +
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  )
}
