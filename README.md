# Projeto Node.js + TypeScript (Arquitetura Hexagonal)

CRUD mínimo (CREATE + GET) para **Customer** com Prisma + SQLite, alternando entre **Express** e **Fastify** via `HTTP_ADAPTER`.

## Requisitos
- Node.js 18+

## Instalação
```bash
npm install
```

## Configuração
Crie um `.env` baseado no `.env.example`:
```bash
copy .env.example .env
```

## Banco (Prisma + SQLite)
Gerar client:
```bash
npm run prisma:generate
```

Criar migrations e aplicar no banco local (`dev.db`):
```bash
npm run prisma:migrate
```

## Rodar em desenvolvimento
```bash
npm run dev
```

Trocar adapter HTTP (sem tocar domínio/usecases):
```bash
set HTTP_ADAPTER=express
npm run dev

set HTTP_ADAPTER=fastify
npm run dev
```

## Swagger
- UI: `http://localhost:3000/docs`
- OpenAPI JSON: `http://localhost:3000/docs/openapi.json`

## Endpoints
### POST /customers
Request:
```json
{ "name": "Bruno Santos", "age": 28, "cpf": "12345678901" }
```

Response 201:
```json
{ "data": { "id": "uuid-aqui", "name": "Bruno Santos", "age": 28, "cpf": "12345678901" } }
```

Response 400 (validation):
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request",
    "details": [{ "path": "cpf", "message": "CPF must have 11 digits" }]
  }
}
```

Response 409 (cpf duplicado):
```json
{
  "error": {
    "code": "CUSTOMER_ALREADY_EXISTS",
    "message": "Customer with this CPF already exists"
  }
}
```

### GET /customers/:id
Response 200:
```json
{ "data": { "id": "uuid-aqui", "name": "Bruno Santos", "age": 28, "cpf": "12345678901" } }
```

Response 404:
```json
{ "error": { "code": "NOT_FOUND", "message": "Customer not found" } }
```

## Testes
Rodar com Express:
```bash
set HTTP_ADAPTER=express
npm test
```

Rodar com Fastify:
```bash
set HTTP_ADAPTER=fastify
npm test
```

Os testes usam SQLite separado: `test.db`.

## Estrutura
```text
src/
  domain/
  application/
  ports/
  adapters/
  infra/
  config/
prisma/
tests/
```
