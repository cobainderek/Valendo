# VALENDO

**Plataforma de Duelos de Conhecimento em Tempo Real**

> "Voce estuda mais porque quer ganhar — e ganha porque estudou mais."

**Derek Cobain** x **Dyone Nunes Andrade**
FAESA — Centro Universitario | Desenvolvimento Web 2 | 2026

---

## O que e o Valendo?

Valendo e uma plataforma web de batalhas de conhecimento em tempo real. Dois ou mais jogadores entram em uma sala — publica ou privada — e respondem as mesmas perguntas simultaneamente. As perguntas sao geradas por Inteligencia Artificial (Gemini 1.5 Pro) com base em um tema escolhido ou em um material enviado pelo proprio usuario, como um PDF ou apostila.

## O Problema que Resolve

Estudar sozinho e entediante e tem baixo indice de retencao. Ferramentas existentes como Quizlet e Kahoot resolvem partes do problema, mas nenhuma combina geracao dinamica de questoes por IA com competicao multiplayer em tempo real entre os proprios colegas.

| Plataforma | O que faz | Limitacao |
|------------|-----------|-----------|
| Quizlet | Flashcards criados manualmente | Sem IA, sem competicao em tempo real |
| Kahoot | Quiz ao vivo em sala de aula | Depende do professor |
| Duolingo | Gamificacao de idiomas | So idiomas, sem conteudo livre |
| **Valendo** | **Duelo multiplayer com IA generativa** | — |

---

## Funcionalidades Principais

### Modos de Jogo

| Modo | Descricao | Prioridade |
|------|-----------|------------|
| PvP 1v1 | Dois jogadores, mesma sala, respostas simultaneas | Alta — core |
| PvP Multiplayer | Varios jogadores na mesma sala | Alta — diferencial |
| Solo vs IA | Jogador treina contra adversario simulado | Media |

### Tipos de Sala

| Tipo | Como entrar | Caso de uso |
|------|-------------|-------------|
| Publica | Matchmaking automatico | Adversario desconhecido |
| Privada | Codigo de 6 digitos | Duelo entre amigos |

### Fontes de Perguntas

- **Tema livre:** o jogador digita um assunto e a IA gera as perguntas do zero
- **Upload de PDF/apostila:** o jogador sobe o material da aula e a IA gera perguntas daquele conteudo especifico

### Progressao e Ranking

- Ranking semanal com reset todo domingo
- Divisoes: Estudante > Dedicado > Aplicado > Destaque > Lendario
- Badges permanentes e semanais colecioaveis
- Perfil publico com historico e stats
- Sistema de amigos: convite por tag (#1234), link ou busca

---

## Arquitetura

### Stack Definida

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 15 (App Router) + Tailwind CSS + shadcn/ui |
| Backend | A definir (FastAPI ou Node.js) |
| Banco de Dados | PostgreSQL |
| IA / LLM | Gemini 1.5 Pro |
| Realtime | WebSocket nativo |
| Auth | JWT proprio |

### Fluxo do Duelo em Tempo Real

```
1. Jogador cria sala (tema ou PDF) e recebe codigo
2. Segundo jogador entra pelo codigo ou matchmaking
3. IA gera as perguntas a partir do tema ou PDF
4. Sala abre conexao WebSocket com todos os jogadores
5. Backend envia a mesma pergunta para todos simultaneamente
6. Timer regressivo visivel para todos em tempo real
7. Jogador responde — servidor registra sem revelar aos outros
8. Ao fim do tempo: resposta correta revelada com explicacao
9. Placar atualizado em tempo real para todos
10. Fim do duelo: relatorio IA gerado, pontos creditados
```

### Entidades do Banco de Dados

| Entidade | Descricao |
|----------|-----------|
| User | Conta do jogador (nome, tag, email, stats) |
| Room | Sala de duelo (codigo, tema, fonte, status) |
| Duel | Instancia do duelo em andamento/encerrado |
| Question | Pergunta gerada pela IA (texto, opcoes, resposta) |
| Answer | Resposta de um jogador a uma pergunta |
| WeeklyScore | Pontuacao semanal de um jogador |
| Friendship | Relacao entre dois jogadores |
| Badge | Conquista permanente ou semanal |

---

## Divisao de Trabalho

| Integrante | Foco principal | Carga |
|------------|----------------|-------|
| **Derek** | Frontend completo + cliente WebSocket + telas sociais | ~50% |
| **Dyone** | Backend + IA + servidor WebSocket + banco | ~50% |
| **Compartilhado** | Setup, schema, testes e QA | — |

### Fases do Desenvolvimento

| Fase | Nome | Entregas |
|------|------|----------|
| 01 | Setup | Repositorio, Docker, banco, ambiente local |
| 02 | Auth | Cadastro, login, perfil, tags |
| 03 | Conteudo | Gemini por tema, PDF, geracao de questoes |
| 04 | Duelo Core | WebSocket, 1v1 em tempo real, placar |
| 05 | Multiplayer | Sala com multiplos players, matchmaking |
| 06 | Social | Amigos, ranking semanal, badges, perfil |
| 07 | Polish | Testes, UX, animacoes, responsivo |

---

## Estrutura do Repositorio

```
valendo/
├── valendo-frontend/    # Aplicacao Next.js 15
├── Docs/                # Documentacao do projeto (dentro do frontend)
└── README.md            # Este arquivo
```

---

## Licenca

© 2026 CYBERNETIC STUDIOS — Derek Cobain x Dyone Nunes Andrade — FAESA
