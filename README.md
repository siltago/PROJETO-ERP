# SGI — Sistema de Gestão Industrial

Fundação do sistema: módulo de **Obras** + estrutura de **Usuários** e **Auditoria**.
Stack: **Next.js 14** + **Supabase** (PostgreSQL gerenciado).

---

## Passo a passo para colocar no ar

### 1. Criar o banco no Supabase

1. Crie uma conta gratuita em https://supabase.com
2. Crie um novo projeto (escolha região **South America (São Paulo)** para menor latência)
3. No menu lateral, abra **SQL Editor**
4. Cole todo o conteúdo de `supabase/schema.sql` e clique em **Run**
5. Isso cria todas as tabelas, os status padrão das obras e os setores

### 2. Pegar as credenciais

No Supabase, vá em **Settings → API** e copie:
- **Project URL**
- **anon public key**

### 3. Rodar localmente

```bash
# instalar dependências
npm install

# configurar variáveis de ambiente
cp .env.local.example .env.local
# edite .env.local e cole a URL e a anon key do Supabase

# rodar
npm run dev
```

Abra http://localhost:3000 — você cai direto na tela de Obras.

> Para criar a primeira obra você precisa de pelo menos um cliente cadastrado.
> Rode no SQL Editor do Supabase:
> ```sql
> insert into clientes (nome, documento) values ('Cliente Teste', '00.000.000/0001-00');
> ```

### 4. Publicar (deploy gratuito)

1. Suba o código para um repositório no GitHub
2. Crie conta em https://vercel.com e importe o repositório
3. Em **Environment Variables**, adicione as mesmas duas variáveis do `.env.local`
4. Deploy. Pronto — o sistema fica no ar com HTTPS automático.

**Custo total nesse estágio: R$ 0** (free tier do Supabase + Vercel cobre o primeiro cliente).

---

## O que já funciona

- Listagem de obras com status colorido
- Criação de obra (código `OB-2026-0001` gerado automaticamente)
- Página de detalhe da obra com central de informações e abas
- Histórico imutável registrando a criação
- Esquema de banco pronto para os próximos módulos

## Estrutura de pastas

```
sgi/
├── supabase/schema.sql        ← cole isto no Supabase
├── lib/supabase-server.ts     ← conexão com o banco
├── components/status-badge.tsx
├── app/
│   ├── layout.tsx             ← navegação lateral
│   ├── obras/
│   │   ├── page.tsx           ← lista
│   │   ├── nova/page.tsx      ← formulário
│   │   ├── [id]/page.tsx      ← detalhe
│   │   └── actions.ts         ← gravação no banco
│   └── globals.css            ← tokens de design
└── tailwind.config.ts
```

## Próximos passos sugeridos

1. **Autenticação** — login via Supabase Auth (e-mail/senha)
2. **Cadastro de clientes** — tela própria (hoje é via SQL)
3. **Editar obra + troca de status** com registro no histórico
4. **Módulo Catálogo Técnico** — produtos, fornecedores, aliases
