import { useNavigate } from 'react-router-dom'
import { Shield, CheckCircle, ShieldAlert, FileText, GraduationCap, BarChart3, ArrowRight, Star } from 'lucide-react'

const features = [
  { icon: FileText,      title: 'POPs com assinatura digital',    desc: 'Procedimentos aprovados pelo RT com rastreabilidade jurídica completa.' },
  { icon: GraduationCap, title: 'Ciência rastreável dos colaboradores', desc: 'Cada funcionário assina digitalmente com registro de IP, data e dispositivo.' },
  { icon: BarChart3,     title: 'Score sanitário em tempo real',  desc: 'Semáforo visual de todas as obrigações sanitárias com alertas automáticos.' },
  { icon: ShieldAlert,   title: 'Modo Fiscalização',              desc: 'Um botão consolida todos os documentos e gera relatório jurídico em segundos.' },
]

const depoimentos = [
  { nome: 'Dra. Camila Torres', clinica: 'Clínica Torres Odontologia — SP', texto: 'A vigilância apareceu sem aviso. Apertei um botão e tinha tudo organizado na hora. O fiscal ficou impressionado.' },
  { nome: 'Dr. Rafael Mendes', clinica: 'Instituto Mendes — RJ', texto: 'Antes eu não dormia na véspera de fiscalização. Hoje tenho 94 de score sanitário e total tranquilidade.' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100 max-w-6xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-semibold text-gray-900">ClinicGuard</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Já sou cadastrado
          </button>
          <button
            onClick={() => navigate('/cadastro')}
            className="btn-primary flex items-center gap-2"
          >
            Acessar plataforma <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-600 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
          <Shield className="w-3 h-3" /> Compliance Sanitário para Clínicas
        </div>
        <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
          Nunca mais ser pego<br />de surpresa numa fiscalização
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
          O ClinicGuard organiza todos os documentos, treinamentos e obrigações sanitárias da sua clínica em um único lugar — com evidência jurídica real.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            onClick={() => navigate('/cadastro')}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-800 text-white font-semibold px-6 py-3 rounded-xl transition-colors shadow-sm text-sm"
          >
            Criar conta gratuita <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Já tenho conta → Entrar
          </button>
        </div>
      </section>

      {/* Score preview */}
      <section className="max-w-3xl mx-auto px-6 mb-16">
        <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white/70 text-sm">Score Sanitário</p>
              <p className="text-2xl font-bold">Clínica Exemplo — 87/100</p>
              <p className="text-white/70 text-sm mt-1">3 itens críticos pendentes</p>
            </div>
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-2xl font-bold">87</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'POPs ativos', value: '24', ok: true },
              { label: 'Ciências pendentes', value: '3', ok: false },
              { label: 'Docs no cofre', value: '18', ok: true },
              { label: 'Obrigações em dia', value: '91%', ok: true },
            ].map(({ label, value, ok }) => (
              <div key={label} className="bg-white/10 rounded-xl p-3">
                <p className="text-2xl font-bold">{value}</p>
                <p className="text-white/70 text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 mb-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Tudo que sua clínica precisa</h2>
        <p className="text-gray-500 text-center mb-10 text-sm">Do POP ao relatório de fiscalização — em um único sistema</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-brand-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900 mb-1">{title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modo Fiscalização destaque */}
      <section className="max-w-3xl mx-auto px-6 mb-16">
        <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">Modo Fiscalização</p>
              <p className="text-xs text-gray-500">O recurso mais poderoso do ClinicGuard</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            Quando a vigilância sanitária chega, você pressiona um botão. O sistema consolida automaticamente todos os POPs, assinaturas, treinamentos e documentos em um relatório PDF com validade jurídica — em menos de 10 segundos.
          </p>
          <div className="flex items-center gap-2 text-xs text-red-700 font-medium">
            <CheckCircle className="w-4 h-4" />
            Inclui hash SHA-256, registro de IP e carimbo de tempo
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="max-w-4xl mx-auto px-6 mb-16">
        <h2 className="text-xl font-bold text-gray-900 text-center mb-8">O que dizem nossos clientes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {depoimentos.map(({ nome, clinica, texto }) => (
            <div key={nome} className="card p-5">
              <div className="flex gap-1 mb-3">
                {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />)}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">"{texto}"</p>
              <div>
                <p className="text-xs font-semibold text-gray-900">{nome}</p>
                <p className="text-xs text-gray-400">{clinica}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-2xl mx-auto px-6 pb-16 text-center">
        <div className="bg-brand-600 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-white mb-2">Pronto para ter sua clínica 100% segura?</h2>
          <p className="text-white/70 text-sm mb-6">Crie sua conta agora e veja como funciona na prática</p>
          <button
            onClick={() => navigate('/cadastro')}
            className="bg-white text-brand-600 font-bold px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors text-sm flex items-center gap-2 mx-auto"
          >
            Criar conta gratuita <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-white/50 text-xs mt-3">
            Já tem conta?{' '}
            <button onClick={() => navigate('/login')} className="underline hover:text-white/80 transition-colors">
              Entrar aqui
            </button>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 text-center">
        <p className="text-xs text-gray-400">© 2024 ClinicGuard · Compliance Sanitário · Todos os direitos reservados</p>
      </footer>
    </div>
  )
}
