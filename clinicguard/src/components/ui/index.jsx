import clsx from 'clsx'

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function StatusBadge({ status, label }) {
  const map = {
    ok:      { cls: 'badge-ok',     text: label || 'OK' },
    ativo:   { cls: 'badge-ok',     text: label || 'Ativo' },
    alerta:  { cls: 'badge-warn',   text: label || 'Alerta' },
    revisao: { cls: 'badge-warn',   text: label || 'Em revisão' },
    vencido: { cls: 'badge-danger', text: label || 'Vencido' },
    inativo: { cls: 'badge-gray',   text: label || 'Inativo' },
  }
  const { cls, text } = map[status] || map['inativo']
  return <span className={cls}>{text}</span>
}

export function ScoreRing({ score, size = 80 }) {
  const r = (size / 2) - 8
  const circ = 2 * Math.PI * r
  const offset = circ - (score / 100) * circ
  const color = score >= 90 ? '#1D9E75' : score >= 70 ? '#EF9F27' : '#E24B4A'

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#F3F4F6" strokeWidth="7" />
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-lg font-bold text-gray-900 leading-none">{score}</p>
        <p className="text-[9px] text-gray-400 mt-0.5">score</p>
      </div>
    </div>
  )
}

export function EmptyState({ icon: Icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
        <Icon className="w-6 h-6 text-gray-400" />
      </div>
      <p className="text-sm font-medium text-gray-700">{title}</p>
      <p className="text-sm text-gray-400 mt-1 max-w-xs">{desc}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && <div className="px-5 py-3 bg-gray-50 rounded-b-2xl border-t border-gray-100 flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  )
}
