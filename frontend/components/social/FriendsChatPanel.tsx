'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { DoodleIcon } from '@/components/ui/DoodleIcon'
import {
  useChatStore,
  type Conversa,
  type Mensagem,
  type Amigo,
  type PedidoRecebido,
  type UsuarioBusca,
} from '@/lib/store/useChatStore'
import { useAuthStore } from '@/lib/store/useAuthStore'

// Paleta de cores pros avatares — escolhida de forma estável pelo id.
const CORES_AVATAR = ['#1B4FBE', '#7C3AED', '#DB2777', '#059669', '#D97706', '#E8601C', '#0D3080']

function corDoId(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) | 0
  return CORES_AVATAR[Math.abs(hash) % CORES_AVATAR.length]
}

function horaDe(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

// Convites pra sala viajam como mensagem comum com o código no texto
// (ex.: "⚔️ Bora duelar? Entra na minha sala: #AB12CD").
const REGEX_CONVITE = /#([A-Z0-9]{6})\b/

/** Código da sala atual quando o usuário está numa página /room/[code]. */
function useCodigoSalaAtual(): string | null {
  const pathname = usePathname() || ''
  const match = pathname.match(/^\/room\/([A-Za-z0-9]{4,8})$/)
  if (!match || match[1].toLowerCase() === 'create') return null
  return match[1].toUpperCase()
}

interface FriendsChatPanelProps {
  onFechar?: () => void
}

export function FriendsChatPanel({ onFechar }: FriendsChatPanelProps) {
  const conversas = useChatStore((s) => s.conversas)
  const conversaAtivaId = useChatStore((s) => s.conversaAtivaId)
  const fecharConversa = useChatStore((s) => s.fecharConversa)
  const iniciar = useChatStore((s) => s.iniciar)

  useEffect(() => {
    iniciar()
  }, [iniciar])

  const conversaAtiva = conversas.find((c) => c.id === conversaAtivaId) ?? null

  return (
    <aside
      className="painel-amigos"
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
      {conversaAtiva ? (
        <ChatHeader conversa={conversaAtiva} onVoltar={fecharConversa} onFechar={onFechar} />
      ) : (
        <ListaHeader onFechar={onFechar} />
      )}

      {conversaAtiva ? <ChatView conversa={conversaAtiva} /> : <ListaConteudo />}
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
  const titulo = conversa.title
  const subtitulo =
    conversa.type === 'group' ? `${conversa.members.length} membros` : 'conversa direta'
  const cor = corDoId(conversa.id)
  const inicial = (titulo || '?').charAt(0).toUpperCase()

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

function ListaConteudo() {
  const conversas = useChatStore((s) => s.conversas)
  const amigos = useChatStore((s) => s.amigos)
  const pedidos = useChatStore((s) => s.pedidos)
  const onlineIds = useChatStore((s) => s.onlineIds)
  const carregando = useChatStore((s) => s.carregando)
  const erro = useChatStore((s) => s.erro)
  const abrirConversa = useChatStore((s) => s.abrirConversa)
  const abrirDmComAmigo = useChatStore((s) => s.abrirDmComAmigo)

  const [criandoGrupo, setCriandoGrupo] = useState(false)

  const online = amigos.filter((a) => onlineIds.includes(a.id))
  const offline = amigos.filter((a) => !onlineIds.includes(a.id))

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
      <AdicionarAmigo />

      {erro && (
        <div
          style={{
            margin: '8px 4px',
            padding: '8px 10px',
            background: '#FEE2E2',
            border: '2px solid var(--red)',
            borderRadius: 10,
            color: 'var(--red)',
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          {erro}
        </div>
      )}

      {carregando && (
        <div style={{ padding: 16, textAlign: 'center', color: 'var(--muted)', fontWeight: 700, fontSize: 13 }}>
          Carregando...
        </div>
      )}

      {pedidos.length > 0 && (
        <>
          <SectionHeader label={`Pedidos — ${pedidos.length}`} />
          {pedidos.map((p) => (
            <PedidoRow key={p.id} pedido={p} />
          ))}
        </>
      )}

      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <SectionHeader label={`Conversas — ${conversas.length}`} />
        </div>
        <button
          type="button"
          onClick={() => setCriandoGrupo((v) => !v)}
          title="Criar grupo"
          style={{
            border: '2px solid var(--ink)',
            borderRadius: 8,
            background: criandoGrupo ? 'var(--border)' : 'var(--accent)',
            cursor: 'pointer',
            fontFamily: 'var(--font-ui)',
            fontWeight: 900,
            fontSize: 10,
            padding: '3px 8px',
            boxShadow: '2px 2px 0 var(--ink)',
            marginRight: 4,
            textTransform: 'uppercase',
            letterSpacing: 0.6,
          }}
        >
          {criandoGrupo ? 'cancelar' : '+ grupo'}
        </button>
      </div>

      {criandoGrupo && <NovoGrupoForm onCriado={() => setCriandoGrupo(false)} />}

      {conversas.length === 0 && !carregando && (
        <div style={{ padding: '4px 8px', color: 'var(--muted)', fontWeight: 700, fontSize: 12 }}>
          Nenhuma conversa ainda.
        </div>
      )}
      {conversas.map((c) => (
        <ConversaRow key={c.id} conversa={c} onAbrir={() => abrirConversa(c)} />
      ))}

      {amigos.length === 0 && !carregando && (
        <>
          <SectionHeader label="Amigos — 0" />
          <div style={{ padding: '8px 8px', color: 'var(--muted)', fontWeight: 700, fontSize: 12 }}>
            Nenhum amigo ainda. Adiciona alguém pela tag aí em cima! 👆
          </div>
        </>
      )}

      {online.length > 0 && (
        <>
          <SectionHeader label={`Online — ${online.length}`} />
          {online.map((a) => (
            <AmigoRow key={a.id} amigo={a} online onAbrir={() => abrirDmComAmigo(a.id)} />
          ))}
        </>
      )}

      {offline.length > 0 && (
        <>
          <SectionHeader label={`Offline — ${offline.length}`} />
          {offline.map((a) => (
            <AmigoRow key={a.id} amigo={a} online={false} onAbrir={() => abrirDmComAmigo(a.id)} />
          ))}
        </>
      )}
    </div>
  )
}

function NovoGrupoForm({ onCriado }: { onCriado: () => void }) {
  const amigos = useChatStore((s) => s.amigos)
  const criarGrupo = useChatStore((s) => s.criarGrupo)
  const [nome, setNome] = useState('')
  const [selecionados, setSelecionados] = useState<string[]>([])
  const [criando, setCriando] = useState(false)

  function alternar(id: string) {
    setSelecionados((atual) =>
      atual.includes(id) ? atual.filter((s) => s !== id) : [...atual, id],
    )
  }

  async function criar(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim() || selecionados.length === 0 || criando) return
    setCriando(true)
    try {
      const conv = await criarGrupo(nome, selecionados)
      if (conv) onCriado()
    } finally {
      setCriando(false)
    }
  }

  return (
    <form
      onSubmit={criar}
      style={{
        margin: '0 4px 8px',
        padding: 10,
        border: '2px dashed var(--primary)',
        borderRadius: 10,
        background: 'var(--primary-soft)',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      <input
        value={nome}
        onChange={(e) => setNome(e.target.value)}
        placeholder="nome do grupo…"
        maxLength={60}
        style={{
          padding: '8px 10px',
          border: '2.5px solid var(--ink)',
          borderRadius: 10,
          background: '#fff',
          fontFamily: 'var(--font-ui)',
          fontWeight: 600,
          fontSize: 12,
          outline: 'none',
        }}
      />
      {amigos.length === 0 ? (
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>
          Você precisa de amigos pra criar um grupo.
        </div>
      ) : (
        <div style={{ maxHeight: 140, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {amigos.map((a) => (
            <label
              key={a.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '4px 6px',
                borderRadius: 8,
                cursor: 'pointer',
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--ink)',
              }}
            >
              <input
                type="checkbox"
                checked={selecionados.includes(a.id)}
                onChange={() => alternar(a.id)}
              />
              {a.name}
              <span style={{ color: 'var(--muted)', fontWeight: 700, fontSize: 10 }}>@{a.tag}</span>
            </label>
          ))}
        </div>
      )}
      <button
        type="submit"
        disabled={!nome.trim() || selecionados.length === 0 || criando}
        style={{
          padding: '8px 10px',
          border: '2.5px solid var(--ink)',
          borderRadius: 10,
          background:
            nome.trim() && selecionados.length > 0 && !criando ? 'var(--accent)' : 'var(--border)',
          cursor:
            nome.trim() && selecionados.length > 0 && !criando ? 'pointer' : 'not-allowed',
          fontFamily: 'var(--font-ui)',
          fontWeight: 900,
          fontSize: 12,
          boxShadow: '2px 2px 0 var(--ink)',
        }}
      >
        {criando ? 'Criando...' : `Criar grupo (${selecionados.length} ${selecionados.length === 1 ? 'membro' : 'membros'})`}
      </button>
    </form>
  )
}

function AdicionarAmigo() {
  const enviarPedido = useChatStore((s) => s.enviarPedido)
  const buscarUsuarios = useChatStore((s) => s.buscarUsuarios)
  const [tag, setTag] = useState('')
  const [resultados, setResultados] = useState<UsuarioBusca[]>([])
  const [buscando, setBuscando] = useState(false)
  const [enviandoPara, setEnviandoPara] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ ok: boolean; texto: string } | null>(null)

  // Busca ao vivo com debounce — espera 300ms de digitação parada antes de
  // bater no /friends/search, e descarta respostas de buscas antigas.
  useEffect(() => {
    const termo = tag.trim()
    if (!termo) {
      setResultados([])
      setBuscando(false)
      return
    }
    setBuscando(true)
    let cancelado = false
    const timer = setTimeout(async () => {
      try {
        const encontrados = await buscarUsuarios(termo)
        if (!cancelado) setResultados(encontrados)
      } catch {
        if (!cancelado) setResultados([])
      } finally {
        if (!cancelado) setBuscando(false)
      }
    }, 300)
    return () => {
      cancelado = true
      clearTimeout(timer)
    }
  }, [tag, buscarUsuarios])

  async function enviarPara(tagDestino: string) {
    if (enviandoPara) return
    setEnviandoPara(tagDestino)
    setFeedback(null)
    try {
      await enviarPedido(tagDestino)
      setFeedback({ ok: true, texto: `Pedido enviado pra @${tagDestino}! 🤝` })
      setTag('')
      setResultados([])
    } catch (err) {
      setFeedback({
        ok: false,
        texto: err instanceof Error ? err.message : 'Erro ao enviar pedido.',
      })
    } finally {
      setEnviandoPara(null)
    }
  }

  function enviar(e: React.FormEvent) {
    e.preventDefault()
    const t = tag.trim()
    if (!t) return
    // Enter envia pro primeiro resultado da busca; sem resultado, tenta a tag exata.
    enviarPara(resultados[0]?.tag ?? t)
  }

  return (
    <div style={{ padding: '4px 4px 8px' }}>
      <form onSubmit={enviar} style={{ display: 'flex', gap: 6 }}>
        <input
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          placeholder="buscar por tag…"
          style={{
            flex: 1,
            padding: '8px 10px',
            border: '2.5px solid var(--ink)',
            borderRadius: 10,
            background: '#fff',
            fontFamily: 'var(--font-ui)',
            fontWeight: 600,
            fontSize: 12,
            outline: 'none',
            minWidth: 0,
          }}
        />
        <button
          type="submit"
          disabled={!tag.trim() || !!enviandoPara}
          title="Enviar pedido de amizade"
          style={{
            width: 36,
            border: '2.5px solid var(--ink)',
            borderRadius: 10,
            background: tag.trim() && !enviandoPara ? 'var(--accent)' : 'var(--border)',
            cursor: tag.trim() && !enviandoPara ? 'pointer' : 'not-allowed',
            display: 'grid',
            placeItems: 'center',
            boxShadow: '2px 2px 0 var(--ink)',
          }}
        >
          <DoodleIcon name="plus" size={14} strokeColor="var(--ink)" />
        </button>
      </form>

      {tag.trim() && (
        <div
          style={{
            marginTop: 6,
            border: '2px solid var(--ink)',
            borderRadius: 10,
            background: '#fff',
            overflow: 'hidden',
          }}
        >
          {buscando && (
            <div style={{ padding: '8px 10px', fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>
              Buscando...
            </div>
          )}
          {!buscando && resultados.length === 0 && (
            <div style={{ padding: '8px 10px', fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>
              Ninguém encontrado com essa tag.
            </div>
          )}
          {!buscando &&
            resultados.map((u) => (
              <div
                key={u.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 8px',
                  borderBottom: '1px solid var(--border)',
                  opacity: enviandoPara === u.tag ? 0.6 : 1,
                }}
              >
                <Avatar nome={u.name} id={u.id} tamanho={28} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: 12,
                      color: 'var(--ink)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {u.name}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', fontWeight: 700 }}>
                    @{u.tag} · {u.globalXp} XP
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => enviarPara(u.tag)}
                  disabled={!!enviandoPara}
                  title={`Enviar pedido pra @${u.tag}`}
                  style={{
                    width: 26,
                    height: 26,
                    border: '2px solid var(--ink)',
                    borderRadius: 8,
                    background: 'var(--accent)',
                    cursor: enviandoPara ? 'not-allowed' : 'pointer',
                    display: 'grid',
                    placeItems: 'center',
                    boxShadow: '2px 2px 0 var(--ink)',
                    flexShrink: 0,
                  }}
                >
                  <DoodleIcon name="plus" size={12} strokeColor="var(--ink)" />
                </button>
              </div>
            ))}
        </div>
      )}

      {feedback && (
        <div
          style={{
            marginTop: 6,
            fontSize: 11,
            fontWeight: 800,
            color: feedback.ok ? 'var(--green)' : 'var(--red)',
            paddingLeft: 2,
          }}
        >
          {feedback.texto}
        </div>
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

function PedidoRow({ pedido }: { pedido: PedidoRecebido }) {
  const aceitarPedido = useChatStore((s) => s.aceitarPedido)
  const rejeitarPedido = useChatStore((s) => s.rejeitarPedido)
  const [processando, setProcessando] = useState(false)

  async function agir(acao: () => Promise<void>) {
    if (processando) return
    setProcessando(true)
    try {
      await acao()
    } catch {
      // erro já vai pro estado global do store
    } finally {
      setProcessando(false)
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 8px',
        borderRadius: 10,
        background: 'var(--bg-cream)',
        border: '2px dashed var(--accent)',
        marginBottom: 6,
        opacity: processando ? 0.6 : 1,
      }}
    >
      <Avatar nome={pedido.from.name} id={pedido.from.id} />
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
          {pedido.from.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>
          @{pedido.from.tag}
        </div>
      </div>
      <button
        type="button"
        onClick={() => agir(() => aceitarPedido(pedido.id))}
        title="Aceitar"
        style={{
          width: 30,
          height: 30,
          border: '2px solid var(--ink)',
          borderRadius: 8,
          background: 'var(--green)',
          color: '#fff',
          fontWeight: 900,
          fontSize: 14,
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
          boxShadow: '2px 2px 0 var(--ink)',
        }}
      >
        ✓
      </button>
      <button
        type="button"
        onClick={() => agir(() => rejeitarPedido(pedido.id))}
        title="Recusar"
        style={{
          width: 30,
          height: 30,
          border: '2px solid var(--ink)',
          borderRadius: 8,
          background: 'var(--bg-page)',
          color: 'var(--red)',
          fontWeight: 900,
          fontSize: 14,
          display: 'grid',
          placeItems: 'center',
          cursor: 'pointer',
          boxShadow: '2px 2px 0 var(--ink)',
        }}
      >
        ×
      </button>
    </div>
  )
}

function Avatar({ nome, id, tamanho = 38 }: { nome: string; id: string; tamanho?: number }) {
  return (
    <div
      style={{
        width: tamanho,
        height: tamanho,
        borderRadius: 10,
        background: corDoId(id),
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
      {(nome || '?').charAt(0).toUpperCase()}
    </div>
  )
}

function ConversaRow({ conversa, onAbrir }: { conversa: Conversa; onAbrir: () => void }) {
  const preview = conversa.lastMessage?.text ?? 'sem mensagens ainda'

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
      <Avatar nome={conversa.title} id={conversa.id} />
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
          {conversa.title}
        </div>
        <div
          style={{
            fontSize: 11,
            color: 'var(--muted)',
            fontWeight: 700,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {preview}
        </div>
      </div>
      {conversa.unread > 0 && (
        <span
          style={{
            background: 'var(--green)',
            color: '#fff',
            border: '2px solid var(--ink)',
            borderRadius: 999,
            fontWeight: 900,
            fontSize: 11,
            padding: '1px 8px',
            flexShrink: 0,
          }}
        >
          {conversa.unread}
        </span>
      )}
    </div>
  )
}

function AmigoRow({ amigo, online, onAbrir }: { amigo: Amigo; online: boolean; onAbrir: () => void }) {
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
        opacity: online ? 1 : 0.6,
        transition: 'background .12s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--primary-soft)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <Avatar nome={amigo.name} id={amigo.id} />
        <span
          title={online ? 'online' : 'offline'}
          style={{
            position: 'absolute',
            right: -2,
            bottom: -2,
            width: 12,
            height: 12,
            borderRadius: 999,
            background: online ? 'var(--green)' : 'var(--muted)',
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
          {amigo.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>
          @{amigo.tag} · {amigo.globalXp} XP
        </div>
      </div>
      <DoodleIcon name="play" size={14} strokeColor="var(--muted)" />
    </div>
  )
}

function ChatView({ conversa }: { conversa: Conversa }) {
  const mensagens = useChatStore((s) => s.mensagensAtivas)
  const carregandoMensagens = useChatStore((s) => s.carregandoMensagens)
  const digitandoIds = useChatStore((s) => s.digitandoIds)
  const enviarMensagem = useChatStore((s) => s.enviarMensagem)
  const notificarDigitando = useChatStore((s) => s.notificarDigitando)
  const meuId = useAuthStore((s) => s.user?.id)
  const codigoSala = useCodigoSalaAtual()

  const [rascunho, setRascunho] = useState('')
  const [enviando, setEnviando] = useState(false)
  const fimRef = useRef<HTMLDivElement>(null)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const digitandoEmitido = useRef(false)

  // Nomes de quem está digitando (resolve pelo cadastro de membros da conversa).
  const digitandoNomes = digitandoIds
    .map((id) => conversa.members.find((m) => m.id === id)?.name)
    .filter(Boolean) as string[]

  // Auto-scroll pro fim quando chega mensagem nova ou alguém digita.
  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensagens.length, digitandoNomes.length])

  // Ao desmontar/trocar de conversa, garante o "parei de digitar".
  useEffect(() => {
    return () => {
      if (typingTimer.current) clearTimeout(typingTimer.current)
      if (digitandoEmitido.current) {
        notificarDigitando(false)
        digitandoEmitido.current = false
      }
    }
  }, [conversa.id, notificarDigitando])

  function pararDeDigitar() {
    if (typingTimer.current) clearTimeout(typingTimer.current)
    if (digitandoEmitido.current) {
      notificarDigitando(false)
      digitandoEmitido.current = false
    }
  }

  function aoDigitar(valor: string) {
    setRascunho(valor)
    // Emite "digitando" uma vez e renova o timer; 2,5s parado = parou.
    if (!digitandoEmitido.current) {
      notificarDigitando(true)
      digitandoEmitido.current = true
    }
    if (typingTimer.current) clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      notificarDigitando(false)
      digitandoEmitido.current = false
    }, 2500)
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    const txt = rascunho.trim()
    if (!txt || enviando) return
    setEnviando(true)
    setRascunho('')
    pararDeDigitar()
    try {
      await enviarMensagem(txt)
    } finally {
      setEnviando(false)
    }
  }

  async function convidarPraSala() {
    if (!codigoSala || enviando) return
    setEnviando(true)
    try {
      await enviarMensagem(`⚔️ Bora duelar? Entra na minha sala: #${codigoSala}`)
    } finally {
      setEnviando(false)
    }
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
        {carregandoMensagens && (
          <div style={{ margin: 'auto', color: 'var(--muted)', fontWeight: 700, fontSize: 13 }}>
            Carregando mensagens...
          </div>
        )}
        {!carregandoMensagens && mensagens.length === 0 && (
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
        {mensagens.map((m: Mensagem) => {
          const eu = m.authorId === meuId
          const convite = m.text.match(REGEX_CONVITE)
          return (
            <div
              key={m.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: eu ? 'flex-end' : 'flex-start',
              }}
            >
              {!eu && conversa.type === 'group' && (
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    color: 'var(--muted)',
                    marginBottom: 2,
                    marginLeft: 4,
                  }}
                >
                  {m.author?.name ?? '...'}
                </div>
              )}
              <div
                style={{
                  maxWidth: '82%',
                  padding: '8px 12px',
                  background: eu ? 'var(--primary)' : 'var(--bg-cream)',
                  color: eu ? '#fff' : 'var(--ink)',
                  border: '2.5px solid var(--ink)',
                  borderRadius: 12,
                  boxShadow: '2px 2px 0 var(--ink)',
                  fontSize: 13,
                  fontWeight: 600,
                  lineHeight: 1.35,
                  wordBreak: 'break-word',
                }}
              >
                {m.text}
                {convite && (
                  <a
                    href={`/room/${convite[1]}`}
                    style={{
                      display: 'block',
                      marginTop: 8,
                      padding: '6px 10px',
                      background: 'var(--accent)',
                      color: 'var(--ink)',
                      border: '2px solid var(--ink)',
                      borderRadius: 8,
                      boxShadow: '2px 2px 0 var(--ink)',
                      fontWeight: 900,
                      fontSize: 12,
                      textAlign: 'center',
                      textDecoration: 'none',
                    }}
                  >
                    ⚔️ Entrar na sala #{convite[1]}
                  </a>
                )}
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
                {horaDe(m.sentAt)}
              </div>
            </div>
          )
        })}
        {digitandoNomes.length > 0 && (
          <div
            style={{
              fontSize: 11,
              fontWeight: 800,
              color: 'var(--muted)',
              fontStyle: 'italic',
              paddingLeft: 4,
            }}
          >
            {digitandoNomes.length === 1
              ? `${digitandoNomes[0]} está digitando…`
              : 'várias pessoas estão digitando…'}
          </div>
        )}
        <div ref={fimRef} />
      </div>

      {codigoSala && (
        <button
          type="button"
          onClick={convidarPraSala}
          disabled={enviando}
          style={{
            margin: '0 10px 8px',
            padding: '8px 10px',
            border: '2.5px solid var(--ink)',
            borderRadius: 10,
            background: 'var(--bg-cream)',
            cursor: enviando ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-ui)',
            fontWeight: 900,
            fontSize: 12,
            color: 'var(--ink)',
            boxShadow: '2px 2px 0 var(--ink)',
          }}
        >
          ⚔️ Convidar pra sala #{codigoSala}
        </button>
      )}
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
          onChange={(e) => aoDigitar(e.target.value)}
          placeholder="manda a real…"
          maxLength={2000}
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
          disabled={!rascunho.trim() || enviando}
          style={{
            width: 42,
            border: '2.5px solid var(--ink)',
            borderRadius: 10,
            background: rascunho.trim() && !enviando ? 'var(--accent)' : 'var(--border)',
            cursor: rascunho.trim() && !enviando ? 'pointer' : 'not-allowed',
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
