"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"


export default function LoginPage() {

    const [apelido, setApelido] = useState("")
    const [senha, setSenha] = useState("")
    const [erro, setErro] = useState("")
    const [carregando, setCarregando] = useState(false)

    const router = useRouter()

    async function handleLogin() {

        async function handleLogin(e: React.FormEvent) {
            e.preventDefault()

            if (!apelido.trim() || !senha.trim()) {
                setErro("Preencha todos os campos!")
                return
            }


            setCarregando(true)
            setErro("")

            try {
                const resposta = await fetch("http://localhost:3001/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ tag: apelido, senha }),
                })

                if (!resposta.ok) {
                    setErro("Usuário ou Senha inválidos ! ")
                    return
                }

                const dados = await resposta.json()
                localStorage.setItem("token", dados.acess_token)
                router.push("/dashboard")

            } catch {
                setErro("Erro de conexão, Verifique se o servidor está rodando !")
            } finally {
                setCarregando(false)
            }
        }

        return (
            <div className="min-h-screen bg-bg-page flex items-center justify-center">
                <div className="bg-bg-card border border-border rounded-xl p-8 w-full max-w-sm shadow-md">
                    <h1 className="font-display font-black text-4xl text-primary text-center mb-2">
                        Valen<span className="text-yellow">do!</span>
                    </h1>
                    <p className="text-text-muted text-center text-sm mb-8">
                        Entre na disputa
                    </p>
                    <div className="mb-4">
                        <label className="text-text-muted text-xs font-semibold uppercase mb-1 block">
                            Apelido
                        </label>
                        <input
                            type="text"
                            placeholder="Ex: derek#1234"
                            value={apelido}
                            onChange={(e) => setApelido(e.target.value)}
                            className="w-full border border-border rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-primary"
                        />
                    </div>

                    <div className="mb-6">
                        <label className="text-text-muted text-xs font-semibold uppercase mb-1 block">
                            Senha
                        </label>
                        <input
                            type="password"
                            placeholder="Sua senha"
                            value={senha}
                            onChange={(e) => setSenha(e.target.value)}
                            className="w-full border border-border rounded-lg px-4 py-3 text-text-main focus:outline-none focus:border-primary"
                        />
                    </div>
                    {erro && (
                        <p className="text-danger text-sm mb-4 text-center">{erro}</p>
                    )}

                    <button
                        onClick={handleLogin}
                        disabled={carregando}
                        className="w-full bg-yellow text-primary-dark font-extrabold py-3 rounded-lg hover:bg-yellow/90 transition disabled:opacity-50"
                    >
                        {carregando ? "Entrando..." : "⚡ ENTRAR NA DISPUTA"}
                    </button>

                    <p className="text-center text-text-muted text-sm mt-4">
                        Novo por aqui?{" "}
                        <a href="/register" className="text-primary font-semibold hover:underline">
                            Criar conta
                        </a>
                    </p>

                </div>
            </div>
        )
    }
}