# Valendo — Roadmap de Desenvolvimento

Plataforma web de duelos de conhecimento em tempo real.
Dois ou mais jogadores entram em salas e respondem perguntas geradas por IA (Gemini 1.5 Pro).

---

## Stack

| Camada     | Tecnologia                        |
| ---------- | --------------------------------- |
| Framework  | Next.js 15 (App Router)           |
| Linguagem  | TypeScript                        |
| UI         | Tailwind CSS + shadcn/ui          |
| Auth       | JWT proprio (email/senha)         |
| Realtime   | WebSocket nativo                  |
| IA         | Gemini 1.5 Pro (geracao de perguntas) |
| Pacotes    | npm                               |

---

## Fase 01 — Setup do Projeto ✅

- [x] Criar projeto Next.js 15 com TypeScript, Tailwind, ESLint, App Router, src dir
- [x] Instalar e configurar shadcn/ui (button, input, label, card, sonner)
- [x] Instalar dependencias (clsx, lucide-react, jwt-decode)
- [x] Estrutura de pastas (app, components, hooks, lib, types, contexts)
- [x] Tema cyberpunk escuro (neon cyan, neon magenta, dark bg)
- [x] Fontes Inter + JetBrains Mono
- [x] Utilitarios CSS de glow neon

---

## Fase 02 — Autenticacao ✅

- [x] Types (User, AuthResponse, LoginCredentials, RegisterCredentials)
- [x] Auth utils (saveToken, getToken, removeToken, getUser, isTokenExpired)
- [x] API client (fetch wrapper com Bearer token e tratamento 401)
- [x] AuthContext/AuthProvider (login, register, logout, rehydrate)
- [x] Middleware de protecao de rotas
- [x] Tela de login com validacao e tema cyberpunk
- [x] Tela de cadastro com validacao completa
- [x] Dashboard placeholder com logout
- [x] Mock auth via .env para desenvolvimento sem backend
- [x] Sincronizacao token localStorage + cookie para middleware

---

## Fase 03 — Lobby e Salas ✅

Objetivo: permitir que jogadores criem e entrem em salas de duelo.

- [x] Listagem de salas abertas no dashboard
- [x] Criar sala (formulario: tema, numero de rodadas, max jogadores, publica/privada)
- [x] Entrar em sala por codigo ou pela listagem
- [x] Sala de espera (lobby) mostrando jogadores conectados
- [x] Dono da sala pode iniciar a partida quando todos estiverem prontos
- [x] Botao "Pronto" para cada jogador
- [ ] Chat simples no lobby (opcional — adiado para fase futura)
- [x] Componentes: room-card, create-room-modal, join-by-code, player-list
- [x] Mock de salas para desenvolvimento sem backend
- [x] Tipos: Room, RoomPlayer, CreateRoomPayload, RoomStatus

### Tipos esperados
```
Room { id, code, theme, rounds, maxPlayers, isPrivate, status, owner, players }
RoomPlayer { id, name, tag, isReady }
```

---

## Fase 04 — WebSocket e Comunicacao em Tempo Real ✅

Objetivo: estabelecer conexao WebSocket para sincronizar estado do jogo.

- [x] Servico WebSocket client (connect, disconnect, send, on)
- [x] Hook `useSocket` com reconexao automatica
- [x] Eventos do lobby: player_joined, player_left, player_ready, game_start (tipos definidos)
- [x] Eventos do jogo: question, answer, timer_tick, round_result, game_end (tipos definidos)
- [x] Feedback visual de conexao (conectado/reconectando/desconectado)
- [x] Provider de socket no contexto da sala (SocketProvider + room layout)

---

## Fase 05 — Motor do Jogo (Gameplay) ✅

Objetivo: implementar a mecanica de perguntas e respostas em tempo real.

- [x] Tela de jogo em tela cheia
- [x] Exibir pergunta com 4 alternativas
- [x] Timer de 30 segundos por pergunta (barra visual animada com cores urgencia)
- [x] Selecionar resposta e travar escolha
- [x] Resultado da rodada (quem acertou, pontuacao)
- [x] Transicao entre rodadas com placar parcial
- [x] Tela de fim de jogo com ranking final e estatisticas
- [x] Animacoes de acerto/erro (feedback visual cyberpunk)
- [x] Componentes: question-card, answer-option, timer-bar, scoreboard, game-over, countdown
- [x] Mock de perguntas e bot adversario para teste
- [x] Pontuacao baseada em acerto + tempo restante

### Fluxo
```
Lobby → Countdown 3..2..1 → Pergunta 1 → Resultado → ... → Pergunta N → Resultado Final
```

---

## Fase 06 — Ranking Semanal ✅

Objetivo: ranking competitivo com reset semanal.

- [x] Pagina de ranking (/ranking)
- [x] Listagem dos top jogadores da semana
- [x] Pontuacao baseada em: vitorias, acertos, tempo de resposta
- [x] Posicao do jogador atual destacada (card proprio + highlight na lista)
- [x] Filtros: semanal, mensal, geral
- [x] Badge/icone para top 3 (trofeu ouro, medalha prata, medalha bronze)
- [x] Componentes: ranking-table, rank-badge, player-rank-card
- [x] Navegacao via navbar (Salas + Ranking)
- [x] Mock com 12 jogadores e escalas por periodo

---

## Fase 07 — Perfil do Jogador ✅

Objetivo: pagina de perfil com historico e estatisticas.

- [x] Pagina de perfil (/profile)
- [x] Exibir: nome, tag, avatar (emoji), email, data de criacao
- [x] Estatisticas: partidas, vitorias, taxa de vitoria, acertos, melhor sequencia, pontos totais
- [x] Historico de partidas recentes com resultado, tema, oponente, pontos
- [x] Editar nome e avatar (12 emojis disponiveis)
- [x] Componentes: profile-card, stats-grid, match-history
- [x] Navegacao via navbar (Salas + Ranking + Perfil)
- [x] Mock com dados realistas

---

## Fase 08 — Integracao com Gemini (Geracao de Perguntas) ✅

Objetivo: gerar perguntas dinamicas via Gemini 1.5 Pro.

- [x] Service que chama endpoint /questions/generate no backend
- [x] Prompt engineering para perguntas de multipla escolha (template completo)
- [x] Cache de perguntas por sessao para evitar repeticao
- [x] 8 categorias/temas predefinidos + tema "Geral"
- [x] Validacao rigorosa do formato da resposta da IA
- [x] Fallback com 54 perguntas pre-cadastradas (6 por tema) em caso de erro
- [x] Tipos: GeneratedQuestion, GenerateQuestionsRequest, QuestionDifficulty
- [x] Motor de jogo integrado com o gerador de perguntas (async)

---

## Fase 09 — Polish e UX ✅

Objetivo: refinar a experiencia do usuario.

- [x] Animacoes de transicao entre paginas (PageTransition com fade-in + slide)
- [ ] Efeitos sonoros (acerto, erro, timer, vitoria) — adiado, requer assets de audio
- [x] Modo responsivo (mobile-first em todas as telas)
- [x] Loading skeletons em todas as telas (dashboard, ranking, profile)
- [x] Notificacoes toast para acoes (sala criada, entrar, perfil atualizado, erros)
- [x] Tratamento de erros amigavel em todas as telas
- [x] Acessibilidade (aria-label, role, aria-selected, sections semanticas)
- [x] SEO completo (title template, description, keywords, OpenGraph, Twitter Card, viewport)

---

## Fase 10 — Deploy e Infraestrutura

Objetivo: colocar o projeto em producao.

- [ ] Configurar variaveis de ambiente de producao
- [ ] Deploy do frontend (Vercel)
- [ ] Deploy do backend (a definir)
- [ ] Dominio customizado
- [ ] HTTPS
- [ ] Monitoramento de erros (Sentry ou similar)
- [ ] Analytics basico

---

## Decisoes Tecnicas

| Decisao                  | Escolha                          | Motivo                                    |
| ------------------------ | -------------------------------- | ----------------------------------------- |
| Auth                     | JWT proprio                      | Controle total, sem dependencia externa    |
| WebSocket                | Nativo                           | Simplicidade, sem overhead de lib          |
| Tempo por pergunta       | 30 segundos                      | Balanco entre pressao e reflexao           |
| Rodadas                  | Variavel (escolhido na sala)     | Flexibilidade para partidas curtas/longas  |
| Ranking                  | Reset semanal                    | Manter competitividade ativa              |
| IA para perguntas        | Gemini 1.5 Pro                   | Custo-beneficio, qualidade de geracao      |
| Tema visual              | Cyberpunk escuro                 | Identidade visual marcante                |
