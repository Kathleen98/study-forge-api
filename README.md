# StudyForge API

REST API construída com NestJS, Prisma e PostgreSQL. Alimenta a plataforma StudyForge com autenticação, gerenciamento de conteúdo e agentes de estudo com RAG.

## Tecnologias

- **[NestJS](https://nestjs.com/)** — framework Node.js progressivo e estruturado
- **[Clerk](https://clerk.com/)** — autenticação e validação de sessões via JWT
- **[Prisma](https://www.prisma.io/)** — ORM com tipagem e migrations
- **[PostgreSQL](https://www.postgresql.org/)** + **[pgvector](https://github.com/pgvector/pgvector)** — banco de dados relacional com suporte a embeddings
- **[Zod](https://zod.dev/)** — validação de schemas compartilhada com o frontend
- **[BullMQ](https://docs.bullmq.io/)** — filas para indexação assíncrona das documentações
- **[Redis](https://redis.io/)** — cache e backend das filas
- **[Gemini API](https://ai.google.dev/)** — LLM e embeddings para os agentes de estudo

## Funcionalidades

- **Autenticação** — rotas protegidas via token JWT emitido pelo Clerk
- **Posts** — CRUD completo com suporte a MDX e tags por tecnologia
- **Agentes de Estudo** — pipeline de RAG que indexa documentações oficiais e responde perguntas com base nelas
- **Roadmaps** — criação e acompanhamento de trilhas de estudo
- **Snippets** — gerenciamento de trechos de código por categoria

## Primeiros Passos

### Pré-requisitos

- Node.js 20+
- Docker e Docker Compose

### Rodando localmente

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/studyforge-api
cd studyforge-api

# Instale as dependências
npm install

# Suba os serviços necessários (PostgreSQL com pgvector e Redis)
docker compose up -d

# Copie as variáveis de ambiente
cp .env.example .env

# Execute as migrations do banco
npx prisma migrate dev

# Inicie o servidor de desenvolvimento
npm run start:dev
```

A API estará disponível em [http://localhost:3333](http://localhost:3333).

### Variáveis de ambiente

```env
# Banco de dados
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/studyforge

# Redis
REDIS_URL=redis://localhost:6379

# Clerk — copie as chaves do dashboard em https://clerk.com
CLERK_SECRET_KEY=
CLERK_PUBLISHABLE_KEY=

# LLM — use o Gemini (plano gratuito) ou aponte para o Ollama local
GEMINI_API_KEY=

# App
PORT=3333
```

## Estrutura do Projeto

```
src/
├── modules/
│   ├── auth/             # Guard que valida o token JWT do Clerk
│   ├── users/            # Sincronização do usuário via webhook do Clerk
│   ├── posts/            # Knowledge hub — CRUD de posts
│   ├── snippets/         # Snippet vault
│   ├── roadmaps/         # Roadmap builder
│   └── agents/           # Agentes de estudo com RAG
│       ├── indexer/      # Workers de indexação das docs (BullMQ)
│       ├── embeddings/   # Geração e busca de embeddings (pgvector)
│       └── chat/         # Endpoint de chat com streaming
├── common/
│   ├── decorators/       # Decorators customizados
│   ├── filters/          # Exception filters globais
│   ├── guards/           # Guard de autenticação (Clerk JWT)
│   └── pipes/            # Pipes de validação com Zod
├── config/               # Configurações de ambiente
└── prisma/               # Schema e migrations do banco
```

## Como o RAG funciona

```
Documentação oficial
      ↓
  Divisão em chunks (BullMQ worker)
      ↓
  Geração de embeddings (Gemini)
      ↓
  Armazenamento no pgvector
      ↓
Pergunta do usuário → embedding
      ↓
  Busca por similaridade no pgvector
      ↓
  Prompt montado com os chunks relevantes
      ↓
  LLM responde com base nas docs reais
```

## Como a autenticação funciona

O Clerk gerencia todo o fluxo de login no frontend. A API recebe o token JWT em cada requisição e valida a assinatura usando a chave pública do Clerk — sem precisar consultar nenhum serviço externo a cada chamada.

Quando um usuário se cadastra pela primeira vez, o Clerk dispara um **webhook** para a API criar o registro correspondente no banco local, mantendo os dados do usuário sincronizados.

## Relacionados

- [studyforge-web](https://github.com/seu-usuario/studyforge-web) — o frontend em Next.js que consome esta API
