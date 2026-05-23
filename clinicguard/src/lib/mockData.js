// Simula banco de dados local para o protótipo
// Em produção, esses dados viriam da API/Supabase

export const mockClinica = {
  id: 1,
  nome: 'Odonto Central',
  rt: 'Dr. João Rocha',
  cnpj: '12.345.678/0001-90',
  responsavel: 'Dr. João Rocha',
  plano: 'Profissional',
  scoreGeral: 87,
}

export const mockPOPs = [
  { id: 1, titulo: 'Esterilização em Autoclave', categoria: 'Esterilização', versao: '2.1', status: 'ativo', validade: '2025-12-01', aprovadoPor: 'Dr. João Rocha', aprovadoEm: '2024-06-01', ciencias: 4, totalColaboradores: 5 },
  { id: 2, titulo: 'Controle Biológico', categoria: 'Biossegurança', versao: '1.3', status: 'ativo', validade: '2025-08-15', aprovadoPor: 'Dr. João Rocha', aprovadoEm: '2024-03-10', ciencias: 5, totalColaboradores: 5 },
  { id: 3, titulo: 'Gestão de Resíduos de Saúde', categoria: 'Resíduos', versao: '1.0', status: 'revisao', validade: '2024-07-01', aprovadoPor: null, aprovadoEm: null, ciencias: 0, totalColaboradores: 5 },
  { id: 4, titulo: 'Higienização das Mãos', categoria: 'Biossegurança', versao: '3.0', status: 'ativo', validade: '2026-01-10', aprovadoPor: 'Dr. João Rocha', aprovadoEm: '2024-01-10', ciencias: 5, totalColaboradores: 5 },
  { id: 5, titulo: 'Limpeza e Desinfecção de Superfícies', categoria: 'Higienização', versao: '2.0', status: 'ativo', validade: '2025-10-20', aprovadoPor: 'Dr. João Rocha', aprovadoEm: '2024-04-20', ciencias: 3, totalColaboradores: 5 },
  { id: 6, titulo: 'Descarte de Perfurocortantes', categoria: 'Resíduos', versao: '1.1', status: 'ativo', validade: '2025-11-05', aprovadoPor: 'Dr. João Rocha', aprovadoEm: '2024-05-05', ciencias: 4, totalColaboradores: 5 },
]

export const mockColaboradores = [
  { id: 1, nome: 'Ana Melo', cargo: 'Auxiliar de Saúde Bucal', email: 'ana@odocentral.com', avatar: 'AM' },
  { id: 2, nome: 'João Rocha', cargo: 'Responsável Técnico', email: 'joao@odocentral.com', avatar: 'JR' },
  { id: 3, nome: 'Carla Silva', cargo: 'Recepcionista', email: 'carla@odocentral.com', avatar: 'CS' },
  { id: 4, nome: 'Pedro Lima', cargo: 'Auxiliar de Saúde Bucal', email: 'pedro@odocentral.com', avatar: 'PL' },
  { id: 5, nome: 'Maria Borges', cargo: 'Higienizadora', email: 'maria@odocentral.com', avatar: 'MB' },
]

export const mockCiencias = [
  { id: 1, popId: 1, popTitulo: 'Esterilização em Autoclave', colaboradorId: 1, colaborador: 'Ana Melo', data: '2024-06-02', ip: '192.168.1.101', dispositivo: 'Chrome / Windows', assinado: true, quiz: 90 },
  { id: 2, popId: 1, popTitulo: 'Esterilização em Autoclave', colaboradorId: 2, colaborador: 'João Rocha', data: '2024-06-02', ip: '192.168.1.100', dispositivo: 'Safari / iPhone', assinado: true, quiz: 100 },
  { id: 3, popId: 1, popTitulo: 'Esterilização em Autoclave', colaboradorId: 3, colaborador: 'Carla Silva', data: '2024-06-03', ip: '192.168.1.103', dispositivo: 'Chrome / Android', assinado: true, quiz: 80 },
  { id: 4, popId: 1, popTitulo: 'Esterilização em Autoclave', colaboradorId: 4, colaborador: 'Pedro Lima', data: '2024-06-04', ip: '192.168.1.104', dispositivo: 'Firefox / Windows', assinado: true, quiz: 70 },
  { id: 5, popId: 1, popTitulo: 'Esterilização em Autoclave', colaboradorId: 5, colaborador: 'Maria Borges', data: null, ip: null, dispositivo: null, assinado: false, quiz: null },
]

export const mockObrigacoes = [
  { id: 1, nome: 'Controle Biológico Autoclave', categoria: 'Esterilização', periodicidade: 'Semanal', ultimaData: '2024-05-20', proximaData: '2024-05-27', status: 'vencido', responsavel: 'Ana Melo', documento: null },
  { id: 2, nome: 'PMOC — Manutenção Ar-Condicionado', categoria: 'Manutenção', periodicidade: 'Semestral', ultimaData: '2024-01-10', proximaData: '2024-07-10', status: 'alerta', responsavel: 'Dr. João Rocha', documento: 'pmoc_jan24.pdf' },
  { id: 3, nome: 'Dedetização', categoria: 'Controle de Pragas', periodicidade: 'Semestral', ultimaData: '2023-12-05', proximaData: '2024-06-05', status: 'alerta', responsavel: 'Dr. João Rocha', documento: 'dedet_dez23.pdf' },
  { id: 4, nome: 'Alvará Sanitário', categoria: 'Licença', periodicidade: 'Anual', ultimaData: '2024-03-01', proximaData: '2025-03-01', status: 'ok', responsavel: 'Dr. João Rocha', documento: 'alvara_2024.pdf' },
  { id: 5, nome: 'ASO — Admissional/Periódico', categoria: 'Medicina do Trabalho', periodicidade: 'Anual', ultimaData: '2024-02-15', proximaData: '2025-02-15', status: 'ok', responsavel: 'Dr. João Rocha', documento: 'aso_2024.pdf' },
  { id: 6, nome: 'Calibração Equipamentos', categoria: 'Manutenção', periodicidade: 'Anual', ultimaData: '2024-04-01', proximaData: '2025-04-01', status: 'ok', responsavel: 'Ana Melo', documento: 'calibracao_abr24.pdf' },
  { id: 7, nome: 'Vacinas — Hepatite B', categoria: 'Imunização', periodicidade: 'Conforme esquema', ultimaData: '2024-01-20', proximaData: '2024-07-20', status: 'alerta', responsavel: 'Dr. João Rocha', documento: null },
  { id: 8, nome: 'Manifesto de Resíduos (MTR)', categoria: 'Resíduos', periodicidade: 'Mensal', ultimaData: '2024-05-01', proximaData: '2024-06-01', status: 'ok', responsavel: 'Maria Borges', documento: 'mtr_mai24.pdf' },
]

export const mockDocumentos = [
  { id: 1, nome: 'Alvará Sanitário 2024', tipo: 'Licença', validade: '2025-03-01', tamanho: '1.2 MB', enviado: '2024-03-05', status: 'ok' },
  { id: 2, nome: 'PGRSS — Plano de Gerenciamento', tipo: 'Plano', validade: '2024-12-31', tamanho: '3.4 MB', enviado: '2024-01-10', status: 'ok' },
  { id: 3, nome: 'Contrato Empresa Resíduos', tipo: 'Contrato', validade: '2024-06-30', tamanho: '0.8 MB', enviado: '2024-01-15', status: 'alerta' },
  { id: 4, nome: 'ASO Equipe 2024', tipo: 'Medicina do Trabalho', validade: '2025-02-15', tamanho: '2.1 MB', enviado: '2024-02-20', status: 'ok' },
  { id: 5, nome: 'Laudo Técnico Autoclave', tipo: 'Laudo', validade: '2025-04-01', tamanho: '1.5 MB', enviado: '2024-04-03', status: 'ok' },
]

// Calcula status de uma data
export function calcStatus(dataStr) {
  if (!dataStr) return 'vencido'
  const hoje = new Date()
  const data = new Date(dataStr)
  const diff = Math.ceil((data - hoje) / (1000 * 60 * 60 * 24))
  if (diff < 0) return 'vencido'
  if (diff <= 30) return 'alerta'
  return 'ok'
}

export function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('pt-BR')
}
