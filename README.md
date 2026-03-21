# ✂️ Salão da Leila — Sistema de Agendamentos

Sistema de agendamento online para o Salão de Beleza da Leila

---

## Tecnologias

| Tecnologia | Por que usei |
|---|---|
| React 19 + TypeScript | Base do frontend com tipagem estática |
| Vite 8 | Build rápido e HMR no desenvolvimento |
| Tailwind CSS v4 | Estilização sem sair do JSX |
| Zustand v5 | Estado global simples, sem boilerplate do Redux |
| React Hook Form + Zod | Formulários com validação tipada |
| React Router DOM v7 | Roteamento entre as páginas |
| Radix UI | Componentes acessíveis prontos (Dialog, Tabs, Select...) |
| Framer Motion | Animações nas transições do formulário |
| date-fns | Manipulação de datas sem o peso do moment.js |
| Express 5 | API REST simples para o backend |
| PostgreSQL via Neon | Banco gratuito em nuvem, fácil de configurar |
| JWT + bcryptjs | Autenticação stateless com senhas seguras |

---

## Arquitetura

Segui o padrão **MVVM** para separar bem as responsabilidades:

```
Repository → Service → Store (Zustand) → Hook → Component
```

- **Repository**: só faz as chamadas HTTP, sem lógica nenhuma
- **Service**: onde ficam todas as regras de negócio (validações, erros de domínio)
- **Store**: conecta o service com a UI, mantém o estado em memória
- **Hook**: gerencia o estado do formulário e mapeia erros para mensagens
- **Component**: puramente visual, recebe dados e callbacks via props

Estrutura de pastas:

```
├── server/
│   ├── index.ts
│   ├── auth.ts
│   ├── db.ts
│   └── routes/
│       ├── auth.routes.ts
│       └── appointments.routes.ts
└── src/
    ├── pages/
    ├── components/
    ├── store/
    ├── services/
    ├── repositories/
    ├── hooks/
    ├── lib/
    └── types/
```

---

## Funcionalidades

**Área do cliente (`/`)**
- Página inicial pública, sem precisar logar pra ver
- Ao clicar em "Novo Agendamento" sem estar logado, pede login/cadastro
- Agendamento de um ou mais serviços
- Edição e cancelamento (só até 2 dias antes — depois disso precisa ligar)
- Histórico de agendamentos
- Sugestão automática de data quando já tem agendamento na mesma semana

**Painel admin (`/admin`)**
- Acesso exclusivo para a Leila
- Lista todos os agendamentos
- Edita qualquer agendamento sem restrição de prazo
- Gerencia status: Pendente → Confirmado → Concluído / Cancelado
- Dashboard semanal com KPIs e calendário visual

---

## Como rodar

**Pré-requisitos:** Node.js 18+, npm, e uma instância PostgreSQL (recomendo o [Neon](https://neon.tech) que é gratuito)

```bash
# 1. instalar dependências
npm install

# 2. configurar o .env (copie o .env.example e preencha)
cp .env.example .env

# 3. criar as tabelas no banco
npm run migrate

# 4. rodar backend e frontend em terminais separados
npm run server   # porta 3000
npm run dev      # porta 5173
```

Acesse em `http://localhost:5173`

**Criando a conta admin:** cadastre-se com o e-mail definido em `ADMIN_EMAIL` no `.env` — o sistema atribui o papel de admin automaticamente.

---

## Variáveis de ambiente

```env
DATABASE_URL=postgresql://usuario:senha@host/banco?sslmode=require
JWT_SECRET=qualquer_string_longa_aqui
ADMIN_EMAIL=leila@salaoleila.com.br
```

---

## Serviços do salão

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
