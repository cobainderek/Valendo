import { create } from 'zustand'
import {
  listarConversas,
  listarMensagens,
  enviarMensagem as apiEnviarMensagem,
  marcarLida,
  abrirDm,
  criarGrupo as apiCriarGrupo,
  type Conversa,
  type Mensagem,
} from '@/services/chat'
import {
  listarAmigos,
  listarPedidosRecebidos,
  enviarPedido as apiEnviarPedido,
  aceitarPedido as apiAceitarPedido,
  rejeitarPedido as apiRejeitarPedido,
  buscarUsuarios as apiBuscarUsuarios,
  type Amigo,
  type PedidoRecebido,
  type UsuarioBusca,
} from '@/services/friends'
import { getChatSocket } from '@/services/socket'
import { useAuthStore } from './useAuthStore'

// Componentes consomem os tipos por aqui pra não importar de services/ direto.
export type { Conversa, Mensagem } from '@/services/chat'
export type { Amigo, PedidoRecebido, UsuarioBusca } from '@/services/friends'

interface ChatState {
  conversas: Conversa[]
  amigos: Amigo[]
  pedidos: PedidoRecebido[]
  conversaAtivaId: string | null
  mensagensAtivas: Mensagem[]
  carregando: boolean
  carregandoMensagens: boolean
  erro: string
  /** Ids dos amigos online agora (presence:update + presence:who). */
  onlineIds: string[]
  /** Ids de quem está digitando na conversa ativa. */
  digitandoIds: string[]
  /** Painel flutuante de amigos aberto? Compartilhado entre Sidebar e botão flutuante. */
  painelAberto: boolean

  iniciar: () => void
  recarregarTudo: () => Promise<void>
  abrirConversa: (conversa: Conversa) => Promise<void>
  abrirDmComAmigo: (amigoId: string) => Promise<Conversa | null>
  fecharConversa: () => void
  enviarMensagem: (texto: string) => Promise<void>
  enviarPedido: (tag: string) => Promise<void>
  aceitarPedido: (pedidoId: string) => Promise<void>
  rejeitarPedido: (pedidoId: string) => Promise<void>
  buscarUsuarios: (q: string) => Promise<UsuarioBusca[]>
  criarGrupo: (nome: string, memberIds: string[]) => Promise<Conversa | null>
  notificarDigitando: (isTyping: boolean) => void
  setPainelAberto: (aberto: boolean) => void
}

// Flag fora do estado: o socket é global e os listeners só podem ser
// registrados uma vez, mesmo que vários componentes chamem iniciar().
let socketIniciado = false

// Timers de segurança do "digitando…": se o evento isTyping=false se perder,
// o indicador some sozinho depois de alguns segundos.
const typingTimers = new Map<string, ReturnType<typeof setTimeout>>()

function meuId(): string | null {
  return useAuthStore.getState().user?.id ?? null
}

/** Upsert mantendo a conversa mais ativa no topo. */
function upsertConversa(lista: Conversa[], conv: Conversa): Conversa[] {
  const resto = lista.filter((c) => c.id !== conv.id)
  return [conv, ...resto]
}

/** Pergunta ao servidor quais desses ids estão online (resposta via ack). */
function consultarPresenca(ids: string[], aplicar: (online: string[]) => void) {
  if (!ids.length) {
    aplicar([])
    return
  }
  const socket = getChatSocket()
  const emitir = () =>
    socket.emit('presence:who', { userIds: ids }, (resp: { online?: string[] }) => {
      if (resp && Array.isArray(resp.online)) aplicar(resp.online)
    })
  if (socket.connected) emitir()
  else socket.once('connect', emitir)
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversas: [],
  amigos: [],
  pedidos: [],
  conversaAtivaId: null,
  mensagensAtivas: [],
  carregando: false,
  carregandoMensagens: false,
  erro: '',
  onlineIds: [],
  digitandoIds: [],
  painelAberto: false,

  iniciar: () => {
    const token = useAuthStore.getState().token
    if (!token || socketIniciado) return
    socketIniciado = true

    const socket = getChatSocket()

    // Mensagem nova em qualquer conversa que estamos inscritos (conv:ID).
    socket.on('chat:message', ({ conversationId, message }: { conversationId: string; message: Mensagem }) => {
      const { conversaAtivaId, mensagensAtivas, conversas } = get()
      const minha = message.authorId === meuId()

      if (conversationId === conversaAtivaId) {
        // Dedup: a própria mensagem enviada via REST também ecoa pelo socket.
        if (!mensagensAtivas.some((m) => m.id === message.id)) {
          set({ mensagensAtivas: [...mensagensAtivas, message] })
        }
        if (!minha) marcarLida(conversationId, message.id).catch(() => {})
      }

      set({
        conversas: conversas.map((c) =>
          c.id === conversationId
            ? {
                ...c,
                lastMessage: message,
                unread:
                  minha || conversationId === conversaAtivaId ? c.unread : c.unread + 1,
              }
            : c,
        ),
      })
    })

    // Conversa criada/alterada (ex.: alguém abriu DM com a gente, grupo novo).
    socket.on('chat:conversation-updated', (conv: Conversa) => {
      set({ conversas: upsertConversa(get().conversas, conv) })
      // Entra na sala da conversa pra receber chat:message dela.
      socket.emit('chat:join', { conversationId: conv.id })
    })

    socket.on('chat:removed-from', ({ conversationId }: { conversationId: string }) => {
      const { conversas, conversaAtivaId } = get()
      set({
        conversas: conversas.filter((c) => c.id !== conversationId),
        ...(conversaAtivaId === conversationId
          ? { conversaAtivaId: null, mensagensAtivas: [] }
          : {}),
      })
    })

    socket.on('friend:request-received', (pedido: PedidoRecebido) => {
      const { pedidos } = get()
      if (!pedidos.some((p) => p.id === pedido.id)) {
        set({ pedidos: [pedido, ...pedidos] })
      }
    })

    socket.on('friend:request-accepted', () => {
      // Alguém aceitou nosso pedido — recarrega amigos e a presença deles.
      listarAmigos()
        .then((amigos) => {
          set({ amigos })
          consultarPresenca(amigos.map((a) => a.id), (online) => set({ onlineIds: online }))
        })
        .catch(() => {})
    })

    // Presença em tempo real: amigo conectou/desconectou no chat.
    socket.on('presence:update', ({ userId, online }: { userId: string; online: boolean }) => {
      const { onlineIds } = get()
      if (online && !onlineIds.includes(userId)) {
        set({ onlineIds: [...onlineIds, userId] })
      } else if (!online) {
        set({ onlineIds: onlineIds.filter((id) => id !== userId) })
      }
    })

    // "Fulano está digitando…" — só interessa pra conversa aberta.
    socket.on(
      'chat:typing',
      ({ conversationId, userId, isTyping }: { conversationId: string; userId: string; isTyping: boolean }) => {
        if (conversationId !== get().conversaAtivaId || userId === meuId()) return
        const chave = `${conversationId}:${userId}`
        const timerAntigo = typingTimers.get(chave)
        if (timerAntigo) clearTimeout(timerAntigo)

        if (isTyping) {
          const atual = get().digitandoIds
          if (!atual.includes(userId)) set({ digitandoIds: [...atual, userId] })
          // Failsafe: some sozinho se o isTyping=false nunca chegar.
          typingTimers.set(
            chave,
            setTimeout(() => {
              set({ digitandoIds: get().digitandoIds.filter((id) => id !== userId) })
              typingTimers.delete(chave)
            }, 4000),
          )
        } else {
          set({ digitandoIds: get().digitandoIds.filter((id) => id !== userId) })
          typingTimers.delete(chave)
        }
      },
    )

    // Reconexão: re-inscreve em todas as conversas e refaz a presença.
    socket.on('connect', () => {
      for (const c of get().conversas) {
        socket.emit('chat:join', { conversationId: c.id })
      }
      consultarPresenca(get().amigos.map((a) => a.id), (online) => set({ onlineIds: online }))
    })

    get().recarregarTudo()
  },

  recarregarTudo: async () => {
    set({ carregando: true, erro: '' })
    try {
      const [conversas, amigos, pedidos] = await Promise.all([
        listarConversas(),
        listarAmigos(),
        listarPedidosRecebidos(),
      ])
      set({ conversas, amigos, pedidos })
      consultarPresenca(amigos.map((a) => a.id), (online) => set({ onlineIds: online }))

      // Inscreve em todas as conversas pra receber mensagens em tempo real
      // (o backend só emite chat:message pra quem deu chat:join).
      const socket = getChatSocket()
      const entrar = () => {
        for (const c of conversas) socket.emit('chat:join', { conversationId: c.id })
      }
      if (socket.connected) entrar()
      else socket.once('connect', entrar)
    } catch (err) {
      set({ erro: err instanceof Error ? err.message : 'Erro ao carregar o chat.' })
    } finally {
      set({ carregando: false })
    }
  },

  abrirConversa: async (conversa: Conversa) => {
    set({
      conversaAtivaId: conversa.id,
      mensagensAtivas: [],
      digitandoIds: [],
      carregandoMensagens: true,
    })
    try {
      const pagina = await listarMensagens(conversa.id)
      // A API devolve da mais recente pra mais antiga — inverte pra exibir.
      const mensagens = [...pagina.items].reverse()
      set({ mensagensAtivas: mensagens })

      // Zera o contador local e marca como lida no servidor.
      set({
        conversas: get().conversas.map((c) =>
          c.id === conversa.id ? { ...c, unread: 0 } : c,
        ),
      })
      const ultima = mensagens[mensagens.length - 1]
      if (ultima) marcarLida(conversa.id, ultima.id).catch(() => {})
    } catch (err) {
      set({ erro: err instanceof Error ? err.message : 'Erro ao carregar mensagens.' })
    } finally {
      set({ carregandoMensagens: false })
    }
  },

  abrirDmComAmigo: async (amigoId: string) => {
    try {
      const conv = await abrirDm(amigoId)
      set({ conversas: upsertConversa(get().conversas, conv) })
      getChatSocket().emit('chat:join', { conversationId: conv.id })
      await get().abrirConversa(conv)
      return conv
    } catch (err) {
      set({ erro: err instanceof Error ? err.message : 'Erro ao abrir conversa.' })
      return null
    }
  },

  fecharConversa: () => {
    set({ conversaAtivaId: null, mensagensAtivas: [], digitandoIds: [] })
  },

  enviarMensagem: async (texto: string) => {
    const { conversaAtivaId, mensagensAtivas } = get()
    const txt = texto.trim()
    if (!conversaAtivaId || !txt) return
    try {
      const msg = await apiEnviarMensagem(conversaAtivaId, txt)
      // Dedup contra o eco do socket (chat:message chega pro remetente também).
      if (!get().mensagensAtivas.some((m) => m.id === msg.id)) {
        set({ mensagensAtivas: [...get().mensagensAtivas, msg] })
      }
      set({
        conversas: get().conversas.map((c) =>
          c.id === conversaAtivaId ? { ...c, lastMessage: msg } : c,
        ),
      })
    } catch (err) {
      set({
        erro: err instanceof Error ? err.message : 'Erro ao enviar mensagem.',
        mensagensAtivas,
      })
    }
  },

  enviarPedido: async (tag: string) => {
    await apiEnviarPedido(tag.trim())
    // Pode ter virado amizade direto (pedido inverso pendente) — recarrega.
    const [amigos, pedidos] = await Promise.all([listarAmigos(), listarPedidosRecebidos()])
    set({ amigos, pedidos })
    consultarPresenca(amigos.map((a) => a.id), (online) => set({ onlineIds: online }))
  },

  aceitarPedido: async (pedidoId: string) => {
    await apiAceitarPedido(pedidoId)
    const [amigos, pedidos] = await Promise.all([listarAmigos(), listarPedidosRecebidos()])
    set({ amigos, pedidos })
    consultarPresenca(amigos.map((a) => a.id), (online) => set({ onlineIds: online }))
  },

  rejeitarPedido: async (pedidoId: string) => {
    await apiRejeitarPedido(pedidoId)
    set({ pedidos: get().pedidos.filter((p) => p.id !== pedidoId) })
  },

  buscarUsuarios: async (q: string) => {
    const termo = q.trim()
    if (!termo) return []
    // Filtra quem já é amigo e o próprio usuário — só faz sentido
    // sugerir quem ainda pode receber pedido.
    const { amigos } = get()
    const eu = meuId()
    const resultados = await apiBuscarUsuarios(termo)
    return resultados.filter(
      (u) => u.id !== eu && !amigos.some((a) => a.id === u.id),
    )
  },

  criarGrupo: async (nome: string, memberIds: string[]) => {
    try {
      const conv = await apiCriarGrupo(nome.trim(), memberIds)
      set({ conversas: upsertConversa(get().conversas, conv) })
      getChatSocket().emit('chat:join', { conversationId: conv.id })
      await get().abrirConversa(conv)
      return conv
    } catch (err) {
      set({ erro: err instanceof Error ? err.message : 'Erro ao criar grupo.' })
      return null
    }
  },

  notificarDigitando: (isTyping: boolean) => {
    const { conversaAtivaId } = get()
    if (!conversaAtivaId) return
    getChatSocket().emit('chat:typing', { conversationId: conversaAtivaId, isTyping })
  },

  setPainelAberto: (aberto: boolean) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('valendo:chatPanel:aberto', aberto ? '1' : '0')
    }
    set({ painelAberto: aberto })
  },
}))
