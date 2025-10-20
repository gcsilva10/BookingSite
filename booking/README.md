# 🍽️ Booking Site - Sistema de Reservas para Restaurante

Um sistema completo de gestão de reservas para restaurantes, desenvolvido com Django REST Framework (backend) e React + TypeScript (frontend).

![Restaurant Booking System](https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920&q=80)

## 📋 Índice

- [Características](#características)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Requisitos](#requisitos)
- [2Instalação e Setup](#instalação-e-setup)
- [Como Funciona](#como-funciona)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)

---

## ✨ Características

### Para Clientes

- ✅ Interface moderna e intuitiva para fazer reservas
- ✅ Seleção de data, hora e número de pessoas
- ✅ Visualização de disponibilidade em tempo real
- ✅ Sistema de atribuição automática de mesas

### Para Staff

- ✅ Dashboard com estatísticas em tempo real
- ✅ Gestão completa de reservas (confirmar, cancelar, eliminar)
- ✅ Gestão de mesas (criar, ativar/desativar, eliminar)
- ✅ Gestão de utilizadores staff
- ✅ Calendário visual com todas as reservas
- ✅ Gráficos de atividade por hora e status de reservas

### Design

- 🎨 Interface moderna com glassmorphism e gradientes
- 🌙 Tema escuro elegante com detalhes dourados
- 📱 Totalmente responsivo (desktop, tablet, mobile)
- ✨ Animações suaves e transições fluidas
- 🖼️ Background consistente em todas as páginas

---

## 🛠️ Tecnologias Utilizadas

### Backend

- **Python 3.11+**
- **Django 5.1** - Framework web
- **Django REST Framework** - API RESTful
- **SQLite** - Base de dados (desenvolvimento)
- **CORS Headers** - Comunicação entre frontend e backend

### Frontend

- **React 18.3** - Biblioteca UI
- **TypeScript 5.5** - Type safety
- **Vite 5.4** - Build tool e dev server
- **React Router 6** - Navegação
- **Recharts** - Gráficos e visualizações
- **FullCalendar** - Calendário de reservas
- **CSS Modules** - Estilos modernos

---

## 📁 Estrutura do Projeto

```
booking/
├── backend/                    # Django Backend
│   ├── api/                   # Configuração principal
│   │   ├── settings.py       # Configurações Django
│   │   ├── urls.py           # URLs principais
│   │   └── wsgi.py
│   ├── reservations/          # App de Reservas
│   │   ├── models.py         # Modelo Reservation
│   │   ├── serializers.py    # Serializers DRF
│   │   ├── views.py          # Views/Endpoints
│   │   └── urls.py
│   ├── tables/                # App de Mesas
│   │   ├── models.py         # Modelo Table
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── users/                 # App de Utilizadores
│   │   ├── models.py         # User management
│   │   ├── views.py
│   │   └── admin_urls.py
│   ├── db.sqlite3            # Base de dados
│   └── manage.py             # Django CLI
│
└── frontend/                  # React Frontend
    ├── src/
    │   ├── components/        # Componentes reutilizáveis
    │   │   ├── Buttons/      # Botões (5 variantes)
    │   │   ├── Navbar/       # Barra de navegação
    │   │   └── GeometricShapes/  # Background animado
    │   ├── pages/            # Páginas da aplicação
    │   │   ├── Home/         # Dashboard + Reservas
    │   │   ├── StaffLogin/   # Login staff
    │   │   ├── StaffReservations/  # Gestão de reservas
    │   │   ├── StaffTables/  # Gestão de mesas
    │   │   └── StaffUsers/   # Gestão de users
    │   ├── lib/
    │   │   └── api.ts        # Cliente API HTTP
    │   ├── App.tsx           # Rotas principais
    │   ├── main.tsx          # Entry point
    │   └── index.css         # Design system global
    ├── public/
    ├── package.json
    └── vite.config.ts
```

---

## 📦 Requisitos

### Backend

- Python 3.11 ou superior
- pip (gestor de pacotes Python)

### Frontend

- Node.js 18+
- npm ou yarn

---

## 🚀 Instalação e Setup

### 1️⃣ Clone o Repositório

```bash
git clone <repository-url>
cd booking
```

---

### 2️⃣ Setup do Backend

#### 2.1 Navegue para a pasta backend

```bash
cd backend
```

#### 2.2 Crie um ambiente virtual Python

```bash
python -m venv venv
```

#### 2.3 Ative o ambiente virtual

**macOS/Linux:**

```bash
source venv/bin/activate
```

**Windows:**

```bash
venv\Scripts\activate
```

#### 2.4 Instale as dependências

```bash
pip install django djangorestframework django-cors-headers
```

#### 2.5 Execute as migrações

```bash
python manage.py migrate
```

#### 2.6 Crie um superuser (admin)

```bash
python manage.py createsuperuser
```

> Siga as instruções para criar username e password

#### 2.7 Inicie o servidor backend

```bash
python manage.py runserver
```

✅ **Backend estará disponível em: http://localhost:8000**

---

### 3️⃣ Setup do Frontend

#### 3.1 Abra um novo terminal e navegue para a pasta frontend

```bash
cd frontend
```

#### 3.2 Instale as dependências

```bash
npm install
```

#### 3.3 Configure a URL da API

Crie/edite o arquivo `src/config.ts`:

```typescript
export const API_BASE_URL = 'http://localhost:8000';
```

#### 3.4 Inicie o servidor de desenvolvimento

```bash
npm run dev
```

✅ **Frontend estará disponível em: http://localhost:5173**

---

## 🎯 Como Funciona

### 🏠 Homepage

A homepage adapta-se automaticamente ao tipo de utilizador:

#### Para Visitantes (Não autenticados)

- **Formulário de Reserva**: Interface simples para criar reservas
  - Seleção de nome, telefone, data/hora
  - Número de pessoas
  - Notas opcionais
  - Sistema automático atribui mesas disponíveis

#### Para Staff (Autenticados)

- **Dashboard Interativo** com 3 colunas:
  - **Coluna Esquerda**: 4 cards estatísticos
    - Total de Reservas
    - Reservas Confirmadas
    - Reservas Pendentes
    - Reservas Canceladas
  - **Coluna Centro**: Gráfico de Atividade por Hora
  - **Coluna Direita**: Gráfico de Status (Donut chart)

---

### 🔐 Autenticação Staff

#### Login (`/staff`)

- Página de login moderna com card glassmorphism
- Autenticação via JWT tokens
- Validação de credenciais staff/superuser

#### Sistema de Tokens

- `access_token`: Armazenado em localStorage
- Enviado em todas as requisições via header `Authorization: Bearer <token>`
- Validação automática em rotas protegidas

---

### 📅 Gestão de Reservas (`/staff/reservations`)

#### Visualização

- **Calendário FullCalendar** com 3 views:
  - Mês (dayGridMonth)
  - Semana (timeGridWeek)
  - Dia (timeGridDay)
- **Cores por Status**:
  - 🟡 Amarelo: Pendente
  - 🟢 Verde: Confirmada
  - 🔴 Vermelho: Cancelada

#### Filtros

- Filtrar por status (Todos, Pendentes, Confirmadas, Canceladas)

#### Ações

- **Ver Detalhes**: Click no evento abre modal
- **Confirmar Reserva**: Muda status para CONFIRMED
- **Marcar Pendente**: Volta para PENDING
- **Cancelar**: Muda para CANCELLED
- **Eliminar**: Remove permanentemente

#### Modal de Detalhes

- Nome do cliente
- Telefone
- Data e hora
- Número de convidados
- Mesas atribuídas
- Notas
- Status atual
- Botões de ação

---

### 🪑 Gestão de Mesas (`/staff/tables`)

#### Listar Mesas

- Grid de 3 colunas (responsivo)
- Cards modernos com informação:
  - Número da mesa
  - Capacidade (pessoas)
  - Status (Ativa/Inativa)

#### Criar Mesa

- **Botão "Adicionar Nova Mesa"** abre formulário
- Campos:
  - Número da mesa (único)
  - Capacidade (número de pessoas)
  - Status inicial (Ativa/Inativa)

#### Ações por Mesa

- **🔒 Desativar / ✅ Ativar**: Alterna disponibilidade
- **🗑️ Eliminar**: Remove mesa (pede confirmação)

---

### 👥 Gestão de Utilizadores (`/staff/users`)

#### Criar Utilizador

- **Formulário de Criação**:
  - Username (único)
  - Password
  - Email (opcional)
  - Checkbox "Acesso Superuser" (centralizada)

#### Listar Utilizadores

- Tabela moderna com colunas:
  - Username
  - Email
  - Status (Ativo/Inativo)
  - Permissões (Staff, Superuser)
  - Ações

#### Badges de Status

- 🟢 **Ativo**: Conta ativa
- 🔴 **Inativo**: Conta desativada
- 👔 **Staff**: Acesso área staff
- 👑 **Superuser**: Acesso total

#### Ações

- **🗑️ Eliminar**: Remove utilizador (pede confirmação)

---

## 🔌 API Endpoints

### Autenticação

```
POST   /auth/login/          # Login (retorna tokens)
POST   /auth/refresh/        # Refresh access token
GET    /auth/me/             # Info do user autenticado
```

### Reservas

```
GET    /reservations/        # Listar todas
POST   /reservations/        # Criar nova
GET    /reservations/{id}/   # Ver detalhes
PATCH  /reservations/{id}/   # Atualizar (ex: status)
DELETE /reservations/{id}/   # Eliminar
```

### Mesas

```
GET    /tables/              # Listar todas
POST   /tables/              # Criar nova
GET    /tables/{id}/         # Ver detalhes
PUT    /tables/{id}/         # Atualizar completo
PATCH  /tables/{id}/         # Atualizar parcial
DELETE /tables/{id}/         # Eliminar
```

### Utilizadores (Admin)

```
GET    /admin/users/         # Listar users
POST   /admin/users/         # Criar user
DELETE /admin/users/{id}/    # Eliminar user
```

---

## 🎨 Design System

### Cores

- **Primary**: `#E8B701` (Dourado)
- **Dark**: `#1a1a1a` (Background)
- **Secondary Dark**: `#2a2a2a`
- **Gray Scale**: 100-900

### Tipografia

- **Display**: Playfair Display (700-900) - Títulos
- **Body**: Poppins (300-800) - Texto geral

### Efeitos

- **Glassmorphism**: `backdrop-filter: blur(30px)`
- **Gradientes**: Dark gradients com overlay
- **Sombras**: `0 8px 32px rgba(0,0,0,0.3)`
- **Hover**: `transform: translateY(-4px)` + shadow boost

### Componentes

- **Cards**: Border radius 20px, gradient backgrounds
- **Botões**: 5 variantes (primary, secondary, success, danger, cancel)
- **Inputs**: Dark theme, yellow focus borders
- **Badges**: Status coloridos com borders

---

## 📱 Responsividade

### Breakpoints

- **Desktop**: > 1400px (layout completo)
- **Tablet**: 768px - 1400px (layout ajustado)
- **Mobile**: < 768px (layout vertical)

### Ajustes por Dispositivo

- **Desktop**: Grid 3 colunas, tabelas completas
- **Tablet**: Grid 2 colunas, navegação adaptada
- **Mobile**: 1 coluna, menu hamburger, formulários verticais

---

## 🔒 Segurança

- **Autenticação JWT**: Tokens seguros com expiração
- **Proteção CORS**: Configurado para desenvolvimento
- **Validação Backend**: Todos os dados validados server-side
- **Permissões**: Rotas staff protegidas (is_staff=True)
- **SQL Injection**: Protegido pelo Django ORM
- **XSS**: React escapa automaticamente o output

---

## 🐛 Troubleshooting

### Backend não inicia

```bash
# Verificar se o ambiente virtual está ativo
which python  # deve mostrar path do venv

# Reinstalar dependências
pip install -r requirements.txt  # se existir
```

### Frontend não carrega

```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Erro de CORS

- Verificar se backend está em `localhost:8000`
- Verificar `CORS_ALLOWED_ORIGINS` em `settings.py`

### Tabelas não aparecem

```bash
# Criar algumas mesas de teste
python manage.py shell
>>> from tables.models import Table
>>> Table.objects.create(number=1, seats=2, is_active=True)
>>> Table.objects.create(number=2, seats=4, is_active=True)
```

---

## 📝 Notas de Desenvolvimento

### Próximas Features

- [ ] Notificações por email
- [ ] Sistema de avaliações
- [ ] Integração com pagamentos
- [ ] Multi-restaurante
- [ ] App mobile nativa
- [ ] Dashboard analytics avançado

### Melhorias Futuras

- [ ] Testes unitários (Jest + Pytest)
- [ ] CI/CD pipeline
- [ ] Docker containerization
- [ ] PostgreSQL em produção
- [ ] Redis para cache
- [ ] WebSockets para updates real-time

---

## 👨‍💻 Autor

Desenvolvido com ❤️ por gcsilva

---

## 📄 Licença

Este projeto é privado e não possui licença pública.

---

## 🙏 Agradecimentos

- **Unsplash**: Imagens de background
- **Google Fonts**: Poppins e Playfair Display
- **Recharts**: Biblioteca de gráficos
- **FullCalendar**: Componente de calendário
- **React Community**: Ferramentas e bibliotecas

---

**Enjoy coding! 🚀**
