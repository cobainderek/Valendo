import { redirect } from 'next/navigation'

// Register será implementado — por enquanto redireciona pro login
// onde o modo signup já existe no formulário
export default function RegisterPage() {
  redirect('/auth/login')
}
