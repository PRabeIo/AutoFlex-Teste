# AutoFlex Production Planner

Sistema web para **gestão de matérias-primas, produtos e planejamento de produção**.

O sistema calcula automaticamente **quais produtos podem ser produzidos com o estoque disponível**, utilizando um algoritmo **Greedy** que prioriza produtos de **maior valor unitário**, maximizando o valor total da produção sugerida.

---

# Live Demo
  
https://auto-flex-teste-qcbb.vercel.app

---

# Demonstração

## Desktop

### Raw Materials

![Raw Materials Screenshot](./screenshots/raw-materials.png)

---

### Products

![Products Screenshot](./screenshots/products.png)

---

### Production Suggestion

![Production Suggestion Screenshot](./screenshots/production.png)

---

## Mobile

### Raw Materials

![Raw Materials Screenshot](./screenshots/mobile/raw-materials.png)

---

### Products

![Products Screenshot](./screenshots/mobile/products.png)

---

### Production Suggestion

![Production Suggestion Screenshot](./screenshots/mobile/production.png)

---

# Arquitetura do Projeto

```bash
AutoFlex/
├── backend/
│   ├── api/
│   │
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── routes/
│   │   ├── scripts/
│   │   ├── services/
│   │   ├── utils/
│   │   ├── app.js
│   │   └── server.js
│   │   
│   ├── tests/
│   │     ├── integration/
│   │     └── unit/
│   │   
│   ├── .env.example
│   └── schema.sql
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Production/
│   │   │   ├── Products/
│   │   │   └── RawMaterials/
│   │   │
│   │   ├── assets/
│   │   ├── layout/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   │   
│   ├── public/
│   └── .env.example
│
├── screenshots/
└── README.md
```


O projeto é dividido em duas aplicações:

## Backend

API REST responsável por:

- Gerenciamento de matérias-primas
- Gerenciamento de produtos
- Gerenciamento da estrutura de materiais (BOM)
- Cálculo da sugestão de produção

Tecnologias utilizadas:

- Node.js
- Express
- PostgreSQL
- SQL puro utilizando o driver `pg`

---

### Arquitetura Backend

| Camada      | Responsabilidade                       |
| ----------- | -------------------------------------- |
| Routes      | Definir endpoints                      |
| Controllers | Receber requisição e retornar resposta |
| Services    | Regras de negócio                      |
| DB          | Conexão com banco                      |

---

## Frontend

Aplicação web responsável pela interface do sistema.

Tecnologias utilizadas:

- React
- Vite
- CSS puro

---

# Algoritmo de Planejamento

O planejamento de produção utiliza uma estratégia **Greedy**.

O processo funciona da seguinte forma:

1. Os produtos são ordenados por **maior preço unitário**
2. Para cada produto é calculada a **quantidade máxima que pode ser produzida**
3. O estoque de matérias-primas é consumido
4. O processo continua até esgotar os recursos disponíveis

Devido à priorização por valor, **produtos de menor valor podem não aparecer na sugestão caso matérias-primas compartilhadas sejam totalmente consumidas por produtos mais valiosos.**

---

# Estrutura do Banco

## raw_material

```sql
id
code CHAR(10)
name
stock_quantity
```

---

## product

```sql
id
code CHAR(10)
name
price
```

---

## product_raw_material (BOM - Bill of Materials)

Tabela responsável por associar produtos às matérias-primas necessárias para sua produção.

```sql
product_id
raw_material_id
required_quantity
```

---

# Endpoints da API

```bash
GET /api/raw-materials
POST /api/raw-materials
PUT /api/raw-materials/:id
DELETE /api/raw-materials/:id

GET /api/products
POST /api/products
PUT /api/products/:id
DELETE /api/products/:id

GET /api/products/:productId/materials
POST /api/products/:productId/materials
PUT /api/products/:productId/materials/:itemId
DELETE /api/products/:productId/materials/:itemId

GET /api/production/suggestion
```

---

# Como rodar localmente

## Criar o Banco

1. Acesse o site do Supabase:

https://supabase.com

2. Crie uma conta ou faça login.

3. Clique em **New Project**.

4. Defina:

- Nome do projeto
- **Senha do banco**

⚠️ **Guarde a senha escolhida**, ela será utilizada na string de conexão.

5. Após o projeto ser criado, vá em SQL Editor

6. Execute o conteúdo do arquivo backend/schema.sql no SQL Editor do Supabase.

```bash
backend/schema.sql
```

Esse script criará todas as tabelas necessárias.

7. No topo da página clique em:

```bash
Connect
```

8. Copie a **Direct Connection String**.

Ela terá o formato:

```bash
postgresql://postgres:SUA-SENHA@db.<project-ref>.supabase.co:5432/postgres
```

## Backend

Abrir um terminal e entrar na pasta do backend:

```bash
cd backend
```

Instalar dependências:

```bash
npm install
```

Criar arquivo `.env` baseado no `.env.example`:

```bash
PORT=3001
DATABASE_URL=postgresql://postgres:SUA-SENHA@db.<project-ref>.supabase.co:5432/postgres
```

Executar servidor:

```bash
npm run dev
```

API disponível em:

```
http://localhost:3001
```

---

## Frontend

Abrir outro terminal e entrar na pasta do frontend:

```bash
cd frontend
```

Instalar dependências:

```bash
npm install
```

Criar arquivo `.env` baseado no `.env.example`:

```bash
VITE_API_URL=http://localhost:3001/api
```

Executar aplicação:

```bash
npm run dev
```

Aplicação disponível em:

```
http://localhost:5173
```

---

# Testes

O backend possui testes automatizados utilizando **Jest** e **Supertest**.

Tipos de testes incluídos:

- Testes unitários (validators e algoritmo de planejamento)
- Testes de integração da API

Executar testes:

```bash
npm test
```

---

# Interface

A interface foi desenvolvida com foco em **simplicidade e responsividade**.

Características:

- Layout limpo
- Sidebar fixa no desktop
- Menu hamburger no mobile
- Tabelas no desktop
- Cards no mobile

---

# Responsividade

A interface foi construída utilizando abordagem **mobile-first**.

Estratégia de layout:

Mobile:
- Cards

Desktop:
- Tables
- Sidebar fixa

---

# Tech Stack

## Backend

- Node.js
- Express
- PostgreSQL
- pg

## Frontend

- React
- Vite
- CSS

## Infraestrutura

- Supabase (PostgreSQL)
- Vercel (deploy)

---

# Autor

Desenvolvido por **Paulo Eduardo Lima Rabelo**

