import { useState, useRef } from "react";

// ─── DADOS MOCK (substituir por dados reais do Supabase/contexto da clínica) ──
const CLINICA_MOCK = {
  razao_social: "Buccal Odontologia",
  cnpj: "00.000.000/0001-00",
  endereco: "Rua Exemplo, 123 — Setor Bueno, Goiânia/GO — CEP 74.000-000",
  telefone: "(62) 99999-9999",
  email: "contato@buccal.com.br",
  especialidades: ["Odontologia Geral", "Ortodontia", "Implantodontia"],
  tipo_servico: "Consultório Odontológico Individual Classe I",
  responsavel_tecnico: "Dr. Paulo Vieira Junior",
  cro_rt: "CRO-GO 0000",
  responsavel_legal: "Paulo Vieira Junior",
  data_abertura: "2020-01-01",
  licenca_sanitaria: "LS-GO-00000/2024",
  validade_licenca: "2025-12-31",
};

const SECOES = [
  { id: "apresentacao",    icone: "🏥", titulo: "1. Apresentação do Serviço",         status: "completo" },
  { id: "politica",        icone: "📋", titulo: "2. Política de Qualidade",            status: "completo" },
  { id: "organograma",     icone: "👥", titulo: "3. Organograma e Responsabilidades",  status: "completo" },
  { id: "rh",              icone: "🧑‍⚕️", titulo: "4. Gestão de Recursos Humanos",    status: "pendente" },
  { id: "pops",            icone: "📄", titulo: "5. POPs — Referência",                status: "completo" },
  { id: "pgrss",           icone: "♻️", titulo: "6. PGRSS",                            status: "pendente" },
  { id: "agua",            icone: "💧", titulo: "7. Plano de Controle da Água",        status: "pendente" },
  { id: "manutencao",      icone: "🔧", titulo: "8. Plano de Manutenção",              status: "pendente" },
  { id: "tecnologias",     icone: "⚙️",  titulo: "9. Plano de Gestão de Tecnologias", status: "pendente" },
  { id: "segpaciente",     icone: "🛡️",  titulo: "10. Plano de Segurança do Paciente",status: "completo" },
  { id: "iras",            icone: "🦠",  titulo: "11. Plano de Prevenção de IRAS",     status: "completo" },
  { id: "pragas",          icone: "🐛",  titulo: "12. Controle de Pragas e Vetores",   status: "pendente" },
  { id: "versoes",         icone: "📝",  titulo: "13. Histórico de Revisões",          status: "completo" },
];

const POPS_REFERENCIA = [
  { id:"POP-001", titulo:"Higienização das mãos",                         art:"RDC 42/2010" },
  { id:"POP-002", titulo:"Uso de EPI",                                    art:"NR-32" },
  { id:"POP-003", titulo:"Limpeza e desinfecção de superfícies",          art:"RDC 222/2018" },
  { id:"POP-004", titulo:"Esterilização e processamento de artigos",      art:"RDC 15/2012" },
  { id:"POP-005", titulo:"Gerenciamento de Resíduos (PGRSS)",             art:"RDC 222/2018" },
  { id:"POP-006", titulo:"Acidente com material biológico",               art:"NR-32" },
  { id:"POP-007", titulo:"Precauções padrão e controle de infecção",      art:"RDC 36/2008" },
  { id:"POP-008", titulo:"Manutenção de equipamentos",                    art:"RDC 50/2002" },
  { id:"POP-009", titulo:"Controle de estoque e insumos",                 art:"RDC 36/2008" },
  { id:"POP-010", titulo:"Atendimento e triagem de pacientes",            art:"RDC 36/2013" },
  { id:"POP-011", titulo:"Gestão de prontuários",                         art:"LGPD/2018" },
  { id:"POP-012", titulo:"Conduta em emergências e urgências",            art:"Portaria MS 2.048/2002" },
  { id:"POP-013", titulo:"Controle de qualidade da água",                 art:"Portaria MS 888/2021" },
  { id:"POP-014", titulo:"Controle de pragas e vetores",                  art:"RDC 52/2009" },
  { id:"POP-015", titulo:"Manutenção do sistema de climatização",         art:"RE ANVISA 09/2003" },
  { id:"POP-016", titulo:"Gestão de medicamentos e controlados",          art:"Portaria 344/1998" },
  { id:"POP-017", titulo:"Segurança do paciente",                         art:"RDC 36/2013" },
  { id:"POP-018", titulo:"Treinamento e integração de colaboradores",     art:"NR-32" },
  { id:"POP-019", titulo:"Gestão documental e controle de versões",       art:"ISO 9001:2015" },
  { id:"POP-020", titulo:"Resíduos perigosos e químicos",                 art:"RDC 222/2018" },
  { id:"POP-021", titulo:"Acessibilidade e atendimento humanizado",       art:"Lei 13.146/2015" },
  { id:"POP-022", titulo:"Prevenção e controle de IRAS",                  art:"RDC 36/2008" },
  { id:"POP-ODO-001", titulo:"Processamento de DM Odontológicos",         art:"RDC 1.002/2025" },
  { id:"POP-ODO-002", titulo:"Pré-limpeza de turbinas e instrumentais",   art:"RDC 1.002/2025" },
  { id:"POP-ODO-003", titulo:"Monitoramento da esterilização",            art:"RDC 1.002/2025" },
  { id:"POP-ODO-004", titulo:"Desinfecção química de DM semicríticos",    art:"RDC 1.002/2025" },
  { id:"POP-ODO-005", titulo:"Gestão de resíduos odontológicos",          art:"RDC 1.002/2025" },
  { id:"POP-ODO-006", titulo:"Proteção radiológica",                      art:"RDC 1.002/2025" },
  { id:"POP-ODO-007", titulo:"Sedação inalatória e endovenosa",           art:"RDC 1.002/2025" },
  { id:"POP-ODO-008", titulo:"Recepção de moldagens e modelos",           art:"RDC 1.002/2025" },
];

const HISTORICO = [
  { versao:"1.0", data:"2025-01-01", autor:"Dr. Paulo Vieira Junior", descricao:"Elaboração inicial do Manual de Boas Práticas." },
  { versao:"1.1", data:"2025-06-01", autor:"Dr. Paulo Vieira Junior", descricao:"Atualização com POPs odontológicos — RDC 1.002/2025." },
  { versao:"1.2", data:"2025-12-01", autor:"Dr. Paulo Vieira Junior", descricao:"Revisão anual obrigatória. Inclusão do Plano de Segurança do Paciente atualizado." },
];

// ─── ESTILOS COMPARTILHADOS ────────────────────────────────────────────────
const S = {
  card: { background:"#fff", borderRadius:12, border:"1px solid #e2e8f0", padding:"24px", marginBottom:20 },
  h2:   { fontSize:16, fontWeight:700, color:"#0f172a", margin:"0 0 16px", display:"flex", alignItems:"center", gap:10 },
  h3:   { fontSize:13, fontWeight:700, color:"#0f172a", margin:"0 0 10px", textTransform:"uppercase", letterSpacing:".5px" },
  row:  { display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:12 },
  field:{ background:"#f8fafc", borderRadius:8, padding:"10px 13px", border:"1px solid #e2e8f0" },
  label:{ fontSize:10, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:".5px", marginBottom:3 },
  value:{ fontSize:13, color:"#1e293b", fontWeight:500 },
  badge:{ fontSize:11, padding:"3px 10px", borderRadius:20, fontWeight:600 },
  sep:  { border:"none", borderTop:"1px solid #e2e8f0", margin:"20px 0" },
};

function Campo({ label, value, full }) {
  return (
    <div style={{ ...S.field, gridColumn: full ? "1/-1" : undefined }}>
      <div style={S.label}>{label}</div>
      <div style={S.value}>{value || "—"}</div>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    completo: { bg:"#dcfce7", color:"#16a34a", label:"✓ Completo" },
    pendente: { bg:"#fef9c3", color:"#ca8a04", label:"⏳ Pendente" },
    vencido:  { bg:"#fee2e2", color:"#dc2626", label:"⚠ Vencido"  },
  };
  const c = cfg[status] || cfg.pendente;
  return <span style={{ ...S.badge, background:c.bg, color:c.color }}>{c.label}</span>;
}

// ─── SEÇÕES DO MANUAL ─────────────────────────────────────────────────────────
function SecaoApresentacao({ c }) {
  return (
    <div style={S.card}>
      <h2 style={S.h2}>🏥 1. Apresentação do Serviço</h2>
      <div style={S.row}>
        <Campo label="Razão Social" value={c.razao_social} />
        <Campo label="CNPJ" value={c.cnpj} />
        <Campo label="Endereço" value={c.endereco} full />
        <Campo label="Telefone" value={c.telefone} />
        <Campo label="E-mail" value={c.email} />
        <Campo label="Tipo de Serviço" value={c.tipo_servico} full />
        <Campo label="Especialidades" value={c.especialidades?.join(", ")} full />
      </div>
      <hr style={S.sep}/>
      <div style={S.row}>
        <Campo label="Responsável Técnico" value={c.responsavel_tecnico} />
        <Campo label="CRO/CRM/CFO" value={c.cro_rt} />
        <Campo label="Responsável Legal" value={c.responsavel_legal} />
        <Campo label="Data de Abertura" value={c.data_abertura ? new Date(c.data_abertura).toLocaleDateString("pt-BR") : "—"} />
        <Campo label="Nº Licença Sanitária" value={c.licenca_sanitaria} />
        <Campo label="Validade da Licença" value={c.validade_licenca ? new Date(c.validade_licenca).toLocaleDateString("pt-BR") : "—"} />
      </div>
      <div style={{background:"#f0fdf4",borderRadius:8,padding:"12px 14px",marginTop:8,fontSize:12,color:"#166534",lineHeight:1.6}}>
        📌 <strong>Base legal:</strong> RDC ANVISA 63/2011 | RDC 1.002/2025 (Art. 5º e 6º) | RDC 36/2013
      </div>
    </div>
  );
}

function SecaoPolitica() {
  return (
    <div style={S.card}>
      <h2 style={S.h2}>📋 2. Política de Qualidade</h2>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14, marginBottom:18}}>
        {[
          { titulo:"Missão", texto:"Oferecer serviços de saúde com excelência técnica, humanização no atendimento e plena conformidade com as normas sanitárias vigentes, garantindo segurança a pacientes, colaboradores e comunidade.", cor:"#0369a1" },
          { titulo:"Visão", texto:"Ser referência em compliance sanitário, utilizando tecnologia para tornar a gestão de qualidade acessível, transparente e eficaz em todos os serviços de saúde do Brasil.", cor:"#059669" },
          { titulo:"Valores", texto:"Segurança do paciente · Ética e transparência · Melhoria contínua · Responsabilidade sanitária · Humanização · Rastreabilidade", cor:"#7c3aed" },
        ].map(item=>(
          <div key={item.titulo} style={{background:item.cor+"10",border:`1px solid ${item.cor}30`,borderRadius:10,padding:"16px"}}>
            <div style={{fontSize:12,fontWeight:700,color:item.cor,marginBottom:8,textTransform:"uppercase",letterSpacing:".5px"}}>{item.titulo}</div>
            <p style={{margin:0,fontSize:12,color:"#334155",lineHeight:1.65}}>{item.texto}</p>
          </div>
        ))}
      </div>
      <div style={{background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:8,padding:"14px",fontSize:12,color:"#92400e",lineHeight:1.65}}>
        <strong>Compromisso do Responsável Técnico:</strong> Elaborar, implementar, revisar e fazer cumprir a Série de Documentos de Boas Práticas de Funcionamento (SDBPF), conforme exigido pelo Art. 6º da RDC 1.002/2025 e Art. 5º da RDC 63/2011, assegurando que todos os profissionais do serviço sejam capacitados e assinem ciência dos procedimentos.
      </div>
    </div>
  );
}

function SecaoOrganograma({ c }) {
  const cargos = [
    { cargo:"Responsável Legal (RL)", nome:c.responsavel_legal, cor:"#0f172a" },
    { cargo:"Responsável Técnico (RT)", nome:c.responsavel_tecnico + " — " + c.cro_rt, cor:"#0369a1" },
    { cargo:"RT Substituto", nome:"A definir", cor:"#0369a1" },
    { cargo:"Equipe Assistencial", nome:"Cirurgiões-dentistas, ASB, TSB", cor:"#059669" },
    { cargo:"Equipe de Apoio", nome:"Recepcionistas, Higienização", cor:"#7c3aed" },
  ];
  return (
    <div style={S.card}>
      <h2 style={S.h2}>👥 3. Organograma e Responsabilidades</h2>
      <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
        {cargos.map((item,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 16px",background:item.cor+"08",border:`1px solid ${item.cor}25`,borderRadius:9}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:item.cor,flexShrink:0}}/>
            <div>
              <div style={{fontSize:11,fontWeight:700,color:item.cor,textTransform:"uppercase",letterSpacing:".4px"}}>{item.cargo}</div>
              <div style={{fontSize:13,color:"#334155",marginTop:2}}>{item.nome}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={S.h3}>Responsabilidades do RT (Art. 6º — RDC 1.002/2025)</div>
      <ul style={{margin:0,paddingLeft:20}}>
        {["Elaborar e implementar a SDBPF do serviço.","Garantir que todos os profissionais recebam capacitação admissional e periódica.","Supervisionar o cumprimento dos POPs por toda a equipe.","Notificar a VISA sobre alterações de RT ou RT substituto (Art. 7º).","Responder tecnicamente perante a Vigilância Sanitária.","Revisar os documentos da qualidade no mínimo a cada 2 anos."].map((r,i)=>(
          <li key={i} style={{fontSize:12,color:"#334155",lineHeight:1.75}}>{r}</li>
        ))}
      </ul>
    </div>
  );
}

function SecaoPOPs() {
  const gerais = POPS_REFERENCIA.filter(p=>!p.id.includes("ODO"));
  const odo    = POPS_REFERENCIA.filter(p=>p.id.includes("ODO"));
  return (
    <div style={S.card}>
      <h2 style={S.h2}>📄 5. POPs — Referência Completa</h2>
      <p style={{fontSize:12,color:"#64748b",marginBottom:16,lineHeight:1.6}}>
        Este Manual referencia os Procedimentos Operacionais Padrão disponíveis no sistema ClinicGuard. Todos os POPs devem ser acessados, lidos e assinados pelos colaboradores antes de iniciar atividades (Art. 114 — RDC 1.002/2025).
      </p>
      <div style={S.h3}>POPs Transversais — Saúde Geral ({gerais.length})</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
        {gerais.map(p=>(
          <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#f8fafc",borderRadius:8,padding:"9px 12px",border:"1px solid #e2e8f0"}}>
            <div>
              <span style={{fontSize:10,fontWeight:700,color:"#64748b"}}>{p.id} · </span>
              <span style={{fontSize:12,color:"#1e293b"}}>{p.titulo}</span>
            </div>
            <span style={{fontSize:10,color:"#94a3b8",whiteSpace:"nowrap",marginLeft:8}}>{p.art}</span>
          </div>
        ))}
      </div>
      <div style={S.h3}>POPs Odontológicos — RDC 1.002/2025 ({odo.length})</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {odo.map(p=>(
          <div key={p.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"#fef2f2",borderRadius:8,padding:"9px 12px",border:"1px solid #fecaca"}}>
            <div>
              <span style={{fontSize:10,fontWeight:700,color:"#dc2626"}}>{p.id} · </span>
              <span style={{fontSize:12,color:"#1e293b"}}>{p.titulo}</span>
            </div>
            <span style={{fontSize:10,color:"#94a3b8",whiteSpace:"nowrap",marginLeft:8}}>{p.art}</span>
          </div>
        ))}
      </div>
      <div style={{background:"#f0fdf4",borderRadius:8,padding:"12px 14px",marginTop:16,fontSize:12,color:"#166534",lineHeight:1.6}}>
        ✅ Total: <strong>{POPS_REFERENCIA.length} POPs</strong> ativos. Todos acessíveis em <strong>clinicguard.com.br/pops</strong>. Última revisão: <strong>dezembro/2025</strong>.
      </div>
    </div>
  );
}

function SecaoSegPaciente() {
  const metas = ["Identificar corretamente o paciente (2 identificadores).","Melhorar a comunicação entre profissionais — confirmar ordens verbais por escrito.","Melhorar a segurança no uso de medicamentos de alta vigilância.","Assegurar cirurgias em local, procedimento e paciente corretos (checklist cirúrgico).","Higienizar as mãos para prevenir IRAS — cumprir os 5 momentos da OMS.","Reduzir o risco de quedas e lesões."];
  const acoes = ["Monitorar e notificar eventos adversos internamente (NOTIVISA para eventos graves).","Analisar causas raiz e implementar ações corretivas.","Manter cultura não punitiva — o erro deve ser notificado sem medo de punição.","Revisar o PSP sempre que identificados novos riscos na assistência."];
  return (
    <div style={S.card}>
      <h2 style={S.h2}>🛡️ 10. Plano de Segurança do Paciente (PSP)</h2>
      <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:8,padding:"12px 14px",marginBottom:16,fontSize:12,color:"#1e40af",lineHeight:1.6}}>
        <strong>Base legal:</strong> RDC 36/2013 | Portaria MS 529/2013 | RDC 1.002/2025 Art. 117-120<br/>
        <strong>Responsável:</strong> Responsável Técnico (consultórios individuais) ou NSP (serviços com 2+ consultórios)
      </div>
      <div style={S.h3}>6 Metas Internacionais de Segurança (OMS/ANVISA)</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
        {metas.map((m,i)=>(
          <div key={i} style={{background:"#f8fafc",borderRadius:8,padding:"10px 12px",border:"1px solid #e2e8f0",display:"flex",gap:10,alignItems:"flex-start"}}>
            <span style={{fontSize:14,fontWeight:700,color:"#0369a1",flexShrink:0}}>{i+1}</span>
            <span style={{fontSize:12,color:"#334155",lineHeight:1.55}}>{m}</span>
          </div>
        ))}
      </div>
      <div style={S.h3}>Ações de Gestão de Risco</div>
      <ul style={{margin:0,paddingLeft:20}}>
        {acoes.map((a,i)=><li key={i} style={{fontSize:12,color:"#334155",lineHeight:1.75}}>{a}</li>)}
      </ul>
      <div style={{background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:8,padding:"12px 14px",marginTop:16,fontSize:12,color:"#92400e",lineHeight:1.6}}>
        ⚠️ <strong>Notificação obrigatória:</strong> Eventos adversos graves (óbito, surtos) devem ser notificados ao NOTIVISA em até <strong>24 horas</strong> (Art. 120 parágrafo único — RDC 1.002/2025).
      </div>
    </div>
  );
}

function SecaoIRAS() {
  const medidas = ["Precauções padrão em 100% dos atendimentos.","Higienização das mãos nos 5 momentos da OMS — monitorar adesão mensalmente.","Processamento correto de dispositivos médicos conforme classificação de Spaulding.","Técnica asséptica rigorosa em todos os procedimentos invasivos.","Prescrição racional de antimicrobianos — uso baseado em antibiograma quando disponível.","Vigilância ativa de infecções pós-procedimento.","Investigação de surtos (2 ou mais casos com relação epidemiológica).","Notificação de surtos à VISA local e ao NOTIVISA."];
  return (
    <div style={S.card}>
      <h2 style={S.h2}>🦠 11. Plano de Prevenção e Controle de IRAS</h2>
      <div style={{background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:8,padding:"12px 14px",marginBottom:16,fontSize:12,color:"#1e40af",lineHeight:1.6}}>
        <strong>Base legal:</strong> RDC 36/2008 | RDC 63/2011 | Notas Técnicas ANVISA IRAS 2024 | RDC 1.002/2025 Art. 113 XVI<br/>
        <strong>CCIH:</strong> Obrigatória em serviços hospitalares (Portaria MS 2.616/1998)
      </div>
      <div style={S.h3}>Medidas Estruturadas de Prevenção</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
        {medidas.map((m,i)=>(
          <div key={i} style={{background:"#f0fdf4",borderRadius:8,padding:"9px 12px",border:"1px solid #bbf7d0",display:"flex",gap:10,alignItems:"flex-start"}}>
            <span style={{color:"#16a34a",fontWeight:700,fontSize:13,flexShrink:0}}>✓</span>
            <span style={{fontSize:12,color:"#166534",lineHeight:1.55}}>{m}</span>
          </div>
        ))}
      </div>
      <div style={S.h3}>Indicadores de Monitoramento</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10}}>
        {[{label:"Adesão à HM",meta:"≥ 80%",freq:"Mensal"},{label:"Taxa de IRAS pós-proc.",meta:"< 1%",freq:"Mensal"},{label:"Surtos investigados",meta:"100%",freq:"Imediato"},{label:"Treinamento IRAS equipe",meta:"100%",freq:"Anual"},{label:"Indicador biológico autoclave",meta:"Negativo semanal",freq:"Semanal"},{label:"Notif. NOTIVISA",meta:"100% eventos graves",freq:"24h"}].map((ind,i)=>(
          <div key={i} style={{background:"#f8fafc",borderRadius:8,padding:"10px 12px",border:"1px solid #e2e8f0"}}>
            <div style={{fontSize:11,fontWeight:700,color:"#64748b",marginBottom:4}}>{ind.label}</div>
            <div style={{fontSize:13,fontWeight:600,color:"#0f172a"}}>{ind.meta}</div>
            <div style={{fontSize:10,color:"#94a3b8",marginTop:2}}>Frequência: {ind.freq}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SecaoHistorico() {
  return (
    <div style={S.card}>
      <h2 style={S.h2}>📝 13. Histórico de Revisões</h2>
      <p style={{fontSize:12,color:"#64748b",marginBottom:16,lineHeight:1.6}}>
        Conforme Art. 111 IV da RDC 1.002/2025, planos, protocolos e POPs devem ser revisados no mínimo a cada 2 anos ou sempre que houver mudança regulatória ou no perfil assistencial do serviço.
      </p>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {HISTORICO.map((h,i)=>(
          <div key={i} style={{display:"grid",gridTemplateColumns:"60px 100px 1fr",gap:12,alignItems:"center",background:i===0?"#f0fdf4":"#f8fafc",borderRadius:9,padding:"12px 14px",border:`1px solid ${i===0?"#bbf7d0":"#e2e8f0"}`}}>
            <span style={{fontSize:13,fontWeight:700,color:i===0?"#16a34a":"#64748b",textAlign:"center"}}>v{h.versao}</span>
            <span style={{fontSize:12,color:"#64748b"}}>{new Date(h.data).toLocaleDateString("pt-BR")}</span>
            <div>
              <div style={{fontSize:11,color:"#94a3b8",marginBottom:2}}>{h.autor}</div>
              <div style={{fontSize:12,color:"#334155"}}>{h.descricao}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{background:"#f8fafc",borderRadius:8,padding:"16px",marginTop:16,border:"1px solid #e2e8f0"}}>
        <div style={S.h3}>Assinatura do Responsável Técnico</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:12}}>
          {[["RT","___________________________"],["CRO/CRM","___________________________"],["Data","_____ / _____ / _________"]].map(([l,v])=>(
            <div key={l}>
              <div style={{fontSize:10,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:".5px",marginBottom:6}}>{l}</div>
              <div style={{fontSize:13,color:"#1e293b",borderBottom:"1px solid #94a3b8",paddingBottom:4}}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SecaoPendente({ secao }) {
  const pendentes = {
    rh:         { titulo:"Gestão de Recursos Humanos", itens:["Fichas funcionais de todos os colaboradores","Comprovação de formação profissional (diplomas, registros nos conselhos)","Controle de saúde ocupacional (ASO, vacinação)","Registro de capacitações admissionais e periódicas","Carga horária e escala de trabalho"] },
    pgrss:      { titulo:"Plano de Gerenciamento de Resíduos (PGRSS)", itens:["Identificação e quantificação dos resíduos gerados","Procedimentos de segregação, acondicionamento e coleta interna","Contrato com empresa coletora licenciada","Manifesto de transporte e certificado de destinação","Planilha de monitoramento mensal da geração de resíduos"] },
    agua:       { titulo:"Plano de Monitoramento e Controle da Água", itens:["Identificação do sistema de abastecimento","Cronograma semestral de limpeza e desinfecção do reservatório","Controle mensal de cloro residual livre (0,2–5 mg/L)","Análise microbiológica semestral","Registros de todas as análises e manutenções"] },
    manutencao: { titulo:"Plano Anual de Manutenção", itens:["Inventário de equipamentos e instalações","Cronograma de manutenção preventiva por equipamento","Registro de manutenções corretivas realizadas","Certificados de calibração de equipamentos de medição","Contratos com empresas de manutenção"] },
    tecnologias:{ titulo:"Plano de Gerenciamento de Tecnologias em Saúde (PGTS)", itens:["Inventário de todos os dispositivos médicos e equipamentos","Planejamento de aquisição, instalação e desativação","Programa de qualificação de equipamentos","Registro de assistência técnica, manutenção e calibração","Controle de equipamentos emissores de radiação ionizante"] },
    pragas:     { titulo:"Controle de Vetores e Pragas Urbanas", itens:["Contrato com empresa dedetizadora licenciada pela VISA","CESP (Certificado de Execução de Serviço de Controle de Pragas) — guardar 5 anos","Cronograma de dedetização semestral","Planilha de monitoramento de pragas","Medidas preventivas estruturais implementadas"] },
  };
  const info = pendentes[secao.id];
  if (!info) return null;
  return (
    <div style={{...S.card,border:"1px solid #fde68a",background:"#fffbeb"}}>
      <h2 style={{...S.h2,color:"#92400e"}}>{secao.icone} {secao.titulo}</h2>
      <div style={{background:"#fef9c3",borderRadius:8,padding:"12px 14px",marginBottom:16,fontSize:12,color:"#713f12",lineHeight:1.6}}>
        ⏳ <strong>Seção pendente de preenchimento.</strong> O RT deve elaborar este plano e incluí-lo na SDBPF para conformidade com a legislação sanitária vigente.
      </div>
      <div style={S.h3}>Itens obrigatórios a incluir</div>
      <ul style={{margin:0,paddingLeft:20}}>
        {info.itens.map((item,i)=>(
          <li key={i} style={{fontSize:12,color:"#92400e",lineHeight:1.75,marginBottom:4}}>
            <span style={{marginRight:8}}>☐</span>{item}
          </li>
        ))}
      </ul>
      <div style={{marginTop:16,padding:"12px 14px",background:"#fff",borderRadius:8,border:"1px solid #fde68a",fontSize:12,color:"#713f12"}}>
        💡 Clique em <strong>Editar seção</strong> para adicionar as informações desta clínica.
      </div>
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Manual() {
  const [secaoAtiva, setSecaoAtiva] = useState("apresentacao");
  const [exportando,  setExportando]  = useState(false);
  const conteudoRef = useRef(null);
  const c = CLINICA_MOCK;

  const totalCompleto = SECOES.filter(s=>s.status==="completo").length;
  const pct = Math.round((totalCompleto/SECOES.length)*100);

  function exportarPDF() {
    setExportando(true);
    setTimeout(()=>{
      window.print();
      setExportando(false);
    },300);
  }

  function renderSecao(id) {
    switch(id) {
      case "apresentacao": return <SecaoApresentacao c={c}/>;
      case "politica":     return <SecaoPolitica/>;
      case "organograma":  return <SecaoOrganograma c={c}/>;
      case "pops":         return <SecaoPOPs/>;
      case "segpaciente":  return <SecaoSegPaciente/>;
      case "iras":         return <SecaoIRAS/>;
      case "versoes":      return <SecaoHistorico/>;
      default:             return <SecaoPendente secao={SECOES.find(s=>s.id===id)}/>;
    }
  }

  return (
    <div style={{fontFamily:"'IBM Plex Sans',system-ui,sans-serif",background:"#f1f5f9",minHeight:"100vh",display:"flex",flexDirection:"column"}}>

      {/* ── HEADER ── */}
      <div style={{background:"#0f172a",padding:"18px 28px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{margin:0,fontSize:19,fontWeight:700,color:"#f1f5f9",letterSpacing:"-.3px"}}>Manual de Boas Práticas de Funcionamento</h1>
          <p style={{margin:"3px 0 0",fontSize:12,color:"#64748b"}}>SDBPF · {c.razao_social} · RT: {c.responsavel_tecnico}</p>
        </div>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <div style={{background:"#1e293b",borderRadius:8,padding:"7px 14px",fontSize:12,color:"#94a3b8"}}>
            Conformidade: <strong style={{color: pct===100?"#4ade80":pct>=60?"#fbbf24":"#f87171"}}>{pct}%</strong>
          </div>
          <button onClick={exportarPDF} disabled={exportando} style={{padding:"8px 18px",borderRadius:8,border:"none",background:"#2563eb",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",opacity:exportando?.7:1}}>
            {exportando?"Gerando...":"⬇ Exportar PDF"}
          </button>
        </div>
      </div>

      {/* ── PROGRESS BAR ── */}
      <div style={{background:"#1e293b",height:4}}>
        <div style={{height:"100%",background:"#3b82f6",width:`${pct}%`,transition:"width .5s"}}/>
      </div>

      <div style={{display:"flex",flex:1,minHeight:0}}>

        {/* ── SIDEBAR ── */}
        <div style={{width:280,background:"#fff",borderRight:"1px solid #e2e8f0",overflowY:"auto",flexShrink:0}}>
          <div style={{padding:"16px 16px 8px",fontSize:10,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:".5px"}}>
            Seções — {totalCompleto}/{SECOES.length} completas
          </div>
          {SECOES.map(s=>{
            const ativa = secaoAtiva===s.id;
            const cfgStatus = { completo:{dot:"#16a34a"}, pendente:{dot:"#ca8a04"}, vencido:{dot:"#dc2626"} };
            const dot = cfgStatus[s.status]?.dot||"#94a3b8";
            return (
              <button key={s.id} onClick={()=>setSecaoAtiva(s.id)} style={{
                display:"flex",alignItems:"center",gap:10,width:"100%",textAlign:"left",
                padding:"11px 16px",border:"none",background:ativa?"#eff6ff":"transparent",
                cursor:"pointer",borderLeft:ativa?"3px solid #2563eb":"3px solid transparent",
                transition:"background .1s"
              }}>
                <span style={{fontSize:14,flexShrink:0}}>{s.icone}</span>
                <span style={{fontSize:12,fontWeight:ativa?600:400,color:ativa?"#1e40af":"#374151",flex:1,lineHeight:1.35}}>{s.titulo}</span>
                <span style={{width:7,height:7,borderRadius:"50%",background:dot,flexShrink:0}}/>
              </button>
            );
          })}
          <div style={{padding:"12px 16px",borderTop:"1px solid #e2e8f0",marginTop:8}}>
            <div style={{fontSize:10,fontWeight:700,color:"#94a3b8",textTransform:"uppercase",letterSpacing:".5px",marginBottom:8}}>Legenda</div>
            {[{cor:"#16a34a",label:"Completo"},{cor:"#ca8a04",label:"Pendente"},{cor:"#dc2626",label:"Vencido"}].map(l=>(
              <div key={l.label} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                <div style={{width:7,height:7,borderRadius:"50%",background:l.cor}}/>
                <span style={{fontSize:11,color:"#64748b"}}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── CONTEÚDO ── */}
        <div ref={conteudoRef} style={{flex:1,overflowY:"auto",padding:"24px 28px"}}>

          {/* Card de resumo de conformidade */}
          <div style={{background:"#fff",borderRadius:12,border:"1px solid #e2e8f0",padding:"18px 22px",marginBottom:20,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16}}>
            {[
              {label:"Seções completas",value:`${totalCompleto}/${SECOES.length}`,cor:"#16a34a"},
              {label:"POPs ativos",value:`${POPS_REFERENCIA.length}`,cor:"#0369a1"},
              {label:"Licença sanitária",value:"Vigente",cor:"#059669"},
              {label:"Prazo RDC 1.002/2025",value:"16/12/2026",cor:"#dc2626"},
            ].map(item=>(
              <div key={item.label} style={{textAlign:"center",padding:"12px",background:item.cor+"08",borderRadius:9,border:`1px solid ${item.cor}25`}}>
                <div style={{fontSize:20,fontWeight:700,color:item.cor}}>{item.value}</div>
                <div style={{fontSize:11,color:"#64748b",marginTop:3}}>{item.label}</div>
              </div>
            ))}
          </div>

          {renderSecao(secaoAtiva)}

        </div>
      </div>

      {/* ── PRINT STYLES ── */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .print-area, .print-area * { visibility: visible; }
          .print-area { position: absolute; left: 0; top: 0; width: 100%; }
        }
      `}</style>

    </div>
  );
}
