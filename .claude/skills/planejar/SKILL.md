---
name: planejar
description: Planeja uma feature, fix ou tarefa do planner-api a partir de uma issue do GitHub (número ou URL) ou de uma ideia em texto, seguindo a arquitetura do projeto. Use quando o usuário pedir para planejar, desenhar ou quebrar uma tarefa antes de implementar.
argument-hint: "<número/URL da issue ou descrição da ideia>"
---

# Planejar

Entrada: `$ARGUMENTS` — uma issue (número, `#12` ou URL) ou uma descrição livre.

## Passos

1. **Ler a arquitetura**: leia `.claude/architecture.md` antes de tudo. O plano deve respeitá-la integralmente.
2. **Entender a demanda**:
   - Issue: `gh issue view <número> --comments`.
   - Ideia: use o texto recebido. Se faltar algo que muda o desenho (regra de negócio ambígua, quem pode acessar, formato de resposta), pergunte ao usuário antes de seguir.
3. **Investigar o código existente**: localize entidades, repositórios, use cases, controllers, schemas e testes relacionados. Reaproveite o que existir (erros, factories de teste, presenters, `trip-access`) em vez de duplicar.
4. **Montar o plano** com as seções abaixo e salvar em `.claude/plans/<slug-em-ingles>.md`.
5. Apresentar um resumo curto ao usuário com o caminho do arquivo e pedir aprovação. Não implementar nada nesta skill.

## Formato do plano

```markdown
# <título>

Origem: <issue #N | ideia>
Tipo: feat | fix | chore | add
Nome sugerido: <tipo>/<nome-descritivo-em-ingles>

## Objetivo
<o que muda para quem usa a API>

## Regras de negócio
- <regra verificável>

## Mudanças por camada
### Prisma (se houver)
### Entidades / value objects
### Erros
### Interfaces de repositório (novos métodos)
### Repositórios fake (tests/repositories)
### Repositórios Prisma + mappers
### Use case
### Factory
### Schema / documentação
### Controller (mapeamento de erros -> status HTTP)
### Rota
### Presenter

## Testes (escritos ANTES da implementação)
### Unitários (use case)
- it('should be able to ...')
- it('should not be able to ...')
### E2E (controller)
- test('[VERBO] /rota', ...) e casos 401/403/404/409 aplicáveis
### Repositório Prisma (se houver método novo com query não trivial)

## Ordem de execução
1. ...

## Riscos / fora de escopo
```

## Regras

- Controller só HTTP; regra de negócio só no use case; `new` de implementações concretas só na factory.
- Todo método novo de repositório aparece na interface, no fake e no Prisma.
- Omita seções de camadas não afetadas.
- Não incluir comentários em nenhum trecho de código do plano.
