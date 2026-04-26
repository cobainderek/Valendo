import { apiFetch } from './api'

export interface User {
  id: string
  name: string
  tag: string
  email: string
  globalXp: number
}

interface LoginResponse {
  access_token: string
  user: User
}

interface RegisterData {
  name: string
  tag: string
  email: string
  password: string
}

export async function login(email: string, senha: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password: senha }),
  })
}

export async function register(data: RegisterData): Promise<LoginResponse> {
  await apiFetch('/users', {
    method: 'POST',
    body: JSON.stringify(data),
  })
  return login(data.email, data.password)
}

export async function recoverPassword(email: string): Promise<void> {
  await apiFetch('/auth/recover', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}
