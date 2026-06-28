interface StatusDonutProps {
  scheduled: number
  inProgress: number
  released: number
}

export function StatusDonut({ scheduled, inProgress, released }: StatusDonutProps) {
  const total = scheduled + inProgress + released || 1
  const segments = [
    { label: 'Scheduled', value: scheduled, color: '#e5e7eb', pct: (scheduled / total) * 100 },
    { label: 'In Progress', value: inProgress, color: '#40916c', pct: (inProgress / total) * 100 },
    { label: 'Released', value: released, color: '#1b4332', pct: (released / total) * 100 },
  ]

  let offset = 0
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const dominant = segments.reduce((a, b) => (a.pct > b.pct ? a : b))

  return (
    <div className="card h-full flex flex-col">
      <h3 className="text-base font-semibold text-text mb-6">Status</h3>

      <div className="flex-1 flex flex-col items-center justify-center">
        <div className="relative">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="14" />
            {segments.map((seg) => {
              const dash = (seg.pct / 100) * circumference
              const el = (
                <circle
                  key={seg.label}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="14"
                  strokeDasharray={`${dash} ${circumference - dash}`}
                  strokeDashoffset={-offset}
                  transform="rotate(-90 70 70)"
                  className="transition-all duration-500"
                />
              )
              offset += dash
              return el
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-text">{dominant.pct.toFixed(1)}%</span>
            <span className="text-[10px] text-muted">{dominant.label}</span>
          </div>
        </div>

        <div className="w-full mt-6 space-y-2.5">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: seg.color }} />
                <span className="text-muted">{seg.label}</span>
              </div>
              <span className="font-medium text-text">
                {seg.value} ({seg.pct.toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
