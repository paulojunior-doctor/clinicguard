import { useState, useRef } from "react";

// ─── ESTADO INICIAL (campos em branco para o RT preencher) ───────────────────
const ESTADO_INICIAL = {
  // Seção 1 — Apresentação
  razao_social: "",
  cnpj: "",
  endereco: "",
  telefone: "",
  email: "",
  tipo_servico: "",
  especialidades: "",
  licenca_sanitaria: "",
  validade_licenca: "",
  responsavel_tecnico: "",
  registro_conselho_rt: "",
  responsavel_substituto: "",
  registro_conselho_sub: "",
  responsavel_legal: "",
  data_abertura: "",
  // Seção 2 — Política
  missao: "",
  visao: "",
  valores: "",
  compromisso: "",
  // Seção 3 — Organograma
  cargo_1: "Responsável Legal (RL)", nome_1: "",
  cargo_2: "Responsável Técnico (RT)", nome_2: "",
  cargo_3: "RT Substituto", nome_3: "",
  cargo_4: "Equipe Assistencial", nome_4: "",
  cargo_5: "Equipe de Apoio", nome_5: "",
  // Seção 4 — RH
  num_colaboradores: "",
  controle_saude_ocupacional: "",
  plano_educacao: "",
  // Seção 6 — PGRSS
  empresa_residuos: "",
  cnpj_empresa_residuos: "",
  frequencia_coleta: "",
  numero_cesp: "",
  validade_cesp: "",
  responsavel_pgrss: "",
  // Seção 7 — Água
  sistema_abastecimento: "",
  responsavel_agua: "",
  empresa_analise_agua: "",
  ultima_limpeza_reservatorio: "",
  proxima_limpeza_reservatorio: "",
  // Seção 8 — Manutenção
  empresa_manutencao: "",
  responsavel_manutencao: "",
  frequencia_manutencao: "",
  ultima_manutencao_autoclave: "",
  // Seção 9 — Tecnologias
  equipamentos_radiologia: "",
  registro_visa_radio: "",
  supervisor_radiologico: "",
  data_levantamento_radiometrico: "",
  // Seção 12 — Pragas
  empresa_dedetizacao: "",
  cnpj_dedetizacao: "",
  numero_cesp_pragas: "",
  ultima_dedetizacao: "",
  proxima_dedetizacao: "",
};

const POPS_REF = [
  { id:"POP-001", titulo:"Higienização das mãos", art:"RDC 42/2010" },
  { id:"POP-002", titulo:"Uso de EPI", art:"NR-32" },
  { id:"POP-003", titulo:"Limpeza e desinfecção de superfícies", art:"RDC 222/2018" },
  { id:"POP-004", titulo:"Esterilização e processamento de artigos", art:"RDC 15/2012" },
  { id:"POP-005", titulo:"Gerenciamento de Resíduos (PGRSS)", art:"RDC 222/2018" },
  { id:"POP-006", titulo:"Acidente com material biológico", art:"NR-32" },
  { id:"POP-007", titulo:"Precauções padrão e controle de infecção", art:"RDC 36/2008" },
  { id:"POP-008", titulo:"Manutenção de equipamentos", art:"RDC 50/2002" },
  { id:"POP-009", titulo:"Controle de estoque e insumos", art:"RDC 36/2008" },
  { id:"POP-010", titulo:"Atendimento e triagem de pacientes", art:"RDC 36/2013" },
  { id:"POP-011", titulo:"Gestão de prontuários", art:"LGPD/2018" },
  { id:"POP-012", titulo:"Conduta em emergências e urgências", art:"Portaria MS 2.048/2002" },
  { id:"POP-013", titulo:"Controle de qualidade da água", art:"Portaria MS 888/2021" },
  { id:"POP-014", titulo:"Controle de pragas e vetores", art:"RDC 52/2009" },
  { id:"POP-015", titulo:"Manutenção do sistema de climatização", art:"RE ANVISA 09/2003" },
  { id:"POP-016", titulo:"Gestão de medicamentos e controlados", art:"Portaria 344/1998" },
  { id:"POP-017", titulo:"Segurança do paciente", art:"RDC 36/2013" },
  { id:"POP-018", titulo:"Treinamento e integração de colaboradores", art:"NR-32" },
  { id:"POP-019", titulo:"Gestão documental e controle de versões", art:"ISO 9001:2015" },
  { id:"POP-020", titulo:"Resíduos perigosos e químicos", art:"RDC 222/2018" },
  { id:"POP-021", titulo:"Acessibilidade e atendimento humanizado", art:"Lei 13.146/2015" },
  { id:"POP-022", titulo:"Prevenção e controle de IRAS", art:"RDC 36/2008" },
  { id:"POP-ODO-001", titulo:"Processamento de DM Odontológicos", art:"RDC 1.002/2025" },
  { id:"POP-ODO-002", titulo:"Pré-limpeza de turbinas e instrumentais", art:"RDC 1.002/2025" },
  { id:"POP-ODO-003", titulo:"Monitoramento da esterilização", art:"RDC 1.002/2025" },
  { id:"POP-ODO-004", titulo:"Desinfecção química de DM semicríticos", art:"RDC 1.002/2025" },
  { id:"POP-ODO-005", titulo:"Gestão de resíduos odontológicos", art:"RDC 1.002/2025" },
  { id:"POP-ODO-006", titulo:"Proteção radiológica", art:"RDC 1.002/2025" },
  { id:"POP-ODO-007", titulo:"Sedação inalatória e endovenosa", art:"RDC 1.002/2025" },
  { id:"POP-ODO-008", titulo:"Recepção de moldagens e modelos", art:"RDC 1.002/2025" },
];

const SECOES = [
  { id:"apresentacao", icone:"🏥", titulo:"1. Apresentação do Serviço",         campos:["razao_social","cnpj","endereco","responsavel_tecnico","licenca_sanitaria"] },
  { id:"politica",     icone:"📋", titulo:"2. Política de Qualidade",            campos:["missao","visao","valores"] },
  { id:"organograma",  icone:"👥", titulo:"3. Organograma e Responsabilidades",  campos:["nome_1","nome_2"] },
  { id:"rh",           icone:"🧑‍⚕️", titulo:"4. Gestão de Recursos Humanos",   campos:["num_colaboradores","plano_educacao"] },
  { id:"pops",         icone:"📄", titulo:"5. POPs — Referência",                campos:[] },
  { id:"pgrss",        icone:"♻️", titulo:"6. PGRSS",                            campos:["empresa_residuos","numero_cesp"] },
  { id:"agua",         icone:"💧", titulo:"7. Plano de Controle da Água",        campos:["sistema_abastecimento","ultima_limpeza_reservatorio"] },
  { id:"manutencao",   icone:"🔧", titulo:"8. Plano de Manutenção",              campos:["empresa_manutencao","ultima_manutencao_autoclave"] },
  { id:"tecnologias",  icone:"⚙️",  titulo:"9. Plano de Gestão de Tecnologias", campos:["supervisor_radiologico","data_levantamento_radiometrico"] },
  { id:"segpaciente",  icone:"🛡️",  titulo:"10. Plano de Segurança do Paciente",campos:[] },
  { id:"iras",         icone:"🦠",  titulo:"11. Plano de Prevenção de IRAS",     campos:[] },
  { id:"pragas",       icone:"🐛",  titulo:"12. Controle de Pragas e Vetores",   campos:["empresa_dedetizacao","numero_cesp_pragas"] },
  { id:"versoes",      icone:"📝",  titulo:"13. Histórico de Revisões",          campos:[] },
];

// ─── COMPONENTES AUXILIARES ───────────────────────────────────────────────────

function CampoEditavel({ label, campo, dados, onChange, tipo = "text", placeholder, obrigatorio, full, hint }) {
  const vazio = !dados[campo] || dados[campo].trim() === "";
  return (
    <div style={{
      gridColumn: full ? "1/-1" : undefined,
      background: vazio ? "#fffbeb" : "#f8fafc",
      borderRadius: 8, padding: "10px 13px",
      border: `1.5px solid ${vazio ? "#fde68a" : "#e2e8f0"}`,
      transition: "border-color .15s"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <label style={{ fontSize: 10, fontWeight: 700, color: vazio ? "#92400e" : "#64748b", textTransform: "uppercase", letterSpacing: ".5px" }}>
          {label} {obrigatorio && <span style={{ color: "#dc2626" }}>*</span>}
        </label>
        {vazio && <span style={{ fontSize: 10, color: "#ca8a04", fontWeight: 600 }}>Preencher</span>}
      </div>
      {tipo === "textarea" ? (
        <textarea
          value={dados[campo] || ""}
          onChange={e => onChange(campo, e.target.value)}
          placeholder={placeholder || `Digite ${label.toLowerCase()}...`}
          rows={3}
          style={{
            width: "100%", border: "none", background: "transparent", fontSize: 13,
            color: "#1e293b", resize: "vertical", outline: "none", fontFamily: "inherit",
            lineHeight: 1.6
          }}
        />
      ) : (
        <input
          type={tipo}
          value={dados[campo] || ""}
          onChange={e => onChange(campo, e.target.value)}
          placeholder={placeholder || `Digite ${label.toLowerCase()}...`}
          style={{
            width: "100%", border: "none", background: "transparent", fontSize: 13,
            color: "#1e293b", outline: "none", fontFamily: "inherit"
          }}
        />
      )}
      {hint && <p style={{ margin: "4px 0 0", fontSize: 10, color: "#94a3b8" }}>{hint}</p>}
    </div>
  );
}

function InfoBox({ tipo, texto }) {
  const cfg = {
    info:  { bg: "#eff6ff", border: "#bfdbfe", color: "#1e40af" },
    aviso: { bg: "#fff7ed", border: "#fed7aa", color: "#92400e" },
    ok:    { bg: "#f0fdf4", border: "#bbf7d0", color: "#166534" },
  };
  const c = cfg[tipo] || cfg.info;
  return (
    <div style={{ background: c.bg, border: `1px solid ${c.border}`, borderRadius: 8, padding: "12px 14px", fontSize: 12, color: c.color, lineHeight: 1.6, marginBottom: 16 }}>
      {texto}
    </div>
  );
}

// ─── SEÇÕES ───────────────────────────────────────────────────────────────────

function SecaoApresentacao({ d, onChange }) {
  return (
    <div>
      <InfoBox tipo="info" texto="📌 Base legal: RDC 63/2011 | RDC 1.002/2025 (Art. 5º e 6º). Preencha todos os campos com os dados reais da clínica." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <CampoEditavel label="Razão Social" campo="razao_social" dados={d} onChange={onChange} obrigatorio placeholder="Ex: Buccal Odontologia Ltda" />
        <CampoEditavel label="CNPJ" campo="cnpj" dados={d} onChange={onChange} obrigatorio placeholder="00.000.000/0001-00" />
        <CampoEditavel label="Endereço Completo" campo="endereco" dados={d} onChange={onChange} obrigatorio placeholder="Rua, número, bairro, cidade/UF, CEP" full />
        <CampoEditavel label="Telefone" campo="telefone" dados={d} onChange={onChange} placeholder="(00) 00000-0000" />
        <CampoEditavel label="E-mail" campo="email" dados={d} onChange={onChange} tipo="email" placeholder="contato@clinica.com.br" />
        <CampoEditavel label="Tipo de Serviço" campo="tipo_servico" dados={d} onChange={onChange} obrigatorio placeholder="Ex: Consultório Odontológico Individual Classe I" full hint="Conforme classificação da RDC 1.002/2025 Art. 11" />
        <CampoEditavel label="Especialidades" campo="especialidades" dados={d} onChange={onChange} placeholder="Ex: Clínico Geral, Ortodontia, Implantodontia" full />
        <CampoEditavel label="Nº Licença Sanitária" campo="licenca_sanitaria" dados={d} onChange={onChange} obrigatorio placeholder="Ex: LS-GO-00000/2024" />
        <CampoEditavel label="Validade da Licença" campo="validade_licenca" dados={d} onChange={onChange} tipo="date" />
        <CampoEditavel label="Data de Abertura" campo="data_abertura" dados={d} onChange={onChange} tipo="date" />
      </div>
      <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #e2e8f0" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", marginBottom: 12, textTransform: "uppercase", letterSpacing: ".5px" }}>Responsabilidade Técnica</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <CampoEditavel label="Responsável Técnico (RT)" campo="responsavel_tecnico" dados={d} onChange={onChange} obrigatorio placeholder="Nome completo com título" />
          <CampoEditavel label="Nº Registro no Conselho (RT)" campo="registro_conselho_rt" dados={d} onChange={onChange} obrigatorio placeholder="Ex: CRO-GO 0000" />
          <CampoEditavel label="RT Substituto" campo="responsavel_substituto" dados={d} onChange={onChange} placeholder="Nome completo com título" hint="Obrigatório se houver mais de um profissional (Art. 5º §1º)" />
          <CampoEditavel label="Nº Registro no Conselho (Substituto)" campo="registro_conselho_sub" dados={d} onChange={onChange} placeholder="Ex: CRO-GO 0000" />
          <CampoEditavel label="Responsável Legal (RL)" campo="responsavel_legal" dados={d} onChange={onChange} obrigatorio placeholder="Nome do proprietário / sócio administrador" full />
        </div>
      </div>
    </div>
  );
}

function SecaoPolitica({ d, onChange }) {
  return (
    <div>
      <InfoBox tipo="info" texto="📌 Defina a identidade do serviço. Estes textos aparecem no manual impresso apresentado em inspeção sanitária." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
        <CampoEditavel label="Missão" campo="missao" dados={d} onChange={onChange} tipo="textarea" obrigatorio placeholder="Descreva o propósito do serviço — o que ele faz, para quem e com qual compromisso..." />
        <CampoEditavel label="Visão" campo="visao" dados={d} onChange={onChange} tipo="textarea" obrigatorio placeholder="Onde o serviço quer chegar — objetivo de longo prazo..." />
        <CampoEditavel label="Valores" campo="valores" dados={d} onChange={onChange} tipo="textarea" obrigatorio placeholder="Ex: Segurança do paciente · Ética · Melhoria contínua · Humanização..." />
        <CampoEditavel label="Compromisso do Responsável Técnico" campo="compromisso" dados={d} onChange={onChange} tipo="textarea" obrigatorio placeholder="Declaração de comprometimento do RT com a implementação e manutenção da SDBPF..." hint="Art. 6º RDC 1.002/2025 — O RT é responsável por elaborar e implementar a SDBPF" />
      </div>
    </div>
  );
}

function SecaoOrganograma({ d, onChange }) {
  return (
    <div>
      <InfoBox tipo="info" texto="📌 Identifique todos os profissionais e suas responsabilidades no serviço." />
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {[1,2,3,4,5].map(n => (
          <div key={n} style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: 12, alignItems: "center" }}>
            <div style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 13px", border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 2 }}>Cargo</div>
              <div style={{ fontSize: 13, color: "#1e293b" }}>{d[`cargo_${n}`]}</div>
            </div>
            <CampoEditavel label="Nome / Descrição" campo={`nome_${n}`} dados={d} onChange={onChange}
              placeholder={n <= 3 ? "Nome completo e registro no conselho" : "Descrever composição da equipe"}
              obrigatorio={n <= 2} />
          </div>
        ))}
      </div>
      <InfoBox tipo="aviso" texto="⚠️ Art. 7º RDC 1.002/2025: O órgão sanitário competente deve ser notificado sempre que houver alteração de Responsável Técnico ou de seu substituto." />
    </div>
  );
}

function SecaoRH({ d, onChange }) {
  return (
    <div>
      <InfoBox tipo="info" texto="📌 Art. 113 II — RDC 1.002/2025: A SDBPF deve conter gestão de RH com fichas funcionais, comprovação de formação, controle de saúde ocupacional e capacitações." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <CampoEditavel label="Nº total de colaboradores" campo="num_colaboradores" dados={d} onChange={onChange} tipo="number" placeholder="Ex: 5" />
        <CampoEditavel label="Responsável pelo controle de RH" campo="responsavel_rh" dados={d} onChange={onChange} placeholder="Nome do responsável" />
        <CampoEditavel label="Controle de saúde ocupacional (ASO)" campo="controle_saude_ocupacional" dados={d} onChange={onChange} tipo="textarea" placeholder="Descreva como é feito o controle de ASO, vacinação e exames periódicos..." full />
        <CampoEditavel label="Plano de educação permanente" campo="plano_educacao" dados={d} onChange={onChange} tipo="textarea" placeholder="Descreva as capacitações previstas no ano, periodicidade e responsável pela execução..." full hint="Art. 114 — Todos os profissionais devem receber capacitação admissional e periódica sobre os POPs da SDBPF" />
      </div>
      <InfoBox tipo="aviso" texto="📎 Os registros de capacitações (listas de presença, conteúdo, datas) devem ser mantidos no prontuário do colaborador e disponibilizados em inspeção sanitária." />
    </div>
  );
}

function SecaoPOPs() {
  const gerais = POPS_REF.filter(p => !p.id.includes("ODO"));
  const odo    = POPS_REF.filter(p =>  p.id.includes("ODO"));
  return (
    <div>
      <InfoBox tipo="ok" texto={`✅ ${POPS_REF.length} POPs ativos no sistema ClinicGuard. Esta seção é gerada automaticamente — não requer edição manual.`} />
      <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10 }}>POPs Transversais — Saúde Geral ({gerais.length})</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7, marginBottom: 20 }}>
        {gerais.map(p => (
          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", borderRadius: 7, padding: "8px 11px", border: "1px solid #e2e8f0" }}>
            <span style={{ fontSize: 12, color: "#1e293b" }}><span style={{ fontSize: 10, fontWeight: 700, color: "#64748b" }}>{p.id} · </span>{p.titulo}</span>
            <span style={{ fontSize: 10, color: "#94a3b8", whiteSpace: "nowrap", marginLeft: 8 }}>{p.art}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10 }}>POPs Odontológicos — RDC 1.002/2025 ({odo.length})</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 7 }}>
        {odo.map(p => (
          <div key={p.id} style={{ display: "flex", justifyContent: "space-between", background: "#fef2f2", borderRadius: 7, padding: "8px 11px", border: "1px solid #fecaca" }}>
            <span style={{ fontSize: 12, color: "#1e293b" }}><span style={{ fontSize: 10, fontWeight: 700, color: "#dc2626" }}>{p.id} · </span>{p.titulo}</span>
            <span style={{ fontSize: 10, color: "#94a3b8", whiteSpace: "nowrap", marginLeft: 8 }}>{p.art}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecaoPGRSS({ d, onChange }) {
  return (
    <div>
      <InfoBox tipo="info" texto="📌 Base legal: RDC 222/2018 | CONAMA 358/2005. Todo serviço de saúde é obrigado a ter PGRSS aprovado pela VISA local." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <CampoEditavel label="Empresa coletora de resíduos" campo="empresa_residuos" dados={d} onChange={onChange} obrigatorio placeholder="Razão social da empresa" />
        <CampoEditavel label="CNPJ da empresa coletora" campo="cnpj_empresa_residuos" dados={d} onChange={onChange} placeholder="00.000.000/0001-00" />
        <CampoEditavel label="Frequência de coleta" campo="frequencia_coleta" dados={d} onChange={onChange} placeholder="Ex: Semanal, Quinzenal, Mensal" />
        <CampoEditavel label="Responsável pelo PGRSS" campo="responsavel_pgrss" dados={d} onChange={onChange} placeholder="Nome e registro profissional" hint="Pode ser o próprio RT ou profissional habilitado" />
        <CampoEditavel label="Nº do CESP (Certificado de Execução)" campo="numero_cesp" dados={d} onChange={onChange} obrigatorio placeholder="Número do certificado" />
        <CampoEditavel label="Validade do CESP" campo="validade_cesp" dados={d} onChange={onChange} tipo="date" />
      </div>
      <InfoBox tipo="aviso" texto="⚠️ O CESP deve ser mantido por 5 anos e apresentado obrigatoriamente em vistoria sanitária. Renove semestralmente." />
    </div>
  );
}

function SecaoAgua({ d, onChange }) {
  return (
    <div>
      <InfoBox tipo="info" texto="📌 Base legal: Portaria MS 888/2021. Limpeza semestral do reservatório e controle mensal do cloro residual (0,2–5 mg/L) são obrigatórios." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <CampoEditavel label="Sistema de abastecimento" campo="sistema_abastecimento" dados={d} onChange={onChange} obrigatorio placeholder="Ex: Rede pública (SANEAGO) + reservatório de 1.000 L" full />
        <CampoEditavel label="Responsável pelo controle da água" campo="responsavel_agua" dados={d} onChange={onChange} obrigatorio placeholder="Nome do responsável" />
        <CampoEditavel label="Empresa de análise microbiológica" campo="empresa_analise_agua" dados={d} onChange={onChange} placeholder="Laboratório responsável pelas análises semestrais" />
        <CampoEditavel label="Data da última limpeza do reservatório" campo="ultima_limpeza_reservatorio" dados={d} onChange={onChange} tipo="date" obrigatorio />
        <CampoEditavel label="Data da próxima limpeza programada" campo="proxima_limpeza_reservatorio" dados={d} onChange={onChange} tipo="date" />
        <CampoEditavel label="Último resultado do cloro residual (mg/L)" campo="ultimo_cloro" dados={d} onChange={onChange} placeholder="Ex: 0,5 mg/L — dentro do padrão" />
      </div>
    </div>
  );
}

function SecaoManutencao({ d, onChange }) {
  return (
    <div>
      <InfoBox tipo="info" texto="📌 Art. 113 VII — RDC 1.002/2025: Plano anual de manutenção preventiva e corretiva é obrigatório com apresentação de registros." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <CampoEditavel label="Empresa de manutenção" campo="empresa_manutencao" dados={d} onChange={onChange} obrigatorio placeholder="Razão social da empresa" />
        <CampoEditavel label="Responsável interno pela manutenção" campo="responsavel_manutencao" dados={d} onChange={onChange} placeholder="Nome do responsável pelo acompanhamento" />
        <CampoEditavel label="Frequência da manutenção preventiva" campo="frequencia_manutencao" dados={d} onChange={onChange} placeholder="Ex: Semestral para autoclave, Anual para outros" full />
        <CampoEditavel label="Data da última manutenção da autoclave" campo="ultima_manutencao_autoclave" dados={d} onChange={onChange} tipo="date" obrigatorio hint="Autoclave exige manutenção semestral e indicador biológico semanal" />
        <CampoEditavel label="Data da última manutenção do climatizador" campo="ultima_manutencao_ar" dados={d} onChange={onChange} tipo="date" hint="Limpeza de filtros mensal, manutenção completa anual (RE 09/2003)" />
        <CampoEditavel label="Próxima manutenção programada" campo="proxima_manutencao" dados={d} onChange={onChange} tipo="date" />
      </div>
    </div>
  );
}

function SecaoTecnologias({ d, onChange }) {
  return (
    <div>
      <InfoBox tipo="info" texto="📌 RDC 1.002/2025 Arts. 138-154: Todos os equipamentos emissores de radiação ionizante devem estar cadastrados na VISA local." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <CampoEditavel label="Equipamentos de radiologia intraoral" campo="equipamentos_radiologia" dados={d} onChange={onChange} placeholder="Ex: Rx intraoral fixo — marca/modelo" full />
        <CampoEditavel label="Nº de registro na VISA (equipamento)" campo="registro_visa_radio" dados={d} onChange={onChange} obrigatorio placeholder="Número do cadastro do equipamento na VISA" />
        <CampoEditavel label="Supervisor de proteção radiológica" campo="supervisor_radiologico" dados={d} onChange={onChange} obrigatorio placeholder="Nome e registro profissional" hint="Art. 147 — Designação formal obrigatória por escrito" />
        <CampoEditavel label="Substituto do supervisor radiológico" campo="substituto_radiologico" dados={d} onChange={onChange} placeholder="Nome e registro profissional" />
        <CampoEditavel label="Data do levantamento radiométrico" campo="data_levantamento_radiometrico" dados={d} onChange={onChange} tipo="date" obrigatorio hint="Deve ser atualizado a cada 4 anos (Art. 141)" />
        <CampoEditavel label="Empresa responsável pelo laudo radiométrico" campo="empresa_radiometrico" dados={d} onChange={onChange} placeholder="Razão social da empresa especializada" />
      </div>
      <InfoBox tipo="aviso" texto="⚠️ Softwares de planejamento cirúrgico e ortodôntico devem estar regularizados na ANVISA (Art. 155 — RDC 1.002/2025)." />
    </div>
  );
}

function SecaoSegPaciente() {
  const metas = ["Identificar corretamente o paciente (2 identificadores: nome + data de nascimento).","Melhorar a comunicação entre profissionais — confirmar ordens verbais por escrito.","Melhorar a segurança no uso de medicamentos de alta vigilância.","Assegurar cirurgias em local, procedimento e paciente corretos — checklist cirúrgico.","Higienizar as mãos para prevenir IRAS — cumprir os 5 momentos da OMS.","Reduzir o risco de quedas e lesões — avaliação de risco e medidas preventivas."];
  return (
    <div>
      <InfoBox tipo="info" texto="📌 Base legal: RDC 36/2013 | Portaria MS 529/2013 | RDC 1.002/2025 Arts. 117-120. Esta seção é padronizada pela legislação — não requer edição." />
      <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 12 }}>6 Metas Internacionais de Segurança (OMS/ANVISA)</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
        {metas.map((m, i) => (
          <div key={i} style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 12px", border: "1px solid #e2e8f0", display: "flex", gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#0369a1", flexShrink: 0 }}>{i+1}</span>
            <span style={{ fontSize: 12, color: "#334155", lineHeight: 1.55 }}>{m}</span>
          </div>
        ))}
      </div>
      <InfoBox tipo="aviso" texto="⚠️ Notificação obrigatória: Eventos adversos graves (óbito, surtos) devem ser notificados ao NOTIVISA em até 24 horas. Demais eventos: até o 15º dia útil do mês seguinte (Art. 120 — RDC 1.002/2025)." />
    </div>
  );
}

function SecaoIRAS() {
  const medidas = ["Precauções padrão em 100% dos atendimentos.","Higienização das mãos nos 5 momentos da OMS — monitorar adesão mensalmente.","Processamento correto de DM conforme classificação de Spaulding.","Técnica asséptica rigorosa em todos os procedimentos invasivos.","Prescrição racional de antimicrobianos.","Vigilância ativa de infecções pós-procedimento.","Investigação de surtos (2+ casos com relação epidemiológica).","Notificação de surtos à VISA local e ao NOTIVISA."];
  return (
    <div>
      <InfoBox tipo="info" texto="📌 Base legal: RDC 36/2008 | Notas Técnicas ANVISA IRAS 2024 | RDC 1.002/2025 Art. 113 XVI. Esta seção é padronizada — não requer edição." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
        {medidas.map((m, i) => (
          <div key={i} style={{ background: "#f0fdf4", borderRadius: 8, padding: "9px 12px", border: "1px solid #bbf7d0", display: "flex", gap: 10 }}>
            <span style={{ color: "#16a34a", fontWeight: 700, flexShrink: 0 }}>✓</span>
            <span style={{ fontSize: 12, color: "#166534", lineHeight: 1.55 }}>{m}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 10 }}>Indicadores de Monitoramento</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
        {[{l:"Adesão à HM",m:"≥ 80%",f:"Mensal"},{l:"Taxa de IRAS",m:"< 1%",f:"Mensal"},{l:"Indicador biológico",m:"Negativo semanal",f:"Semanal"},{l:"Treinamento IRAS",m:"100% equipe",f:"Anual"},{l:"Surtos investigados",m:"100%",f:"Imediato"},{l:"Notif. NOTIVISA",m:"100% eventos graves",f:"24h"}].map((ind,i)=>(
          <div key={i} style={{ background: "#f8fafc", borderRadius: 8, padding: "10px 12px", border: "1px solid #e2e8f0" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", marginBottom: 4 }}>{ind.l}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{ind.m}</div>
            <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>Frequência: {ind.f}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecaoPragas({ d, onChange }) {
  return (
    <div>
      <InfoBox tipo="info" texto="📌 Base legal: RDC 52/2009 | RE ANVISA 1303/2005. A empresa de dedetização deve ter Autorização de Funcionamento ANVISA." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <CampoEditavel label="Empresa de controle de pragas" campo="empresa_dedetizacao" dados={d} onChange={onChange} obrigatorio placeholder="Razão social da empresa" />
        <CampoEditavel label="CNPJ da empresa" campo="cnpj_dedetizacao" dados={d} onChange={onChange} placeholder="00.000.000/0001-00" />
        <CampoEditavel label="Nº do CESP" campo="numero_cesp_pragas" dados={d} onChange={onChange} obrigatorio placeholder="Número do certificado" hint="Guardar CESP por 5 anos — obrigatório em vistoria sanitária" />
        <CampoEditavel label="Validade do CESP" campo="validade_cesp_pragas" dados={d} onChange={onChange} tipo="date" />
        <CampoEditavel label="Data da última dedetização" campo="ultima_dedetizacao" dados={d} onChange={onChange} tipo="date" obrigatorio />
        <CampoEditavel label="Data da próxima dedetização" campo="proxima_dedetizacao" dados={d} onChange={onChange} tipo="date" hint="Frequência mínima semestral" />
      </div>
    </div>
  );
}

function SecaoHistorico({ d, onChange, versoes, onAddVersao }) {
  return (
    <div>
      <InfoBox tipo="info" texto="📌 Art. 111 IV — RDC 1.002/2025: POPs devem ser revisados no mínimo a cada 2 anos ou quando houver mudança regulatória." />
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {versoes.map((h, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "60px 120px 1fr", gap: 12, alignItems: "center", background: i === 0 ? "#f0fdf4" : "#f8fafc", borderRadius: 9, padding: "12px 14px", border: `1px solid ${i === 0 ? "#bbf7d0" : "#e2e8f0"}` }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: i === 0 ? "#16a34a" : "#64748b", textAlign: "center" }}>v{h.versao}</span>
            <span style={{ fontSize: 12, color: "#64748b" }}>{h.data}</span>
            <div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 2 }}>{h.autor}</div>
              <div style={{ fontSize: 12, color: "#334155" }}>{h.descricao}</div>
            </div>
          </div>
        ))}
      </div>
      <button onClick={onAddVersao} style={{ padding: "8px 16px", borderRadius: 8, border: "1.5px dashed #cbd5e1", background: "#f8fafc", color: "#64748b", fontSize: 12, cursor: "pointer", width: "100%", marginBottom: 20 }}>
        + Adicionar nova revisão
      </button>
      <div style={{ background: "#f8fafc", borderRadius: 8, padding: "16px", border: "1px solid #e2e8f0" }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#0f172a", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 14 }}>Assinatura do Responsável Técnico</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[["RT", d.responsavel_tecnico || "___________________________"], ["Conselho", d.registro_conselho_rt || "___________________________"], ["Data", new Date().toLocaleDateString("pt-BR")]].map(([l, v]) => (
            <div key={l}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: ".5px", marginBottom: 6 }}>{l}</div>
              <div style={{ fontSize: 13, color: "#1e293b", borderBottom: "1px solid #94a3b8", paddingBottom: 4 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Manual() {
  const STORAGE_KEY = "clinicguard_manual_dados";
  const VERSOES_KEY = "clinicguard_manual_versoes";

  const [dados, setDados] = useState(() => {
    try { return { ...ESTADO_INICIAL, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") }; }
    catch { return ESTADO_INICIAL; }
  });

  const [versoes, setVersoes] = useState(() => {
    try { return JSON.parse(localStorage.getItem(VERSOES_KEY) || "null") || [{ versao: "1.0", data: new Date().toLocaleDateString("pt-BR"), autor: dados.responsavel_tecnico || "Responsável Técnico", descricao: "Elaboração inicial do Manual de Boas Práticas de Funcionamento." }]; }
    catch { return []; }
  });

  const [secaoAtiva, setSecaoAtiva] = useState("apresentacao");
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  function onChange(campo, valor) {
    setDados(prev => ({ ...prev, [campo]: valor }));
    setSalvo(false);
  }

  function salvar() {
    setSalvando(true);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    localStorage.setItem(VERSOES_KEY, JSON.stringify(versoes));
    setTimeout(() => { setSalvando(false); setSalvo(true); setTimeout(() => setSalvo(false), 3000); }, 600);
  }

  function addVersao() {
    const novaVersao = { versao: `1.${versoes.length}`, data: new Date().toLocaleDateString("pt-BR"), autor: dados.responsavel_tecnico || "RT", descricao: "Revisão periódica do manual." };
    const novas = [novaVersao, ...versoes];
    setVersoes(novas);
    localStorage.setItem(VERSOES_KEY, JSON.stringify(novas));
  }

  function exportarPDF() { window.print(); }

  // Calcular conformidade
  const camposObrigatorios = ["razao_social","cnpj","endereco","responsavel_tecnico","registro_conselho_rt","responsavel_legal","licenca_sanitaria","missao","visao","valores","compromisso","nome_1","nome_2","empresa_residuos","numero_cesp","sistema_abastecimento","ultima_limpeza_reservatorio","empresa_manutencao","ultima_manutencao_autoclave","supervisor_radiologico","data_levantamento_radiometrico","empresa_dedetizacao","numero_cesp_pragas","ultima_dedetizacao"];
  const preenchidos = camposObrigatorios.filter(c => dados[c] && dados[c].trim() !== "").length;
  const pct = Math.round((preenchidos / camposObrigatorios.length) * 100);

  function statusSecao(secao) {
    if (["pops","segpaciente","iras"].includes(secao.id)) return "completo";
    if (secao.campos.length === 0) return "completo";
    const preenchido = secao.campos.every(c => dados[c] && dados[c].trim() !== "");
    return preenchido ? "completo" : "pendente";
  }

  const totalCompleto = SECOES.filter(s => statusSecao(s) === "completo").length;

  function renderSecao(id) {
    switch(id) {
      case "apresentacao": return <SecaoApresentacao d={dados} onChange={onChange} />;
      case "politica":     return <SecaoPolitica d={dados} onChange={onChange} />;
      case "organograma":  return <SecaoOrganograma d={dados} onChange={onChange} />;
      case "rh":           return <SecaoRH d={dados} onChange={onChange} />;
      case "pops":         return <SecaoPOPs />;
      case "pgrss":        return <SecaoPGRSS d={dados} onChange={onChange} />;
      case "agua":         return <SecaoAgua d={dados} onChange={onChange} />;
      case "manutencao":   return <SecaoManutencao d={dados} onChange={onChange} />;
      case "tecnologias":  return <SecaoTecnologias d={dados} onChange={onChange} />;
      case "segpaciente":  return <SecaoSegPaciente />;
      case "iras":         return <SecaoIRAS />;
      case "pragas":       return <SecaoPragas d={dados} onChange={onChange} />;
      case "versoes":      return <SecaoHistorico d={dados} onChange={onChange} versoes={versoes} onAddVersao={addVersao} />;
      default: return null;
    }
  }

  const secaoInfo = SECOES.find(s => s.id === secaoAtiva);

  return (
    <div style={{ fontFamily: "'IBM Plex Sans',system-ui,sans-serif", background: "#f1f5f9", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* HEADER */}
      <div style={{ background: "#0f172a", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#f1f5f9" }}>Manual de Boas Práticas de Funcionamento</h1>
          <p style={{ margin: "3px 0 0", fontSize: 11, color: "#64748b" }}>SDBPF · {dados.razao_social || "Preencha o nome da clínica"} · RT: {dados.responsavel_tecnico || "Preencha o RT"}</p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ background: "#1e293b", borderRadius: 8, padding: "6px 14px", fontSize: 12, color: "#94a3b8" }}>
            Conformidade: <strong style={{ color: pct >= 80 ? "#4ade80" : pct >= 50 ? "#fbbf24" : "#f87171" }}>{pct}%</strong>
          </div>
          <button onClick={salvar} disabled={salvando} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: salvo ? "#16a34a" : "#2563eb", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            {salvando ? "Salvando..." : salvo ? "✓ Salvo" : "💾 Salvar"}
          </button>
          <button onClick={exportarPDF} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "#475569", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
            ⬇ PDF
          </button>
        </div>
      </div>

      {/* PROGRESS */}
      <div style={{ background: "#1e293b", height: 4 }}>
        <div style={{ height: "100%", background: pct >= 80 ? "#22c55e" : "#3b82f6", width: `${pct}%`, transition: "width .5s" }} />
      </div>

      <div style={{ display: "flex", flex: 1 }}>

        {/* SIDEBAR */}
        <div style={{ width: 272, background: "#fff", borderRight: "1px solid #e2e8f0", overflowY: "auto", flexShrink: 0 }}>
          <div style={{ padding: "14px 16px 6px", fontSize: 10, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: ".5px" }}>
            {totalCompleto}/{SECOES.length} seções completas
          </div>
          {SECOES.map(s => {
            const st = statusSecao(s);
            const ativa = secaoAtiva === s.id;
            const dot = st === "completo" ? "#16a34a" : "#ca8a04";
            return (
              <button key={s.id} onClick={() => setSecaoAtiva(s.id)} style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%", textAlign: "left",
                padding: "10px 16px", border: "none", background: ativa ? "#eff6ff" : "transparent",
                cursor: "pointer", borderLeft: ativa ? "3px solid #2563eb" : "3px solid transparent"
              }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>{s.icone}</span>
                <span style={{ fontSize: 12, fontWeight: ativa ? 600 : 400, color: ativa ? "#1e40af" : "#374151", flex: 1, lineHeight: 1.35 }}>{s.titulo}</span>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot, flexShrink: 0 }} />
              </button>
            );
          })}
        </div>

        {/* CONTEÚDO */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px 28px" }}>

          {/* Resumo */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "16px 20px", marginBottom: 20, display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
            {[
              { l: "Seções completas", v: `${totalCompleto}/${SECOES.length}`, cor: "#16a34a" },
              { l: "POPs ativos",      v: `${POPS_REF.length}`,               cor: "#0369a1" },
              { l: "Campos preenchidos", v: `${preenchidos}/${camposObrigatorios.length}`, cor: "#7c3aed" },
              { l: "Prazo RDC 1.002/2025", v: "16/12/2026",                  cor: "#dc2626" },
            ].map(item => (
              <div key={item.l} style={{ textAlign: "center", padding: "10px", background: item.cor + "08", borderRadius: 9, border: `1px solid ${item.cor}20` }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: item.cor }}>{item.v}</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{item.l}</div>
              </div>
            ))}
          </div>

          {/* Seção ativa */}
          <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 10 }}>
                {secaoInfo?.icone} {secaoInfo?.titulo}
              </h2>
              {!["pops","segpaciente","iras"].includes(secaoAtiva) && (
                <span style={{ fontSize: 11, color: "#64748b", background: "#f1f5f9", padding: "4px 10px", borderRadius: 20 }}>
                  Campos com <span style={{ color: "#dc2626" }}>*</span> são obrigatórios
                </span>
              )}
            </div>
            {renderSecao(secaoAtiva)}
          </div>

          {/* Botão salvar bottom */}
          {!["pops","segpaciente","iras"].includes(secaoAtiva) && (
            <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
              <button onClick={salvar} disabled={salvando} style={{ padding: "10px 28px", borderRadius: 10, border: "none", background: salvo ? "#16a34a" : "#0f172a", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                {salvando ? "Salvando..." : salvo ? "✓ Salvo com sucesso!" : "💾 Salvar alterações"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
