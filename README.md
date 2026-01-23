# Planner API

Backend da aplicação **Planner**, um app para **planejamento e organização de viagens em grupo**.

A API é responsável por gerenciar usuários, viagens, atividades, links úteis e convidados, oferecendo uma base sólida e extensível para evoluções futuras da aplicação mobile.

## 🎯 Objetivo do app

O Planner tem como objetivo facilitar o planejamento de viagens, centralizando em um único lugar:

- Informações da viagem
- Atividades organizadas por dia
- Links importantes (reservas, mapas, documentos, etc.)
- Pessoas convidadas para a viagem

A ideia é evitar o uso de várias ferramentas soltas (anotações, mensagens, links perdidos) e manter tudo organizado de forma simples e acessível.

## 🏗️ Arquitetura

O backend foi estruturado com foco em:

- Separação clara de responsabilidades
- Regras de negócio bem definidas
- Facilidade para manutenção e evolução
- Segurança para refatorações

Estrutura baseada em princípios de **Clean Architecture**, separando:

- **Domain**: entidades e regras de negócio
- **Application / Use Cases**: casos de uso da aplicação
- **Infra**: banco de dados, ORM e serviços externos
- **Presentation**: controllers HTTP e rotas
- **Tests**: testes unitários e de integração

## 🚀 Tecnologias

- Node.js
- TypeScript
- Fastify
- Prisma
- PostgreSQL
- Docker
- Vitest

## ⚙️ Requisitos

- Node.js >= 20
- Docker e Docker Compose
- npm

## ▶️ Como rodar o projeto

### 1. Clone o repositório

```bash
git clone https://github.com/RodrigoGrz/planner-api
cd planner-api
```

### 2. Suba o banco de dados

```bash
docker-compose up -d
```
### 3. Rodar testes

```bash
npm run test
npm run test:e2e
```

### 4. Rodar em dev

```bash
npm run dev:start
```
