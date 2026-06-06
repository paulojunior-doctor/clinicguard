import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { Navigate } from 'react-router-dom'

export default function SuperAdmin() {
  const { isSuperAdmin, loading } = useAuth()
  const [clinicas, setClinicas] = useState([])
  const [stats, setStats] = useState({})
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    if (!isSuperAdmin) return
    carregarDados()
  }, [isSuperAdmin])

  const carregarDados = async () => {
    const { data: clinicasData } = await supabase
      .from('clinicas')
      .select('*')
      .order('created_at', { ascending: false })

    if (clinicasData) {
      setClinicas(clinicasData)
      const statsTemp = {}
      for (const clinica of clinicasData) {
        const [{ count: colab }, { count: ciencias }, { count: obrig }] = await Promise.all([
          supabase.from('colaboradores').select('*', { count: 'exact', head: true }).eq('clinica_id', clinica.id),
          supabase.from('ciencias').select('*', { count: 'exact', head: true }).eq('clinica_id', clinica.id),
          supabase.from('obrigacoes').select('*', { count: 'exact', head: true }).eq('clinica_id', clinica.id).eq('status', 'vencido'),
        ])
        statsTemp[clinica.id] = { colab, ciencias, obrig }
      }
      setStats(statsTemp)
    }
    setCarregando(false)
  }

  if (loading) return null
  if (!isSuperAdmin) return <Navigate to="/dashboard" replace />

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Painel Superadmin</h1>
        <p className="text-gray-500 mt-1">Visão geral de todas as clínicas piloto</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <p className="text-sm text-green-600 font-medium">Total de Clínicas</p>
          <p className="text-3xl font-bold text-green-700 mt-1">{clinicas.length}</p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-600 font-medium">Total de Colaboradores</p>
          <p className="text-3xl font-bold text-blue-700 mt-1">
            {Object.values(stats).reduce((a, b) => a + (b.colab || 0), 0)}
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-600 font-medium">Obrigações Vencidas (total)</p>
          <p className="text-3xl font-bold text-red-700 mt-1">
            {Object.values(stats).reduce((a, b) => a + (b.obrig || 0), 0)}
          </p>
        </div>
      </div>

      {carregando ? (
        <p className="text-gray-400">Carregando clínicas...</p>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left p-4 font-medium text-gray-600">Clínica</th>
                <th className="text-center p-4 font-medium text-gray-600">Colaboradores</th>
                <th className="text-center p-4 font-medium text-gray-600">Ciências</th>
                <th className="text-center p-4 font-medium text-gray-600">Obrig. Vencidas</th>
                <th className="text-left p-4 font-medium text-gray-600">Cadastro</th>
              </tr>
            </thead>
            <tbody>
              {clinicas.map((c, i) => (
                <tr key={c.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{c.nome}</p>
                    <p className="text-xs text-gray-400">{c.cidade || '—'}</p>
                  </td>
                  <td className="p-4 text-center text-gray-700">{stats[c.id]?.colab ?? '—'}</td>
                  <td className="p-4 text-center text-gray-700">{stats[c.id]?.ciencias ?? '—'}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      stats[c.id]?.obrig > 0
                        ? 'bg-red-100 text-red-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {stats[c.id]?.obrig ?? '—'}
                    </span>
                  </td>
                  <td className="p-4 text-gray-500 text-xs">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString('pt-BR') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
