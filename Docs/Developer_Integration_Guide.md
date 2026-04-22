# 🚀 Guia do Desenvolvedor: Integração e Conectividade Backend

Bem-vindo à documentação modular da arquitetura do Valendo. Este guia contém todas as diretrizes de conexões e endereçamentos de infraestrutura para auxiliar nas etapas de deployment (produção) ou alocação nos ambientes de desenvolvimento de outros programadores e do painel Frontend.

---

## 🌎 1. Endereçamentos Host e API Rest

### Comunicação com o Frontend
Quando o seu servidor é ativado, ele escuta conexões com base no arquivo root (`main.ts`). Para lidar com origens distintas, o sistema encontra-se com o `CORS` habilitado globalmente. 
A API Rest sobe no formato `API_HOST:PORTA`.

> **Desenvolvimento (Localhost):**
> A porta padrão designada é `3000`. O Front-end durante o desenvolvimento **PRECISA** realizar os disparos do Axios e do SWR para a base `http://localhost:3000`.

> **Produção (VPS, Docker ou Cloud Run):**
> Quando a aplicação foi encapsulada para a nuvem, o processo do sistema injetará silenciosamente `0.0.0.0` como o Host raiz via variável de ambiente. Isso garante o _port binding_ nativo na rede em que ele se hospeda.
> - O link mudará inteiramente. Um cloud irá reescrever seu acesso encriptado.
> - No frontend em Produção, você deve usar Variáveis de Ambiente no front (Exemplo: `VITE_API_URL`) para chamar os dados sem estourar CORS Error.

---

## 🔑 2. Variáveis de Ambiente e Configuração Segura
O Sistema não opera sozinho sem os nós de segurança definidos pelos mantenedores.
Toda máquina instanciada que desejar rodar e compilar a base deste app precisa carregar um arquivo `.env` idêntico à documentação abaixo na pasta `/backend/`:

```env
# URL De Conexão para o PostgreSQL
DATABASE_URL="postgresql://[NOME_USER]:[SENHA]@[127.0.0.1]:5432/valendo?schema=public"

# Define a porta local. Em ambientes de nuvem, a Nuvem costuma sobrescrever e gerenciar isto.
PORT=3000
API_HOST="0.0.0.0"

# O Salteador para gerar Hashings fortes dos usuários na criação e emissão dos cookies
JWT_SECRET="sua-chave-secreta-aqui"

# Fornece a identidade para acessar Modelos Nativos do Google para geração de recursos base
GEMINI_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"

# Porta de escape para o banco de acesso de Memória Rápida de dados não estruturados
REDIS_URL="redis://localhost:6379"
```

---

## 🗄️ 3. Infraestrutura Postgres (Prisma Data Layer)
Todo dado relacional da aplicação roda em PostgreSQL engrenado com a abstração pesada nativa do **Prisma 7.0**. 
- O Driver de conexão com o banco opera nativo e com `exports = "cjs"` forçados. 
- A cada inserção de um desenvolvedor ao Database, deve-se gerar novamente as tipagens via `npx prisma generate` ou a sintaxe tipada (TypeScript) irá estourar _Type Failures_.

---

## ⚡ 4. Mecanismos de Otimização e Cache Neural (Google AI & Redis)
A API de geração interativa atrela comunicação entre o Gemini (Sintetizador via LLM) e Redis.

### Algoritmo de Persistência MD5
Toda a interação via Rota `POST /questions/generate` que usa de Tema e Texto processa a entrada no algoritmo MD5 gerando Chaves Criptadas para acesso da memória do REDIS da máquina. 
Isso permite um reaproveitamento universal das chaves geradas entre milissegundos para salas ou hosts diferentes.

### Docker Requirement Minimal
Para o backend operar perfeitamente sua engrenagem de cache na porta 6379, ele necessita encontrar serviços vitais sendo instanciados pela sua máquina subjacente, o mais recomendado sendo Dockerizados na rede (`redis:alpine`).
Em caso de quebra ou queda do container, a API **não acusa 500 Internals explícitos**, um tratamento `try/catch` silenciosamente repassa a função para a geração crua do Gemini garantindo Zero-Crash Experience contra quedas de Hardware momentâneas.
