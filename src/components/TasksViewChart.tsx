import type { ChartDay } from '../types'

interface TasksViewChartProps {
  data: ChartDay[]
  totalUpdates: number
  completionRate: number
}

export function TasksViewChart({ data, totalUpdates, completionRate }: TasksViewChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const peak = data.reduce((best, d) => (d.value > best.value ? d : best), data[0])
  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div className="card h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-text">Task Analytics</h3>
        <select className="text-xs text-muted border border-border rounded-lg px-2 py-1 cursor-pointer">
          <option>Last 7 days</option>
        </select>
      </div>

      <div className="flex items-end gap-3 mb-2">
        <span className="text-3xl font-bold text-text">{totalUpdates}</span>
        <span className="flex items-center gap-1 text-xs font-medium text-green-primary mb-1">
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
            <path d="M6 2L10 8H2L6 2Z" />
          </svg>
          +{completionRate}%
        </span>
        <span className="text-xs text-muted mb-1">daily updates</span>
      </div>

      <div className="flex-1 flex items-end gap-3 pt-4 min-h-[160px]">
        {data.map((day, i) => {
          const heightPct = (day.value / maxValue) * 100
          const isPeak = day.date === peak.date && day.value > 0

          return (
            <div key={day.date} className="flex-1 flex flex-col items-center gap-2 relative">
              {isPeak && (
                <div className="absolute -top-8 bg-green-primary text-white text-[10px] font-semibold px-2 py-1 rounded-md whitespace-nowrap">
                  {day.value} updates
                </div>
              )}
              <div className="w-full flex items-end justify-center h-28">
                <div
                  className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 ${
                    isPeak ? 'bg-green-primary' : day.isToday ? 'bg-green-mid' : 'bg-green-pale'
                  }`}
                  style={{ height: `${Math.max(heightPct, day.value > 0 ? 8 : 4)}%` }}
                />
              </div>
              <span className={`text-xs ${day.isToday ? 'font-semibold text-text' : 'text-muted'}`}>
                {dayLabels[i]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
