# StudyForge API

API backend da plataforma StudyForge, construída com NestJS para gerenciar autenticação, conteúdo e agentes de estudo com IA.

## Stack

- **Framework**: NestJS v11
- **Linguagem**: TypeScript (strict mode)
- **Banco de dados**: PostgreSQL via Prisma ORM
- **Autenticação**: AWS Cognito
- **Documentação**: Swagger / OpenAPI
- **Validação**: Zod

## Pré-requisitos

- Node.js 20+
- Docker e Docker Compose
- Conta AWS com Cognito User Pool configurado

## Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/study-forge-api.git
cd study-forge-api

# Instale as dependências
npm install
```

## Configuração

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
NODE_ENV=dev
PORT=3333

# Banco de dados
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/study-forge-api
SHADOW_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/study-forge-api

# AWS Cognito
AWS_REGION=us-east-1
COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
COGNITO_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## Banco de dados

Suba os containers do PostgreSQL com Docker Compose:

```bash
docker-compose up -d
```

Execute as migrations do Prisma:

```bash
npx prisma migrate dev
npx prisma generate
```

## Executando a aplicação

```bash
# Desenvolvimento
npm run start:dev

# Produção
npm run build
npm run start:prod
```

A API ficará disponível em `http://localhost:3333`.

A documentação Swagger estará disponível em `http://localhost:3333/api`.

## Testes

```bash
# Unitários
npm run test

# Com coverage
npm run test:cov

# End-to-end
npm run test:e2e

# Watch mode
npm run test:watch
```

## Estrutura do projeto

```
src/
├── main.ts                 # Entry point com Swagger
├── app.module.ts           # Módulo raiz
├── auth/                   # Módulo de autenticação
│   ├── cognito/            # Provider AWS Cognito
│   └── domain/             # Interfaces de autenticação
├── enums/                  # Enums compartilhados (roles)
└── prisma/                 # Módulo global do Prisma
prisma/
├── schema.prisma           # Schema do banco de dados
└── migrations/             # Histórico de migrations
```

## Modelos do banco de dados

| Modelo   | Descrição                                               |
|----------|---------------------------------------------------------|
| `User`   | Usuários da plataforma, com suporte à integração Cognito |
| `Domain` | Domínios organizacionais com SSO e controle de licença   |

## Roles

| Role    | Descrição                        |
|---------|----------------------------------|
| `USER`  | Usuário padrão                   |
| `ADMIN` | Administrador da plataforma      |

## Scripts disponíveis

| Comando             | Descrição                        |
|---------------------|----------------------------------|
| `npm run start:dev` | Servidor em modo watch           |
| `npm run build`     | Compila o projeto                |
| `npm run lint`      | Lint com correção automática     |
| `npm run format`    | Formata com Prettier             |
| `npm run test`      | Executa os testes unitários      |
| `npm run test:cov`  | Executa testes com coverage      |
| `npm run test:e2e`  | Executa testes end-to-end        |

## Licença

[MIT](LICENSE)
