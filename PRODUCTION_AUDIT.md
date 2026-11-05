# PRODUCTION_AUDIT — Konnexy OS Auto
**Data:** 04/11/2026  
**Auditor:** Equipe Sênior de Engenharia (Staff Engineer, SRE, AppSec, QA, UX & Produto)  
**Status do Portão:** 🛑 **AGUARDANDO APROVAÇÃO DO PLANO DE CORREÇÃO (FASE 1 CONCLUÍDA)**  
**Branch de Trabalho:** `chore/production-readiness`  

---

## 1. Sumário Executivo

O **Konnexy OS Auto** possui uma base de código sólida, moderna e visualmente atrativa, com o fluxo principal de oficina mecânica e estética automotiva implementado com sucesso do início ao fim (cliente $\to$ veículo $\to$ checklist $\to$ orçamento versionado $\to$ aprovação no WhatsApp $\to$ OS com Kanban $\to$ pagamento Pix $\to$ pós-venda assistido).

No entanto, para transformar o protótipo funcional em um **SaaS de missão crítica operável em produção comercial**, identificamos **5 vulnerabilidades P0 bloqueantes de lançamento**, **10 inconformidades P1 de 7 dias** e **8 melhorias P2**.

### Quadro Resumo de Achados:
- **P0 (Bloqueantes de Produção):** 5 itens
- **P1 (Alta Prioridade - 7 dias):** 10 itens
- **P2 (Melhoria Contínua / Qualidade):** 8 itens

---

## 2. Achados Detalhados por Severidade

### 🔴 P0 — Bloqueios de Produção (Impedem o Go-Live)

---

#### [P0-01] Viewport Bloqueando Zoom e Falta de Acessibilidade WCAG 1.4.4
- **Arquivo / Linha:** `index.html` (linha 6)
- **Descrição:** A tag `<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />` proíbe o usuário de dar pinch-to-zoom na tela. Isso viola o critério de sucesso **WCAG 2.2 AA (1.4.4 Resize Text)** e pode gerar rejeição em auditorias e em apps encapsulados em WebViews/PWA em pátio de oficina sob luz solar direta.
- **Risco:** Inacessibilidade grave, descumprimento legal de normas de acessibilidade digital e UX frustrante para clientes e mecânicos que precisam ampliar imagens e valores.
- **Evidência:** `maximum-scale=1.0, user-scalable=no` presente no `index.html`.
- **Correção Proposta:**
  1. Alterar a meta para: `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />`.
  2. Garantir que inputs de texto e selects tenham `font-size: 16px` em mobile para evitar o zoom involuntário do iOS Safari sem desabilitar o zoom voluntário do usuário.
- **Esforço:** Baixo (1h).

---

#### [P0-02] SPA Pura Sem SSR/SSG/Prerender: Landing e Páginas Públicas Invisíveis para SEO e WhatsApp Link Previews
- **Arquivo / Linha:** `index.html` (linhas 10-16), `src/pages/LandingPage.tsx`, `src/pages/public/PublicQuotePage.tsx`
- **Descrição:** O HTML inicial entregue pelo Vite entrega um `<div id="root"></div>` vazio. Quando a oficina compartilha o link do orçamento ou tracking no WhatsApp, scrapers (como o `WhatsApp/facebookexternalhit` e bots de indexação do Google) não executam JavaScript client-side completo e geram uma prévia sem título, sem descrição da oficina e sem banner do carro.
- **Risco:** Taxa de conversão de orçamentos prejudicada (clientes desconfiam de links sem card enriquecido no WhatsApp), SEO nulo para a landing comercial e vulnerabilidade de indexação de áreas restritas.
- **Evidência:** O arquivo `index.html` estático possui meta descriptions estáticas gerais e nenhum Open Graph / Twitter Card dinâmico ou estático estruturado, além de ausência de `robots.txt` e `sitemap.xml`.
- **Correção Proposta:**
  1. Implementar tags Open Graph completas (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`) e Twitter Cards no `index.html`.
  2. Adicionar bloco `<noscript>` informativo com telefone e contato da plataforma.
  3. Criar `public/robots.txt` bloqueando rotas privadas (`/dashboard`, `/settings`, `/superadmin`, `/quotes/`, `/service-orders/`) e liberando a landing.
  4. Criar `public/sitemap.xml` para indexação orgânica das páginas institucionais.
- **Esforço:** Médio (3h).

---

#### [P0-03] PWA Incompleto para Operação de Pátio (Sem Service Worker, Sem Maskable Icons e Sem Apple Splash Screens)
- **Arquivo / Linha:** `public/manifest.json`, `index.html`
- **Descrição:** O manifest possui apenas uma referência de ícone SVG sem indicação de `purpose: "any maskable"`, sem `id` único, sem `scope` explícito e a aplicação não registra nenhum Service Worker. Se o mecânico no pátio da oficina perder o sinal Wi-Fi/4G temporariamente ao registrar um checklist, a aplicação desaba com tela de "Sem Conexão" do navegador.
- **Risco:** Rejeição do instalador PWA no Chrome/Android e Safari/iOS; frustração operacional diária na oficina.
- **Evidência:** `public/manifest.json` não contém `purpose: "maskable"`, nem ícones PNG padronizados 192/512, e não há registro de `serviceWorker.register` em `src/main.tsx`.
- **Correção Proposta:**
  1. Atualizar o `manifest.json` com `id`, `start_url: "/"`, `scope: "/"`, `display: "standalone"`, `categories: ["business", "productivity"]`, e ícones em conformidade.
  2. Adicionar meta tags `mobile-web-app-capable` e `apple-touch-icon`.
  3. Implementar Service Worker de cache seguro para assets estáticos (Stale-While-Revalidate para UI e Network-First para dados sensíveis, garantindo que nunca sirva preços antigos sem alerta).
- **Esforço:** Médio (4h).

---

#### [P0-04] Ausência de Páginas Legais Mandatórias (Termos de Uso, Política de Privacidade LGPD e Canal do Titular)
- **Arquivo / Linha:** `src/pages/LandingPage.tsx` (linhas 154-159), `src/App.tsx`
- **Descrição:** O produto processa dados pessoais sensíveis de consumidores finais (Nome, CPF/CNPJ, Telefone/WhatsApp, Placa de Veículo, Fotos com geolocalização e histórico financeiro), além dos dados cadastrais das próprias oficinas clientes. A plataforma não possui rotas para Termos de Uso, Política de Privacidade e Canal de Atendimento a Direitos do Titular (LGPD Art. 18).
- **Risco:** Risco de autuação pela ANPD, processos de Procon por infração ao CDC (Código de Defesa do Consumidor), desconfiança de oficinas em assinar e bloqueio em auditorias de meios de pagamento.
- **Evidência:** O rodapé da Landing Page exibe apenas texto de copyright sem links para documentos jurídicos.
- **Correção Proposta:**
  1. Criar as rotas públicas `/termos` e `/privacidade` no `src/App.tsx`.
  2. Desenvolver componentes com minutas técnicas de **Termos de Uso SaaS** (SLA, política de uso aceitável, cancelamento conforme art. 49 do CDC) e **Política de Privacidade LGPD** (Konnexy como Operador e Oficina como Controladora).
  3. Incluir banner informativo de cookies e canal de contato do Encarregado (DPO).
- **Esforço:** Médio (4h).

---

#### [P0-05] Risco de Exposição de Painel Master de Governança (`/superadmin`) na Barra Lateral
- **Arquivo / Linha:** `src/components/layout/Sidebar.tsx` (linhas 55-57), `src/pages/superadmin/SuperadminPage.tsx`
- **Descrição:** O item "Superadmin Plataforma" está visível na barra lateral para qualquer perfil que possua a flag `is_superadmin: true` ou caso o role esteja configurado. Como a autenticação atual em fallback local permite alternar para perfis com privilégios master, o acesso à lista agregada de todos os inquilinos e à impersonação de outras oficinas pode ser alcançado.
- **Risco:** Violação severa de isolamento multi-tenant (IDOR e quebra de confidencialidade de clientes de outras oficinas).
- **Evidência:** Linha 55 de `Sidebar.tsx`: `canAccess('view_superadmin')`.
- **Correção Proposta:**
  1. Ocultar totalmente o link do Superadmin da navegação comum da oficina; ele deve ser acessível apenas por rota protegida com credencial segregada e autenticação em dois fatores (MFA).
  2. Adicionar trava explícita impedindo que qualquer usuário comum de oficina consiga elevar seu privilégio via console/localStorage.
- **Esforço:** Baixo (2h).

---

### 🟡 P1 — Alta Prioridade (Resolver em 7 dias)

---

#### [P1-01] Cálculos Financeiros com Ponto Flutuante (`number`) em vez de Centavos Inteiros
- **Arquivo / Linha:** `src/pages/quotes/QuoteCreateEditPage.tsx`, `src/types/index.ts`, `src/context/DataContext.tsx`
- **Descrição:** O sistema realiza somas e subtrações de itens, acréscimos e descontos utilizando o tipo JavaScript `number` de ponto flutuante IEEE 754 (ex: `0.1 + 0.2 = 0.30000000000000004`).
- **Risco:** Erros de arredondamento em centavos, discrepância entre o valor exibido na proposta e o valor emitido no QR Code Pix ou nota de fechamento da OS.
- **Correção Proposta:** Padronizar cálculos com função de precisão exata em centavos inteiros (`Math.round(val * 100)`) ou função utilitária de aritmética financeira segura (`src/lib/money.ts`).
- **Esforço:** Médio (3h).

---

#### [P1-02] Exigência CDC: Discriminação Expressa de Peças Recondicionadas/Usadas
- **Arquivo / Linha:** `src/types/index.ts` (linhas 147-158), `src/pages/quotes/QuoteCreateEditPage.tsx`
- **Descrição:** O Código de Defesa do Consumidor (CDC Art. 21) estabelece que o uso de peças usadas ou recondicionadas na reparação de qualquer produto depende de **autorização prévia e expressa do consumidor**. Atualmente, o item de orçamento possui apenas `type: 'service' | 'part'`, sem indicar se a peça é *Nova Original*, *Paralela Nova* ou *Recondicionada/Remanufaturada*.
- **Risco:** Vulnerabilidade jurídica para a oficina em caso de litígio com cliente sobre a qualidade de peças aplicadas.
- **Correção Proposta:** Adicionar o campo `part_condition?: 'original_new' | 'aftermarket_new' | 'reconditioned'` nos itens de orçamento e OS, exibindo aviso de consentimento no aceite digital do cliente.
- **Esforço:** Baixo (2h).

---

#### [P1-03] Falta de Validação Estrita de Documentos (CPF e CNPJ com Algoritmo de Dígitos Verificadores)
- **Arquivo / Linha:** `src/components/ui/Input.tsx`, `src/pages/customers/CustomersListPage.tsx`
- **Descrição:** O campo de documento do cliente aceita qualquer sequência numérica sem validação matemática do módulo 11 de CPFs e CNPJs brasileiros.
- **Risco:** Dados cadastrais corrompidos, impossibilidade futura de integração com emissores de NFS-e e falhas em cobranças bancárias.
- **Correção Proposta:** Implementar função de validação matemática de CPF/CNPJ com rejeição amigável e máscara visual automática (`src/lib/validators.ts`).
- **Esforço:** Baixo (2h).

---

#### [P1-04] Busca por Placa Rígida (Sem Tolerância ao Formato Antigo e Mercosul)
- **Arquivo / Linha:** `src/context/DataContext.tsx`, `src/pages/service-orders/ServiceOrdersListPage.tsx`
- **Descrição:** Quando o operador digita a placa no formato sem hífen (ex: `BRA2E19`) ou com hífen (`BRA-2E19`), a busca necessita de correspondência exata ou normalizada para evitar não encontrar o veículo.
- **Risco:** Lentidão no atendimento de balcão e cadastro de veículos duplicados no banco.
- **Correção Proposta:** Criar função utilitária `normalizePlate(plate: string)` que remove pontuações e converte para maiúsculas em todas as consultas e filtros.
- **Esforço:** Baixo (1h).

---

#### [P1-05] Concorrência em Numeração Sequencial de Orçamentos e Ordens de Serviço
- **Arquivo / Linha:** `src/context/DataContext.tsx` (linhas 150-180), `src/supabase/schema.sql`
- **Descrição:** Na camada de aplicação/mock, o número de OS e Orçamento é gerado com base no comprimento do array ou timestamp. No PostgreSQL, a tabela utiliza `SERIAL`, o que pode gerar numeração global da plataforma em vez de sequencial por oficina (`1, 2, 3...` independente para cada empresa).
- **Risco:** Uma oficina visualizando o número de OS `#104` saltar para `#115` porque outros inquilinos criaram ordens no mesmo período.
- **Correção Proposta:** Ajustar a numeração sequencial para ser estritamente particionada por `company_id` (trigger ou sequence por tenant).
- **Esforço:** Médio (3h).

---

#### [P1-06] Metadados EXIF em Fotos de Veículos (Geolocalização e Dados Pessoais)
- **Arquivo / Linha:** `src/pages/service-orders/ServiceOrderDetailsPage.tsx`
- **Descrição:** Upload de fotos de vistorias tiradas diretamente da câmera de smartphones dos mecânicos mantém metadados EXIF (coordenadas GPS de onde o veículo estava, data/hora e modelo do smartphone).
- **Risco:** Vazamento de dados de localização de clientes e violação das diretrizes de minimização de dados da LGPD.
- **Correção Proposta:** Implementar striping de EXIF e compressão WebP client-side via Canvas antes do upload para o storage.
- **Esforço:** Médio (3h).

---

#### [P1-07] Ausência de Trava de Concorrência na Edição de Ordem de Serviço
- **Arquivo / Linha:** `src/pages/service-orders/ServiceOrderDetailsPage.tsx`
- **Descrição:** Se dois colaboradores (ex: atendente no balcão e mecânico no elevador) abrirem a mesma OS ao mesmo tempo, a última alteração salva pode sobrescrever os dados da outra sem aviso.
- **Risco:** Perda de anotações técnicas, diagnósticos ou itens adicionais inseridos na ordem de serviço.
- **Correção Proposta:** Implementar controle otimista de concorrência com timestamp `updated_at` comparativo antes de persistir alterações.
- **Esforço:** Médio (2h).

---

#### [P1-08] Inconsistência de Módulo de Estoque (Peças sem Baixa Automática e Sem Estoque Mínimo)
- **Arquivo / Linha:** `src/types/index.ts`, `src/pages/quotes/QuoteCreateEditPage.tsx`
- **Descrição:** O catálogo possui itens do tipo `part`, porém não há tabela nem controle de saldo de estoque, compras, baixa ao concluir a OS ou alertas de estoque mínimo de insumos (como filtros e óleos).
- **Risco:** Ruptura de estoque no pátio e promessas de prazos de entrega que não podem ser cumpridas por falta de peças.
- **Correção Proposta:** Estruturar tabela de movimentação de estoque (`inventory_items` e `inventory_transactions`) ou ajustar a copy do produto para deixar claro que o controle no MVP é voltado ao catálogo de serviços e peças aplicadas.
- **Esforço:** Médio (4h).

---

#### [P1-09] Limitação de Consulta à API de Placas e Tabela FIPE (Custos e Rate Limiting)
- **Arquivo / Linha:** `src/pages/customers/CustomerDetailsPage.tsx`
- **Descrição:** Não há proteção contra consultas excessivas de placas ou bots, o que em integrações com provedores de busca veicular pode estourar cotas pagas.
- **Risco:** Prejuízo financeiro por consumo desenfreado de APIs pagas de dados veiculares.
- **Correção Proposta:** Adicionar cache local de consultas de placas e debounce com validação prévia de padrão Mercosul.
- **Esforço:** Baixo (2h).

---

#### [P1-10] Falta de Script Automatizado no `package.json` (`npm test`) e Verificação Contínua
- **Arquivo / Linha:** `package.json` (linhas 6-11)
- **Descrição:** O comando `npm test` falha com `npm error Missing script: "test"`. Embora exista uma suíte em `src/test/suite.ts`, ela não é executada no ciclo padrão de CI.
- **Risco:** Regressões silenciosas introduzidas em novos deploys sem detecção automática.
- **Correção Proposta:** Adicionar `"test": "tsx src/test/suite.ts"` e configurar pipeline do GitHub Actions para validar `lint`, `build` e `test` antes de qualquer merge.
- **Esforço:** Baixo (1h).

---

### 🟢 P2 — Melhorias Contínuas e Refinamentos de UX/Operação

---

#### [P2-01] Eliminação de Avisos do Linter (185 Warnings em Oxlint)
- **Arquivo / Linha:** Diversos arquivos em `src/pages/` e `src/components/`
- **Descrição:** O linter identificou 185 variáveis e imports não utilizados (ex: ícones que deixaram de ser usados após refatoração).
- **Correção:** Limpar declarações mortas e padronizar o código para manter a base limpa e leve.
- **Esforço:** Baixo (2h).

#### [P2-02] Termo de Retirada de Veículo com Assinatura na Entrega da OS
- **Arquivo / Linha:** `src/pages/service-orders/ServiceOrderDetailsPage.tsx`
- **Descrição:** Incluir opção de registro de retirada do veículo com declaração de que o carro foi conferido e entregue nas condições combinadas.
- **Esforço:** Baixo (2h).

#### [P2-03] Botão de Impressão Térmica (80mm) para Cupom de Balcão
- **Arquivo / Linha:** `src/components/printable/ServiceOrderReceipt.tsx`
- **Descrição:** Oficinas de atendimento rápido frequentemente utilizam impressoras térmicas de cupom de 80mm para comprovante de entrada.
- **Esforço:** Médio (3h).

#### [P2-04] DRE Simples e Fluxo de Caixa no Módulo de Relatórios
- **Arquivo / Linha:** `src/pages/reports/ReportsPage.tsx`
- **Descrição:** Separar entradas por tipo de receita (Mão de Obra vs. Peças) e permitir exportação em CSV para contabilidade.
- **Esforço:** Médio (3h).

#### [P2-05] Gestão de Boxes e Elevadores na Agenda
- **Arquivo / Linha:** `src/types/index.ts`
- **Descrição:** Suporte a agendamentos com alocação visual de qual elevador/box receberá o veículo.
- **Esforço:** Médio (4h).

#### [P2-06] Filtros de Data com Fuso Horário Padronizado `America/Sao_Paulo`
- **Arquivo / Linha:** `src/lib/formatters.ts`
- **Descrição:** Garantir que todas as conversões de ISO string respeitem estritamente o horário oficial de Brasília, mesmo se o dispositivo do cliente estiver em outro fuso.
- **Esforço:** Baixo (1h).

#### [P2-07] Compressão de Assets e Otimização de Imagens (WebP)
- **Arquivo / Linha:** `src/assets/hero.png`
- **Descrição:** Substituir imagens estáticas em PNG de alta resolução por formatos WebP otimizados para reduzir o LCP em conexões 4G lentas.
- **Esforço:** Baixo (1h).

#### [P2-08] Banner de Consentimento de Cookies em Conformidade
- **Arquivo / Linha:** `src/components/common/`
- **Descrição:** Implementar banner discreto e em conformidade LGPD para gestão de preferências de cookies não essenciais.
- **Esforço:** Baixo (2h).

---

## 3. Matriz de Correção Recomendada para a Fase 2

| Prioridade | Item | Ação | Complexidade |
| :--- | :--- | :--- | :--- |
| **P0** | P0-01 | Remover restrição de zoom no viewport (`index.html`) e manter inputs com $\ge$ 16px | Baixa |
| **P0** | P0-02 | Inserir Meta Open Graph, Twitter Cards, robots.txt e sitemap.xml | Média |
| **P0** | P0-03 | Configurar PWA completo (`manifest.json` com maskable icons e Service Worker) | Média |
| **P0** | P0-04 | Publicar páginas obrigatórias `/termos` e `/privacidade` (LGPD/CDC) | Média |
| **P0** | P0-05 | Segregar e proteger acesso ao Superadmin contra IDOR e elevação indevida | Baixa |
| **P1** | P1-10 | Adicionar script `"test"` no `package.json` e garantir suite verde | Baixa |
| **P1** | P1-03 | Adicionar validação estrita com algoritmo de CPF/CNPJ | Baixa |
| **P1** | P1-04 | Normalização tolerante na busca de placas Mercosul e antigas | Baixa |
| **P1** | P1-01 | Aritmética de centavos inteiros para evitar falha de ponto flutuante | Média |
| **P1** | P1-02 | Discriminação expressa da condição de peças para cumprimento do CDC Art. 21 | Baixa |
