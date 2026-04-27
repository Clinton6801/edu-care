interface StatsCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  trend?: string
  color?: 'indigo' | 'emerald' | 'amber' | 'red'
}

const colorMap = {
  indigo: 'bg-indigo-500/10 text-indigo-400',
  emerald: 'bg-emerald-500/10 text-emerald-400',
  amber: 'bg-amber-500/10 text-amber-400',
  red: 'bg-red-500/10 text-red-400',
}

export function StatsCard({ label, value, icon, trend, color = 'indigo' }: StatsCardProps) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">{label}</p>
          <p className="text-3xl font-black text-white">{value}</p>
          {trend && <p className="text-xs text-zinc-500 mt-1">{trend}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  )
}
