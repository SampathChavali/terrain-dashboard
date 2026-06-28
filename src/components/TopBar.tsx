import { Bell, Mail, Search } from 'lucide-react'

interface TopBarProps {
  searchQuery: string
  onSearchChange: (q: string) => void
  userName: string
}

export function TopBar({ searchQuery, onSearchChange, userName }: TopBarProps) {
  return (
    <header className="shrink-0 flex items-center gap-4 px-5 py-3 border-b border-border bg-white">
      <div className="flex-1 max-w-lg">
        <div className="flex items-center w-full rounded-full border-[1.5px] border-green-pale bg-white transition-shadow focus-within:border-green-light focus-within:shadow-[0_0_0_3px_rgba(183,228,199,0.35)]">
          <Search className="w-4 h-4 text-muted shrink-0 ml-4" />
          <input
            type="text"
            placeholder="Search task"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="flex-1 min-w-0 py-2.5 pl-2.5 pr-2 text-sm bg-transparent border-0 outline-none text-text placeholder:text-muted"
          />
          <kbd className="hidden sm:inline-flex items-center mr-3 px-1.5 py-0.5 text-[10px] text-muted bg-gray-50 border border-green-pale rounded shrink-0">
            ⌘F
          </kbd>
        </div>
      </div>

      <button className="p-2 rounded-full hover:bg-elevated text-muted cursor-pointer">
        <Mail className="w-4 h-4" />
      </button>
      <button className="p-2 rounded-full hover:bg-elevated text-muted cursor-pointer relative">
        <Bell className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-2 pl-2 border-l border-border">
        <div className="w-8 h-8 rounded-full bg-green-primary text-white flex items-center justify-center text-xs font-bold shrink-0">
          {userName.charAt(0).toUpperCase()}
        </div>
        <div className="hidden sm:block min-w-0">
          <p className="text-sm font-semibold text-text truncate leading-tight">{userName}</p>
          <p className="text-[10px] text-muted truncate">Admin</p>
        </div>
      </div>
    </header>
  )
}
