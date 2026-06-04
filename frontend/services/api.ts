const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dyotech.shop/api'

interface FetchOptions extends RequestInit {
  token?: string
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { token, headers, ...rest } = options

  const storedToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null)

  // FormData (upload de arquivo): o browser define o Content-Type sozinho
  // com o boundary do multipart — forçar application/json quebraria o upload.
  const ehFormData = typeof FormData !== 'undefined' && rest.body instanceof FormData

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...rest,
    headers: {
      ...(ehFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(storedToken ? { Authorization: `Bearer ${storedToken}` } : {}),
      ...headers,
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Erro desconhecido' }))
    throw new Error(error.message || `Erro ${res.status}`)
  }

  return res.json()
}
