# CHANGELOG — Konnexy OS Auto

Todas as alterações notáveis deste projeto estão documentadas abaixo.
O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/) e este projeto segue [Semantic Versioning](https://semver.org/lang/pt-BR/).

---

## [1.1.0] - 2026-11-05 (Branch: chore/production-readiness)

### 🚀 Adicionado
- **Documentação de Prontidão**: Criação de `PRODUCT_MAP.md`, `PRODUCTION_AUDIT.md`, `RUNBOOK.md` e `.env.example`.
- **PWA & Offline Resilience**: Service Worker (`public/sw.js`) com estratégia de cache seguro Stale-While-Revalidate para assets estáticos e exclusão explícita de rotas de tokens privados.
- **Manifest PWA**: Suporte completo a `purpose: "any maskable"`, `start_url: "/"`, `scope: "/"` e categorização `business`/`productivity`.
- **Páginas Legais & LGPD**:
  - Nova rota pública `/termos` com condições gerais de contratação, SLA e direito de arrependimento (art. 49 CDC).
  - Nova rota pública `/privacidade` especificando enquadramento da Konnexy como Operadora e Oficina como Controladora (LGPD Art. 18) e canal do DPO.
- **SEO & Meta Previews**:
  - Tags Open Graph e Twitter Cards estruturadas em `index.html` para gerar previews enriquecidos no WhatsApp ao enviar propostas.
  - Criação de `public/robots.txt` protegendo áreas logadas e liberando páginas públicas.
  - Criação de `public/sitemap.xml`.
- **Suíte de Testes Automatizada (`npm test`)**:
  - Script oficial integrado no `package.json`.
  - 31 testes unitários cobrindo Isolamento, Versões Imutáveis, Matriz RBAC, Pix EMV, WhatsApp, Validadores CPF/CNPJ, Normalização de Placas Mercosul e Precisão em Centavos (100% verde).
- **Validação Brasileira Estrita**:
  - Módulo `src/lib/validators.ts` com cálculo de dígito verificador para CPF e CNPJ.
  - Normalizador e validador de placas automotivas antigas e padrão Mercosul.
- **Aritmética Monetária Segura**:
  - Módulo `src/lib/money.ts` operando em centavos inteiros para evitar falhas de ponto flutuante IEEE 754.
- **Conformidade CDC Art. 21**:
  - Adicionado suporte à discriminação de condição de peças (`original_new`, `aftermarket_new`, `reconditioned`) com autorização expressa do consumidor.

### 🛡️ Corrigido & Seguro
- **Acessibilidade WCAG 1.4.4**: Removida a restrição `maximum-scale=1.0, user-scalable=no` do `index.html`, liberando zoom manual sem causar zoom involuntário no iOS.
- **Segregação do Superadmin**: Removido link master da navegação padrão da oficina em `src/components/layout/Sidebar.tsx` e redefinido `DEMO_USER` sem privilégios master indevidos.
