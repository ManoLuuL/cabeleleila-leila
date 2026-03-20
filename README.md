# ✂️ Salão da Leila — Sistema de Agendamentos

Sistema web de agendamento online para o Salão de Beleza da Leila

---

## Tecnologias Utilizadas

| Tecnologia | Descrição |
|---|---|
| React 19 + TypeScript | Interface e tipagem estática |
| Vite 8 | Bundler e servidor de desenvolvimento |
| Tailwind CSS v4 | Estilização utilitária |
| Zustand v5 | Gerenciamento de estado global (ViewModel) |
| React Hook Form + Zod | Formulários com validação de esquema |
| React Router DOM v7 | Roteamento entre páginas |
| Radix UI | Componentes acessíveis (Dialog, Tabs, Select, Toast) |
| Framer Motion | Animações de interface |
| date-fns | Manipulação e formatação de datas |
| Express 5 | Servidor de API REST |
| PostgreSQL (Neon) | Banco de dados relacional em nuvem |
| JWT + bcryptjs | Autenticação e hash de senhas |
| tsx | Execução de TypeScript no Node.js |

---

## Arquitetura

O projeto segue o padrão **MVVM (Model-View-ViewModel)** com separação clara de responsabilidades:

```
├── server/                 # Backend Express
│   ├── index.ts            # Configuração do servidor
│   ├── auth.ts             # Utilitários JWT
│   ├── db.ts               # Conexão com PostgreSQL
│   └── routes/
│       ├── auth.routes.ts        # POST /api/auth/register, /login, GET /me
│       └── appointments.routes.ts # CRUD /api/appointments
│
└── src/                    # Frontend React
    ├── pages/              # Views — ClientPage e AdminPage
    ├── components/         # Componentes reutilizáveis de UI
    ├── store/              # ViewModel — estado reativo com Zustand
    ├── services/           # Regras de negócio (domínio)
    ├── repositories/       # Acesso a dados via API REST
    ├── hooks/              # Hooks customizados
    ├── lib/                # Utilitários, constantes e validações
    └── types/              # Tipagens TypeScript
```

---

## Funcionalidades

### Área do Cliente (`/`)
- Página inicial pública — qualquer pessoa pode acessar
- Agendamento de um ou mais serviços em uma única data
- Login/cadastro solicitado ao clicar em "Novo Agendamento" (necessário para identificar o cliente)
- Edição de agendamento (permitida até 2 dias antes da data; abaixo disso apenas por telefone)
- Cancelamento de agendamento com mesma regra de prazo
- Histórico completo de agendamentos (requer login)
- Sugestão automática de data quando já existe agendamento na mesma semana para o mesmo cliente

### Área Administrativa (`/admin`)
- Acesso exclusivo para a Leila (definido por e-mail no `.env`)
- Listagem de todos os agendamentos recebidos
- Edição de qualquer agendamento sem restrição de prazo
- Gerenciamento de status: `Pendente → Confirmado → Concluído` / `Cancelado`
- Dashboard semanal com navegação por semana
- KPIs: total de agendamentos, confirmados, concluídos e receita estimada
- Calendário semanal visual com agendamentos por dia
- Breakdown de status em gráfico de barras

---

## Como Rodar o Projeto

### Pré-requisitos
- Node.js 18+
- npm
- Conta no [Neon](https://neon.tech) (PostgreSQL gratuito) ou outro PostgreSQL acessível

### 1. Clone e instale as dependências

```bash
git clone https://github.com/seu-usuario/sala-leila.git
cd sala-leila
npm install
```

### 2. Configure as variáveis de ambiente

Copie o arquivo de exemplo e preencha com seus dados:

```bash
cp .env.example .env
```

Edite o `.env`:

```env
DATABASE_URL=postgresql://usuario:senha@host/banco?sslmode=require
JWT_SECRET=uma_string_longa_e_aleatoria
ADMIN_EMAIL=leila@salaoleila.com.br
```

> O `ADMIN_EMAIL` define qual e-mail receberá o papel de administrador ao se cadastrar.

### 3. Execute a migração do banco de dados

Cria as tabelas `users` e `appointments`:

```bash
npm run migrate
```

### 4. Inicie o backend e o frontend

Em dois terminais separados:

```bash
# Terminal 1 — servidor Express (porta 3000)
npm run server

# Terminal 2 — frontend Vite (porta 5173)
npm run dev
```

Acesse em: **http://localhost:5173**

### 5. Criando a conta de administrador

1. Acesse `http://localhost:5173`
2. Clique em "Entrar / Cadastrar" e vá para a aba "Cadastrar"
3. Preencha com o e-mail definido em `ADMIN_EMAIL` no `.env`
4. Após o cadastro, você será redirecionado automaticamente para `/admin`

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

## Regras de Negócio

- Salão fechado aos domingos
- Horário de funcionamento: 08:00 às 18:00 (nenhum atendimento pode ultrapassar 18:00)
- Agendamentos permitidos com até 60 dias de antecedência, nunca no passado
- Sem conflito de horários entre agendamentos
- Fluxo de status: `pendente → confirmado → concluído` ou qualquer → `cancelado`
- Agendamentos `concluídos` e `cancelados` são imutáveis
- Clientes não podem cancelar online com menos de 2 dias de antecedência (devem ligar)
- Ao detectar agendamento do mesmo cliente na mesma semana, o sistema sugere consolidar na mesma data

---

## Observações

- Os preços são armazenados em centavos para evitar problemas de ponto flutuante.
- A regra de edição por prazo (2 dias) é aplicada apenas na área do cliente. O admin pode editar qualquer agendamento.
- O frontend se comunica com o backend via proxy Vite (`/api` → `localhost:3000`), sem necessidade de configurar CORS manualmente em desenvolvimento.
- O banco de dados utilizado é o **Neon** (PostgreSQL serverless gratuito), mas qualquer PostgreSQL compatível funciona.
