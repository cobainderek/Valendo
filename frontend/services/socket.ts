import { io, type Socket } from 'socket.io-client'

// Origem do WebSocket: usa NEXT_PUBLIC_WS_URL se definida; senão deriva da
// URL da API removendo o sufixo "/api".
// Ex.: https://dyotech.shop/api  ->  https://dyotech.shop
//      http://localhost:3001/api ->  http://localhost:3001
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dyotech.shop/api'
const WS_ORIGIN = process.env.NEXT_PUBLIC_WS_URL || API_URL.replace(/\/api\/?$/, '')

// O Nest expõe o Socket.IO em /api/socket.io (alinhado ao prefixo global e ao Nginx).
const WS_PATH = '/api/socket.io'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

let roomsSocket: Socket | null = null
let chatSocket: Socket | null = null

/** Socket do namespace padrão "/" — usado pelas salas/duelos. */
export function getRoomsSocket(): Socket {
  if (roomsSocket && roomsSocket.connected) return roomsSocket
  if (!roomsSocket) {
    roomsSocket = io(WS_ORIGIN, {
      path: WS_PATH,
      transports: ['websocket', 'polling'],
      auth: { token: getToken() },
      autoConnect: true,
    })
  } else if (!roomsSocket.connected) {
    // Token pode ter mudado entre logins — garante o atual antes de reconectar.
    roomsSocket.auth = { token: getToken() }
    roomsSocket.connect()
  }
  return roomsSocket
}

/** Socket do namespace "/chat" — usado pelo painel social. */
export function getChatSocket(): Socket {
  if (chatSocket && chatSocket.connected) return chatSocket
  if (!chatSocket) {
    chatSocket = io(`${WS_ORIGIN}/chat`, {
      path: WS_PATH,
      transports: ['websocket', 'polling'],
      auth: { token: getToken() },
      autoConnect: true,
    })
  } else if (!chatSocket.connected) {
    chatSocket.auth = { token: getToken() }
    chatSocket.connect()
  }
  return chatSocket
}

/** Encerra ambos os sockets — chamar no logout pra não vazar conexão autenticada. */
export function disconnectSockets() {
  if (roomsSocket) {
    roomsSocket.removeAllListeners()
    roomsSocket.disconnect()
    roomsSocket = null
  }
  if (chatSocket) {
    chatSocket.removeAllListeners()
    chatSocket.disconnect()
    chatSocket = null
  }
}
