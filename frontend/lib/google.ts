// Google Identity Services (GIS) — carrega o script oficial sob demanda e
// renderiza o botão real do Google (que devolve um ID Token via callback).
// O botão oficial fica INVISÍVEL por cima do botão doodle: o clique cai no
// iframe do Google, que abre o popup sem ser bloqueado e sem o cooldown do
// One Tap. Docs: https://developers.google.com/identity/gsi/web

const GIS_SRC = 'https://accounts.google.com/gsi/client'

export const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''

interface CredentialResponse {
  credential?: string
}

interface GoogleAccountsId {
  initialize(config: {
    client_id: string
    callback: (resp: CredentialResponse) => void
    ux_mode?: 'popup' | 'redirect'
  }): void
  renderButton(
    container: HTMLElement,
    options: {
      type?: 'standard' | 'icon'
      theme?: 'outline' | 'filled_blue' | 'filled_black'
      size?: 'large' | 'medium' | 'small'
      width?: number
      text?: 'signin_with' | 'continue_with'
      locale?: string
    },
  ): void
}

declare global {
  interface Window {
    google?: { accounts?: { id?: GoogleAccountsId } }
  }
}

let scriptCarregando: Promise<void> | null = null

function carregarScript(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (scriptCarregando) return scriptCarregando

  scriptCarregando = new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = GIS_SRC
    s.async = true
    s.defer = true
    s.onload = () => resolve()
    s.onerror = () => {
      scriptCarregando = null
      reject(new Error('Não foi possível carregar o Google. Verifica tua conexão.'))
    }
    document.head.appendChild(s)
  })
  return scriptCarregando
}

/**
 * Renderiza o botão oficial do Google dentro de `container`. Quando o usuário
 * completa o login no popup, `aoReceberToken` recebe o ID Token (JWT do
 * Google) — que o controller troca pelo JWT do Valendo via /auth/google.
 */
export async function renderizarBotaoGoogle(
  container: HTMLElement,
  aoReceberToken: (idToken: string) => void,
): Promise<void> {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Login com Google não está configurado.')
  }

  await carregarScript()
  const gsi = window.google?.accounts?.id
  if (!gsi) throw new Error('Google indisponível no momento. Tenta de novo.')

  gsi.initialize({
    client_id: GOOGLE_CLIENT_ID,
    ux_mode: 'popup',
    callback: (resp) => {
      if (resp.credential) aoReceberToken(resp.credential)
    },
  })

  gsi.renderButton(container, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    text: 'continue_with',
    locale: 'pt-BR',
    width: 400,
  })
}
