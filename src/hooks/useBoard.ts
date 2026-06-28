import { useCallback, useEffect, useMemo, useState } from 'react'
import type { BoardState, Project, Task, TaskPriority, TaskStatus } from '../types'
import { getTotalUpdates, getWeeklyChartData, normalizeTask, appendStatusHistory } from '../types'
import type { LinkedWorkItem } from '../types'

const LEGACY_STORAGE_KEY = 'personal-jira-kanban-v2'

const defaultState = (username = 'You'): BoardState => ({
  tasks: [],
  projects: [],
  nextNumber: 1,
  projectKey: 'PERS',
  defaultReporter: username,
})

function boardKey(username: string) {
  return `${LEGACY_STORAGE_KEY}-${username.toLowerCase()}`
}

function loadState(username: string): BoardState {
  try {
    const key = boardKey(username)
    let raw = localStorage.getItem(key)

    if (!raw) {
      raw =
        localStorage.getItem(LEGACY_STORAGE_KEY) ||
        localStorage.getItem('personal-jira-kanban') ||
        null
    }

    if (!raw) return defaultState(username)

    const parsed = JSON.parse(raw)
    const state: BoardState = {
      ...defaultState(username),
      ...parsed,
      tasks: (parsed.tasks ?? []).map((t: Task) => normalizeTask(t)),
      projects: parsed.projects ?? [],
      defaultReporter: parsed.defaultReporter || username,
    }

    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(state))
    }

    return state
  } catch {
    return defaultState(username)
  }
}

function saveState(username: string, state: BoardState) {
  localStorage.setItem(boardKey(username), JSON.stringify(state))
}

export function useBoard(username: string | null) {
  const [state, setState] = useState<BoardState>(() =>
    username ? loadState(username) : defaultState(),
  )

  useEffect(() => {
    if (!username) {
      setState(defaultState())
      return
    }
    setState(loadState(username))
  }, [username])

  useEffect(() => {
    if (!username) return
    saveState(username, state)
  }, [state, username])

  const createTask = useCallback(
    (data: {
      title: string
      description: string
      priority: TaskPriority
      reporter: string
      assignee: string
      labels: string[]
      status?: TaskStatus
      definitionOfDone?: string[]
    }) => {
      const now = new Date().toISOString()
      const key = `${state.projectKey}-${state.nextNumber}`
      const dod = data.definitionOfDone ?? []

      const task = normalizeTask({
        id: crypto.randomUUID(),
        key,
        title: data.title,
        description: data.description,
        status: data.status ?? 'todo',
        priority: data.priority,
        reporter: data.reporter,
        assignee: data.assignee,
        labels: data.labels,
        definitionOfDone: dod,
        dodCompleted: dod.map(() => false),
        dailyUpdates: [],
        statusHistory: [{ status: data.status ?? 'todo', enteredAt: now }],
        linkedItems: [],
        createdAt: now,
        updatedAt: now,
      })

      setState((prev) => ({
        ...prev,
        tasks: [...prev.tasks, task],
        nextNumber: prev.nextNumber + 1,
        defaultReporter: data.reporter || prev.defaultReporter,
      }))

      return task
    },
    [state.projectKey, state.nextNumber],
  )

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    const now = new Date().toISOString()
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id !== id) return t
        const statusHistory =
          updates.status && updates.status !== t.status
            ? appendStatusHistory(t, updates.status, now)
            : t.statusHistory
        return normalizeTask({
          ...t,
          ...updates,
          statusHistory,
          updatedAt: now,
        })
      }),
    }))
  }, [])

  const deleteTask = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== id),
    }))
  }, [])

  const moveTask = useCallback(
    (taskId: string, newStatus: TaskStatus, newIndex: number) => {
      setState((prev) => {
        const task = prev.tasks.find((t) => t.id === taskId)
        if (!task) return prev

        const now = new Date().toISOString()
        const updated = normalizeTask({
          ...task,
          status: newStatus,
          statusHistory: appendStatusHistory(task, newStatus, now),
          updatedAt: now,
        })
        const without = prev.tasks.filter((t) => t.id !== taskId)

        const columnOrder: TaskStatus[] = ['todo', 'in_progress', 'done']
        const result: Task[] = []
        for (const col of columnOrder) {
          const colTasks = without.filter((t) => t.status === col)
          if (col === newStatus) {
            colTasks.splice(newIndex, 0, updated)
          }
          result.push(...colTasks)
        }
        return { ...prev, tasks: result }
      })
    },
    [],
  )

  const toggleDod = useCallback((taskId: string, index: number) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id !== taskId) return t
        const dodCompleted = [...t.dodCompleted]
        dodCompleted[index] = !dodCompleted[index]
        return normalizeTask({
          ...t,
          dodCompleted,
          updatedAt: new Date().toISOString(),
        })
      }),
    }))
  }, [])

  const addDodItem = useCallback((taskId: string, text: string) => {
    if (!text.trim()) return
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id !== taskId) return t
        return normalizeTask({
          ...t,
          definitionOfDone: [...t.definitionOfDone, text.trim()],
          dodCompleted: [...t.dodCompleted, false],
          updatedAt: new Date().toISOString(),
        })
      }),
    }))
  }, [])

  const addDailyUpdate = useCallback((taskId: string, text: string) => {
    if (!text.trim()) return
    const today = new Date().toISOString().slice(0, 10)
    const update = {
      id: crypto.randomUUID(),
      date: today,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    }
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => {
        if (t.id !== taskId) return t
        return normalizeTask({
          ...t,
          dailyUpdates: [...t.dailyUpdates, update],
          updatedAt: new Date().toISOString(),
        })
      }),
    }))
  }, [])

  const setDefaultReporter = useCallback((reporter: string) => {
    setState((prev) => ({ ...prev, defaultReporter: reporter }))
  }, [])

  const createProject = useCallback(
    (name: string, taskIds: string[] = [], members: string[] = []) => {
      const colors = ['#3b82f6', '#14b8a6', '#84cc16', '#eab308', '#a855f7', '#f97316']
      const project: Project = {
        id: crypto.randomUUID(),
        name: name.trim(),
        color: colors[state.projects.length % colors.length],
        taskIds,
        members,
      }
      setState((prev) => ({ ...prev, projects: [...prev.projects, project] }))
      return project
    },
    [state.projects.length],
  )

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }))
  }, [])

  const linkTaskToProject = useCallback((projectId: string, taskId: string) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === projectId && !p.taskIds.includes(taskId)
          ? { ...p, taskIds: [...p.taskIds, taskId] }
          : p,
      ),
    }))
  }, [])

  const addLinkedItem = useCallback((taskId: string, item: Omit<LinkedWorkItem, 'id' | 'uploadedAt'>) => {
    const entry: LinkedWorkItem = {
      ...item,
      id: crypto.randomUUID(),
      uploadedAt: new Date().toISOString(),
    }
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId
          ? normalizeTask({
              ...t,
              linkedItems: [...t.linkedItems, entry],
              updatedAt: new Date().toISOString(),
            })
          : t,
      ),
    }))
  }, [])

  const removeLinkedItem = useCallback((taskId: string, itemId: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) =>
        t.id === taskId
          ? normalizeTask({
              ...t,
              linkedItems: t.linkedItems.filter((i) => i.id !== itemId),
              updatedAt: new Date().toISOString(),
            })
          : t,
      ),
    }))
  }, [])

  const importBoardData = useCallback((data: Partial<BoardState>) => {
    setState((prev) => ({
      ...prev,
      ...data,
      tasks: (data.tasks ?? prev.tasks).map((t: Task) => normalizeTask(t)),
      projects: data.projects ?? prev.projects,
    }))
  }, [])

  const stats = useMemo(
    () => ({
      total: state.tasks.length,
      scheduled: state.tasks.filter((t) => t.status === 'todo').length,
      inProgress: state.tasks.filter((t) => t.status === 'in_progress').length,
      released: state.tasks.filter((t) => t.status === 'done').length,
      todo: state.tasks.filter((t) => t.status === 'todo').length,
      done: state.tasks.filter((t) => t.status === 'done').length,
      totalUpdates: getTotalUpdates(state.tasks),
    }),
    [state.tasks],
  )

  const weeklyChart = useMemo(
    () => getWeeklyChartData(state.tasks),
    [state.tasks],
  )

  const completionRate = useMemo(() => {
    if (stats.total === 0) return 0
    return Math.round((stats.released / stats.total) * 100)
  }, [stats])

  return {
    state,
    stats,
    weeklyChart,
    completionRate,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    toggleDod,
    addDodItem,
    addDailyUpdate,
    setDefaultReporter,
    createProject,
    updateProject,
    linkTaskToProject,
    addLinkedItem,
    removeLinkedItem,
    importBoardData,
  }
}
