import { Bell, Mail, Search } from 'lucide-react'

interface TopBarProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  userName: string
}

export function TopBar({ searchQuery, onSearchChange, userName }: TopBarProps) {
  return (
    <header className="shrink-0 flex items-center gap-4 px-5 py-3 glass-topbar">
      <div className="flex-1 max-w-lg">
        <div className="flex items-center w-full rounded-full glass-search border-[1.5px] border-white/20 transition-shadow focus-within:border-green-light/60 focus-within:shadow-[0_0_0_3px_rgba(64,145,108,0.25)]">
          <Search className="w-4 h-4 text-white/60 shrink-0 ml-4" />
          <input
            type="text"
            placeholder="Search task"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 min-w-0 py-2.5 pl-2.5 pr-2 text-sm bg-transparent border-0 outline-none text-white placeholder:text-white/45"
          />
          <kbd className="hidden sm:inline-flex items-center mr-3 px-1.5 py-0.5 text-[10px] text-white/50 bg-white/10 border border-white/20 rounded shrink-0">
            ⌘F
          </kbd>
        </div>
      </div>

      <button className="p-2 rounded-full hover:bg-white/10 text-white/70 cursor-pointer">
        <Mail className="w-4 h-4" />
      </button>
      <button className="p-2 rounded-full hover:bg-white/10 text-white/70 cursor-pointer relative">
        <Bell className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 pl-2 border-l border-white/15">
        <div className="w-8 h-8 rounded-full bg-green-primary text-white flex items-center justify-center text-xs font-bold shrink-0">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="hidden sm:block min-w-0">
          <p className="text-sm font-semibold text-white truncate leading-tight">{userName}</p>
          <p className="text-[10px] text-white/55 truncate">User</p>
        </div>
      </div>
    </header>
  )
}
