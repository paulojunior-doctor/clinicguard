import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, GraduationCap, CheckSquare, Shield, FolderOpen, LogOut, ShieldAlert, Users } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import clsx from 'clsx'

const nav = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pops',          icon: FileText,         label: 'POPs' },
  { to: '/colaboradores', icon: Users,            label: 'Colaboradores' },
  { to: '/treinamentos',  icon: GraduationCap,    label: 'Treinamentos' },
  { to: '/obrigacoes',    icon: CheckSquare,      label: 'Obrigações' },
  { to: '/documentos',    icon: FolderOpen,       label: 'Cofre Digital' },
  { to: '/fiscalizacao',  icon: ShieldAlert,      label: 'Modo Fiscalização', highlight: true },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <aside className="w-56 bg-white border-r border-gray-100 flex flex-col h-screen sticky top-0 flex-shrink-0">
      <div className="px-4 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 leading-none">ClinicGuard</p>
            <p className="text-[10px] text-gray-400 mt-0.5">Compliance Sanitário</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-2 py-1.5">Menu</p>
        {nav.map(({ to, icon: Icon, label, highlight }) => (
          <NavLink key={to} to={to}
            className={({ isActive }) => clsx(
              'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors',
              highlight
                ? isActive ? 'bg-red-50 text-red-700 font-medium' : 'text-red-600 hover:bg-red-50 font-medium'
                : isActive ? 'bg-brand-50 text-brand-600 font-medium' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-gray-100">
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-gray-50 mb-2">
          <div className="w-7 h-7 rounded-full bg-brand-600 flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0">PV</div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900 truncate">{user?.clinica || 'Buccal Odontologia'}</p>
            <p className="text-[10px] text-gray-400">Plano Profissional</p>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/login') }}
          className="flex items-center gap-2 w-full px-2 py-1.5 text-sm text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </div>
    </aside>
  )
}
