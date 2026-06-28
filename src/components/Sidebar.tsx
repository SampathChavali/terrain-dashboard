import {
  BarChart3,
  Calendar,
  HelpCircle,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Settings,
  Users,
} from 'lucide-react'
import type { AppView } from '../types'

interface SidebarProps {
  currentView: AppView
  onNavigate: (view: AppView) => void
  onHelp: () => void
  onLogout: () => void
  stats: { total: number; inProgress: number }
}

const menuItems: { id: AppView; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
  { id: 'overview', label: 'Tasks', icon: <ListTodo className="w-5 h-5" /> },
  { id: 'scheduled', label: 'Calendar', icon: <Calendar className="w-5 h-5" /> },
  { id: 'progress', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
  { id: 'in_progress', label: 'Team', icon: <Users className="w-5 h-5" /> },
]

export function Sidebar({ currentView, onNavigate, onHelp, onLogout, stats }: SidebarProps) {
  const taskBadge = stats.total > 0 ? stats.total : undefined

  return (
    <aside className="w-[220px] shrink-0 flex flex-col glass-sidebar border-r border-white/30 h-full overflow-hidden">
      <div className="p-5 pb-3">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-full bg-green-primary flex items-center justify-center">
            <span className="text-white text-xs font-bold">T</span>
          </div>
          <span className="text-lg font-bold text-text">Terrain</span>
        </div>
        <p className="text-[10px] font-semibold text-text uppercase tracking-widest mb-3">Menu</p>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const active = currentView === item.id
            const badge = item.id === 'overview' ? taskBadge : undefined
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer relative ${
                  active
                    ? 'bg-white/40 text-text backdrop-blur-md'
                    : 'text-text hover:bg-white/25'
                }`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-green-primary rounded-r-full -ml-3" />
                )}
                <span className={active ? 'text-green-primary' : 'text-text'}>{item.icon}</span>
                <span className="flex-1 text-left">{item.label}</span>
                {badge !== undefined && badge > 0 && (
                  <span className="badge badge-green text-[10px]">{badge}+</span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="px-5 mt-auto pb-5">
        <p className="text-[10px] font-semibold text-text uppercase tracking-widest mb-2">General</p>
        <nav className="space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-text hover:bg-white/25 cursor-pointer">
            <Settings className="w-4 h-4" />
            Settings
          </button>
          <button
            onClick={onHelp}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-text hover:bg-white/25 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            Help
          </button>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-text hover:bg-white/25 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </nav>
      </div>
    </aside>
  )
}
