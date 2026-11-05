# RUNBOOK OPERACIONAL — KONNEXY OS AUTO
**Ambiente:** Produção (`https://osauto.konnexy.com.br/`)  
**Stack:** React 19 + TypeScript + Tailwind CSS + PWA (Vite) + Supabase PostgreSQL  

---

## 1. Visão Geral da Arquitetura
O **Konnexy OS Auto** opera como SPA estática servida via CDN (Vercel / Cloudflare) integrada a PostgreSQL no Supabase com isolamento multi-tenant por RLS (`company_id`). Possui fallback automático para simulação local caso as credenciais não estejam presentes no client-side.

---

## 2. Deploy em Produção (Vercel / Cloudflare Pages)

### Pré-requisitos:
- Node.js >= 20
- Repositório Git: `https://github.com/msjtec12/konnexy-os-auto.git`

### Passos de Build e Deploy:
```bash
# Instalar dependências
npm ci

# Executar suíte de testes de validação automatizada
npm test

# Executar compilação estrita TypeScript + Vite
npm run build
```

**Configurações do painel Vercel:**
- **Framework Preset:** Vite
- **Root Directory:** `./`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Environment Variables:** Ver `.env.example`

---

## 3. Procedimento de Rollback Imediato

Se uma nova versão em produção apresentar anomalias:
1. No painel da **Vercel**, clique na aba **Deployments**.
2. Localize o último deployment estável anterior.
3. Clique nos três pontos `...` $\to$ **Instant Rollback**.
4. O tráfego será restabelecido na versão anterior em menos de 10 segundos.

No repositório Git:
```bash
git checkout main
git revert HEAD -m 1
git push origin main
```

---

## 4. Gestão do Banco de Dados & RLS (Supabase)

O esquema relacional auditado está localizado em `src/supabase/schema.sql`.
- **Nunca** desative RLS em nenhuma tabela de inquilinos.
- Para verificar integridade do isolamento entre empresas:
```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
```
Todas as tabelas de negócio devem retornar `rowsecurity = true`.

---

## 5. Resolução de Incidentes Comuns

### 1. Cliente relata que o link do orçamento não carrega
- Verifique se a URL termina com um token alfanumérico válido (`/orcamento/tok_...`).
- Caso o token tenha sido revogado por nova versão do orçamento, solicite à oficina reenviar a proposta atualizada via WhatsApp.

### 2. QR Code Pix com erro no app do banco
- O motor de Pix EMV gera payload padrão Banco Central com chave sanitizada.
- Acesse `/settings` da oficina e certifique-se de que a chave cadastrada não contém espaços ou caracteres especiais inválidos para o tipo escolhido (ex: telefone deve conter DDD sem símbolos).

### 3. PWA não atualiza no celular do mecânico
- O Service Worker implementa Stale-While-Revalidate seguro. Para forçar atualização:
  - No Chrome/Safari: Fechar a aba ou aplicativo e reabrir. O evento `controllerchange` assumirá os novos assets.
