# ✂️ Salão da Leila — Sistema de Agendamentos

Sistema web de agendamento online para o Salão de Beleza da Leila, desenvolvido como solução para o teste prático da **DSIN Tecnologia da Informação**.

---

## Tecnologias Utilizadas

| Tecnologia | Descrição |
|---|---|
| React 19 + TypeScript | Interface e tipagem estática |
| Vite | Bundler e servidor de desenvolvimento |
| Tailwind CSS v4 | Estilização utilitária |
| Zustand | Gerenciamento de estado global (ViewModel) |
| React Hook Form + Zod | Formulários com validação de esquema |
| IndexedDB (idb) | Persistência local dos dados no navegador |
| React Router DOM v7 | Roteamento entre páginas |
| Radix UI | Componentes acessíveis (Dialog, Tabs, Select, Toast) |
| Framer Motion | Animações de interface |
| date-fns | Manipulação e formatação de datas |
| TanStack React Query | Cache e sincronização de dados assíncronos |

---

## Arquitetura

O projeto segue o padrão **MVVM (Model-View-ViewModel)** com separação clara de responsabilidades:

```
src/
├── pages/          # Views — ClientPage e AdminPage
├── components/     # Componentes reutilizáveis de UI
├── store/          # ViewModel — estado reativo com Zustand
├── services/       # Regras de negócio (domínio)
├── repositories/   # Acesso a dados (IndexedDB)
├── hooks/          # Hooks customizados
├── lib/            # Utilitários, constantes e validações
└── types/          # Tipagens TypeScript
```

---

## Funcionalidades

### Área do Cliente (`/`)
- Agendamento de um ou mais serviços em uma única data
- Edição de agendamento (permitida até 2 dias antes da data)
- Cancelamento de agendamento
- Busca de agendamentos ativos por telefone
- Histórico completo de agendamentos por telefone
- Sugestão automática de data quando já existe agendamento na mesma semana para o mesmo cliente

### Área Administrativa (`/admin`)
- Listagem de todos os agendamentos recebidos
- Edição de qualquer agendamento (sem restrição de prazo)
- Gerenciamento de status: Pendente → Confirmado → Concluído / Cancelado
- Dashboard semanal com navegação por semana
- KPIs: total de agendamentos, confirmados, concluídos e receita estimada
- Calendário semanal visual com agendamentos por dia
- Breakdown de status em gráfico de barras

---

## Como Rodar o Projeto

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/sala-leila.git
cd sala-leila

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse em: `http://localhost:5173`

### Build para produção

```bash
npm run build
npm run preview
```

---

## Serviços Disponíveis

| Serviço | Duração | Preço |
|---|---|---|
| Corte de Cabelo | 45 min | R$ 60,00 |
| Coloração | 120 min | R$ 150,00 |
| Escova | 60 min | R$ 70,00 |
| Hidratação | 60 min | R$ 80,00 |
| Manicure | 45 min | R$ 40,00 |
| Pedicure | 60 min | R$ 50,00 |
| Sobrancelha | 30 min | R$ 30,00 |
| Progressiva | 180 min | R$ 200,00 |

---

## Observações

- Os dados são persistidos localmente via **IndexedDB**, sem necessidade de backend ou banco de dados externo.
- Os preços são armazenados em centavos para evitar problemas de ponto flutuante.
- A regra de edição por prazo (2 dias) é aplicada apenas na área do cliente. O admin pode editar qualquer agendamento.
- A sugestão de consolidação de data é acionada automaticamente ao detectar outro agendamento do mesmo cliente na mesma semana.
