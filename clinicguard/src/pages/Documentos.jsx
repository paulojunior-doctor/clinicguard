/**
 * ClinicGuard — Módulo de Documentos (Cofre Digital)
 * Upload e download de PDFs via Supabase Storage, com categorização,
 * registro na tabela `documentos` (escopo por clínica) e análise
 * de documentos por IA para Controle de Pragas e Vetores.
 *
 * Instalação:
 *   npm install @supabase/supabase-js
 *
 * Configuração:
 *   Crie src/lib/supabase.js com:
 *     import { createClient } from '@supabase/supabase-js'
 *     export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
 *
 * Uso:
 *   import Documentos from './Documentos'
 *   <Documentos />
 */

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { useDocumentos, useObrigacoes, gerarObrigacoesDoManual } from '@/lib/useSupabase'
import ConferenciaExtracao from '@/components/ConferenciaExtracao'

const BUCKET = 'documentos'

const CATEGORIAS = [
  { id: 'outros', label: 'Outros documentos' },
  { id: 'controle_pragas', label: 'Controle de Pragas e Vetores' },
]

function labelCategoria(id) {
  return CATEGORIAS.find(c => c.id === id)?.label || 'Outros documentos'
}

// ─── Helpers ────────────────────────────────────────────────────────────────
function formatBytes(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
}

// ─── Estilos ────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=DM+Sans:wght@400;500&display=swap');

  .cg-docs * { box-sizing: border-box; margin: 0; padding: 0; }

  .cg-docs {
    font-family: 'DM Sans', sans-serif;
    background: #f7f6f2;
    min-height: 100vh;
    padding: 40px 32px;
    color: #1a1916;
  }

  .cg-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 36px;
    flex-wrap: wrap;
    gap: 16px;
  }

  .cg-title {
    font-family: 'Syne', sans-serif;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.5px;
    color: #1a1916;
    line-height: 1;
  }

  .cg-title span {
    color: #c8692a;
  }

  .cg-subtitle {
    font-size: 13px;
    color: #7a7870;
    margin-top: 5px;
  }

  /* Categoria select */
  .cg-categoria-wrap {
    margin-bottom: 16px;
  }

  .cg-categoria-label {
    font-size: 12px;
    font-weight: 500;
    color: #7a7870;
    margin-bottom: 6px;
    display: block;
  }

  .cg-select {
    width: 100%;
    max-width: 320px;
    height: 40px;
    border: 1px solid #dedad4;
    border-radius: 8px;
    padding: 0 12px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    background: #fff;
    color: #1a1916;
    outline: none;
    cursor: pointer;
  }

  .cg-select:focus { border-color: #c8692a; }

  /* Badge de categoria na lista */
  .cg-badge {
    display: inline-block;
    font-size: 10px;
    font-weight: 500;
    padding: 2px 8px;
    border-radius: 99px;
    background: #f0ede8;
    color: #7a7870;
    margin-top: 3px;
  }

  .cg-badge.pragas {
    background: #fff0e8;
    color: #c8692a;
  }

  /* Upload zone */
  .cg-upload-zone {
    border: 1.5px dashed #d4cfc7;
    border-radius: 12px;
    padding: 32px 24px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
    background: #ffffff;
    margin-bottom: 32px;
    position: relative;
  }

  .cg-upload-zone.dragging {
    border-color: #c8692a;
    background: #fff8f4;
  }

  .cg-upload-zone input[type="file"] {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
    width: 100%;
    height: 100%;
  }

  .cg-upload-icon {
    width: 40px;
    height: 40px;
    background: #f0ede8;
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 12px;
  }

  .cg-upload-icon svg {
    width: 20px;
    height: 20px;
    stroke: #7a7870;
  }

  .cg-upload-label {
    font-size: 14px;
    font-weight: 500;
    color: #1a1916;
  }

  .cg-upload-label em {
    font-style: normal;
    color: #c8692a;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  .cg-upload-hint {
    font-size: 12px;
    color: #aaa8a2;
    margin-top: 4px;
  }

  /* Progress bar */
  .cg-progress-wrap {
    margin-bottom: 32px;
    background: #fff;
    border-radius: 10px;
    padding: 16px 20px;
    border: 1px solid #ebe8e2;
  }

  .cg-progress-name {
    font-size: 13px;
    color: #1a1916;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
  }

  .cg-progress-bar-bg {
    height: 4px;
    background: #ebe8e2;
    border-radius: 99px;
    overflow: hidden;
  }

  .cg-progress-bar {
    height: 100%;
    background: #c8692a;
    border-radius: 99px;
    transition: width 0.3s;
  }

  /* Toast */
  .cg-toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    padding: 12px 20px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    z-index: 1000;
    animation: cg-slidein 0.25s ease;
    display: flex;
    align-items: center;
    gap: 8px;
    max-width: 320px;
  }

  .cg-toast.success { background: #1a1916; color: #fff; }
  .cg-toast.error   { background: #c8692a; color: #fff; }

  @keyframes cg-slidein {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* Toolbar */
  .cg-toolbar {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }

  .cg-search {
    flex: 1;
    min-width: 200px;
    height: 38px;
    border: 1px solid #dedad4;
    border-radius: 8px;
    padding: 0 12px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    background: #fff;
    color: #1a1916;
    outline: none;
    transition: border-color 0.15s;
  }

  .cg-search:focus { border-color: #c8692a; }
  .cg-search::placeholder { color: #b0ada7; }

  .cg-btn {
    height: 38px;
    padding: 0 16px;
    border-radius: 8px;
    font-size: 13px;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    cursor: pointer;
    transition: opacity 0.15s, transform 0.1s;
    border: none;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .cg-btn:active { transform: scale(0.97); }
  .cg-btn-primary { background: #1a1916; color: #fff; }
  .cg-btn-primary:hover { opacity: 0.85; }
  .cg-btn-ghost { background: transparent; color: #7a7870; border: 1px solid #dedad4; }
  .cg-btn-ghost:hover { background: #f0ede8; color: #1a1916; }
  .cg-btn-danger { background: transparent; color: #c8692a; border: 1px solid #e8c5ad; }
  .cg-btn-danger:hover { background: #fff8f4; }
  .cg-btn:disabled { opacity: 0.45; cursor: not-allowed; }

  /* Stats */
  .cg-stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
    margin-bottom: 24px;
  }

  .cg-stat {
    background: #fff;
    border: 1px solid #ebe8e2;
    border-radius: 10px;
    padding: 14px 16px;
  }

  .cg-stat-label {
    font-size: 11px;
    color: #aaa8a2;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    margin-bottom: 4px;
  }

  .cg-stat-value {
    font-family: 'Syne', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: #1a1916;
  }

  /* File list */
  .cg-list {
    background: #fff;
    border: 1px solid #ebe8e2;
    border-radius: 12px;
    overflow: hidden;
  }

  .cg-list-header {
    display: grid;
    grid-template-columns: 1fr 100px 120px 130px;
    padding: 10px 20px;
    border-bottom: 1px solid #f0ede8;
    font-size: 11px;
    color: #aaa8a2;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    font-weight: 500;
  }

  .cg-file-row {
    display: grid;
    grid-template-columns: 1fr 100px 120px 130px;
    padding: 14px 20px;
    align-items: center;
    border-bottom: 1px solid #f7f6f2;
    transition: background 0.1s;
  }

  .cg-file-row:last-child { border-bottom: none; }
  .cg-file-row:hover { background: #faf9f7; }

  .cg-file-name {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    color: #1a1916;
    font-weight: 500;
    overflow: hidden;
  }

  .cg-file-name-col {
    overflow: hidden;
  }

  .cg-file-name-text {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
  }

  .cg-file-icon {
    width: 32px;
    height: 32px;
    background: #fff0e8;
    border-radius: 7px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .cg-file-icon svg { width: 16px; height: 16px; stroke: #c8692a; }

  .cg-file-size, .cg-file-date {
    font-size: 13px;
    color: #7a7870;
  }

  .cg-file-actions {
    display: flex;
    gap: 6px;
    justify-content: flex-end;
  }

  .cg-icon-btn {