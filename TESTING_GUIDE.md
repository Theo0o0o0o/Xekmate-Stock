# Guia rapido para testar o XEKmate Stock

## 1. Acessar o site

Abra o link publicado no Vercel.

Antes do login, o sistema pede uma senha de acesso interna. A senha inicial e:

```text
xstock
```

Essa senha existe para impedir que pessoas de fora cheguem nas telas de login e registo.

## 2. Criar conta

1. Clique em `Registar`.
2. Preencha nome, email e palavra-passe.
3. Confirme o email, se o Supabase pedir confirmacao.
4. Depois volte ao login e entre normalmente.

Todos os utilizadores têm as mesmas permissoes no sistema.

Na pagina `Utilizadores`, o botao de adicionar utilizador mostra um link de registo para copiar e enviar manualmente. O sistema nao envia convite por email automaticamente.

## 3. Testes recomendados

- Criar uma localizacao.
- Criar um fornecedor.
- Criar um equipamento.
- Criar um consumivel ou peca.
- Registar movimento de stock.
- Recarregar a pagina e confirmar que os dados continuam aparecendo.
- Abrir `Relatorios` e testar exportacao.
- Abrir `Utilizadores` e confirmar que e possivel ativar/desativar contas de teste.

## 4. Alterar senha de acesso

Depois de entrar no sistema:

1. Abra `Definicoes`.
2. Va em `Seguranca`.
3. Informe a senha atual.
4. Defina a nova senha de acesso.

A nova senha passa a ser usada antes do login/registo para todos os utilizadores.

## 5. Observacao sobre registo

Se aparecer erro de limite de email, aguarde alguns minutos. Esse limite vem do Supabase Auth quando muitos emails de confirmacao sao enviados em pouco tempo.
