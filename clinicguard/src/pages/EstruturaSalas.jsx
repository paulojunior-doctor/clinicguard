import { useState } from "react";

// ─── TIPOS DE SALA — RDC 1.002/2025 ──────────────────────────────────────────
const TIPOS_SALA = [
  {
    id: "sem_anestesia",
    label: "Ambiente sem anestesia",
    subtitulo: "Procedimentos sem equipo odontológico e sem anestesia",
    area_min: 7.5,
    dim_min: null,
    complexidade: "A",
    requisitos: [
      { id: "lavatório", texto: "Lavatório com água corrente exclusivo para higienização das mãos", obrigatorio: true },
      { id: "alcool", texto: "Dispensador de preparação alcoólica para higiene das mãos identificado", obrigatorio: true },
      { id: "bancada", texto: "Bancada de apoio", obrigatorio: true },
      { id: "foco", texto: "Foco de luz para procedimentos intraorais", obrigatorio: true },
      { id: "ventilacao", texto: "Ventilação natural ou sistema de climatização (ABNT NBR 7256)", obrigatorio: true },
      { id: "eletrica", texto: "Instalação elétrica planejada e dimensionada para os equipamentos", obrigatorio: true },
    ]
  },
  {
    id: "classe_i",
    label: "Consultório Classe I — sem sedação",
    subtitulo: "Consultório padrão sem sedação",
    area_min: 9,
    dim_min: 2.20,
    complexidade: "A",
    requisitos: [
      { id: "lavatório", texto: "Lavatório com água corrente exclusivo para higienização das mãos", obrigatorio: true },
      { id: "alcool", texto: "Dispensador de preparação alcoólica identificado", obrigatorio: true },
      { id: "bancada", texto: "Bancada de apoio", obrigatorio: true },
      { id: "ar_comprimido", texto: "Instalação de ar comprimido", obrigatorio: true },
      { id: "agua_fria", texto: "Instalação de água fria", obrigatorio: true },
      { id: "compressor", texto: "Compressor de ar adequado para uso em serviços de saúde com filtro regulador", obrigatorio: true },
      { id: "ventilacao", texto: "Ventilação natural ou sistema de climatização (ABNT NBR 7256)", obrigatorio: true },
      { id: "eletrica", texto: "Instalação elétrica planejada e dimensionada", obrigatorio: true },
    ]
  },
  {
    id: "classe_i_inalatoria",
    label: "Consultório Classe I — com sedação inalatória",
    subtitulo: "Óxido nitroso (N₂O) — sedação consciente",
    area_min: 9,
    dim_min: 2.20,
    complexidade: "A",
    requisitos: [
      { id: "lavatório", texto: "Lavatório com água corrente exclusivo para higienização das mãos", obrigatorio: true },
      { id: "alcool", texto: "Dispensador de preparação alcoólica identificado", obrigatorio: true },
      { id: "bancada", texto: "Bancada de apoio", obrigatorio: true },
      { id: "ar_comprimido", texto: "Instalação de ar comprimido", obrigatorio: true },
      { id: "agua_fria", texto: "Instalação de água fria", obrigatorio: true },
      { id: "compressor", texto: "Compressor de ar com proteção acústica e filtro regulador", obrigatorio: true },
      { id: "gases", texto: "Sistema de fornecimento de gases medicinais (oxigênio e óxido nitroso)", obrigatorio: true },
      { id: "exaustao", texto: "Sistema de exaustão para diluição de resíduos de gás anestésico", obrigatorio: true },
      { id: "eletrostatica", texto: "Segurança eletrostática conforme orientação do fabricante dos equipamentos de gases", obrigatorio: true },
      { id: "ventilacao", texto: "Sistema de climatização (ABNT NBR 7256)", obrigatorio: true },
      { id: "monitor", texto: "Monitor multiparâmetros e equipamentos de emergência (Art. 36)", obrigatorio: true },
      { id: "dea", texto: "DEA (Desfibrilador Externo Automático) acessível", obrigatorio: true },
    ]
  },
  {
    id: "classe_ii",
    label: "Consultório Classe II — sedação endovenosa",
    subtitulo: "Anestesia endovenosa — maior complexidade",
    area_min: 12,
    dim_min: 3.00,
    complexidade: "A",
    requisitos: [
      { id: "lavatório", texto: "Lavatório com água corrente exclusivo para higienização das mãos", obrigatorio: true },
      { id: "alcool", texto: "Dispensador de preparação alcoólica identificado", obrigatorio: true },
      { id: "bancada", texto: "Bancada de apoio", obrigatorio: true },
      { id: "ar_comprimido", texto: "Instalação de ar comprimido", obrigatorio: true },
      { id: "agua_fria", texto: "Instalação de água fria", obrigatorio: true },
      { id: "oxigenio", texto: "Fonte de Oxigênio (FO) — cilindro ou rede canalizada", obrigatorio: true },
      { id: "vacuo", texto: "Fonte de Vácuo Clínico (FVC) — para aspiração de vias aéreas", obrigatorio: true },
      { id: "nobreak", texto: "Ponto de energia elétrica com sistema de emergência (EE) ou nobreak", obrigatorio: true },
      { id: "recuperacao", texto: "Área/sala de recuperação pós-anestésica — mínimo 10 m² por leito", obrigatorio: true },
      { id: "porta_maca", texto: "Porta para passagem de maca de emergência — mínimo 1,10 m de vão livre", obrigatorio: true },
      { id: "rota_maca", texto: "Rota acessível para maca de emergência", obrigatorio: true },
      { id: "climatizacao", texto: "Sistema de ventilação e climatização (ABNT NBR 7256)", obrigatorio: true },
      { id: "monitor", texto: "Monitor multiparâmetros e equipamentos de emergência (Art. 36)", obrigatorio: true },
      { id: "dea", texto: "DEA (Desfibrilador Externo Automático) acessível", obrigatorio: true },
    ]
  },
  {
    id: "coletivo",
    label: "Consultório Odontológico Coletivo",
    subtitulo: "Boxes — clínicas escola, convênios, atendimento em volume",
    area_min: 9,
    dim_min: 2.50,
    complexidade: "A",
    requisitos: [
      { id: "separacao", texto: "Dispositivos de separação entre cadeiras com altura mínima de 2,0 m", obrigatorio: true },
      { id: "lavatório", texto: "Lavatório com água corrente exclusivo para higienização das mãos", obrigatorio: true },
      { id: "alcool", texto: "Dispensador de preparação alcoólica identificado", obrigatorio: true },
      { id: "bancada", texto: "Bancada de apoio", obrigatorio: true },
      { id: "ar_comprimido", texto: "Instalação de ar comprimido", obrigatorio: true },
      { id: "agua_fria", texto: "Instalação de água fria", obrigatorio: true },
      { id: "compressor", texto: "Compressor de ar em local exclusivo com proteção acústica", obrigatorio: true },
      { id: "climatizacao", texto: "Sistema de ventilação e climatização (ABNT NBR 7256)", obrigatorio: true },
      { id: "sem_radiologia", texto: "PROIBIDO uso de equipamento emissor de radiação ionizante nos boxes", obrigatorio: true },
    ]
  },
  {
    id: "imagem",
    label: "Sala de Imagem Odontológica",
    subtitulo: "Radiografia intraoral, panorâmica, tomografia",
    area_min: null,
    dim_min: null,
    complexidade: "A",
    requisitos: [
      { id: "lavatório", texto: "Lavatório com água corrente exclusivo para higienização das mãos", obrigatorio: true },
      { id: "climatizacao", texto: "Sistema de ventilação e climatização (ABNT NBR 7256)", obrigatorio: true },
      { id: "blindagem", texto: "Projeto de blindagem aprovado na VISA (RDC 611/2022) — quando houver emissor de radiação ionizante", obrigatorio: true },
      { id: "equipamento_unico", texto: "Proibição de mais de um equipamento emissor de radiação ionizante por sala", obrigatorio: true },
      { id: "eletrica", texto: "Instalação elétrica planejada e dimensionada", obrigatorio: true },
      { id: "cadastro_visa", texto: "Equipamento cadastrado na VISA local (Art. 139)", obrigatorio: true },
      { id: "vestimenta", texto: "Vestimenta plumbífera mínimo 0,25 mm Pb por equipamento (Art. 144)", obrigatorio: true },
    ]
  },
  {
    id: "cco",
    label: "Centro Cirúrgico Odontológico (CCO)",
    subtitulo: "Complexidade B — cirurgias em regime não hospitalar",
    area_min: 20,
    dim_min: 3.45,
    complexidade: "B",
    requisitos: [
      { id: "recepcao_preparo", texto: "Área de recepção e preparo de paciente", obrigatorio: true },
      { id: "lavabo", texto: "Lavabo cirúrgico", obrigatorio: true },
      { id: "recuperacao", texto: "Área de recuperação pós-anestésica com posto de enfermagem", obrigatorio: true },
      { id: "oxigenio", texto: "Fonte de Oxigênio (FO) — cilindro ou rede canalizada", obrigatorio: true },
      { id: "vacuo", texto: "Fonte de Vácuo Clínico (FVC)", obrigatorio: true },
      { id: "ar_medicinal", texto: "Fonte de Ar Comprimido Medicinal (FAM) se necessário", obrigatorio: false },
      { id: "nobreak", texto: "Sistema de emergência elétrica (EE) ou nobreak", obrigatorio: true },
      { id: "climatizacao", texto: "Sistema de ventilação e climatização (ABNT NBR 7256)", obrigatorio: true },
      { id: "expurgo", texto: "Expurgo", obrigatorio: true },
      { id: "vestiarios", texto: "Vestiários/sanitários de barreira — masculino e feminino", obrigatorio: true },
      { id: "dml", texto: "Área/sala exclusiva para depósito de material de limpeza com tanque", obrigatorio: true },
      { id: "deposito", texto: "Área/sala exclusiva para depósito de equipamentos e materiais", obrigatorio: true },
      { id: "pe_direito", texto: "Pé-direito útil de 2,7 m", obrigatorio: true },
    ]
  },
  {
    id: "processamento",
    label: "Sala de Processamento de Dispositivos Médicos",
    subtitulo: "CME — Central de Material e Esterilização",
    area_min: 4.8,
    dim_min: 1.30,
    complexidade: "A",
    requisitos: [
      { id: "area_suja_limpa", texto: "Divisão em área suja (limpeza) e área limpa (esterilização) com barreira física mínima de 50 cm", obrigatorio: true },
      { id: "cuba", texto: "Cuba para lavagem com afastamento mínimo de 30 cm em pelo menos um dos lados", obrigatorio: true },
      { id: "bancada_min", texto: "Bancada de preparo com comprimento mínimo de 1,0 m", obrigatorio: true },
      { id: "climatizacao", texto: "Sistema de climatização adequado", obrigatorio: true },
      { id: "alcool", texto: "Dispensador de preparação alcoólica na área limpa", obrigatorio: true },
      { id: "fluxo", texto: "Fluxo unidirecional: sempre da área suja para a área limpa", obrigatorio: true },
    ]
  },
];

const COR_COMPLEXIDADE = { A: "#0369a1", B: "#dc2626" };

function calcularArea(l, c) {
  const larg = parseFloat(l);
  const comp = parseFloat(c);
  if (!larg || !comp || isNaN(larg) || isNaN(comp)) return null;
  return Math.round(larg * comp * 100) / 100;
}

function StatusArea({ area, tipo }) {
  if (!area || !tipo) return null;
  const t = TIPOS_SALA.find(t => t.id === tipo);
  if (!t || !t.area_min) return (
    <div style={{ fontSize: 12, color: "#0369a1", marginTop: 6 }}>
      ℹ️ Área calculada: <strong>{area} m²</strong> — dimensão mínima conforme projeto aprovado pela VISA
    </div>
  );
  const ok = area >= t.area_min;
  const okDim = !t.dim_min;
  return (
    <div style={{ marginTop: 8, padding: "10px 13px", borderRadius: 8, background: ok ? "#f0fdf4" : "#fef2f2", border: `1px solid ${ok ? "#bbf7d0" : "#fecaca"}` }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <div>
          <span style={{ fontSize: 11, color: "#64748b" }}>Área calculada: </span>
          <strong style={{ fontSize: 14, color: ok ? "#16a34a" : "#dc2626" }}>{area} m²</strong>
        </div>
        <div>
          <span style={{ fontSize: 11, color: "#64748b" }}>Mínimo exigido: </span>
          <strong style={{ fontSize: 14, color: "#475569" }}>{t.area_min} m²</strong>
        </div>
        {t.dim_min && (
          <div>
            <span style={{ fontSize: 11, color: "#64748b" }}>Dimensão mínima: </span>
            <strong style={{ fontSize: 14, color: "#475569" }}>{t.dim_min} m</strong>
          </div>
        )}
        <div style={{ marginLeft: "auto" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: ok ? "#16a34a" : "#dc2626" }}>
            {ok ? "✓ CONFORME" : "✗ NÃO CONFORME"}
          </span>
        </div>
      </div>
      {!ok && (
        <div style={{ marginTop: 6, fontSize: 12, color: "#dc2626" }}>
          ⚠️ Área insuficiente — faltam {Math.round((t.area_min - area) * 100) / 100} m² para atingir o mínimo exigido pela RDC 1.002/2025.
        </div>
      )}
    </div>
  );
}

function CardSala({ sala, index, onChange, onRemover }) {
  const tipo = TIPOS_SALA.find(t => t.id === sala.tipo);
  const area = calcularArea(sala.largura, sala.comprimento);
  const areaOk = area && tipo?.area_min ? area >= tipo.area_min : true;
  const reqOk = tipo ? tipo.requisitos.filter(r => r.obrigatorio).every(r => sala.requisitos?.[r.id]) : true;
  const conformidade = areaOk && reqOk;

  return (
    <div style={{
      background: "#fff", borderRadius: 14, border: `2px solid ${conformidade ? "#e2e8f0" : "#fecaca"}`,
      overflow: "hidden", marginBottom: 16,
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
    }}>
      {/* Cabeçalho da sala */}
      <div style={{ background: conformidade ? "#0f172a" : "#fef2f2", padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ background: conformidade ? "#1e293b" : "#fee2e2", borderRadius: 8, padding: "6px 12px", fontSize: 13, fontWeight: 700, color: conformidade ? "#94a3b8" : "#dc2626" }}>
            Sala {index + 1}
          </div>
          <input
            value={sala.nome || ""}
            onChange={e => onChange("nome", e.target.value)}
            placeholder="Nome da sala (ex: Consultório 01)"
            style={{ background: "transparent", border: "none", fontSize: 15, fontWeight: 600, color: conformidade ? "#f1f5f9" : "#dc2626", outline: "none", minWidth: 200 }}
          />
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: conformidade ? "#16a34a" : "#dc2626", color: "#fff" }}>
            {conformidade ? "✓ Conforme" : "✗ Pendente"}
          </span>
          <button onClick={onRemover} style={{ background: "none", border: "none", color: conformidade ? "#64748b" : "#dc2626", cursor: "pointer", fontSize: 18, padding: "0 4px" }}>✕</button>
        </div>
      </div>

      <div style={{ padding: "20px" }}>
        {/* Tipo de sala */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".5px", display: "block", marginBottom: 6 }}>
            Tipo de Sala — RDC 1.002/2025 Art. 11 *
          </label>
          <select
            value={sala.tipo || ""}
            onChange={e => onChange("tipo", e.target.value)}
            style={{ width: "100%", padding: "10px 13px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, color: "#1e293b", background: "#f8fafc", outline: "none" }}
          >
            <option value="">Selecione o tipo de sala...</option>
            {TIPOS_SALA.map(t => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
          {tipo && (
            <div style={{ marginTop: 6, fontSize: 12, color: "#64748b", display: "flex", gap: 10, alignItems: "center" }}>
              <span>{tipo.subtitulo}</span>
              <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 20, background: COR_COMPLEXIDADE[tipo.complexidade] + "15", color: COR_COMPLEXIDADE[tipo.complexidade] }}>
                Complexidade {tipo.complexidade}
              </span>
            </div>
          )}
        </div>

        {/* Dimensões */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".5px", display: "block", marginBottom: 8 }}>
            Dimensões da Sala (metros) *
          </label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 24px 1fr 24px 1fr", gap: 8, alignItems: "center" }}>
            <div>
              <input
                type="number" step="0.01" min="0"
                value={sala.largura || ""}
                onChange={e => onChange("largura", e.target.value)}
                placeholder="Largura"
                style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", textAlign: "center" }}
              />
              <div style={{ fontSize: 10, color: "#94a3b8", textAlign: "center", marginTop: 3 }}>Largura (m)</div>
            </div>
            <div style={{ textAlign: "center", fontSize: 16, color: "#94a3b8", fontWeight: 700 }}>×</div>
            <div>
              <input
                type="number" step="0.01" min="0"
                value={sala.comprimento || ""}
                onChange={e => onChange("comprimento", e.target.value)}
                placeholder="Comprimento"
                style={{ width: "100%", padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 13, outline: "none", textAlign: "center" }}
              />
              <div style={{ fontSize: 10, color: "#94a3b8", textAlign: "center", marginTop: 3 }}>Comprimento (m)</div>
            </div>
            <div style={{ textAlign: "center", fontSize: 16, color: "#94a3b8", fontWeight: 700 }}>=</div>
            <div>
              <div style={{ padding: "9px 12px", border: "1.5px solid #e2e8f0", borderRadius: 8, fontSize: 14, fontWeight: 700, textAlign: "center", background: area ? (areaOk ? "#f0fdf4" : "#fef2f2") : "#f8fafc", color: area ? (areaOk ? "#16a34a" : "#dc2626") : "#94a3b8" }}>
                {area ? `${area} m²` : "— m²"}
              </div>
              <div style={{ fontSize: 10, color: "#94a3b8", textAlign: "center", marginTop: 3 }}>Área total</div>
            </div>
          </div>
          <StatusArea area={area} tipo={sala.tipo} />
        </div>

        {/* Checklist de requisitos */}
        {tipo && (
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10 }}>
              Checklist de Requisitos — RDC 1.002/2025
              <span style={{ marginLeft: 8, fontSize: 11, fontWeight: 600, color: reqOk ? "#16a34a" : "#ca8a04" }}>
                ({tipo.requisitos.filter(r => sala.requisitos?.[r.id]).length}/{tipo.requisitos.length} atendidos)
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {tipo.requisitos.map(req => {
                const marcado = sala.requisitos?.[req.id] || false;
                return (
                  <label key={req.id} style={{
                    display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer",
                    padding: "10px 12px", borderRadius: 8,
                    background: marcado ? "#f0fdf4" : req.obrigatorio ? "#fffbeb" : "#f8fafc",
                    border: `1px solid ${marcado ? "#bbf7d0" : req.obrigatorio ? "#fde68a" : "#e2e8f0"}`,
                    transition: "background .1s"
                  }}>
                    <input
                      type="checkbox"
                      checked={marcado}
                      onChange={e => onChange("requisitos", { ...sala.requisitos, [req.id]: e.target.checked })}
                      style={{ marginTop: 2, flexShrink: 0, accentColor: "#16a34a", width: 14, height: 14 }}
                    />
                    <span style={{ fontSize: 12, color: marcado ? "#166534" : "#334155", lineHeight: 1.5 }}>
                      {req.texto}
                      {req.obrigatorio && !marcado && <span style={{ color: "#dc2626", marginLeft: 4 }}>*</span>}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function EstruturaSalas() {
  const STORAGE_KEY = "clinicguard_estrutura_salas";

  const [salas, setSalas] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
    catch { return []; }
  });
  const [salvo, setSalvo] = useState(false);
  const [salvando, setSalvando] = useState(false);

  function addSala() {
    setSalas(prev => [...prev, { id: Date.now(), nome: "", tipo: "", largura: "", comprimento: "", requisitos: {} }]);
  }

  function updateSala(index, campo, valor) {
    setSalas(prev => prev.map((s, i) => i === index ? { ...s, [campo]: valor } : s));
    setSalvo(false);
  }

  function removerSala(index) {
    if (window.confirm("Remover esta sala?")) {
      setSalas(prev => prev.filter((_, i) => i !== index));
      setSalvo(false);
    }
  }

  function salvar() {
    setSalvando(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(salas));
    setTimeout(() => { setSalvando(false); setSalvo(true); setTimeout(() => setSalvo(false), 3000); }, 500);
  }

  // Métricas gerais
  const totalSalas = salas.length;
  const salasConformes = salas.filter(sala => {
    const tipo = TIPOS_SALA.find(t => t.id === sala.tipo);
    if (!tipo) return false;
    const area = calcularArea(sala.largura, sala.comprimento);
    const areaOk = area && tipo.area_min ? area >= tipo.area_min : true;
    const reqOk = tipo.requisitos.filter(r => r.obrigatorio).every(r => sala.requisitos?.[r.id]);
    return areaOk && reqOk;
  }).length;
  const pct = totalSalas > 0 ? Math.round((salasConformes / totalSalas) * 100) : 0;

  return (
    <div style={{ fontFamily: "'IBM Plex Sans',system-ui,sans-serif", background: "#f1f5f9", minHeight: "100vh" }}>

      {/* HEADER */}
      <div style={{ background: "#0f172a", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>Estrutura do Serviço</h1>
          <p style={{ margin: "3px 0 0", fontSize: 11, color: "#64748b" }}>Cadastro de salas e conformidade — RDC 1.002/2025</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ background: "#1e293b", borderRadius: 8, padding: "6px 14px", fontSize: 12, color: "#94a3b8" }}>
            {salasConformes}/{totalSalas} salas conformes —
            <strong style={{ color: pct >= 80 ? "#4ade80" : pct >= 50 ? "#fbbf24" : "#f87171", marginLeft: 4 }}>{totalSalas > 0 ? pct + "%" : "—"}</strong>
          </div>
          <button onClick={salvar} disabled={salvando} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: salvo ? "#16a34a" : "#2563eb", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {salvando ? "Salvando..." : salvo ? "✓ Salvo" : "💾 Salvar"}
          </button>
        </div>
      </div>

      {/* PROGRESS */}
      <div style={{ background: "#1e293b", height: 4 }}>
        <div style={{ height: "100%", background: pct >= 80 ? "#22c55e" : "#3b82f6", width: `${pct}%`, transition: "width .5s" }} />
      </div>

      <div style={{ padding: "24px 28px" }}>

        {/* Resumo */}
        {totalSalas > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
            {TIPOS_SALA.map(t => {
              const count = salas.filter(s => s.tipo === t.id).length;
              if (count === 0) return null;
              return (
                <div key={t.id} style={{ background: "#fff", borderRadius: 10, padding: "12px 14px", border: "1px solid #e2e8f0", textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: COR_COMPLEXIDADE[t.complexidade] }}>{count}</div>
                  <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.4, marginTop: 2 }}>{t.label}</div>
                </div>
              );
            }).filter(Boolean)}
          </div>
        )}

        {/* Cards das salas */}
        {salas.map((sala, i) => (
          <CardSala
            key={sala.id}
            sala={sala}
            index={i}
            onChange={(campo, valor) => updateSala(i, campo, valor)}
            onRemover={() => removerSala(i)}
          />
        ))}

        {/* Adicionar sala */}
        <button onClick={addSala} style={{
          width: "100%", padding: "16px", borderRadius: 14, border: "2px dashed #cbd5e1",
          background: "#fff", color: "#64748b", fontSize: 14, fontWeight: 600, cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          transition: "border-color .15s, color .15s"
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#0f172a"; e.currentTarget.style.color = "#0f172a"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#cbd5e1"; e.currentTarget.style.color = "#64748b"; }}
        >
          <span style={{ fontSize: 20 }}>+</span>
          Adicionar sala / consultório
        </button>

        {/* Legenda */}
        {totalSalas > 0 && (
          <div style={{ marginTop: 20, background: "#fff", borderRadius: 10, padding: "14px 18px", border: "1px solid #e2e8f0", fontSize: 12, color: "#64748b" }}>
            <strong style={{ color: "#0f172a" }}>Referência — RDC 1.002/2025:</strong>
            {" "}Art. 14 define os requisitos mínimos de estrutura por tipo de sala.
            {" "}<span style={{ color: "#dc2626" }}>Campos com *</span> são obrigatórios.
            {" "}Salve antes de sair para não perder as alterações.
          </div>
        )}

      </div>
    </div>
  );
}
