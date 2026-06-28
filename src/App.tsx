import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import type { AppView, Task, TaskStatus } from './types'
import { VIEW_TO_STATUS } from './types'
import { Board } from './components/Board'
import { DashboardOverview } from './components/DashboardOverview'
import { HelpModal } from './components/HelpModal'
import { ImportDataModal } from './components/ImportDataModal'
import { LoginPage } from './components/LoginPage'
import { AdminLoginPage } from './components/AdminLoginPage'
import { AdminPortal } from './components/AdminPortal'
import { ProgressPanel } from './components/ProgressPanel'
import { Sidebar } from './components/Sidebar'
import { TaskDetail } from './components/TaskDetail'
import { TaskModal } from './components/TaskModal'
import { TopBar } from './components/TopBar'
import { TerrainBackground } from './components/TerrainBackground'
import { useAuth } from './hooks/useAuth'
import { useBoard } from './hooks/useBoard'

type ModalState =
  | { type: 'closed' }
  | { type: 'create'; status: TaskStatus }
  | { type: 'edit'; task: Task }

const VIEW_META: Record<AppView, { title: string; subtitle: string }> = {
  dashboard: { title: 'Dashboard', subtitle: 'Plan, prioritize, and accomplish your tasks with ease.' },
  overview: { title: 'Tasks', subtitle: 'Manage all your tasks in one place.' },
  scheduled: { title: 'Calendar', subtitle: 'Scheduled tasks waiting to start.' },
  in_progress: { title: 'Team', subtitle: 'Tasks your team is working on.' },
  released: { title: 'Released', subtitle: 'Completed and released tasks.' },
  progress: { title: 'Analytics', subtitle: 'Track daily updates and progress.' },
}

export default function App() {
  const {
    session,
    login,
    platformAdminLogin,
    register,
    logout,
    listUsers,
    addUserAccount,
    removeUserAccount,
  } = useAuth()
  const board = useBoard(session?.role === 'user' ? session.name : null)
  const [authView, setAuthView] = useState<'user' | 'admin'>('user')
  const [userListVersion, setUserListVersion] = useState(0)

  const users = useMemo(() => {
    void userListVersion
    return listUsers()
  }, [listUsers, userListVersion])

  if (!session) {
    if (authView === 'admin') {
      return (
        <AdminLoginPage
          onLogin={platformAdminLogin}
          onBack={() => setAuthView('user')}
        />
      )
    }
    return (
      <LoginPage
        onLogin={login}
        onRegister={register}
        onAdminPortal={() => setAuthView('admin')}
      />
    )
  }

  if (session.role === 'platform_admin') {
    return (
      <AdminPortal
        adminName={session.name}
        users={users}
        onAddUser={addUserAccount}
        onRemoveUser={removeUserAccount}
        onLogout={logout}
        onRefresh={() => setUserListVersion((v) => v + 1)}
      />
    )
  }

  return <AdminDashboard sessionName={session.name} onLogout={logout} board={board} />
}

function AdminDashboard({
  sessionName,
  onLogout,
  board,
}: {
  sessionName: string
  onLogout: () => void
  board: ReturnType<typeof useBoard>
}) {
  const {
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
    addLinkedItem,
    removeLinkedItem,
    importBoardData,
  } = board

  const [currentView, setCurrentView] = useState<AppView>('dashboard')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [progressTaskId, setProgressTaskId] = useState<string | null>(null)
  const [modal, setModal] = useState<ModalState>({ type: 'closed' })
  const [showHelp, setShowHelp] = useState(false)
  const [showImportData, setShowImportData] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const selectedTask = useMemo(
    () => state.tasks.find((t) => t.id === selectedTaskId) ?? null,
    [state.tasks, selectedTaskId],
  )

  const filteredTasks = useMemo(() => {
    let tasks = state.tasks
    const statusFilter = VIEW_TO_STATUS[currentView]
    if (statusFilter) tasks = tasks.filter((t) => t.status === statusFilter)
    return tasks
  }, [state.tasks, currentView])

  const recentTasks = useMemo(
    () =>
      [...state.tasks].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    [state.tasks],
  )

  const openTask = (task: Task) => setSelectedTaskId(task.id)

  const moveToInProgress = (taskId: string) => {
    const count = state.tasks.filter((t) => t.status === 'in_progress').length
    moveTask(taskId, 'in_progress', count)
  }

  const openCreate = (status?: TaskStatus) => {
    setModal({ type: 'create', status: status ?? defaultStatusForView() })
  }

  const handleSave = (data: {
    title: string
    description: string
    priority: Task['priority']
    reporter: string
    assignee: string
    labels: string[]
    status: TaskStatus
    definitionOfDone: string[]
  }) => {
    setDefaultReporter(data.reporter)
    if (modal.type === 'edit') {
      const existing = modal.task
      const dodCompleted = data.definitionOfDone.map((_, i) =>
        i < existing.dodCompleted.length ? existing.dodCompleted[i] : false,
      )
      updateTask(modal.task.id, { ...data, dodCompleted })
    } else {
      createTask(data)
    }
  }

  const defaultStatusForView = (): TaskStatus => {
    if (currentView === 'scheduled') return 'todo'
    if (currentView === 'in_progress') return 'in_progress'
    if (currentView === 'released') return 'done'
    return 'todo'
  }

  const meta = VIEW_META[currentView]

  return (
    <TerrainBackground className="h-screen overflow-hidden">
      <div className="flex h-full overflow-hidden">
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        onHelp={() => setShowHelp(true)}
        onLogout={onLogout}
        stats={{ total: stats.total, inProgress: stats.inProgress }}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          userName={sessionName}
        />
        <main
          className={`flex-1 min-h-0 p-4 ${
            currentView === 'dashboard' ? 'overflow-hidden' : 'overflow-y-auto'
          }`}
        >
          {currentView !== 'dashboard' && (
            <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold text-text">{meta.title}</h1>
                <p className="text-sm text-muted mt-1">{meta.subtitle}</p>
              </div>
              <button onClick={() => openCreate()} className="btn-primary">
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>
          )}

          {currentView === 'dashboard' && (
            <DashboardOverview
              stats={stats}
              weeklyChart={weeklyChart}
              completionRate={completionRate}
              recentTasks={recentTasks}
              projects={state.projects}
              onTaskClick={openTask}
              onCreateClick={() => openCreate()}
              onCreateProject={(name, taskIds) => createProject(name, taskIds)}
              onImportData={() => setShowImportData(true)}
            />
          )}

          {currentView === 'overview' && (
            <Board
              tasks={filteredTasks}
              onTaskClick={openTask}
              onAddClick={(status) => openCreate(status)}
              onMoveTask={moveTask}
              onMoveToInProgress={moveToInProgress}
            />
          )}

          {(currentView === 'scheduled' ||
            currentView === 'in_progress' ||
            currentView === 'released') && (
            <Board
              tasks={filteredTasks}
              columns={[VIEW_TO_STATUS[currentView]!]}
              onTaskClick={openTask}
              onAddClick={() => openCreate()}
              onMoveTask={moveTask}
              onMoveToInProgress={moveToInProgress}
            />
          )}

          {currentView === 'progress' && (
            <ProgressPanel
              tasks={state.tasks}
              selectedTaskId={progressTaskId}
              onSelectTask={setProgressTaskId}
              onToggleDod={toggleDod}
              onAddDod={addDodItem}
              onAddDailyUpdate={addDailyUpdate}
            />
          )}
        </main>
      </div>

      <HelpModal open={showHelp} onClose={() => setShowHelp(false)} />

      <ImportDataModal
        open={showImportData}
        username={sessionName}
        state={state}
        onClose={() => setShowImportData(false)}
        onImport={importBoardData}
      />

      <TaskModal
        open={modal.type !== 'closed'}
        mode={modal.type === 'edit' ? 'edit' : 'create'}
        task={modal.type === 'edit' ? modal.task : undefined}
        defaultReporter={state.defaultReporter}
        defaultStatus={modal.type === 'create' ? modal.status : 'todo'}
        onClose={() => setModal({ type: 'closed' })}
        onSave={handleSave}
      />

      <TaskDetail
        task={selectedTask}
        defaultReporter={state.defaultReporter}
        onClose={() => setSelectedTaskId(null)}
        onEdit={(task) => {
          setSelectedTaskId(null)
          setModal({ type: 'edit', task })
        }}
        onDelete={(id) => {
          deleteTask(id)
          setSelectedTaskId(null)
        }}
        onAddDailyUpdate={addDailyUpdate}
        onToggleDod={toggleDod}
        onStatusChange={(id, status) => updateTask(id, { status })}
        onAddLinkedItem={addLinkedItem}
        onRemoveLinkedItem={removeLinkedItem}
      />
      </div>
    </TerrainBackground>
  )
}
