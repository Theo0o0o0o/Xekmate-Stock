# Log Tecnico / Documento de Passagem - XEKmate Stock

**Projeto:** XEKmate Stock  
**Tipo:** Aplicacao web interna para gestao de stock  
**Estado:** Versao final de estagio / pronta para demonstracao e testes internos  
**Ultima atualizacao deste log:** 29/06/2026  
**Stack atual:** React + Vite + Supabase + Vercel  

---

## 1. Contexto do projeto

O **XEKmate Stock** foi desenvolvido como uma aplicacao web para centralizar e organizar a gestao interna de stock da empresa, especialmente para equipamentos de impressao, consumiveis, pecas, localizacoes, fornecedores, utilizadores e movimentos de stock.

O projeto comecou como prototipo no **Base44**, mas a versao atual do codigo ja nao depende do Base44 no frontend. A aplicacao foi migrada para **React/Vite**, com autenticacao e base de dados ligadas ao **Supabase**. O deploy de demonstracao foi preparado para **Vercel**, embora a empresa possa optar por outro alojamento no futuro.

O objetivo desta entrega e deixar uma base funcional para que a equipa de TI consiga testar, avaliar, alojar e evoluir o sistema caso decida usa-lo internamente.

---

## 2. Estado atual da aplicacao

A aplicacao encontra-se funcional para demonstracao e testes internos.

Funcionalidades implementadas:

- Login, registo, recuperacao e redefinicao de palavra-passe via Supabase Auth.
- Ecra inicial de protecao com senha de acesso interno antes do login/registo.
- Dashboard com indicadores principais do stock.
- Gestao de equipamentos/impressoras.
- Gestao de consumiveis, como toners, tintas, cartuchos, tambores e fusores.
- Gestao de pecas.
- Gestao de localizacoes.
- Gestao de fornecedores.
- Gestao/listagem de utilizadores.
- Copia manual do link de registo para novos utilizadores.
- Ativacao/desativacao de utilizadores.
- Historico de movimentos por utilizador.
- Movimentos de stock: entrada, saida, ajuste, edicao, manutencao, reserva e venda.
- Relatorios e exportacao para Excel `.xlsx`.
- Interface responsiva com identidade visual alinhada a XEKmate: vermelho, preto, branco e cinza.
- Suporte basico a idioma Portugues/Ingles e tema claro/escuro nas definicoes.

---

## 3. Tecnologias utilizadas

### Frontend

- React
- Vite
- React Router
- TanStack React Query
- Tailwind CSS
- Radix UI / componentes UI
- Lucide React para icones
- Recharts para graficos
- XLSX para exportacao Excel

### Backend/base de dados

- Supabase
- PostgreSQL gerido pelo Supabase
- Supabase Auth
- Row Level Security configurado no SQL

### Deploy

- Vercel
- `vercel.json` configurado com rewrite para Single Page Application, evitando erro 404 ao atualizar paginas internas.

---

## 4. Estrutura principal do projeto

```text
src/
  api/
    supabaseClient.js

  components/
    AccessGate.jsx
    AuthLayout.jsx
    ProtectedRoute.jsx
    UserNotRegisteredError.jsx
    equipment/
    layout/
    shared/
    ui/

  lib/
    AuthContext.jsx
    i18n.jsx
    query-client.js
    useUserRole.js
    utils.js

  pages/
    Dashboard.jsx
    Equipment.jsx
    EquipmentDetail.jsx
    Consumables.jsx
    Parts.jsx
    Movements.jsx
    Locations.jsx
    Suppliers.jsx
    Users.jsx
    Reports.jsx
    Settings.jsx
    Login.jsx
    Register.jsx
    ForgotPassword.jsx
    ResetPassword.jsx

  services/
    supabaseEntityService.js
    equipmentService.js
    consumableService.js
    partService.js
    stockMovementService.js
    locationService.js
    supplierService.js
    userService.js
    appAccessService.js

  utils/
    exportXlsx.js
    validation.js

supabase/
  schema.sql
  seed.sql

.env.example
vercel.json
vite.config.js
package.json
package-lock.json
README.md
TESTING_GUIDE.md
```

---

## 5. Integracao com Supabase

A ligacao ao Supabase esta centralizada em:

```text
src/api/supabaseClient.js
```

Variaveis de ambiente necessarias:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICA_ANON_OU_PUBLISHABLE
```

Observacoes importantes:

- `VITE_SUPABASE_URL` deve ser a URL base do projeto Supabase, sem `/rest/v1` no final.
- Estas variaveis devem existir localmente em `.env.local` e na Vercel em **Project Settings > Environment Variables**.
- A aplicacao usa apenas publishable/anon key no frontend.
- Nunca colocar `service_role key` no frontend, GitHub, Vercel ou ZIP de entrega.
- O ficheiro `.env.example` contem apenas valores ficticios/modelo.

---

## 6. Base de dados

### 6.1 Criacao da base do zero

A base de dados pode ser criada do zero atraves de:

```text
supabase/schema.sql
```

Esse ficheiro esta preparado para ser executado no **SQL Editor do Supabase** e cria a estrutura principal completa da aplicacao.

O script cria:

- extensao `pgcrypto`;
- tabelas principais;
- constraints basicas;
- indices;
- triggers de `updated_at`;
- funcao de criacao automatica de perfil ao registar utilizador;
- funcao auxiliar `current_user_is_active()`;
- politicas RLS;
- configuracao inicial da senha de acesso interno.

Tabelas criadas:

- `profiles`
- `equipment`
- `consumables`
- `parts`
- `locations`
- `suppliers`
- `stock_movements`
- `app_settings`

O script tambem define:

- `role` padrao como `admin`;
- todos os novos utilizadores como ativos;
- numero de serie de equipamento como unico;
- quantidades e stock minimo como valores nao negativos;
- campos obrigatorios protegidos por constraints;
- senha inicial de acesso interno em `app_settings`.

### 6.2 Dados de demonstracao

Os dados de demonstracao ficam em:

```text
supabase/seed.sql
```

Esse ficheiro insere dados exemplo de:

- localizacoes;
- fornecedores;
- equipamentos;
- consumiveis;
- pecas;
- movimentos iniciais.

O `seed.sql` e opcional. Deve ser executado apenas se a equipa quiser uma base ja populada para demonstracao/testes.

Importante: o `seed.sql` nao cria utilizadores do Supabase Auth. As contas devem ser criadas pela tela de registo da aplicacao ou diretamente no painel do Supabase Auth.

### 6.3 Atualizacao de uma base existente

O `schema.sql` foi escrito de forma idempotente na maior parte da estrutura: ele usa `create table if not exists`, `create or replace function`, `drop policy if exists` e recriacao de politicas.

Ou seja, em geral pode ser executado novamente para atualizar funcoes, triggers e politicas sem apagar os dados existentes.

Nao executar `seed.sql` novamente se nao quiser inserir dados de demonstracao adicionais.

---

## 7. Autenticacao e utilizadores

A autenticacao principal usa **Supabase Auth**.

Fluxos existentes:

- Login com email e palavra-passe.
- Registo de nova conta.
- Recuperacao/redefinicao de palavra-passe.
- Sincronizacao do utilizador autenticado com a tabela `profiles`.

Ficheiros importantes:

```text
src/lib/AuthContext.jsx
src/services/userService.js
src/pages/Login.jsx
src/pages/Register.jsx
src/pages/ForgotPassword.jsx
src/pages/ResetPassword.jsx
src/pages/Users.jsx
```

### Regras atuais de utilizadores

Nesta versao, por decisao do projeto, **todos os utilizadores sao tratados como Administradores**.

Isto acontece em:

- `supabase/schema.sql`, atraves da funcao `handle_new_user()`;
- `src/services/userService.js`, que garante `role: 'admin'`.

A aplicacao ainda contem utilitarios como `useUserRole()` e alguns checks de `isAdmin`, mas na pratica todos os perfis criados passam a ser `admin`.

### Utilizadores inativos

Utilizadores podem ser desativados na pagina **Utilizadores**.

Quando `profiles.active = false`:

- o frontend bloqueia o uso da aplicacao;
- as politicas RLS tambem deixam de permitir leitura/escrita nas tabelas principais;
- o utilizador continua existindo no Supabase Auth, mas fica impedido de usar o sistema.

A interface nao apaga definitivamente utilizadores do Supabase Auth. Para remocao completa, a equipa de TI deve apagar a conta no painel do Supabase Auth ou criar uma funcao backend/admin propria.

### Adicionar novos utilizadores

A pagina **Utilizadores** nao envia convite por email automaticamente.

Ela mostra um **link de registo** para copiar e enviar manualmente ao funcionario. Depois de criar conta, o perfil e criado automaticamente como `admin`.

Para producao, a empresa pode preferir evoluir para:

- convites reais por email;
- criacao manual pelo administrador;
- restricao por dominio de email;
- aprovacao manual de novas contas.

---

## 8. Senha de acesso interno

Antes do login/registo, a aplicacao mostra uma barreira de acesso interno implementada em:

```text
src/components/AccessGate.jsx
src/services/appAccessService.js
```

Senha inicial:

```text
xstock
```

O hash da senha fica guardado na tabela:

```text
app_settings
```

A senha pode ser alterada em:

```text
Definicoes > Seguranca
```

Observacao importante: esta senha e uma protecao adicional para esconder as paginas de login/registo, mas nao substitui a autenticacao real. A autenticacao principal continua sendo o Supabase Auth.

A hash da senha precisa ser lida antes do login, por isso a politica RLS permite leitura anonima apenas da chave `access_password_hash` em `app_settings`.

---

## 9. Row Level Security atual

O RLS esta ativo nas tabelas principais.

Resumo das politicas atuais:

- Apenas utilizadores autenticados e ativos conseguem ler/criar/editar/apagar dados das tabelas principais.
- Utilizadores inativos deixam de passar nas politicas RLS.
- `profiles` permite que o proprio utilizador leia o seu perfil, e utilizadores ativos leiam/atualizem perfis.
- `app_settings` permite leitura anonima apenas da hash da senha de acesso interno.
- `app_settings` so pode ser alterada por utilizadores autenticados e ativos.

Esta configuracao esta melhor que uma demo totalmente aberta, mas ainda nao separa permissoes por cargo. Como todos sao `admin`, qualquer utilizador ativo tem permissao ampla.

Antes de producao com dados reais, recomenda-se avaliar se a empresa quer:

- manter todos como administradores;
- criar diferenca real entre `admin` e `employee`;
- impedir deletes em tabelas criticas;
- impedir edicao/apagamento de historico de movimentos;
- restringir gestao de utilizadores apenas a alguns administradores.

---

## 10. Servicos e camada de dados

A camada de dados foi organizada para evitar chamadas ao Supabase espalhadas diretamente pelas paginas.

Servico base:

```text
src/services/supabaseEntityService.js
```

Ele faz o mapeamento entre nomes usados no frontend e nomes reais das colunas no Supabase.

Exemplos:

```text
serialNumber  -> serial_number
referenceCode -> reference_code
created_date  -> created_at
```

Servicos especificos:

- `equipmentService.js`
- `consumableService.js`
- `partService.js`
- `stockMovementService.js`
- `locationService.js`
- `supplierService.js`
- `userService.js`
- `appAccessService.js`

Esta separacao facilita manutencao futura e uma eventual migracao para outro backend/API.

---

## 11. Validacoes existentes

O projeto inclui validacoes no frontend e tambem constraints na base de dados.

Exemplos ja tratados:

- numero de serie obrigatorio para equipamentos;
- numero de serie unico na base de dados;
- quantidades de consumiveis/pecas nao podem ser negativas;
- stock minimo nao pode ser negativo;
- validacao basica de email e telefone em fornecedores;
- movimentos precisam de item, tipo de movimento, utilizador e nome do utilizador;
- saida/ajuste de stock nao deve resultar em quantidade negativa;
- utilizadores inativos ficam bloqueados no frontend e no RLS.

---

## 12. Exportacao Excel

A exportacao para Excel esta implementada em:

```text
src/utils/exportXlsx.js
```

A aplicacao permite exportar ficheiros `.xlsx` com:

- equipamentos;
- consumiveis;
- pecas;
- exportacao completa com resumo, movimentos, localizacoes e fornecedores.

A exportacao trata valores vazios com `-`, formata datas e gera cabecalhos destacados.

---

## 13. Deploy / Vercel

A aplicacao esta preparada para deploy na Vercel.

Ficheiro relevante:

```text
vercel.json
```

Conteudo essencial:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

Isto permite que rotas como `/equipamentos`, `/relatorios` ou `/definicoes` funcionem mesmo apos atualizar a pagina.

Configuracao esperada na Vercel:

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`

---

## 14. Como rodar localmente

### 1. Instalar dependencias

```bash
npm install
```

### 2. Criar `.env.local`

Copiar:

```text
.env.example
```

para:

```text
.env.local
```

E preencher:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICA
```

### 3. Rodar em modo desenvolvimento

```bash
npm run dev
```

Normalmente abre em:

```text
http://localhost:5173
```

### 4. Gerar build final

```bash
npm run build
```

A build fica na pasta:

```text
dist
```

### 5. Pre-visualizar build

```bash
npm run preview
```

---

## 15. Como configurar uma nova base Supabase

1. Criar projeto no Supabase.
2. Ir a **SQL Editor**.
3. Executar o conteudo completo de:

```text
supabase/schema.sql
```

4. Opcionalmente, executar:

```text
supabase/seed.sql
```

5. Em **Authentication > URL Configuration**, configurar:

```text
Site URL: dominio final da aplicacao
Redirect URLs: dominio final + localhost para testes
```

Exemplos:

```text
http://localhost:5173
https://dominio-da-app.vercel.app
https://stock.xekmate.pt
```

6. Configurar email/Supabase Auth conforme necessidade:

- Confirmacao de email ligada ou desligada.
- SMTP proprio, se for usar em producao.
- URLs de reset password corretas.

7. Copiar URL e publishable/anon key para `.env.local` e para as variaveis da Vercel.
8. Criar o primeiro utilizador pela tela de registo da aplicacao.

---

## 16. Opcoes para uso pela empresa

### Opcao A - Manter Vercel + Supabase

Arquitetura:

```text
Vercel -> frontend
Supabase -> autenticacao + base de dados
```

E a opcao mais simples para continuar a testar e usar rapidamente.

### Opcao B - Frontend no servidor da empresa + Supabase cloud

Arquitetura:

```text
Servidor da empresa -> frontend estatico
Supabase -> autenticacao + base de dados
```

Neste caso, o site fica alojado pela empresa, mas os dados continuam no Supabase.

### Opcao C - Tudo no servidor da empresa

Arquitetura possivel:

```text
Servidor da empresa -> frontend + backend/API + PostgreSQL
```

Esta opcao exigiria trabalho adicional, pois a aplicacao atual comunica diretamente com Supabase. Para usar PostgreSQL proprio sem Supabase, o recomendado seria criar uma API/backend entre o React e a base de dados.

---

## 17. Pontos importantes antes de producao real

A versao atual esta adequada para demonstracao e testes internos, mas existem pontos a rever antes de usar com dados reais.

### 17.1 Permissoes

Todos os utilizadores ativos sao administradores. Se a empresa quiser diferenciar cargos, sera necessario ajustar:

- `schema.sql`;
- `userService.js`;
- `useUserRole.js`;
- paginas que usam `isAdmin`;
- politicas RLS.

### 17.2 Deletes e historico

Atualmente utilizadores ativos conseguem apagar dados principais, porque a versao foi mantida simples e administrativa.

Para producao, avaliar se devem ser bloqueados deletes em:

- movimentos de stock;
- equipamentos;
- consumiveis;
- pecas;
- fornecedores/localizacoes.

### 17.3 Registo de utilizadores

O registo esta protegido pela senha interna inicial, mas continua sendo uma tela de registo disponivel para quem tiver acesso.

Para producao, avaliar:

- convite real por email;
- criacao manual de contas;
- restricao por dominio;
- aprovacao manual;
- desativacao automatica de contas desconhecidas.

### 17.4 Senha de acesso interno

Trocar a senha inicial `xstock` antes de qualquer uso real.

### 17.5 Ambiente e segredos

Nao enviar para repositorios publicos:

- `.env.local`
- `.env`
- chaves privadas
- `service_role key` do Supabase

A publishable/anon key pode existir no frontend, mas a seguranca real deve depender das politicas RLS.

### 17.6 Backup

Definir uma politica de backup antes de usar com dados reais.

Opcoes:

- backups do proprio Supabase;
- exportacoes periodicas;
- dump SQL/PostgreSQL;
- plano de restauracao testado.

### 17.7 Dependencias

O projeto contem algumas dependencias herdadas do prototipo/base inicial que podem nao estar em uso direto. Antes de producao, a equipa pode auditar e remover dependencias nao utilizadas para reduzir manutencao e tamanho do bundle.

---

## 18. Observacoes sobre entrega do codigo

Para entregar um ZIP limpo a equipa tecnica, recomenda-se remover:

```text
.git/
node_modules/
dist/
.env.local
.env
```

E manter:

```text
.env.example
README.md
TESTING_GUIDE.md
supabase/schema.sql
supabase/seed.sql
src/
package.json
package-lock.json
vite.config.js
vercel.json
```

Tambem e recomendado que o repositorio GitHub fique privado caso contenha historico, prints, configuracoes ou dados internos.

---

## 19. Comandos uteis

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
```

Validacao feita na versao final:

```bash
npm run lint
npm run build
```

Ambos passaram sem erros.

---

## 20. Resumo para a equipa de TI

O projeto entregue e uma aplicacao React/Vite para gestao interna de stock, ligada ao Supabase para autenticacao e base de dados, com deploy preparado para Vercel.

A versao atual ja nao depende do Base44 no frontend. A estrutura esta separada por paginas, componentes, servicos e utilitarios, facilitando manutencao futura.

Para criar uma base do zero, executar:

1. `supabase/schema.sql` para estrutura, funcoes, triggers e RLS;
2. `supabase/seed.sql` apenas se quiser dados de demonstracao.

Antes de producao com dados reais, recomenda-se rever principalmente:

1. politicas RLS e permissoes reais;
2. decisao sobre todos serem admin ou existir `employee`;
3. onboarding/registo de utilizadores;
4. estrategia de backup;
5. configuracao de email/SMTP no Supabase Auth;
6. troca da senha inicial de acesso interno;
7. limpeza de ficheiros sensiveis antes de publicar ou enviar o codigo.
