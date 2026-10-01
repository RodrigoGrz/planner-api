---
name: criar-issue
description: Cria issues no GitHub do planner-api a partir de um plano em .claude/plans (arquivo, número de item ou pasta inteira) ou de uma descrição em texto, seguindo o skeleton .claude/templates/issue-skeleton.md. Use quando o usuário pedir para criar, abrir ou registrar issues.
argument-hint: "<caminho do plano | número(s) do item | pasta de planos | descrição>"
disable-model-invocation: true
---

# Criar issue

Entrada: `$ARGUMENTS`. Pode ser:
- o caminho de um plano (`.claude/plans/ajustes-vulnerabilidade/07-restrict-link-url-protocol.md`);
- um ou mais números de item (`07`, `01 02 03`), procurados em `.claude/plans/**/<número>-*.md`;
- uma pasta de planos (`.claude/plans/ajustes-vulnerabilidade`), criando uma issue por plano (ignorar `README.md`);
- uma descrição livre do problema.

## Passos

1. **Ler o skeleton** em `.claude/templates/issue-skeleton.md`. O corpo da issue segue exatamente as seções, a ordem, os emojis e os separadores `---` dele.
2. **Ler a fonte**:
   - Plano: use Objetivo, Regras de negócio, Mudanças por camada, Testes e Riscos como base.
   - Descrição livre: investigue o código citado antes de escrever. Se faltar algo que mude o escopo, pergunte.
3. **Evitar duplicata**: `gh issue list --state all --search "<palavras-chave do título> in:title"`. Se já existir uma issue equivalente, mostre o link e não crie outra.
4. **Montar título e corpo** (regras abaixo).
5. **Mostrar o rascunho** (título + corpo) ao usuário e pedir confirmação. Em lote, mostrar a lista de títulos e pedir uma confirmação única para todas.
6. **Criar**: gravar o corpo num arquivo temporário no scratchpad e rodar
   `gh issue create --title "<título>" --body-file <arquivo>`.
   Adicionar `--label` só se o label já existir (`gh label list`); nunca criar labels sem pedido.
7. **Registrar no plano**: quando a fonte for um plano, inserir logo abaixo da linha `Origem:` a linha `Issue: #<número> (<url>)`.
8. **Resumo final**: lista com número, título e link de cada issue criada.

## Título

Formato: `<tipo>: <resumo> (<partes principais>)`

- `tipo` (Conventional Commits): `feat`, `fix`, `refactor`, `chore`, `perf`, `test`, `docs`.
  - Mapeamento a partir do plano: `Tipo: fix` → `fix`; `feat` → `feat`; `chore` que reorganiza código sem mudar comportamento → `refactor`, senão `chore`; `add` → `test` ou `docs` conforme o conteúdo.
- `resumo`: em inglês, minúsculo, verbo no imperativo, sem ponto final.
- `(partes principais)`: opcional; 2 a 4 componentes afetados separados por ` + `, quando ajudam a entender o escopo.
- Até ~90 caracteres.

Exemplos:
- `refactor: restructure create invite flow (use case + token + mail service)`
- `fix: propagate prisma transaction client to repositories (transaction context + repositories)`
- `fix: restrict link url protocol to http and https (schema + e2e)`
- `feat: manage trip participants (remove + leave + decline + resend invite)`

## Corpo

- Todo em **inglês**, seguindo o skeleton.
- **Goal**: 1 a 2 frases sobre o resultado para quem usa a API.
- **Problem**: o comportamento atual e por que está errado, com arquivos e funções em `backticks`. Inclua o cenário de falha concreto (entrada → resultado errado).
- **Proposed solution**: a abordagem em alto nível, sem detalhar cada arquivo.
- **Tasks**: checklist `- [ ]` pequeno e verificável, na ordem de execução do plano, incluindo "write tests first" e migrations/dados legados quando houver. Snippet antes/depois só quando ajudar.
- **Expected behavior**: comportamento observável (status HTTP, resposta, dado no banco).
- **Notes**: decisões pendentes, quebras de contrato, dependências de outras issues/planos (`Depends on #N` quando a issue dependente já existir) e o que ficou fora de escopo.
- Seções sem conteúdo relevante podem ser omitidas, exceto Goal, Problem, Proposed solution e Tasks.
- Não incluir segredos, valores de `.env` nem dados pessoais.
- Não mencionar ferramentas de IA nem adicionar assinatura no corpo.

## Regras

- Nunca criar issue sem a confirmação do usuário no passo 5.
- Em lote, criar na ordem sugerida pelo `README.md` da pasta, para que `Depends on #N` aponte para issues já criadas.
- Se o `gh` não estiver autenticado (`gh auth status`), pare e peça ao usuário para rodar `gh auth login`.
- O projeto fica no WSL; se o `gh` falhar pelo caminho UNC, rode dentro do WSL: `wsl -d archlinux --cd /home/rodrigo/projects/personal/planner-api -- gh ...`.
