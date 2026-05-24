import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { X, ArrowRight, ShieldAlert, CheckSquare, GraduationCap, FileText } from 'lucide-react'

const passos = [
  {
    path: '/dashboard',
    icon: ShieldAlert,
    titulo: '👋 Bem-vindo ao ClinicGuard!',
    desc: 'Este é o painel principal. Veja o Score Sanitário da clínica e os alertas ativos. Explore os módulos pelo menu lateral.',
    proximo: '/obrigacoes',
    proximoLabel: 'Ver Obrigações →',
  },
  {
    path: '/obrigacoes',
    icon: CheckSquare,
    titulo: '🚦 Semáforo Sanitário',
    desc: 'Aqui estão todas as obrigações sanitárias com status visual. Itens vermelhos precisam de ação imediata antes de uma fiscalização.',
    proximo: '/treinamentos',
    proximoLabel: 'Ver Treinamentos →',
  },
  {
    path: '/treinamentos',
    icon: GraduationCap,
    titulo: '✍️ Ciência Rastreável',
    desc: 'Cada colaborador assina digitalmente os POPs. O sistema registra IP, data e dispositivo — isso é prova jurídica real em caso de autuação.',
    proximo: '/fiscalizacao',
    proximoLabel: 'Ver Modo Fiscalização →',
  },
  {
    path: '/fiscalizacao',
    icon: ShieldAlert,
    titulo: '🔴 Modo Fiscalização',
    desc: 'Este é o recurso mais poderoso. Pressione o botão vermelho e veja como tudo se consolida em segundos. Impressione qualquer fiscal.',
    proximo: null,
    proximoLabel: null,
  },
]

export default function TourGuiado({ onClose }) {
  const navigate = useNavigate()
  const location = useLocation()
  const passo = passos.find(p => p.path === location.pathname)

  if (!passo) return null

  const { icon: Icon, titulo, desc, proximo, proximoLabel } = passo

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
      <div className="bg-gray-900 text-white rounded-2xl shadow-2xl p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold mb-1">{titulo}</p>
              <p className="text-xs text-gray-300 leading-relaxed">{desc}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
        {proximo && (
          <button
            onClick={() => navigate(proximo)}
            className="mt-3 w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-800 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
          >
            {proximoLabel} <ArrowRight className="w-3 h-3" />
          </button>
        )}
        <div className="flex gap-1 mt-3 justify-center">
          {passos.map((p, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all ${p.path === location.pathname ? 'w-6 bg-brand-400' : 'w-2 bg-gray-600'}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
