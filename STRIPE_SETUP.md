# Configuração do Stripe - Integração de Pagamentos

## Visão Geral

Este projeto agora está integrado com Stripe para processar pagamentos recorrentes de subscrições de nutricionistas.

## Passos de Configuração

### 1. Criar Conta Stripe

1. Aceda a [stripe.com](https://stripe.com) e crie uma conta
2. Configure a conta para Portugal (EUR)
3. Complete a verificação da conta (KYC)

### 2. Criar Produtos e Preços

No dashboard do Stripe:

1. Vá a **Products** > **Add product**
2. Para cada plano (Starter, Pro, Business):

**Starter (€29/mês):**
- Nome: "Starter Plan"
- Descrição: "Plano inicial para nutricionistas individuais"
- Preço: €29.00/mês
- Recurring: Mensal
- Trial period: 14 dias

**Pro (€49/mês):**
- Nome: "Pro Plan"
- Descrição: "Plano profissional com funcionalidades avançadas"
- Preço: €49.00/mês
- Recurring: Mensal
- Trial period: 14 dias

**Business (€99/mês):**
- Nome: "Business Plan"
- Descrição: "Plano para clínicas e equipas"
- Preço: €99.00/mês
- Recurring: Mensal
- Trial period: 14 dias

3. Copie os **Price IDs** (começam com `price_...`)

### 3. Configurar Webhook

1. No dashboard Stripe, vá a **Developers** > **Webhooks**
2. Clique em **Add endpoint**
3. URL do webhook: `https://seu-dominio.com/api/stripe/webhook`
   - Em desenvolvimento: `http://localhost:3000/api/stripe/webhook`
4. Selecione os seguintes eventos:
   - `checkout.session.completed`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
5. Copie o **Webhook Secret** (começa com `whsec_...`)

### 4. Atualizar Variáveis de Ambiente

Adicione ao seu ficheiro `.env`:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_... (ou sk_test_... para testes)
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_PRO=price_...
STRIPE_PRICE_BUSINESS=price_...

# URL da aplicação (para redirects do Stripe)
NEXT_PUBLIC_APP_URL=https://seu-dominio.com
# Em desenvolvimento:
# NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Testar em Modo Teste

1. Use a **Test API Key** (`sk_test_...`)
2. Use cartões de teste do Stripe:
   - Sucesso: `4242 4242 4242 4242`
   - Falha: `4000 0000 0000 0002`
3. Verifique o webhook no dashboard Stripe

### 6. Passar para Produção

1. Ative a conta Stripe para produção
2. Substitua as chaves de teste pelas chaves de produção
3. Atualize o webhook para a URL de produção
4. Teste um pagamento real com um valor pequeno

## Funcionalidades Implementadas

### Checkout de Subscrição
- Endpoint: `POST /api/stripe/checkout`
- Fluxo: Nutricionista escolhe plano → Checkout Stripe → Pagamento → Ativação

### Portal do Cliente
- Endpoint: `POST /api/stripe/portal`
- Permite: Atualizar método de pagamento, cancelar subscrição, ver histórico

### Webhooks
- Endpoint: `POST /api/stripe/webhook`
- Eventos:
  - `checkout.session.completed`: Ativa subscrição
  - `invoice.paid`: Renova subscrição
  - `invoice.payment_failed`: Marca como PAST_DUE
  - `customer.subscription.deleted`: Cancela subscrição

## Exportação de PDF

### Funcionalidade
- Endpoint: `GET /api/plans/[id]/export`
- Gera PDF elegante com:
  - Logo da clínica
  - Informação do nutricionista
  - Detalhes do plano alimentar
  - Informação do cliente
  - Refeições detalhadas

### Uso
1. Vá à página de Planos
2. Clique no botão "PDF" num plano
3. O PDF é gerado automaticamente e descarregado

## Base de Alimentos Portugueses

### Importação
```bash
npm run db:seed-portuguese
```

### Conteúdo
- 149+ alimentos portugueses
- Baseado na Tabela INSA
- Categorias: Cereais, Frutas, Legumes, Carnes, Peixes, Laticínios, etc.
- Informação nutricional completa por 100g

## Próximos Passos

1. ✅ Configurar conta Stripe
2. ✅ Criar produtos e preços
3. ✅ Configurar webhook
4. ✅ Atualizar variáveis de ambiente
5. ✅ Testar fluxo completo
6. ✅ Passar para produção

## Suporte

Para dúvidas, consulte:
- [Documentação Stripe](https://stripe.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)
