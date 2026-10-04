---
name: revisar
description: Revisa as mudanças da branch atual do planner-api — roda todos os testes e verifica aderência à arquitetura, ausência de comentários e boas práticas de código limpo. Use quando o usuário pedir para revisar, validar ou checar o código antes de commitar ou abrir PR.
argument-hint: "[branch base, padrão main]"
---

# Revisar

Base de comparação: `$ARGUMENTS` ou `main`.

## 1. Levantar o escopo

- `git diff <base>...HEAD --stat` e `git status` (inclui mudanças não commitadas).
- Leia `.claude/architecture.md` e o plano correspondente em `.claude/plans/`, se existir.
- Leia cada arquivo alterado por inteiro, não só o diff.

## 2. Verificações automáticas

Rode e registre o resultado de cada um:

| Checagem | Comando |
|---|---|
| Unitários | `npm test` |
| E2E | `npm run test:e2e` |
| Tipos | `npx tsc --noEmit` |
| Lint | `npm run lint` |
| Comentários | `git diff <base>...HEAD -U0 -- '*.ts' \| grep -nE '^\+.*(//\|/\*)'` (ignore URLs em strings) |

Se o E2E não puder rodar (banco fora do ar), reporte como **não verificado**, nunca como aprovado.

## 3. Checklist de arquitetura

- [ ] Controller contém só HTTP: sem regra de negócio, sem `prisma`, sem `new` de repositório.
- [ ] Use case contém a regra de negócio, depende só de interfaces e retorna `Either`.
- [ ] Instâncias concretas criadas apenas em `use-cases/factory/`.
- [ ] Todo método de repositório existe na interface, no fake (`tests/repositories`) e no Prisma.
- [ ] Repositórios usam mapper e não vazam tipos do Prisma para o domínio.
- [ ] Domínio não importa de `@/infra` (exceto factories).
- [ ] Erros novos em `use-cases/errors/`, estendendo `Error`, implementando `UseCaseError` e com `readonly name` igual ao nome da classe.
- [ ] Erros mapeados para status HTTP coerentes no controller.
- [ ] Resposta via presenter; schema Zod documentado em `routers/documentation`.
- [ ] Nenhum comentário no código.

## 4. Checklist de segurança

Só sobre o diff; a auditoria completa é a skill `auditar`, sugerida ao usuário quando o diff mexe em autenticação, convites, upload, CORS ou dependências.

- [ ] Rota nova ou alterada usa `verify-jwt`, e o use case checa o vínculo e o papel do usuário na viagem; id de recurso filho é validado contra a viagem da URL.
- [ ] Body não aceita campos de controle (dono, confirmação, papel, ids de outra entidade).
- [ ] Strings do schema com `max`, datas estritas, URLs restritas a `http`/`https`.
- [ ] Dado do usuário escapado no HTML de e-mail; nenhum `$queryRaw`/`$executeRaw` com interpolação.
- [ ] Erros e logs não vazam stack, mensagem do Prisma, token, senha nem a existência de recurso alheio.
- [ ] Dependência nova tem propósito claro e nenhum script de install suspeito.

## 5. Checklist de testes (TDD)

- [ ] Todo use case novo/alterado tem spec unitário cobrindo caminho feliz e cada `left`.
- [ ] Todo endpoint novo/alterado tem E2E, incluindo 401/403/404 quando aplicável.
- [ ] Testes usam `makeX`/`makePrismaX` e fakes, sem dados mágicos duplicados.
- [ ] Asserções verificam comportamento (estado do repositório, resposta), não apenas `isRight()`.

## 6. Código limpo

Nomes que revelam intenção, funções pequenas com uma responsabilidade, sem duplicação, sem código morto ou imports não usados, sem `any` desnecessário, early return em vez de aninhamento, sem números/strings mágicos repetidos.

## 7. Relatório

Responda com:

1. **Resultado das verificações** (tabela com passou / falhou / não verificado e a saída relevante das falhas).
2. **Problemas** ordenados por severidade: `bloqueante`, `importante`, `sugestão` — cada um com `arquivo:linha`, o problema e a correção proposta.
3. **Veredito**: aprovado para commit ou não.

Não corrija nada automaticamente; pergunte ao usuário se deseja aplicar as correções.
