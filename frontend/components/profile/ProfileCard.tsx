'use client'

import { useState } from 'react'
import { DoodleIcon } from '@/components/ui/DoodleIcon'
import type {
  PerfilCompleto,
  DueloHistorico,
  AtualizarPerfilDTO,
} from '@/services/users'

interface ProfileCardProps {
  perfil: PerfilCompleto | null
  carregando: boolean
  historico: DueloHistorico[]
  carregandoHistorico: boolean
  temMaisHistorico: boolean
  onCarregarMais: () => void
  onSalvar: (dto: AtualizarPerfilDTO) => Promise<boolean>
  salvando: boolean
  erro: string
  sucesso: string
  onLogout: () => void
}

export function ProfileCard({
  perfil,
  carregando,
  historico,
  carregandoHistorico,
  temMaisHistorico,
  onCarregarMais,
  onSalvar,
  salvando,
  erro,
  sucesso,
  onLogout,
}: ProfileCardProps) {
  if (carregando) {
    return (
      <p style={{ fontWeight: 700, color: 'var(--muted)' }}>Carregando perfil...</p>
    )
  }
  if (!perfil) return null

  const taxaVitoria =
    perfil.stats.duelsPlayed > 0
      ? Math.round((perfil.stats.duelsWon / perfil.stats.duelsPlayed) * 100)
      : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 640 }}>
      {/* Cabeçalho */}
      <div className="doodle-card" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 16,
              background: 'var(--orange)',
              border: '3px solid var(--ink)',
              boxShadow: '3px 3px 0 var(--ink)',
              display: 'grid',
              placeItems: 'center',
              fontFamily: 'var(--font-ui)',
              fontWeight: 900,
              fontSize: 32,
              color: '#fff',
              flexShrink: 0,
            }}
          >
            {perfil.name[0]?.toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <h2
              style={{
                fontFamily: 'var(--font-ui)',
                fontWeight: 900,
                fontSize: 24,
                margin: 0,
                letterSpacing: '-0.02em',
              }}
            >
              {perfil.name}
            </h2>
            <p style={{ color: 'var(--muted)', fontWeight: 700, fontSize: 14, margin: '2px 0 0' }}>
              @{perfil.tag} · {perfil.email}
            </p>
          </div>
          <span
            className="chip"
            style={{ marginLeft: 'auto', background: 'var(--primary-soft)', fontWeight: 900 }}
          >
            ⭐ {perfil.globalXp.toLocaleString('pt-BR')} XP
          </span>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="doodle-card" style={{ padding: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-ui)', fontWeight: 900, fontSize: 16, margin: '0 0 14px' }}>
          Estatísticas
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 10,
          }}
        >
          <StatBox valor={perfil.stats.duelsPlayed} rotulo="duelos" cor="var(--primary)" />
          <StatBox valor={perfil.stats.duelsWon} rotulo="vitórias" cor="var(--green)" />
          <StatBox valor={`${taxaVitoria}%`} rotulo="taxa de vitória" cor="var(--accent)" />
          <StatBox valor={perfil.stats.correctAnswersTotal} rotulo="acertos" cor="var(--purple)" />
          <StatBox valor={perfil.stats.roomsHosted} rotulo="salas criadas" cor="var(--orange)" />
        </div>
      </div>

      {/* Edição */}
      <FormEdicao
        perfil={perfil}
        onSalvar={onSalvar}
        salvando={salvando}
        erro={erro}
        sucesso={sucesso}
      />

      {/* Histórico */}
      <div className="doodle-card" style={{ padding: 20 }}>
        <h3 style={{ fontFamily: 'var(--font-ui)', fontWeight: 900, fontSize: 16, margin: '0 0 14px' }}>
          Histórico de duelos
        </h3>
        {historico.length === 0 && !carregandoHistorico && (
          <p style={{ color: 'var(--muted)', fontWeight: 700, fontSize: 13, margin: 0 }}>
            Nenhum duelo finalizado ainda — bora jogar! 🎮
          </p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {historico.map((d, i) => (
            <LinhaHistorico key={`${d.roomCode}-${i}`} duelo={d} />
          ))}
        </div>
        {carregandoHistorico && (
          <p style={{ color: 'var(--muted)', fontWeight: 700, fontSize: 13, marginTop: 10 }}>
            Carregando...
          </p>
        )}
        {temMaisHistorico && !carregandoHistorico && (
          <button
            type="button"
            className="btn"
            style={{ width: '100%', marginTop: 12, padding: '10px 14px' }}
            onClick={onCarregarMais}
          >
            Carregar mais
          </button>
        )}
      </div>

      <button
        className="btn"
        style={{ width: '100%', padding: '12px 18px', color: 'var(--red)' }}
        onClick={onLogout}
      >
        Sair da conta
      </button>
    </div>
  )
}

function StatBox({ valor, rotulo, cor }: { valor: number | string; rotulo: string; cor: string }) {
  return (
    <div
      style={{
        border: '2.5px solid var(--ink)',
        borderRadius: 12,
        padding: '12px 10px',
        textAlign: 'center',
        background: 'var(--bg-card)',
        boxShadow: '2px 2px 0 var(--ink)',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-ui)',
          fontWeight: 900,
          fontSize: 24,
          color: cor,
          lineHeight: 1.1,
        }}
      >
        {typeof valor === 'number' ? valor.toLocaleString('pt-BR') : valor}
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          color: 'var(--muted)',
          textTransform: 'uppercase',
          letterSpacing: 0.6,
          marginTop: 2,
        }}
      >
        {rotulo}
      </div>
    </div>
  )
}

function FormEdicao({
  perfil,
  onSalvar,
  salvando,
  erro,
  sucesso,
}: {
  perfil: PerfilCompleto
  onSalvar: (dto: AtualizarPerfilDTO) => Promise<boolean>
  salvando: boolean
  erro: string
  sucesso: string
}) {
  const [aberto, setAberto] = useState(false)
  const [nome, setNome] = useState(perfil.name)
  const [tag, setTag] = useState(perfil.tag)
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')

  const mudouAlgo =
    nome.trim() !== perfil.name || tag.trim() !== perfil.tag || novaSenha.length > 0

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!mudouAlgo || salvando) return
    const dto: AtualizarPerfilDTO = {}
    if (nome.trim() !== perfil.name) dto.name = nome.trim()
    if (tag.trim() !== perfil.tag) dto.tag = tag.trim()
    if (novaSenha) {
      dto.newPassword = novaSenha
      dto.currentPassword = senhaAtual
    }
    const ok = await onSalvar(dto)
    if (ok) {
      setSenhaAtual('')
      setNovaSenha('')
    }
  }

  return (
    <div className="doodle-card" style={{ padding: 20 }}>
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 0,
          fontFamily: 'var(--font-ui)',
          fontWeight: 900,
          fontSize: 16,
          color: 'var(--ink)',
        }}
      >
        Editar perfil
        <span style={{ fontSize: 18 }}>{aberto ? '▴' : '▾'}</span>
      </button>

      {aberto && (
        <form onSubmit={salvar} style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
          <label>
            <span style={{ display: 'block', fontWeight: 800, fontSize: 13, marginBottom: 6 }}>Nome</span>
            <input
              className="input"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              maxLength={255}
              style={{ paddingLeft: 16 }}
            />
          </label>
          <label>
            <span style={{ display: 'block', fontWeight: 800, fontSize: 13, marginBottom: 6 }}>
              Tag <span style={{ color: 'var(--muted)', fontWeight: 700 }}>(única — é como te encontram)</span>
            </span>
            <input
              className="input"
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              maxLength={50}
              style={{ paddingLeft: 16 }}
            />
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
            <label>
              <span style={{ display: 'block', fontWeight: 800, fontSize: 13, marginBottom: 6 }}>Senha atual</span>
              <input
                className="input"
                type="password"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
                placeholder="só pra trocar senha"
                style={{ paddingLeft: 16 }}
              />
            </label>
            <label>
              <span style={{ display: 'block', fontWeight: 800, fontSize: 13, marginBottom: 6 }}>Nova senha</span>
              <input
                className="input"
                type="password"
                value={novaSenha}
                onChange={(e) => setNovaSenha(e.target.value)}
                placeholder="mín. 6 caracteres"
                minLength={6}
                style={{ paddingLeft: 16 }}
              />
            </label>
          </div>

          {erro && (
            <div style={{ padding: '8px 12px', background: '#FEE2E2', border: '2px solid var(--red)', borderRadius: 10, color: 'var(--red)', fontWeight: 700, fontSize: 13 }}>
              {erro}
            </div>
          )}
          {sucesso && (
            <div style={{ padding: '8px 12px', background: '#D1FAE5', border: '2px solid var(--green)', borderRadius: 10, color: 'var(--green)', fontWeight: 700, fontSize: 13 }}>
              {sucesso}
            </div>
          )}

          <button
            type="submit"
            className="btn btn-accent"
            disabled={!mudouAlgo || salvando || (novaSenha.length > 0 && senhaAtual.length === 0)}
            style={{ padding: '10px 16px' }}
          >
            {salvando ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      )}
    </div>
  )
}

function LinhaHistorico({ duelo }: { duelo: DueloHistorico }) {
  const data = duelo.finishedAt
    ? new Date(duelo.finishedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    : '—'

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 12px',
        border: '2px solid var(--ink)',
        borderRadius: 10,
        background: duelo.isWinner ? 'rgba(46, 204, 113, 0.08)' : 'var(--bg-card)',
      }}
    >
      <span
        title={duelo.isWinner ? 'Vitória' : 'Derrota'}
        style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          border: '2px solid var(--ink)',
          background: duelo.isWinner ? 'var(--green)' : 'var(--bg-page)',
          color: duelo.isWinner ? '#fff' : 'var(--muted)',
          display: 'grid',
          placeItems: 'center',
          fontFamily: 'var(--font-ui)',
          fontWeight: 900,
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        {duelo.isWinner ? 'V' : 'D'}
      </span>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            fontWeight: 800,
            fontSize: 13,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {duelo.theme || 'Sem tema'}{' '}
          <span style={{ color: 'var(--muted)', fontWeight: 700 }}>#{duelo.roomCode}</span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 700 }}>
          {data} · {duelo.correct}/{duelo.totalQuestions} acertos
        </div>
      </div>
      <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 900, fontSize: 14, color: 'var(--primary)', flexShrink: 0 }}>
        {duelo.score.toLocaleString('pt-BR')} pts
      </span>
      <DoodleIcon name="star" size={14} color={duelo.isWinner ? 'var(--accent)' : 'var(--border)'} />
    </div>
  )
}
