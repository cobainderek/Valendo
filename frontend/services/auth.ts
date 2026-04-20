import { apiFetch } from './api'

interface LoginResponse {
  access_token: string
}

interface RegisterData {
  tag: string
  email: string
  senha: string
}

export async function login(email: string, senha: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, senha }),
  })
}

export async function register(data: RegisterData): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function recoverPassword(email: string): Promise<void> {
  await apiFetch('/auth/recover', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}
