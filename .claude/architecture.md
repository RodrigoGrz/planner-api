# Arquitetura do planner-api

Referência compartilhada pelas skills `planejar`, `executar`, `revisar` e `commit`.

## Stack

Node >= 24, TypeScript, Fastify 5, Zod 4 (`fastify-type-provider-zod`), Prisma 7 (Postgres), Vitest 4, Supertest, Faker.

## Regra absoluta

**NÃO escrever comentários no código.** Nenhum `//`, `/* */` ou JSDoc. O código deve se explicar por nomes claros.

## Camadas e responsabilidades

| Camada | Local | Responsabilidade | Pode depender de |
|---|---|---|---|
| Core | `src/core/` | `Entity`, `UniqueEntityID`, `ValueObject`, `Either` (`left`/`right`), `UseCaseError`, `Optional` | nada do projeto |
| Entidades | `src/domain/trip/enterprise/entities/` (+ `value-objects/`) | Estado e invariantes do domínio. Estendem `Entity<Props>`, expõem getters, `static create(props, id?)`, métodos de comportamento (ex.: `participant.confirm()`) | core |
| Interfaces de repositório | `src/domain/trip/application/repositories/` | `interface XRepository` com assinaturas que recebem/retornam entidades de domínio | entidades |
| Portas de serviço | `src/domain/trip/application/{mail,storage,authorization,transaction}/` | Contratos abstratos (`Mailer`, `Uploader`, `TransactionManager`, ...) | entidades |
| Use cases | `src/domain/trip/application/use-cases/` | **Somente regra de negócio.** Classe `XUseCase` com dependências no construtor (interfaces) e `execute(request): Promise<Either<Erro, Resultado>>` | entidades, interfaces, erros |
| Erros | `src/domain/trip/application/use-cases/errors/` | `class XError extends Error implements UseCaseError`, mensagem em português | core |
| Factories | `src/domain/trip/application/use-cases/factory/` | `xFactory()` instancia repositórios Prisma/serviços concretos e retorna o use case. **Único lugar que faz `new` das implementações concretas** | use case, infra |
| Repositórios Prisma | `src/infra/database/prisma/repositories/prisma-x-repository.ts` | `class PrismaXRepository implements XRepository` | prisma, mappers |
| Mappers | `src/infra/database/prisma/mappers/prisma-x-mapper.ts` | `toDomain(raw)` e `toPrisma(entity)` | entidades, `@prisma/client` |
| Repositórios fake (teste) | `tests/repositories/fake-x-repository.ts` | `class FakeXRepository implements XRepository` com `public items: X[] = []` em memória | interfaces |
| Factories de teste | `tests/factories/make-x.ts` | `makeX(override)` com Faker e `makePrismaX(data)` que persiste via mapper | entidades, mappers |
| Controllers | `src/infra/http/controllers/x.ts` | **Somente HTTP**: ler `request` (body/params/query/`request.user.sub`), chamar a factory, executar o use case, mapear `Left` para status HTTP e `Right` para resposta via presenter. Nenhuma regra de negócio, nenhum acesso a `prisma` | factory, presenters, erros, schemas |
| Schemas / docs | `src/infra/http/routers/documentation/<grupo>/x-schema.ts` | Schemas Zod de body/params/query/response + metadados do Swagger | zod |
| Rotas | `src/infra/http/routers/<grupo>.route.ts` | Registrar `app.<verbo>(path, schema, controller)` | controllers, schemas |
| Presenters | `src/infra/http/presenters/x-presenter.ts` | `static toHTTP(entity)` convertendo entidade em JSON | entidades |

Direção de dependência: `infra -> application -> enterprise -> core`. O domínio nunca importa de `@/infra` (exceção: arquivos em `use-cases/factory/`).

## Convenções

- Arquivos em kebab-case; classes em PascalCase; funções em camelCase.
- Alias `@/` para `src/`; `tests/` importado como `tests/...`.
- Use case: `interface XUseCaseRequest`, `type XUseCaseResponse = Either<ErroA | ErroB, { ... }>`.
- Controller: `export async function xController(request, reply)`; tipos de body/params via `z.infer<typeof schema>`; erros mapeados com `switch (error.constructor)`.
- Repositórios recebem e retornam entidades de domínio, nunca tipos do Prisma.
- Mudanças de banco: `prisma/schema.prisma` + migration (`npm run db:migrate`).
- Descrições de teste em inglês (`it('should be able to ...')`, `it('should not be able to ...')`).

## Testes

- Unitários: `src/domain/**/*.spec.ts`, `src/core/*.spec.ts`, `src/utils/*.spec.ts` — rodam com `npm test`. Usam repositórios fake e `makeX`.
- E2E: `src/infra/http/controllers/*.spec.ts` e `src/infra/database/**/*.spec.ts` — rodam com `npm run test:e2e` (precisa do Postgres do `docker-compose.yml`). Usam `supertest`, `app`, `makePrismaX` e `createAndAuthenticateTraveler`.
- Nome do teste E2E: `test('[VERBO] /rota', ...)`.

## Comandos

| Ação | Comando |
|---|---|
| Testes unitários | `npm test` |
| Testes E2E | `npm run test:e2e` |
| Lint | `npm run lint` |
| Build | `npm run build` |
| Typecheck | `npx tsc --noEmit` |

O projeto fica no WSL (`archlinux`). Se o comando falhar pelo caminho UNC do Windows, rode dentro do WSL: `wsl -d archlinux --cd /home/rodrigo/projects/personal/planner-api -- <comando>`.
