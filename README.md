# XEKmate Stock

Aplicacao React/Vite para gestao de stock de equipamentos, consumiveis, pecas, localizacoes, fornecedores, utilizadores e movimentos.

Esta versao local ja nao depende do Base44 no frontend. A autenticacao e a base de dados usam Supabase.

## Documento de passagem

O documento tecnico completo para a equipa de TI esta em:

```text
LOG_TECNICO_XEKMATE_STOCK.md
```

Esse ficheiro explica o contexto do projeto, estrutura, Supabase, RLS, utilizadores, deploy, comandos, cuidados antes de producao e como criar a base de dados do zero.

## Requisitos

- Node.js instalado
- Projeto Supabase criado
- SQL de estrutura executado no Supabase

## Configurar a base de dados

1. Abra o Supabase.
2. Va em SQL Editor.
3. Cole e execute o conteudo de `supabase/schema.sql`.

Esse script cria as tabelas principais e as politicas RLS para que utilizadores autenticados e ativos consigam ler, criar, editar e apagar dados. Todos os perfis sao tratados como `admin`.

Contas marcadas como inativas na tabela `profiles` deixam de conseguir usar a aplicacao e tambem deixam de passar nas politicas RLS.

## Variaveis de ambiente

Copie `.env.example` para `.env.local` e preencha com os valores do projeto Supabase:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-or-anon-key
```

Use sempre a URL base do projeto, sem `/rest/v1` no final.

Nunca coloque `service_role` keys no frontend, no GitHub ou no Vercel. A aplicacao usa apenas a publishable/anon key do Supabase.

## Deploy na Vercel

Configure as mesmas variaveis no painel da Vercel em Project Settings > Environment Variables.

O ficheiro `vercel.json` redireciona rotas internas para `index.html`, permitindo atualizar paginas como `/equipamentos` sem erro 404.

## Checklist antes de producao

- Confirmar que `.env.local`, `node_modules` e `dist` nao foram commitados.
- Rever as politicas RLS em `supabase/schema.sql` antes de usar com dados reais.
- Trocar a senha inicial de acesso (`xstock`) em Definicoes > Seguranca.
- Confirmar URLs permitidas no Supabase Auth para o dominio da Vercel.
- Configurar confirmacao/reset de email no Supabase Auth antes de uso real.
- Para adicionar utilizadores, enviar manualmente o link de registo mostrado na pagina Utilizadores.
- Rodar `npm run build` antes de publicar.

## Rodar localmente

```bash
npm install
npm run dev
```

Depois abra o endereco mostrado pelo Vite, normalmente `http://localhost:5173`.

## Build

```bash
npm run build
```
