# Relatório de Migração — Monólito Modular SquadSystem

**Branch:** `refactor/squadsystem-modular-architecture`
**Base:** `main` @ `076c5ee`
**Commits desta migração:** `3996ee9`, `5aaac2c`
**Status:** build (`next build`) compila com sucesso, 29 rotas geradas, 0 erros de tipo.

---

## 1. O que foi movido

Apenas código **já modular** (sem regras de negócio embutidas em `page.tsx`) foi
relocado, usando `git mv` para preservar histórico. Nenhuma lógica interna foi
alterada — somente local do arquivo e caminhos de import.

### `shared/` — infraestrutura genérica (reutilizável por qualquer módulo futuro)

| Origem | Destino |
|---|---|
| `lib/supabase-admin.ts` | `shared/database/supabase-admin.ts` |
| `lib/supabase-client.ts` | `shared/database/supabase-client.ts` |
| `lib/supabase-server.ts` | `shared/database/supabase-server.ts` |
| `lib/auth.ts` | `shared/auth/auth.ts` |
| `core/permissions/check-permission.ts` | `shared/auth/check-permission.ts` |
| `lib/web-push.ts` | `shared/providers/push/web-push.ts` |
| `types/global.d.ts` | `shared/types/global.d.ts` |

Critério: zero conhecimento de domínio (compras, obras, catálogo etc.) — funcionam
para qualquer módulo futuro sem alteração.

### `modules/squadframe/` — domínio atual do sistema

| Origem | Destino |
|---|---|
| `core/permissions/permissions.ts` (chaves `PERMISSIONS.*`) | `modules/squadframe/lib/permissions.ts` |
| `lib/cached-queries.ts` | `modules/squadframe/lib/cached-queries.ts` |
| `lib/kanban-compras.ts` | `modules/squadframe/lib/kanban-compras.ts` |
| `lib/tarefas.ts` | `modules/squadframe/lib/tarefas.ts` |
| `lib/tipo-unidade.ts` | `modules/squadframe/lib/tipo-unidade.ts` |
| `lib/unidade.ts` | `modules/squadframe/lib/unidade.ts` |
| `core/state-machines/compras.ts` | `modules/squadframe/services/state-machines/compras.ts` |
| `core/events/event-bus.ts` | `modules/squadframe/services/events/event-bus.ts` |
| `core/events/event-types.ts` | `modules/squadframe/services/events/event-types.ts` |
| `core/events/consumers/*.ts` (7 arquivos + index) | `modules/squadframe/services/events/consumers/` |
| `types/compras.ts` | `modules/squadframe/types/compras.ts` |
| `types/kanban.ts` | `modules/squadframe/types/kanban.ts` |
| `components/*` (29 arquivos, inclui `kanban/` e `notificacoes/`) | `modules/squadframe/components/` |
| `hooks/use-action.ts` | `modules/squadframe/hooks/use-action.ts` |
| `app/compras/actions/*.ts` (6 arquivos) | `modules/squadframe/actions/compras/` |

`app/compras/actions.ts` continuou em `app/` (Next.js exige) como **barrel** —
seus re-exports foram atualizados para apontar para
`@/modules/squadframe/actions/compras/*`.

### Imports atualizados

108 arquivos em todo o projeto tiveram seus imports reescritos de
`@/lib/*`, `@/core/*`, `@/types/*`, `@/components/*`, `@/hooks/*` para os novos
caminhos `@/shared/*` e `@/modules/squadframe/*`. Também corrigidos imports
relativos que quebraram por arquivos terem se separado de antigos vizinhos
(ex.: `shared/auth/auth.ts` agora referencia `../database/supabase-admin`
em vez de `./supabase-admin`).

### Decisão de design: `event-bus` ficou inteiro em `modules/squadframe`

`core/events/event-bus.ts` é tecnicamente um *engine* genérico de pub-sub, mas
na implementação atual ele importa diretamente `CRITICAL_CONSUMERS` e
`OBSERVER_CONSUMERS` de `./consumers` — uma lista hardcoded de consumers
**específicos do domínio de compras** (kanban, notificações, push, histórico,
assinatura). Não há mecanismo de registro plugável.

Mover só o `event-bus.ts` para `shared/events/` e deixar os consumers em
`modules/squadframe/` quebraria essa importação direta, ou exigiria criar um
mecanismo de registro de consumers por módulo — o que é uma mudança de
comportamento/arquitetura, proibida neste escopo ("não implementar novas
funcionalidades"). Por isso eventBus + event-types + consumers foram movidos
juntos para `modules/squadframe/services/events/`, preservando 100% do
comportamento atual. `shared/events/` permanece como placeholder preparado
para quando esse desacoplamento for feito (ver seção 4).

---

## 2. O que permaneceu (e por quê)

### `app/` — 100% intacto na sua função de roteamento

Por exigência explícita do usuário e do Next.js App Router, **nenhuma rota,
`page.tsx`, `layout.tsx` ou `route.ts` foi movida**. Isso inclui:

- Todas as 29 rotas da aplicação (`/`, `/compras/*`, `/catalogo/*`, `/obras/*`,
  `/financeiro/*`, `/usuarios/*`, `/cadastro`, `/perfil`, `/login`, `/tarefas/*`,
  `/api/*`).
- Componentes "client" co-localizados com suas páginas por convenção do
  Next.js (ex.: `app/obras/[id]/aba-producao.tsx`, `app/catalogo/gerenciar-categorias.tsx`).
- Server Actions ainda co-localizadas dentro da rota, fora de `compras`:
  `app/cadastro/actions.ts`, `app/catalogo/actions.ts`, `app/obras/actions.ts`,
  `app/perfil/actions.ts`, `app/tarefas/actions.ts`, `app/usuarios/actions.ts`,
  `app/usuarios/cargos/actions.ts`, `app/compras/empresa/actions.ts`,
  `app/compras/financeiro/actions.ts`.

### Domínios sem separação Action → Service → Repository (extração profunda deferida)

Esta migração moveu apenas o que **já estava separado**. A maior parte do
sistema ainda mistura checagem de permissão + regra de negócio + chamada direta
ao Supabase dentro da própria Server Action ou até do `page.tsx`. Isso foi uma
decisão de escopo explicitamente aprovada para reduzir risco nesta passada.
Ficam pendentes para uma fase futura (ver seção 4):

| Domínio | Arquivos com acesso direto ao Supabase fora de repositories |
|---|---|
| `compras` (parcial) | as 6 actions movidas para `modules/squadframe/actions/compras/` ainda chamam `createAdminClient()` diretamente dentro de cada função — não há `services/` nem `repositories/` reais para esse domínio ainda |
| `catalogo` | 25 arquivos (`page.tsx`, `actions.ts` e componentes client) |
| `obras` | 18 arquivos |
| `financeiro` | 4 arquivos |
| `tarefas` | 3 arquivos |
| `usuarios` | 6 arquivos |
| `cadastro` | 2 arquivos |
| `perfil` | 3 arquivos |
| `login` | 1 arquivo |
| `api` | 4 route handlers |

---

## 3. Estrutura final de pastas

```
sgi/
├── app/                              # 100% Next.js App Router — inalterado
│   ├── compras/
│   │   ├── actions.ts                # barrel → re-exporta de modules/squadframe/actions/compras
│   │   └── ...                       # páginas, layouts, actions locais (catalogo/obras/etc.)
│   └── ...
│
├── modules/
│   ├── squadframe/                   # domínio atual — POPULADO
│   │   ├── actions/compras/          # 6 Server Actions (documentos, fornecedores, helpers,
│   │   │                             #   pedidos, recebimentos, solicitacoes)
│   │   ├── services/
│   │   │   ├── state-machines/       # compras.ts (regras de transição de status)
│   │   │   └── events/               # event-bus.ts, event-types.ts, consumers/ (7 handlers)
│   │   ├── repositories/             # vazio — repositórios reais ainda não extraídos
│   │   ├── lib/                      # permissions.ts, cached-queries, kanban-compras,
│   │   │                             #   tarefas, tipo-unidade, unidade
│   │   ├── hooks/                    # use-action.ts
│   │   ├── components/               # 29 componentes (kanban/, notificacoes/, etc.)
│   │   ├── schemas/                  # vazio — preparado para validação (zod etc.)
│   │   ├── types/                    # compras.ts, kanban.ts
│   │   ├── providers/                # vazio — preparado para integrações externas futuras
│   │   └── utils/                    # vazio
│   │
│   ├── squadboard/                   # módulo vazio — preparado (Trello)
│   │   ├── actions/ services/ repositories/ providers/trello/ adapters/
│   │   │   webhooks/ hooks/ components/ schemas/ types/ utils/
│   ├── squadflow/                    # módulo vazio — preparado
│   ├── squadstock/                   # módulo vazio — preparado
│   ├── squadmeasure/                 # módulo vazio — preparado
│   └── squadhub/                     # módulo vazio — preparado (Bluetooth/RFID/MQTT/WebSocket)
│       ├── actions/ services/ repositories/ providers/ websocket/ mqtt/ bluetooth/ types/ utils/
│
└── shared/
    ├── auth/                         # auth.ts, check-permission.ts — POPULADO
    ├── database/                     # supabase-admin/client/server — POPULADO
    ├── providers/push/               # web-push.ts — POPULADO
    ├── types/                        # global.d.ts — POPULADO
    ├── events/                       # vazio (placeholder) — ver seção 4
    ├── cache/ logger/ middleware/ interfaces/ constants/ decorators/
    │   helpers/ errors/ config/ providers/ utils/   # vazios — placeholders
```

Todas as pastas vazias contêm um `index.ts` placeholder:
```ts
// Preparado para uso futuro (SquadSystem). Nenhuma implementação ainda.
export {};
```

---

## 4. Possíveis melhorias futuras

1. **Extração profunda de Action → Service → Repository por domínio** (maior item
   pendente). Ordem sugerida por risco/benefício:
   - `compras`: dividir as 6 actions já movidas — extrair chamadas Supabase para
     `modules/squadframe/repositories/`, e regras de aprovação/transição/validação
     para `modules/squadframe/services/`. É o domínio com mais regras de negócio
     (RPCs atômicas, débito de carteira, eventos) e o que mais se beneficia.
   - `obras`, `catalogo`: maior volume de arquivos, mas menor complexidade de
     regras — bom para validar o padrão antes de aplicar em `compras`.
   - `financeiro`, `tarefas`, `usuarios`, `cadastro`, `perfil`: menores, podem
     ser feitos em qualquer ordem.

2. **Desacoplar `event-bus` de `consumers`** — hoje o bus importa a lista de
   consumers diretamente. Introduzir um registro plugável (`registerConsumer()`)
   permitiria mover o `event-bus.ts` genérico para `shared/events/` de fato,
   com cada módulo registrando seus próprios consumers no bootstrap.

3. **`modules/squadframe/hooks/use-action.ts`** é um hook React genérico (wrapper
   de `useTransition`), sem acoplamento a domínio. Candidato a subir para
   `shared/utils/` ou um futuro `shared/hooks/` quando um segundo módulo
   precisar dele.

4. **Padronizar Server Actions fora de `compras`** — hoje `obras`, `catalogo`,
   `usuarios` etc. têm um único `actions.ts` por rota misturando todas as
   responsabilidades. Ao fazer a extração da seção 1 acima, vale considerar
   já nascerem como `modules/squadframe/actions/<dominio>/*.ts`, no mesmo
   padrão que `compras` já tem hoje.

5. **`shared/cache`, `shared/logger`** — hoje não há camada de logging
   estruturado nem cache compartilhado (apenas `unstable_cache` pontual em
   `cached-queries.ts`). Centralizar viabilizaria observabilidade quando
   houver múltiplos módulos/serviços.

6. **Atualizar dependências com vulnerabilidades conhecidas** — `npm install`
   nesta migração reportou 4 vulnerabilidades (1 moderada, 2 altas, 1 crítica)
   no `next@14.2.15`, incluindo um aviso de segurança oficial do Next.js.
   Fora do escopo desta refatoração, mas vale abrir como item separado.

---

## 5. Pontos que podem virar microserviços no futuro

Pela visão original do usuário (Action vira chamada HTTP, Service e Repository
ficam quase inalterados), os candidatos mais naturais, em ordem de
prontidão:

1. **SquadHub** (Bluetooth/RFID/MQTT/WebSocket/hardware) — maior candidato
   natural a microserviço dedicado desde o início: lida com protocolos de
   tempo real e hardware, isolado por natureza do resto do domínio web/CRUD.
   Não compartilha tabelas de negócio com squadframe.

2. **SquadBoard** (integração Trello) — fluxo unidirecional bem definido
   (Controller → Service → Provider → TrelloProvider → API externa), com
   webhooks de entrada. Bom candidato porque sua única dependência de
   squadframe seria eventos de domínio (`TaskCreated`, etc.), não acesso a
   tabelas internas.

3. **Sub-domínio de eventos/notificações dentro de squadframe** (atualmente
   `services/events/consumers/{notificacoes,push,dashboard}.consumer.ts`) —
   uma vez que o event-bus seja desacoplado (melhoria 2 acima), o pipeline de
   notificação/push é candidato a virar um worker/serviço separado, consumindo
   eventos de uma fila em vez de rodar in-process.

4. **SquadFlow / SquadStock / SquadMeasure** — ainda não há código real para
   avaliar; permanecem como módulos vazios até que requisitos de negócio
   apareçam. Quando isso acontecer, nascer já como módulo dentro do monólito
   (como squadframe hoje) antes de cogitar extração é o caminho mais seguro.

---

## Como revisar

```bash
git log main..refactor/squadsystem-modular-architecture --oneline
git diff main...refactor/squadsystem-modular-architecture --stat
cd sgi && npm install && npm run build
```

Nenhum merge foi feito — a branch está pronta para revisão.
