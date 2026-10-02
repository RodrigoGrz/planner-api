---
name: executar
description: Implementa um plano do planner-api seguindo TDD estrito (testes primeiro, depois implementação) e a arquitetura do projeto. Use quando o usuário pedir para executar, implementar ou codar um plano ou tarefa.
argument-hint: "[caminho do plano em .claude/plans/]"
---

# Executar

Entrada: `$ARGUMENTS` — caminho do plano. Se vazio, use o arquivo mais recente em `.claude/plans/`. Se não houver plano, rode a skill `planejar` primeiro.

## Antes de começar

1. Leia `.claude/architecture.md` e o plano.
2. Se estiver na `main`, crie a branch com o nome sugerido no plano (`git checkout -b <tipo>/<nome>`).
3. Rode `npm test` para registrar o estado inicial.

## Ciclo TDD (repita por unidade de comportamento)

### 1. Red — escrever o teste primeiro
- **Use case**: `src/domain/trip/application/use-cases/<nome>.spec.ts` com repositórios fake e `makeX`.
- Crie antes apenas o mínimo para o teste compilar: novas assinaturas na interface do repositório, métodos no fake, novas props na entidade, classes de erro, factories de teste (`tests/factories`).
- Rode `npm test -- <nome>` e **confirme que falha pelo motivo esperado** (asserção, não erro de import/sintaxe). Mostre a falha ao usuário.

### 2. Green — implementar o mínimo
- Implemente o use case até o teste passar. Nada além do que o teste exige.
- Rode o teste novamente e confirme que passa.

### 3. Refactor
- Melhore nomes e remova duplicação mantendo os testes verdes.
- **Não crie função/helper novo só para tirar duplicação de poucas linhas** (ex.: buscar participante + trip + checar expiração em dois use cases). Duplicação pequena e local é aceitável. Extraia só quando for uma regra de negócio que precisa morar num único lugar (como `trip-period`) ou quando o trecho repetido for grande.

### 4. Camada HTTP / infra (também test-first)
1. Escreva o E2E em `src/infra/http/controllers/<nome>.spec.ts` (`test('[VERBO] /rota', ...)`, casos de erro e autorização relevantes).
2. Se houver método novo em repositório Prisma com query não trivial, escreva o teste em `src/infra/database/prisma/repositories/*.spec.ts`.
3. Implemente: migration Prisma (se houver) -> mapper -> repositório Prisma -> factory -> schema em `routers/documentation` -> controller -> registro na rota -> presenter.
4. Rode `npm run test:e2e -- <nome>`. Se o Postgres não estiver disponível, avise o usuário (`docker compose up -d`) em vez de pular.

## Ao terminar

- `npm test`, `npm run test:e2e`, `npx tsc --noEmit` e `npm run lint` devem passar.
- Marque no plano os itens concluídos.
- Sugira rodar `revisar`.

## Regras inegociáveis

- **Nunca** escrever implementação antes do teste correspondente existir e falhar.
- **Nenhum comentário no código** (`//`, `/* */`, JSDoc).
- Controller só HTTP; regra de negócio só no use case; instâncias concretas só na factory; repositórios sempre com interface + fake + Prisma.
- Não alterar testes existentes para fazê-los passar, a menos que o plano mude o comportamento de propósito — nesse caso, explique.
