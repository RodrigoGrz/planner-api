# Planner API

Backend for **Planner**, an app for **planning and organizing group trips**.

The API manages travelers, trips, activities, useful links and invited participants, providing a solid and extensible foundation for the future evolution of the mobile app.

## 🎯 App goal

Planner makes trip planning easier by keeping everything in one place:

- Trip information
- Activities organized by day
- Important links (bookings, maps, documents, etc.)
- People invited to the trip

The idea is to avoid juggling scattered tools (notes, messages, lost links) and keep everything organized in a simple, accessible way.

## 🏗️ Architecture

The backend is built with a focus on:

- Clear separation of responsibilities
- Well-defined business rules
- Ease of maintenance and evolution
- Safe refactoring

The structure follows **Clean Architecture** principles, split into:

- **Domain**: entities and business rules
- **Application / Use Cases**: application use cases
- **Infra**: database, ORM and external services
- **Presentation**: HTTP controllers and routes
- **Tests**: unit and integration (E2E) tests

## 🚀 Tech stack

- Node.js
- TypeScript
- Fastify
- Prisma
- PostgreSQL
- Docker
- Vitest

## ⚙️ Requirements

- Node.js >= 24.14
- Docker and Docker Compose
- npm

## ▶️ Running the project

### 1. Clone the repository

```bash
git clone https://github.com/RodrigoGrz/planner-api
cd planner-api
```

### 2. Install dependencies and set up the environment

```bash
npm install
cp .env.example .env
```

### 3. Start the database and run the migrations

```bash
docker compose up -d
npm run db:migrate
```

### 4. Run the tests

```bash
npm test
npm run test:e2e
```

> The E2E tests need the database from step 3 running.

### 5. Run in development mode

```bash
npm run dev:start
```

The API runs on `http://localhost:3333` by default, and the Swagger documentation is available at `/docs`.
