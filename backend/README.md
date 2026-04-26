<p align="center">
  <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Valendo Logo" />
</p>
<h1 align="center">Valendo Backend 🎲</h1>

<p align="center">
  <strong>O motor principal do Valendo.</strong> Um backend robusto, escalável e arquitetado para operar as engrenagens de multiplayer e geração de perguntas através de Inteligência Artificial para duelos em tempo real.
</p>

---

## 🚀 Tecnologias Integradas

- **Framework Core:** [NestJS](https://nestjs.com/) (TypeScript)
- **Banco de Dados:** PostgreSQL com [Prisma ORM](https://www.prisma.io/)
- **Caching & Memória:** [Redis](https://redis.io/)
- **Inteligência Artificial:** Google Gemini AI (`@google/genai`)
- **Segurança:** JWT (JSON Web Tokens) com Passport Auth

## 🧠 Arquitetura de IA e Cache

O Valendo utiliza um sistema avançado de geração de Baterias de Questões:
1. **Requisição de Sala:** O usuário envia um Tema (ex: "Geopolítica") na criação da Sala.
2. **Verificação de Cache (Redis):** O servidor converte o tema num Hash MD5. Se a bateria genética deste assunto foi gerada nos últimos 7 dias, ela é devolvida em 20 milissegundos, economizando tokens da IA.
3. **Geração (Gemini):** Caso o tema seja inédito, a Engine `flash-2.5` do Google Gemini gera 10 perguntas estritas baseadas em nossas instruções do sistema. O resultado é assíncronamente salvo no DB e no Redis simultaneamente.

## ⚙️ Pré-Requisitos e Setup

Para rodar este projeto localmente, você precisa ter o **Node.js** (v20+), **PostgreSQL** e o **Redis** rodando em sua máquina/contêiner.

### 1. Variáveis de Ambiente (`.env`)
Clone na pasta raiz do backend um arquivo `.env` seguindo os mesmos moldes:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/valendo?schema=public"
PORT=3001
API_HOST="0.0.0.0"

# Segurança e Sessão
JWT_SECRET="gere_sua_hash_segura_aqui"

# Integrações Externas
GEMINI_API_KEY="cole_sua_chave_do_google_ai_studio"
REDIS_URL="redis://localhost:6379"
```

### 2. Instalação e Banco de Dados
```bash
# 1. Instalar as dependências
$ npm install

# 2. Subir as tabelas do Prisma para o Banco (Migrations)
$ npx prisma db push
```

### 3. Rodando a Aplicação
```bash
# Modo de desenvolvimento com Hot Reload
$ npm run start:dev

# Prod Build
$ npm run build
$ npm run start:prod
```

## 🧪 Base de Testes Locais

Pensando na fluidez do desenvolvimento contínuo, a raiz do projeto Valendo (fora do `/backend`) possui uma pasta `teste/` com todo o ambiente já parametrizado. 

- **Testes Manuais In-Editor:** Use a extensão `REST Client` (VS Code) para disparar as rotas visualmente através do arquivo `valendo-rotas.http`.
- **Testes E2E via CLI (Robô):** Abra um terminal na pasta de testes e rode `node ./robo-testes.js`. O nosso script Javascript testar a Saúde do Servidor, registrará um Host Autenticado, criará Salas e fará Requests Multi-Part form data na I.A para diagnosticar se a pipeline do Gemini com Redis está fluindo em Verdes!

---
*Feito para garantir a melhor e mais otimizada experiência Backend Multi-player de quizzes.*
