import { redirect } from 'next/navigation'

// Dashboard redireciona pro lobby por enquanto
export default function DashboardPage() {
  redirect('/lobby')
}
