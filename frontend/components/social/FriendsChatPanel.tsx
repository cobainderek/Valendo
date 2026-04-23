'use client'

import { useState } from 'react'
import { DoodleIcon } from '@/components/ui/DoodleIcon'

interface Amigo {
  id: string
  apelido: string
  status: 'online' | 'em-duelo' | 'offline'
  rank: string
  cor: string
}

interface Grupo {
  id: string
  nome: string
  membros: number
  cor: string
  emoji: string
}

interface Mensagem {
  id: string
  autor: string
  texto: string
  hora: string
  eu?: boolean
}

type Conversa =
  | { tipo: 'amigo'; amigo: Amigo }
  | { tipo: 'grupo'; grupo: Grupo }

const AMIGOS_MOCK: Amigo[] = [
  { id: '1', apelido: 'mari.04',    status: 'online',   rank: 'Diamante', cor: '#DB2777' },
  { id: '2', apelido: 'leo_z',      status: 'em-duelo', rank: 'Platina',  cor: '#7C3AED' },
  { id: '3', apelido: 'bia.99',     status: 'online',   rank: 'Ouro',     cor: '#059669' },
  { id: '4', apelido: 'rafa_x',     status: 'offline',  rank: 'Prata',    cor: '#6B7BA8' },
  { id: '5', apelido: 'ju.pereira', status: 'online',   rank: 'Ouro',     cor: '#D97706' },
  { id: '6', apelido: 'gab_dev',    status: 'em-duelo', rank: 'Diamante', cor: '#1B4FBE' },
  { id: '7', apelido: 'thi.lima',   status: 'offline',  rank: 'Bronze',   cor: '#E8601C' },
]

const GRUPOS_MOCK: Grupo[] = [
  { id: 'g1', nome: 'Cálc 3 — turma B',       membros: 6,  cor: '#1B4FBE', emoji: '∫' },
  { id: 'g2', nome: 'Bio — resumos',          membros: 12, cor: '#059669', emoji: '🧬' },
  { id: 'g3', nome: 'galera do enem',         membros: 23, cor: '#E8601C', emoji: '📚' },
]

const MENSAGENS_POR_AMIGO: Record<string, Mensagem[]> = {
  '1': [
    { id: '1', autor: 'mari.04', texto: 'cara, tô travada na prova de cálc 3', hora: '14:02' },
    { id: '2', autor: 'mari.04', texto: 'alguém quer revisar integral dupla?', hora: '14:02' },
    { id: '3', autor: 'eu',      texto: 'bora, tô criando sala agora',          hora: '14:05', eu: true },
  ],
  '3': [
    { id: '1', autor: 'bia.99',  texto: 'me chama no código aí',                hora: '14:06' },
  ],
  '2': [
    { id: '1', autor: 'leo_z',   texto: 'entrei no matchmaking mas tá demorando', hora: '14:08' },
  ],
  '5': [
    { id: '1', autor: 'ju.pereira', texto: 'alguém viu a apostila nova do prof?', hora: '14:12' },
  ],
}

const MENSAGENS_POR_GRUPO: Record<string, Mensagem[]> = {
  'g1': [
    { id: '1', autor: 'mari.04',    texto: 'gente, prova quinta',                 hora: '13:40' },
    { id: '2', autor: 'leo_z',      texto: 'alguém tem o resumo da aula 8?',      hora: '13:45' },
    { id: '3', autor: 'eu',         texto: 'subo aqui daqui a pouco',             hora: '13:46', eu: true },
  ],
  'g2': [
    { id: '1', autor: 'bia.99',     texto: 'divisão celular eu simplesmente não entendo', hora: '12:20' },
  ],
  'g3': [],
}

interface FriendsChatPanelProps {
  onConvidar?: (amigoId: string) => void
  onFechar?: () => void
}

export function FriendsChatPanel({ onConvidar, onFechar }: FriendsChatPanelProps) {
  const [conversa, setConversa] = useState<Conversa | null>(null)

  return (
    <aside
      style={{
        width: 320,
        height: '100vh',
        position: 'fixed',
        top: 0,
        right: 0,
        background: 'var(--bg-card)',
        borderLeft: '3px solid var(--ink)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 50,
        boxShadow: '-6px 0 24px rgba(13, 48, 128, 0.12)',
      }}
    >
      {conversa ? (
        <ChatHeader
          conversa={conversa}
          onVoltar={() => setConversa(null)}
          onFechar={onFechar}
        />
      ) : (
        <ListaHeader onFechar={onFechar} />
      )}

      {conversa ? (
        <ChatView conversa={conversa} />
      ) : (
        <ListaConteudo
          onAbrirAmigo={(a) => setConversa({ tipo: 'amigo', amigo: a })}
          onAbrirGrupo={(g) => setConversa({ tipo: 'grupo', grupo: g })}
          onConvidar={onConvidar}
        />
      )}
    </aside>
  )
}

function ListaHeader({ onFechar }: { onFechar?: () => void }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '14px 16px',
        borderBottom: '2.5px solid var(--ink)',
        background: 'var(--primary-soft)',
      }}
    >
      <DoodleIcon name="people" size={20} strokeColor="var(--primary-dark)" />
      <span
        style={{
          flex: 1,
          fontFamily: 'var(--font-ui)',
          fontWeight: 900,
          fontSize: 16,
          color: 'var(--primary-dark)',
          letterSpacing: '-0.01em',
        }}
      >
        Amigos
      </span>
      {onFechar && <BotaoFechar onFechar={onFechar} />}
    </div>
  )
}

function ChatHeader({
  conversa,
  onVoltar,
  onFechar,
}: {
  conversa: Conversa
  onVoltar: () => void
  onFechar?: () => void
}) {
  const titulo = conversa.tipo === 'amigo' ? conversa.amigo.apelido : conversa.grupo.nome
  const subtitulo =
    conversa.tipo === 'amigo'
      ? (conversa.amigo.status === 'em-duelo' ? 'em duelo' : conversa.amigo.status)
      : `${conversa.grupo.membros} membros`
  const cor = conversa.tipo === 'amigo' ? conversa.amigo.cor : conversa.grupo.cor
  const inicial =
    conversa.tipo === 'amigo'
      ? conversa.amigo.apelido.charAt(0).toUpperCase()
      : conversa.grupo.emoji

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 14px',
        borderBottom: '2.5px solid var(--ink)',
        background: 'var(--bg-card)',
      }}
    >
      <button
        type="button"
        onClick={onVoltar}
        title="Voltar pra lista"
        style={{
          width: 32,
          height: 32,
          border: '2px solid var(--ink)',
          borderRadius: 8,
          background: 'var(--bg-card)',
          cursor: 'pointer',
          display: 'grid',
          placeItems: 'center',
          fontFamily: 'var(--font-ui)',
          fontWeight: 900,
          fontSize: 16,
          color: 'var(--ink)',
        }}
      >
        ←
      </button>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: cor,
          border: '2.5px solid var(--ink)',
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          fontFamily: 'var(--font-ui)',
          fontWeight: 900,
          fontSize: 15,
          flexShrink: 0,
        }}
      >
        {inicial}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontWeight: 900,
            fontSize: 14,
            color: 'var(--ink)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {titulo}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>
          {subtitulo}
        </div>
      </div>
      {onFechar && <BotaoFechar onFechar={onFechar} />}
    </div>
  )
}

function BotaoFechar({ onFechar }: { onFechar: () => void }) {
  return (
    <button
      type="button"
      onClick={onFechar}
      title="Minimizar"
      style={{
        width: 32,
        height: 32,
        border: '2px solid var(--ink)',
        borderRadius: 8,
        background: 'var(--bg-page)',
        cursor: 'pointer',
        display: 'grid',
        placeItems: 'center',
        fontFamily: 'var(--font-ui)',
        fontWeight: 900,
        fontSize: 18,
        color: 'var(--muted)',
        lineHeight: 1,
      }}
    >
      ×
    </button>
  )
}

interface ListaConteudoProps {
  onAbrirAmigo: (a: Amigo) => void
  onAbrirGrupo: (g: Grupo) => void
  onConvidar?: (amigoId: string) => void
}

function ListaConteudo({ onAbrirAmigo, onAbrirGrupo, onConvidar }: ListaConteudoProps) {
  const online = AMIGOS_MOCK.filter((a) => a.status === 'online')
  const emDuelo = AMIGOS_MOCK.filter((a) => a.status === 'em-duelo')
  const offline = AMIGOS_MOCK.filter((a) => a.status === 'offline')

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
      <SectionHeader label={`Grupos — ${GRUPOS_MOCK.length}`} />
      {GRUPOS_MOCK.map((g) => (
        <GrupoRow key={g.id} grupo={g} onAbrir={() => onAbrirGrupo(g)} />
      ))}

      <SectionHeader label={`Online — ${online.length}`} />
      {online.map((a) => (
        <AmigoRow
          key={a.id}
          amigo={a}
          onAbrir={() => onAbrirAmigo(a)}
          onConvidar={onConvidar}
        />
      ))}

      {emDuelo.length > 0 && (
        <>
          <SectionHeader label={`Em duelo — ${emDuelo.length}`} />
          {emDuelo.map((a) => (
            <AmigoRow
              key={a.id}
              amigo={a}
              onAbrir={() => onAbrirAmigo(a)}
              onConvidar={onConvidar}
            />
          ))}
        </>
      )}

      {offline.length > 0 && (
        <>
          <SectionHeader label={`Offline — ${offline.length}`} />
          {offline.map((a) => (
            <AmigoRow
              key={a.id}
              amigo={a}
              onAbrir={() => onAbrirAmigo(a)}
            />
          ))}
        </>
      )}
    </div>
  )
}

function SectionHeader({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: '10px 8px 6px',
        fontSize: 11,
        fontWeight: 900,
        color: 'var(--muted)',
        letterSpacing: 1.2,
        textTransform: 'uppercase',
      }}
    >
      {label}
    </div>
  )
}

function AmigoRow({
  amigo,
  onAbrir,
  onConvidar,
}: {
  amigo: Amigo
  onAbrir: () => void
  onConvidar?: (id: string) => void
}) {
  const statusCor =
    amigo.status === 'online' ? 'var(--green)' :
    amigo.status === 'em-duelo' ? 'var(--accent)' : 'var(--muted)'

  const offline = amigo.status === 'offline'

  return (
    <div
      role="button"
      tabIndex={offline ? -1 : 0}
      onClick={() => { if (!offline) onAbrir() }}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !offline) {
          e.preventDefault()
          onAbrir()
        }
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 8px',
        borderRadius: 10,
        opacity: offline ? 0.55 : 1,
        cursor: offline ? 'default' : 'pointer',
        transition: 'background .12s ease',
      }}
      onMouseEnter={(e) => {
        if (!offline) e.currentTarget.style.background = 'var(--primary-soft)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'transparent'
      }}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            background: amigo.cor,
            border: '2.5px solid var(--ink)',
            display: 'grid',
            placeItems: 'center',
            color: '#fff',
            fontFamily: 'var(--font-ui)',
            fontWeight: 900,
            fontSize: 15,
          }}
        >
          {amigo.apelido.charAt(0).toUpperCase()}
        </div>
        <span
          style={{
            position: 'absolute',
            right: -2,
            bottom: -2,
            width: 12,
            height: 12,
            borderRadius: 999,
            background: statusCor,
            border: '2px solid var(--bg-card)',
          }}
        />
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontWeight: 800,
            fontSize: 13,
            color: 'var(--ink)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {amigo.apelido}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>
          {amigo.status === 'em-duelo' ? 'em duelo' : amigo.rank}
        </div>
      </div>
      {amigo.status === 'online' && onConvidar && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onConvidar(amigo.id)
          }}
          title="Convidar pra sala"
          style={{
            width: 30,
            height: 30,
            border: '2px solid var(--ink)',
            borderRadius: 8,
            background: 'var(--accent)',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            boxShadow: '2px 2px 0 var(--ink)',
          }}
        >
          <DoodleIcon name="plus" size={14} strokeColor="var(--accent-ink)" />
        </button>
      )}
    </div>
  )
}

function GrupoRow({ grupo, onAbrir }: { grupo: Grupo; onAbrir: () => void }) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onAbrir}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onAbrir()
        }
      }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 8px',
        borderRadius: 10,
        cursor: 'pointer',
        transition: 'background .12s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary-soft)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: 10,
          background: grupo.cor,
          border: '2.5px solid var(--ink)',
          display: 'grid',
          placeItems: 'center',
          color: '#fff',
          fontFamily: 'var(--font-ui)',
          fontWeight: 900,
          fontSize: 18,
          flexShrink: 0,
        }}
      >
        {grupo.emoji}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontWeight: 800,
            fontSize: 13,
            color: 'var(--ink)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {grupo.nome}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>
          {grupo.membros} membros
        </div>
      </div>
    </div>
  )
}

function ChatView({ conversa }: { conversa: Conversa }) {
  const iniciais =
    conversa.tipo === 'amigo'
      ? MENSAGENS_POR_AMIGO[conversa.amigo.id] ?? []
      : MENSAGENS_POR_GRUPO[conversa.grupo.id] ?? []

  const [mensagens, setMensagens] = useState<Mensagem[]>(iniciais)
  const [rascunho, setRascunho] = useState('')

  function enviar(e: React.FormEvent) {
    e.preventDefault()
    const txt = rascunho.trim()
    if (!txt) return
    setMensagens((m) => [
      ...m,
      {
        id: String(Date.now()),
        autor: 'eu',
        texto: txt,
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        eu: true,
      },
    ])
    setRascunho('')
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '14px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}
      >
        {mensagens.length === 0 && (
          <div
            style={{
              margin: 'auto',
              textAlign: 'center',
              color: 'var(--muted)',
              fontWeight: 700,
              fontSize: 13,
              padding: 20,
            }}
          >
            manda a primeira mensagem aí
          </div>
        )}
        {mensagens.map((m) => (
          <div
            key={m.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: m.eu ? 'flex-end' : 'flex-start',
            }}
          >
            {!m.eu && conversa.tipo === 'grupo' && (
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 900,
                  color: 'var(--muted)',
                  marginBottom: 2,
                  marginLeft: 4,
                }}
              >
                {m.autor}
              </div>
            )}
            <div
              style={{
                maxWidth: '82%',
                padding: '8px 12px',
                background: m.eu ? 'var(--primary)' : 'var(--bg-cream)',
                color: m.eu ? '#fff' : 'var(--ink)',
                border: '2.5px solid var(--ink)',
                borderRadius: 12,
                boxShadow: '2px 2px 0 var(--ink)',
                fontSize: 13,
                fontWeight: 600,
                lineHeight: 1.35,
                wordBreak: 'break-word',
              }}
            >
              {m.texto}
            </div>
            <div
              style={{
                fontSize: 10,
                color: 'var(--muted)',
                fontWeight: 700,
                marginTop: 2,
                marginInline: 4,
              }}
            >
              {m.hora}
            </div>
          </div>
        ))}
      </div>
      <form
        onSubmit={enviar}
        style={{
          padding: 10,
          borderTop: '2.5px solid var(--ink)',
          display: 'flex',
          gap: 8,
          background: 'var(--bg-page)',
        }}
      >
        <input
          value={rascunho}
          onChange={(e) => setRascunho(e.target.value)}
          placeholder="manda a real…"
          style={{
            flex: 1,
            padding: '10px 12px',
            border: '2.5px solid var(--ink)',
            borderRadius: 10,
            background: '#fff',
            fontFamily: 'var(--font-ui)',
            fontWeight: 600,
            fontSize: 13,
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={!rascunho.trim()}
          style={{
            width: 42,
            border: '2.5px solid var(--ink)',
            borderRadius: 10,
            background: rascunho.trim() ? 'var(--accent)' : 'var(--border)',
            cursor: rascunho.trim() ? 'pointer' : 'not-allowed',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '2px 2px 0 var(--ink)',
          }}
        >
          <DoodleIcon name="play" size={16} strokeColor="var(--accent-ink)" />
        </button>
      </form>
    </div>
  )
}
