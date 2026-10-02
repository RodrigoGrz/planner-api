---
name: commit
description: Cria um commit no planner-api, usando mensagem no formato <tipo>/<nome-descritivo-em-ingles>. Use quando o usuário pedir para commitar as mudanças.
argument-hint: "[tipo ou descrição opcional]"
disable-model-invocation: true
---

# Commit

## 1. Verificar o conteúdo

- `git status` e `git diff` (incluindo staged).
- Não incluir `.env`, `dist/`, `node_modules/` ou arquivos de `.claude/plans/`.
- Se houver comentários adicionados em arquivos `.ts`, avise e pare.
- Se estiver na `main`, crie antes uma branch com o mesmo nome do commit.

## 2. Nome do commit

Formato: `<tipo>/<nome-descritivo-em-ingles>`

- `tipo`: `feat` (funcionalidade nova), `fix` (correção), `chore` (manutenção, config, refactor sem mudar comportamento), `add` (adição de recurso auxiliar: testes, docs, dependências, arquivos).
- `nome-descritivo`: **sempre em inglês**, kebab-case, minúsculo, verbo no imperativo, curto e específico.
- Use `$ARGUMENTS` como dica, se fornecido.

Exemplos: `feat/confirm-participant-by-token-link`, `fix/compare-trip-dates-in-single-timezone`, `chore/remove-unused-confirm-trip-route`, `add/e2e-tests-for-protected-routes`.

## 3. Commitar

Adicione os arquivos pelo nome (evite `git add -A`) e commite:

```
git commit -m "<tipo>/<nome-descritivo>" -m "Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Mostre o `git log --oneline -1` ao final. Não faça push sem pedido explícito.
