---
name: commit
description: Cria um commit no planner-api depois de passar os testes e gerar o build, usando mensagem no formato <tipo>/<nome-descritivo-em-ingles>. Use quando o usuário pedir para commitar as mudanças.
argument-hint: "[tipo ou descrição opcional]"
disable-model-invocation: true
---

# Commit

## 1. Validar (todos obrigatórios, na ordem)

1. `npm test`
2. `npm run test:e2e` — se o banco não estiver disponível, pare e peça ao usuário para subir (`docker compose up -d`).
3. `npm run build` — confirma que nada quebrou na compilação.

Se qualquer passo falhar: **não commite**. Mostre a saída do erro e pare.

## 2. Verificar o conteúdo

- `git status` e `git diff` (incluindo staged).
- Não incluir `.env`, `dist/`, `node_modules/` ou arquivos de `.claude/plans/`.
- Se houver comentários adicionados em arquivos `.ts`, avise e pare.
- Se estiver na `main`, crie antes uma branch com o mesmo nome do commit.

## 3. Nome do commit

Formato: `<tipo>/<nome-descritivo-em-ingles>`

- `tipo`: `feat` (funcionalidade nova), `fix` (correção), `chore` (manutenção, config, refactor sem mudar comportamento), `add` (adição de recurso auxiliar: testes, docs, dependências, arquivos).
- `nome-descritivo`: **sempre em inglês**, kebab-case, minúsculo, verbo no imperativo, curto e específico.
- Use `$ARGUMENTS` como dica, se fornecido.

Exemplos: `feat/confirm-participant-by-token-link`, `fix/compare-trip-dates-in-single-timezone`, `chore/remove-unused-confirm-trip-route`, `add/e2e-tests-for-protected-routes`.

## 4. Commitar

Adicione os arquivos pelo nome (evite `git add -A`) e commite:

```
git commit -m "<tipo>/<nome-descritivo>" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Mostre o `git log --oneline -1` ao final. Não faça push sem pedido explícito.
