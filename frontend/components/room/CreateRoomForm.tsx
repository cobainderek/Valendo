'use client'

import { useRef, useState } from 'react'
import { DoodleIcon } from '@/components/ui/DoodleIcon'
import type { Tema } from '@/lib/temas'

// PDFs maiores que isso costumam estourar o limite do upload/extração.
const TAMANHO_MAX_PDF_MB = 10

export interface NovaSala {
  nome: string
  temaId: string
  maxJogadores: number
  tempoPergunta: number
  /** Quantidade de perguntas do duelo (3–20). */
  numPerguntas: number
  privada: boolean
  soloMode: boolean
  /** Material de estudo opcional — perguntas saem do PDF em vez do tema. */
  arquivoPdf: File | null
}

interface CreateRoomFormProps {
  temas: Tema[]
  temaInicial?: string
  carregando?: boolean
  /** Texto do botão enquanto carrega (ex.: "Gerando perguntas do PDF…"). */
  textoCarregando?: string
  erro?: string
  onSubmit: (sala: NovaSala) => void
  onCancelar: () => void
}

export function CreateRoomForm({
  temas,
  temaInicial,
  carregando,
  textoCarregando,
  erro,
  onSubmit,
  onCancelar,
}: CreateRoomFormProps) {
  const [nome, setNome] = useState('')
  const [temaId, setTemaId] = useState(temaInicial || temas[0]?.id || '')
  const [maxJogadores, setMaxJogadores] = useState(4)
  const [tempoPergunta, setTempoPergunta] = useState(20)
  const [numPerguntas, setNumPerguntas] = useState(10)
  const [privada, setPrivada] = useState(false)
  const [soloMode, setSoloMode] = useState(false)
  const [arquivoPdf, setArquivoPdf] = useState<File | null>(null)
  const [erroPdf, setErroPdf] = useState('')
  const inputPdfRef = useRef<HTMLInputElement>(null)

  function aoEscolherPdf(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0] ?? null
    setErroPdf('')
    if (!arquivo) {
      setArquivoPdf(null)
      return
    }
    if (arquivo.type !== 'application/pdf' && !arquivo.name.toLowerCase().endsWith('.pdf')) {
      setErroPdf('Só aceitamos PDF por enquanto.')
      setArquivoPdf(null)
      return
    }
    if (arquivo.size > TAMANHO_MAX_PDF_MB * 1024 * 1024) {
      setErroPdf(`PDF muito grande — máximo de ${TAMANHO_MAX_PDF_MB} MB.`)
      setArquivoPdf(null)
      return
    }
    setArquivoPdf(arquivo)
  }

  function removerPdf() {
    setArquivoPdf(null)
    setErroPdf('')
    if (inputPdfRef.current) inputPdfRef.current.value = ''
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmit({ nome: nome.trim(), temaId, maxJogadores: soloMode ? 2 : maxJogadores, tempoPergunta, numPerguntas, privada, soloMode, arquivoPdf })
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Modo de jogo */}
      <div>
        <span style={{ display: 'block', fontWeight: 800, fontSize: 13, marginBottom: 8 }}>
          Modo de jogo
        </span>
        <div className="createform-modegrid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <button
            type="button"
            onClick={() => setSoloMode(false)}
            style={{
              padding: '14px 12px',
              border: '2.5px solid var(--ink)',
              borderRadius: 12,
              background: !soloMode ? 'var(--primary)' : 'var(--bg-card)',
              color: !soloMode ? '#fff' : 'var(--ink)',
              boxShadow: !soloMode ? '2px 2px 0 var(--ink)' : 'none',
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer',
              textAlign: 'center',
              font: 'inherit',
            }}
          >
            <DoodleIcon name="people" size={20} strokeColor={!soloMode ? '#fff' : 'var(--ink)'} color="transparent" />
            <div style={{ marginTop: 4 }}>Multiplayer</div>
          </button>
          <button
            type="button"
            onClick={() => setSoloMode(true)}
            style={{
              padding: '14px 12px',
              border: '2.5px solid var(--ink)',
              borderRadius: 12,
              background: soloMode ? 'var(--accent)' : 'var(--bg-card)',
              color: soloMode ? 'var(--accent-ink)' : 'var(--ink)',
              boxShadow: soloMode ? '2px 2px 0 var(--ink)' : 'none',
              fontWeight: 800,
              fontSize: 14,
              cursor: 'pointer',
              textAlign: 'center',
              font: 'inherit',
            }}
          >
            <DoodleIcon name="bolt" size={20} strokeColor={soloMode ? 'var(--accent-ink)' : 'var(--ink)'} color="transparent" />
            <div style={{ marginTop: 4 }}>Solo vs Bot</div>
          </button>
        </div>
      </div>

      {/* Nome */}
      <label className="input-wrap" style={{ margin: 0 }}>
        <span style={{ display: 'block', fontWeight: 800, fontSize: 13, marginBottom: 6 }}>
          Nome da sala
        </span>
        <input
          className="input"
          placeholder="ex: cálculo pra prova"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          maxLength={40}
          style={{ paddingLeft: 16 }}
          required
        />
      </label>

      {/* Tema — chips */}
      <div>
        <span style={{ display: 'block', fontWeight: 800, fontSize: 13, marginBottom: 8 }}>
          Tema
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {temas.map((t) => {
            const ativo = t.id === temaId
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTemaId(t.id)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  border: '2.5px solid var(--ink)',
                  borderRadius: 10,
                  background: ativo ? 'var(--accent)' : 'var(--bg-card)',
                  color: ativo ? 'var(--accent-ink)' : 'var(--ink)',
                  boxShadow: ativo ? '2px 2px 0 var(--ink)' : 'none',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 800,
                  fontSize: 13,
                  cursor: 'pointer',
                }}
              >
                <DoodleIcon name={t.icon} size={16} color={t.color} />
                {t.nome}
              </button>
            )
          })}
        </div>
      </div>

      {/* Material de estudo — PDF opcional pra gerar as perguntas via IA */}
      <div>
        <span style={{ display: 'block', fontWeight: 800, fontSize: 13, marginBottom: 8 }}>
          Material de estudo <span style={{ color: 'var(--muted)', fontWeight: 700 }}>(opcional)</span>
        </span>
        <input
          ref={inputPdfRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={aoEscolherPdf}
          style={{ display: 'none' }}
        />
        {arquivoPdf ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 14px',
              border: '2.5px solid var(--ink)',
              borderRadius: 12,
              background: 'var(--bg-cream)',
              boxShadow: 'var(--shadow-doodle-sm)',
            }}
          >
            <span style={{ fontSize: 20 }}>📄</span>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 13,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {arquivoPdf.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>
                {(arquivoPdf.size / 1024 / 1024).toFixed(1)} MB — as perguntas vão sair desse material
              </div>
            </div>
            <button
              type="button"
              onClick={removerPdf}
              title="Remover PDF"
              style={{
                width: 30,
                height: 30,
                border: '2px solid var(--ink)',
                borderRadius: 8,
                background: 'var(--bg-page)',
                cursor: 'pointer',
                fontWeight: 900,
                fontSize: 16,
                color: 'var(--red)',
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputPdfRef.current?.click()}
            style={{
              width: '100%',
              padding: '14px 12px',
              border: '2.5px dashed var(--muted)',
              borderRadius: 12,
              background: 'var(--bg-card)',
              cursor: 'pointer',
              fontFamily: 'var(--font-ui)',
              fontWeight: 800,
              fontSize: 13,
              color: 'var(--muted)',
            }}
          >
            📎 Anexar apostila em PDF — a IA gera as perguntas do seu material
          </button>
        )}
        {erroPdf && (
          <div style={{ marginTop: 6, fontSize: 12, fontWeight: 800, color: 'var(--red)' }}>
            {erroPdf}
          </div>
        )}
      </div>

      {/* Jogadores + perguntas + tempo — lado a lado */}
      <div className="createform-steppers" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {!soloMode && (
          <StepperField
            label="Máx. jogadores"
            value={maxJogadores}
            min={2}
            max={10}
            step={1}
            onChange={setMaxJogadores}
          />
        )}
        <StepperField
          label="Nº de perguntas"
          value={numPerguntas}
          min={3}
          max={20}
          step={1}
          onChange={setNumPerguntas}
        />
        <StepperField
          label="Tempo por pergunta (s)"
          value={tempoPergunta}
          min={10}
          max={60}
          step={5}
          onChange={setTempoPergunta}
        />
      </div>

      {/* Privacidade */}
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 16px',
          border: '2.5px solid var(--ink)',
          borderRadius: 12,
          boxShadow: 'var(--shadow-doodle-sm)',
          background: 'var(--bg-card)',
          cursor: 'pointer',
        }}
      >
        <div>
          <div style={{ fontWeight: 800, fontSize: 14 }}>Sala privada</div>
          <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600, marginTop: 2 }}>
            Só quem tem o código consegue entrar.
          </div>
        </div>
        <input
          type="checkbox"
          checked={privada}
          onChange={(e) => setPrivada(e.target.checked)}
          style={{ width: 22, height: 22, accentColor: 'var(--primary)' }}
        />
      </label>

      {erro && (
        <div
          style={{
            padding: '10px 14px',
            background: '#FEE2E2',
            border: '2px solid var(--red)',
            borderRadius: 10,
            color: 'var(--red)',
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          {erro}
        </div>
      )}

      {/* Ações */}
      <div className="createform-actions" style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button
          type="button"
          className="btn"
          style={{ flex: '0 0 auto', padding: '12px 18px' }}
          onClick={onCancelar}
          disabled={carregando}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-accent"
          style={{ flex: 1, padding: '12px 18px', fontSize: 15 }}
          disabled={carregando || !nome.trim()}
        >
          {carregando ? (textoCarregando || 'Criando...') : 'Criar sala'}
          <DoodleIcon name="play" size={14} strokeColor="var(--accent-ink)" color="var(--accent-ink)" />
        </button>
      </div>
    </form>
  )
}

interface StepperFieldProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
}

function StepperField({ label, value, min, max, step, onChange }: StepperFieldProps) {
  function bump(delta: number) {
    const next = Math.min(max, Math.max(min, value + delta))
    onChange(next)
  }
  return (
    <div>
      <span style={{ display: 'block', fontWeight: 800, fontSize: 13, marginBottom: 6 }}>
        {label}
      </span>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          border: '2.5px solid var(--ink)',
          borderRadius: 12,
          boxShadow: 'var(--shadow-doodle-sm)',
          background: 'var(--bg-card)',
          overflow: 'hidden',
        }}
      >
        <button
          type="button"
          onClick={() => bump(-step)}
          style={{
            width: 40,
            height: 44,
            border: 'none',
            borderRight: '2.5px solid var(--ink)',
            background: 'transparent',
            fontWeight: 900,
            fontSize: 20,
            cursor: 'pointer',
          }}
          disabled={value <= min}
        >
          −
        </button>
        <div
          style={{
            flex: 1,
            textAlign: 'center',
            fontFamily: 'var(--font-ui)',
            fontWeight: 900,
            fontSize: 18,
          }}
        >
          {value}
        </div>
        <button
          type="button"
          onClick={() => bump(step)}
          style={{
            width: 40,
            height: 44,
            border: 'none',
            borderLeft: '2.5px solid var(--ink)',
            background: 'transparent',
            fontWeight: 900,
            fontSize: 20,
            cursor: 'pointer',
          }}
          disabled={value >= max}
        >
          +
        </button>
      </div>
    </div>
  )
}
