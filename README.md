# 🎬 Erick & Itally | Aplicação Full-Stack de Presentes de Casamento (Next.js 14 + Mercado Pago & Mock Simulator)

Aplicação web completa, mobile-first e pronta para rodar em ambiente local (`http://localhost:3000`), desenvolvida para a lista de presentes de casamento bem-humorada de **Erick & Itally**, com cotas fictícias temáticas do universo audiovisual e filmmaking (ex: *"Café Gourmet para Madrugadas de Render no Premiere"*, *"Claquete Oficial: Take 1, Cena 1"*, *"SSD NVMe 4TB pro Noivo Não Usar o HD de Fotos da Esposa"*).

---

## 🚀 Principais Funcionalidades

1. **Catálogo de Cotas Cinematográficas**:
   - 17 cotas hilárias divididas nas categorias: `Ilha de Edição (DRs)`, `Set & Open Bar` e `Locações & Golden Hour`.
   - Busca em tempo real, filtros por categoria e ordenação por preço e ordem alfabética.

2. **Integração Mercado Pago com Adaptador Inteligente (Mock / Real)**:
   - **Modo Mock Automático**: Ativado por padrão quando `MP_ACCESS_TOKEN` não está configurado.
     - Gera QR Code Pix visualmente fiel com chave de teste.
     - Disponibiliza botão de **⚡ Simular Aprovação Instantânea (1 Clique)** na interface para testes ágeis sem gastar 1 centavo.
     - Suporta simulação de recusa e cartão de crédito de teste.
   - **Modo Real**: Assim que as credenciais de produção ou sandbox forem preenchidas no `.env.local`, a aplicação passa a chamar diretamente os endpoints oficiais do SDK `mercadopago`, registrando webhooks reais.

3. **Experiência de Checkout Fluida**:
   - Modal responsivo com dados do convidado (Nome, E-mail, CPF com máscara).
   - Campo para **recado carinhoso/engraçado** aos noivos (com sugestões pré-fabricadas).
   - Opção de contribuição anônima.
   - Opção de Pix dinâmico ou Cartão de Crédito.
   - Polling a cada 3s para identificar aprovação em tempo real.
   - **Chuva de confetes** (`canvas-confetti`) na confirmação + botão para compartilhar no WhatsApp.

4. **💌 Mural de Recados dos Noivos (Guestbook)**:
   - Feed dinâmico exibindo todas as mensagens deixadas pelos convidados cujos pagamentos foram aprovados, vinculados ao presente escolhido.

5. **📊 Painel dos Noivos (Dashboard Administrativo)**:
   - Métricas em tempo real: Total arrecadado (R$), total de presentes, pedidos aprovados vs pendentes e ticket médio.
   - Tabela detalhada de pedidos com filtro por status e busca.
   - Botão para **Aprovação Manual** com 1 clique.
   - Botão para restauração do catálogo no banco de dados.

---

## 🛠️ Stack Tecnológica

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Estilização**: Tailwind CSS + Lucide Icons + Animações fluidas
- **Efeitos**: Canvas Confetti
- **Banco de Dados**: SQLite via Prisma ORM (`file:./dev.db`)
- **Pagamentos**: SDK Oficial do Mercado Pago (`mercadopago`) + Adaptador inteligente com `qrcode`

---

## ⚡ Como Rodar o Projeto

### 1. Instalação das dependências
```bash
npm install
```

### 2. Inicialização do Banco de Dados SQLite
```bash
npx prisma db push
npm run db:seed
```

### 3. Rodando o servidor de desenvolvimento
```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🔑 Configuração do Mercado Pago (Opcional)

No arquivo `.env.local`:

```env
DATABASE_URL="file:./dev.db"

# Para usar o MODO MOCK (Simulador de Testes), deixe em branco:
MP_ACCESS_TOKEN=""
MP_PUBLIC_KEY=""

# Quando quiser conectar sua conta real do Mercado Pago, preencha:
# MP_ACCESS_TOKEN="APP_USR-xxxxxxxxxxxxxxxxxxxx"
# MP_PUBLIC_KEY="APP_USR-xxxxxxxxxxxxxxxxxxxx"
```

> **Nota:** Não é necessário reiniciar o banco nem refatorar nada para alternar entre Mock e Produção. O adaptador detecta automaticamente as variáveis de ambiente.
