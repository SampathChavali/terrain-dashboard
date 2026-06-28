import { DragDropContext, type DropResult } from '@hello-pangea/dnd'
import type { Task, TaskStatus } from '../types'
import { COLUMNS } from '../types'
import { Column } from './Column'

interface BoardProps {
  tasks: Task[]
  columns?: TaskStatus[]
  onTaskClick: (task: Task) => void
  onAddClick: (status: TaskStatus) => void
  onMoveTask: (taskId: string, status: TaskStatus, index: number) => void
  onMoveToInProgress?: (taskId: string) => void
}

export function Board({
  tasks,
  columns,
  onTaskClick,
  onAddClick,
  onMoveTask,
  onMoveToInProgress,
}: BoardProps) {
  const visibleColumns = columns
    ? COLUMNS.filter((c) => columns.includes(c.id))
    : COLUMNS

  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return
    }

    onMoveTask(
      draggableId,
      destination.droppableId as TaskStatus,
      destination.index,
    )
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="page-panel">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {visibleColumns.map((col) => (
            <Column
              key={col.id}
              id={col.id}
              title={col.title}
              color={col.color}
              tasks={tasks.filter((t) => t.status === col.id)}
              onTaskClick={onTaskClick}
              onAddClick={() => onAddClick(col.id)}
              onMoveToInProgress={onMoveToInProgress}
            />
          ))}
        </div>
      </div>
    </DragDropContext>
  )
}
