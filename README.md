# XEKmate Stock

Aplicacao React/Vite para gestao de stock de equipamentos, consumiveis, pecas, localizacoes, fornecedores, utilizadores e movimentos.

Esta versao local ja nao depende do Base44 no frontend. A autenticacao e a base de dados usam Supabase.

## Requisitos

- Node.js instalado
- Projeto Supabase criado
- SQL de estrutura executado no Supabase

## Configurar a base de dados

1. Abra o Supabase.
2. Va em SQL Editor.
3. Cole e execute o conteudo de `supabase/schema.sql`.

Esse script cria as tabelas principais e as politicas RLS para que qualquer utilizador autenticado consiga ler, criar, editar e apagar dados. Todos os perfis sao tratados como `admin`.

## Variaveis de ambiente

Crie ou confira o ficheiro `.env.local`:

```env
VITE_SUPABASE_URL=https://ydzapeindoeigxkxdejw.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_CpkE3ilGAOiC6yvQHeSgQg_SwPuCBjj
```

Use sempre a URL base do projeto, sem `/rest/v1` no final.

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
