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

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
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
