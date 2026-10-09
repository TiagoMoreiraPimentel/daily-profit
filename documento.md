📋 PROMPT MESTRE — Daily Profit SaaS

🔹 PARTE 1 — CONTEXTO DO PROJETO

Você é meu assistente técnico no desenvolvimento de um SaaS chamado "Daily Profit".

SOBRE O PRODUTO:
- Nome provisório: Daily Profit
- Domínio: dailyprofit.com.br — FUNCIONANDO (Vercel + SSL)
- Proposta: app que mostra ao autônomo/MEI quanto ele realmente lucrou no dia,
  separando automaticamente o que é pessoal do que é do negócio.
- Público inicial: B2C (autônomos, MEIs, informal)
- Público futuro: B2B (pequenos comércios, barbearias, prestadores)
- Plataforma: web responsivo (sem app nativo)

DECISÕES TRAVADAS:
- Modelo de cobrança: assinatura recorrente via Mercado Pago (/preapproval)
- Multi-tenant: shared schema com tenant_id + RLS no Supabase
- Banco + Auth + Realtime: Supabase
- Frontend: Next.js 16 + Tailwind v4 + TypeScript
- Hospedagem front: Vercel (free) — CONFIGURADO
- Domínio: dailyprofit.com.br (registro.br) — funcionando
- Email transacional: Resend — VERIFICADO + SMTP CONFIGURADO
- Preço Pro em produção: R$ 19,90/mês (a restaurar após teste)
- Preço em TESTE (atual): R$ 1,00/mês
- Planos: free, pro, super (super = admin/dev)
- Plano Free: 30 transações/mês + lucro do dia + separação pessoal/negócio
- Plano Pro: ilimitado + previsão de caixa + relatório + gráfico
- Plano Super: tudo do Pro + acesso ao painel /admin
- Autenticação: Supabase Auth nativo
- RLS: obrigatório em todas as tabelas com tenant_id
- RLS de super: REMOVIDA (causava mistura de dados no dashboard)
  → Painel admin usa service_role (ignora RLS) para ver tudo
- tenant_id no JWT: NÃO — recurso bloqueado no plano Free
  → usamos get_user_tenant() no RLS em vez de custom claim
- Estrutura de pastas: sem src/, com App Router
- Import alias: @/* (padrão do Next.js 16)
- Middleware: renomeado para proxy.ts (Next.js 16)
- Proxy: rotas /api/* excluídas do matcher + páginas públicas
  (/, /login, /cadastro, /esqueci-senha, /atualizar-senha, /termos, /privacidade)
- Suspense obrigatório em páginas dinâmicas (Cache Components do Next.js 16)
- Mercado Pago: Checkout Bricks (Payment Brick) no frontend
  gera card_token_id → backend cria /preapproval com status authorized
- Mercado Pago: produção (não mais sandbox)
- Webhook: aponta para https://dailyprofit.com.br/api/webhooks/mercadopago
  Eventos: "Planos e assinaturas" + "Pagamentos (legacy)"
- Resend: domínio dailyprofit.com.br verificado (São Paulo - sa-east-1)
- SMTP do Supabase: configurado (smtp.resend.com) → limite de e-mails aumentado
- Rate limit de e-mails: RESOLVIDO
- FABs (Floating Action Buttons) para entrada/saída no dashboard
- Navegação por data no dashboard (setas + calendário nativo)
- Modal de nova transação (substituiu formulário fixo)
- UPDATE de transações via API route (para evitar CORS no PATCH)
- Link de cobrança: REMOVIDO (exige OAuth + Split de Pagamentos)
- Painel admin /admin: exclusivo para plano super, usa service_role
- Excluir tenant: apaga tenant + public.users + auth.users (exclusão completa)
- Contagem de transações: live (apagadas não são contabilizadas)
- Landing page na raiz do domínio (/)
- WhatsApp flutuante: 11 99223-3306 (suporte)
  Posição: direita na landing, esquerda nas telas internas
- Termos e Privacidade: páginas públicas (não exigem login)
- Footer com links (Termos, Privacidade, Suporte) no dashboard e telas Pro
- Categorias por tenant (cada usuário tem as próprias) [NOVO]
  → Seeded com 15 categorias no cadastro; usuário pode renomear/excluir/criar
- Tela /configuracoes: gerenciamento de categorias [NOVO]
- CSV exportado com BOM UTF-8 + separador `;` (padrão BR) [NOVO]
- Gráfico de entradas/saídas (donut) no relatório [NOVO]
- Gráfico unificado por categoria (lista + barras) [NOVO]

FUNCIONALIDADES CORE:
- F1: Registrar transação em 5 segundos                          [x] FEITO
- F2: Separação automática pessoal vs. negócio                   [x] FEITO
- F3: Tela "Lucro do Dia" (entrou, saiu, lucro, lucro do mês)    [x] FEITO
- F4: Link de cobrança integrado com Mercado Pago                [REMOVIDO]
- F5: Previsão simples de caixa (Pro/Super)                      [x] FEITO
- F6: Relatório mensal de lucro (Pro/Super)                      [x] FEITO
- F7: Gráfico de evolução + categorias (Pro/Super)               [x] FEITO
- F8: Painel admin (/admin) — exclusivo do plano super           [x] FEITO
- F9: Landing page na raiz                                       [x] FEITO
- F10: Categorias personalizáveis por tenant                     [x] FEITO

REGRAS DE NEGÓCIO:
- Limite do Free aplicado no BACKEND, não no frontend
- Paywall em 3 momentos: suave (80%), bloqueio (100%), pós-valor (7 dias)
- Webhook do Mercado Pago obrigatório para bloquear/liberar acesso
- Sem dados sensíveis (não é saúde/financeiro regulado)
- Painel admin só acessível para plano 'super'
- Contagem de transações é live (reflete o estado atual do banco)
- Telas Pro (previsão, relatório, recorrentes) acessíveis para pro E super

🔹 PARTE 2 — CHECKLIST DE IMPLANTAÇÃO

FASE 0 — Fundação (antes de codar)
[x] Definir nome provisório: "Daily Profit"
[x] Registrar domínio dailyprofit.com.br no registro.br (09/10/2026)
[x] Domínio propagado e funcionando na Vercel (Valid Configuration)
[x] SSL emitido automaticamente
[ ] Verificar INPI (marca registrada)
[x] Criar conta Supabase
[x] Criar conta Mercado Pago Developers
[x] Criar conta Vercel
[x] Criar conta Resend
[x] Criar repositório Git local
[x] Criar repositório remoto (GitHub)

FASE 1 — Banco de Dados  [CONCLUÍDA]
[x] Criar projeto no Supabase — região South America (São Paulo)
[x] Rodar SQL das tabelas: tenants, users, transactions, recurring,
    payment_links, subscriptions, categorias_padrao
[x] Criar tabela categorias (por tenant) + RLS
[x] Habilitar RLS em todas as tabelas com tenant_id
[x] Criar políticas RLS (usando get_user_tenant())
[x] Criar função count_monthly_transactions()
[x] Criar função get_user_tenant()
[x] Criar função pode_inserir_transacao()
[x] Criar função is_super()
[x] Criar view vw_lucro_diario
[x] Criar trigger updated_at
[x] Seed de categorias padrão (15 categorias)
[x] Criar função custom_access_token_hook (criada, NÃO ativada)
[x] Criar trigger handle_new_user (cria tenant + user + categorias no cadastro)
[x] Criar política auth_admin_read_users
[x] Política de leitura pública para categorias_padrao
[x] Coluna ultimo_pagamento em subscriptions
[x] Constraint plano aceita 'super' em tenants e subscriptions
[x] RLS de super REMOVIDA (causava mistura no dashboard)
[PULADO] Configurar custom claim tenant_id no JWT
         → bloqueado no plano Free. Usamos get_user_tenant() no RLS.
[ ] Testar isolamento entre 2 tenants diferentes

FASE 2 — Autenticação + Onboarding  [CONCLUÍDA]
[x] Configurar Supabase Auth (email/senha)
[x] Tela de cadastro (/cadastro)
[x] Tela de login (/login)
[x] Recuperação de senha (/esqueci-senha + /atualizar-senha)
[x] Verificação de email (DESATIVADA — sem fricção para testes)
[x] Middleware de proteção de rotas (proxy.ts)
[x] Páginas públicas liberadas no proxy (termos, privacidade)
[x] Onboarding: criação do tenant + categorias via trigger
[x] Redirecionar para dashboard (/dashboard)
[x] Botão de logout no dashboard
[x] Mensagens de erro/sucesso em português
[x] Tratamento de "Email not confirmed" no login
[x] Campos do formulário limpos após cadastro
[x] Trigger handle_new_user recriado (não existia)
[x] Usuários órfãos corrigidos via SQL
[x] SMTP próprio configurado (Resend) → rate limit resolvido  [RESOLVIDO]

FASE 3 — Funcionalidades Core  [CONCLUÍDA]
[x] F1: Tela de registrar transação (entrada/saída, valor, descrição)
[x] F2: Campo natureza (negocio/pessoal) com separação visual
[x] F3: Tela com cards de resumo (negócio + pessoal)
[x] Listagem de transações do dia (separada por natureza + hora)
[x] Supabase Realtime na tela de lucro (atualização automática)
[x] Badge de plano (Free/Pro/Super) ao lado do nome
[x] Hora nas transações (fuso America/Sao_Paulo)
[x] Excluir transações do dashboard
[x] Editar transações (via API route para evitar CORS)
[x] Modal de nova transação (substituiu formulário fixo)
[x] Botões FAB flutuantes (+ entrada / − saída)
[x] Navegação por data no dashboard (setas + calendário)
[x] Cards sincronizados com a data selecionada
[x] Registrar transação na data selecionada (não só hoje)
[x] Select de categoria no modal (opcional)  [NOVO]
[x] Categoria aparece na lista de transações  [NOVO]

FASE 4 — Limites + Paywall  [CONCLUÍDA — parcial]
[x] Aplicar limite de 30 transações/mês no backend (RLS + função)
[x] Banner suave ao atingir 80% do limite
[x] Modal de bloqueio ao atingir 100%
[x] Botão "Assinar Pro" sempre visível no dashboard (free only)
[x] Bloco AssinaturaInfo no dashboard (status da assinatura)
[ ] Email pós-valor (7 dias de uso)  [ADIADO — sem domínio/email]

FASE 5 — Mercado Pago  [EM ANDAMENTO — verificação pendente]
[x] Criar conta Mercado Pago Developers
[x] Criar aplicação no painel
[x] Configurar variáveis de ambiente (.env + Vercel)
[x] Implementar /preapproval_plan (criar plano Pro)
[x] Implementar /preapproval (assinar plano com card_token_id)
[x] Payment Brick (Checkout Bricks) no frontend para tokenizar cartão
[x] Webhook /api/webhooks/mercadopago configurado (200 OK)
[x] Tratar status: authorized, paused, cancelled, pending
[x] Bloquear/liberar funções Pro conforme status
[x] Proxy exclui /api/* do matcher (webhook não passa por auth)
[x] Migrar para credenciais de PRODUÇÃO
[x] Preço reduzido para R$ 1,00 para teste
[x] Webhook salva ultimo_pagamento e proxima_cobranca
[x] Teste real: assinatura criada, plano Pro ativado, painel admin OK
[~] Verificar se cobrança de R$ 1,00 aparece no Mercado Pago após 1h
    → Pendente de verificação (comportamento padrão: validação é estornada;
      cobrança real ocorre ~1h após a autorização)
[ ] Reverter preço para R$ 19,90 após o teste

FASE 6 — Link de Cobrança (F4)  [REMOVIDA]
[REMOVIDO] Motivo: exige OAuth + Split de Pagamentos (inviável para MVP).

FASE 7 — Funcionalidades Pro  [CONCLUÍDA]
[x] F5: Previsão de caixa (média + tendência + recorrentes)
[x] Tela de cadastro de contas recorrentes (/pro/recorrentes)
[x] Refresh automático da lista de recorrentes
[x] F6: Relatório mensal de lucro (com exportação CSV)
[x] CSV com BOM UTF-8 + separador `;` + formatação BR  [MELHORADO]
[x] CSV agrupado em: Resumo, Movimentações, Por Categoria  [MELHORADO]
[x] F7: Gráfico de evolução dos últimos 6 meses
[x] Gráfico de entradas/saídas (donut)  [NOVO]
[x] Gráfico unificado por categoria (lista + barras)  [NOVO]
[x] Telas Pro acessíveis para super também
[ ] Envio de relatório por e-mail  [ADIADO — sem domínio]

FASE 8 — Landing Page + SEO  [CONCLUÍDA — parcial]
[x] Landing page na raiz do site (/)
[x] Página de preços (dentro da landing)
[x] WhatsApp flutuante na landing
[ ] Páginas SEO: "controle financeiro para MEI", "app de lucro para autônomo"
[ ] Google Search Console
[ ] Analytics (Plausible ou GA4)

FASE 9 — Lançamento  [EM ANDAMENTO]
[x] Domínio customizado na Vercel (dailyprofit.com.br)
[x] SSL (automático)
[x] Termos de uso (placeholder, público)
[x] Política de privacidade (placeholder, público)
[x] Footer com links no dashboard e telas Pro
[x] Canal de suporte (WhatsApp configurado)
[ ] Backup automático do Supabase
[ ] Monitoramento de erros (Sentry free)
[ ] Testes com 5-10 autônomos reais

FASE 10 — Ajustes de UX Mobile  [CONCLUÍDA]
[x] Contraste dos botões (entrar, previsão, relatório, sair)
[x] Contraste dos FABs e links como botão
[x] Contraste dos inputs (texto digitado legível)
[x] color-scheme: light no globals.css
[x] WhatsApp flutuante em todas as telas
[x] Remover new Date() de páginas estáticas (termos/privacidade)

FASE 11 — Painel Admin  [CONCLUÍDA]
[x] Adicionar plano 'super' na constraint de tenants e subscriptions
[x] Criar função is_super() no banco
[x] RLS de super REMOVIDA (causava mistura de dados)
[x] Painel admin usa service_role (ignora RLS)
[x] Criar lib/admin.ts (getAdminInfo + isSuper)
[x] Criar app/api/admin/mudar-plano/route.ts (com service_role)
[x] Criar app/api/admin/excluir-tenant/route.ts
[x] Excluir tenant apaga também auth.users (exclusão completa)  [MELHORADO]
[x] Criar app/admin/page.tsx (usa service_role)
[x] Criar app/admin/content.tsx (tabela + busca + ações)
[x] Link "🔧 Admin" no dashboard (só para super)
[x] Coluna ultimo_pagamento em subscriptions
[x] Colunas Status/Últ.pgto/Próx.venc. no painel admin
[x] Bloco AssinaturaInfo no dashboard do usuário
[ ] Badge "Concedido" para Pro sem assinatura  [MELHORIA FUTURA]
[ ] Coluna "Última atividade" no painel admin  [MELHORIA FUTURA]

FASE 12 — Categorias Personalizáveis  [CONCLUÍDA]  [NOVA]
[x] Criar tabela categorias (por tenant) + RLS
[x] Atualizar trigger handle_new_user (seeda 15 categorias)
[x] Popular tenants existentes com as 15 categorias
[x] Criar app/api/categorias/route.ts (GET + POST)
[x] Criar app/api/categorias/[id]/route.ts (PATCH + DELETE)
[x] Criar app/configuracoes/page.tsx
[x] Criar app/configuracoes/content.tsx (CRUD + busca + agrupamento)
[x] Link "⚙️ Configurações" no dashboard
[x] Select de categoria no modal de nova transação
[x] Categoria aparece na lista de transações

🔹 PARTE 3 — REGRAS DE CONTINUIDADE

COMO VOCÊ DEVE SE COMPORTAR NESTA CONVERSA:

1. SEMPRE leia este prompt antes de responder. Ele é a fonte da verdade.
2. NUNCA sugira mudar decisões travadas sem eu pedir explicitamente.
3. Se eu pedir algo que conflita com uma decisão travada, me avise antes.
4. Sempre que eu concluir uma tarefa do checklist, marque como [x].
5. Sempre que iniciarmos uma nova fase, confirme em qual fase estamos.
6. Se eu pedir código, entregue pronto para colar, com contexto de onde vai.
7. Se eu pedir SQL, entregue com RLS incluído.
8. Se eu pedir componente React, use Next.js 16 + Tailwind v4 + TypeScript.
9. Se eu pedir integração Mercado Pago, use /preapproval (não /preapproval_plan
   isolado) e sempre trate webhook.
10. Se o chat resetar, eu vou colar este prompt novamente. Continue de onde paramos.

FORMATO DE RESPOSTA PADRÃO:
- Confirmação do que foi entendido (1 linha)
- Conteúdo (código, SQL, explicação)
- Próximo passo sugerido (1-2 linhas)

ESTADO ATUAL:
- Fase: 5 (Mercado Pago) — EM ANDAMENTO (verificação de cobrança pendente)
- Concluído até agora:
  * FASE 0: Supabase + Mercado Pago + Vercel + GitHub + domínio funcionando
  * FASE 1: banco completo (RLS de super removida, tabela categorias)
  * FASE 2: auth completo (SMTP configurado, rate limit resolvido)
  * FASE 3: dashboard completo (com select de categoria)
  * FASE 4: limite Free + botão Assinar + bloco AssinaturaInfo
  * FASE 5: Mercado Pago em produção (assinatura criada, plano Pro ativado);
    preço R$ 1,00 para teste; cobrança pendente de verificação após 1h
  * FASE 7: previsão, recorrentes, relatório, CSV melhorado,
    gráficos (evolução, donut entradas/saídas, categorias)
  * FASE 8: landing page
  * FASE 9: termos e privacidade (públicos), SSL, WhatsApp
  * FASE 10: UX mobile
  * FASE 11: painel admin completo (usa service_role, exclui auth.users)
  * FASE 12: categorias personalizáveis por tenant + tela /configuracoes
  * Domínio dailyprofit.com.br funcionando + SSL
  * Resend verificado + SMTP configurado
  * Deploy ativo
  * Commit + push feitos
- Última decisão: aguardar 1h para verificar cobrança de R$ 1,00
- Pendências conhecidas:
  * Verificar se cobrança de R$ 1,00 aparece no Mercado Pago após 1h
  * Reverter preço para R$ 19,90 depois do teste
  * SEO (páginas, Google Search Console, Analytics)
- Próximo passo: verificar cobrança após 1h; se OK, reverter preço para R$ 19,90

🔹 PARTE 4 — CREDENCIAIS E ACESSOS

⚠️ REGRA: NUNCA colar chaves, senhas ou tokens neste arquivo.
Guardar tudo em gerenciador de senhas (Bitwarden, 1Password, etc.).

- Supabase Project URL: https://fagwraaypkluvpwqwbot.supabase.co
- Supabase anon public key: [guardada no .env — é pública]
- Supabase service_role key: [guardada no .env e gerenciador de senhas]
- Supabase DB password: [guardada no gerenciador de senhas]
- Vercel URL de produção: https://dailyprofit.com.br
- Domínio próprio: dailyprofit.com.br (funcionando)
- Mercado Pago Access Token (produção): [guardada no .env e Vercel]
- Mercado Pago Public Key (produção): [guardada no .env e Vercel]
- Resend API key: [guardada no .env e Vercel]
- Resend SMTP host: smtp.resend.com (username: resend)
- WhatsApp de suporte: +55 11 99223-3306
- Registro.br: [conta do Tiago]

📌 COMO USAR ESTE PROMPT:
- Salvar como PROMPT_MESTRE.md no computador
- A cada nova conversa, colar no início antes de perguntar
- Atualizar checklist e ESTADO ATUAL a cada tarefa concluída
- Se o chat resetar, colar novamente e dizer:
  "Continue de onde paramos. Estamos na Fase X. Próximo passo: Y."