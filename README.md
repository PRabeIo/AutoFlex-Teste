# AutoFlex Production Planner

Sistema web para **gestão de matérias-primas, produtos e planejamento de produção**, desenvolvido como teste técnico.

O sistema calcula automaticamente **quais produtos devem ser produzidos com o estoque disponível**, utilizando um algoritmo **Greedy (ganancioso)** para maximizar o valor total da produção.

---

# Demonstração

## Raw Materials

![Raw Materials Screenshot](./screenshots/raw-materials.png)

---

## Products

![Products Screenshot](./screenshots/products.png)

---

## Production Suggestion

![Production Suggestion Screenshot](./screenshots/production.png)

---

# Arquitetura do Projeto

```bash
AutoFlex/
├── backend/
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
│   ├── test/
│   │   ├── integration/
│   │   └── unit/
│   ├── .env.example
│   └── schema.sql
│
├── frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Production/
│   │   │   ├── Products/
│   │   │   └── RawMaterials/
│   │   ├── assets/
│   │   ├── layout/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jss
│   ├── public/   
│   └── .env.example   
│
├── screenshots/
└── README.md 
```

O projeto foi dividido em duas aplicações:

## Backend

API REST responsável por:

* Gerenciamento de matérias-primas
* Gerenciamento de produtos
* Gerenciamento da estrutura de materiais (BOM)
* Cálculo da sugestão de produção

Tecnologias:

* Node.js
* Express
* PostgreSQL
* SQL puro (sem ORM)

---

## Frontend

Aplicação web responsável pela interface do sistema.

Tecnologias:

* React
* Vite
* CSS puro (sem frameworks)

---

# Decisões Técnicas

## Sem ORM

Foi utilizado **SQL direto via `pg`** em vez de ORM.

Motivos:

* Melhor controle das queries
* Redução de complexidade
* Melhor desempenho
* Projeto pequeno não justifica camada ORM

---

## Arquitetura Backend

Responsabilidades:

| Camada      | Responsabilidade                       |
| ----------- | -------------------------------------- |
| Routes      | Definir endpoints                      |
| Controllers | Receber requisição e retornar resposta |
| Services    | Regras de negócio                      |
| DB          | Conexão com banco                      |

---

## Algoritmo de Planejamento

O planejamento utiliza uma estratégia **Greedy**:

1. Ordena produtos por **maior preço**
2. Para cada produto calcula **quantas unidades podem ser produzidas**
3. Consome o estoque
4. Continua até esgotar as matérias-primas

---

### Exemplo

Estoque:

```
Plastic: 100
Rubber: 50
```

Produtos:

```
Product A (valor 100)
Product B (valor 80)
```

Resultado:

```
Produzir primeiro o produto de maior valor.
```

---

# Estrutura do Banco

## raw_material

```
id
code CHAR(10)
name
stock_quantity
```

---

## product

```
id
code CHAR(10)
name
price
```

---

## product_raw_material (BOM)

Tabela de relação entre produto e matéria-prima.

```
product_id
raw_material_id
required_quantity
```

---

# Backend

## Instalação

Dentro da pasta backend:

```
npm install
```

---

## Configuração

Criar arquivo `.env`:

```env
PORT=3001

DATABASE_URL=postgresql://postgres:Sua_Senha@db.lchpurmaprqvjraswlds.supabase.co:5432/postgres

```

---

## Executar

```bash
npm run dev
```

API:

```
http://localhost:3001
```

---

# Endpoints da API

## Raw Materials

### Listar

```
GET /api/raw-materials
```

---

### Criar

```
POST /api/raw-materials
```

Body:

```
{
  "code": "RM00000001",
  "name": "Plastic",
  "stockQuantity": 100
}
```

---

### Atualizar

```
PUT /api/raw-materials/:id
```

---

### Deletar

```
DELETE /api/raw-materials/:id
```

---

## Products

### Listar

```
GET /api/products
```

---

### Criar

```
POST /api/products
```

```
{
  "code": "P000000001",
  "name": "Rubber Grip",
  "price": 10.50
}
```

---

### Atualizar

```
PUT /api/products/:id
```

---

### Deletar

```
DELETE /api/products/:id
```

---

## Production Suggestion

Calcula o planejamento de produção com base no estoque.

```
GET /api/production/suggestion
```

Exemplo de resposta:

```
{
  "suggestion": [
    {
      "productId": 1,
      "code": "P000000001",
      "name": "Rubber Grip",
      "unitPrice": 10,
      "suggestedQuantity": 5,
      "totalValue": 50
    }
  ],
  "grandTotalValue": 50
}
```

---

# Frontend

## Instalação

Dentro da pasta frontend:

```
npm install
```

---

## Executar

```
npm run dev
```

Aplicação:

```
http://localhost:5173
```

---

# Funcionalidades

## Raw Materials

* Criar matéria-prima
* Editar
* Deletar
* Visualizar estoque

---

## Products

* Criar produto
* Editar
* Deletar
* Definir preço

---

## Production Suggestion

* Cálculo automático da produção
* Visualização do valor total gerado
* Lista de produtos a produzir

---

# Interface

O frontend foi desenvolvido com foco em:

* Layout limpo
* Responsividade
* Experiência simples de uso

Características:

* Sidebar fixa no desktop
* Menu hamburger no mobile
* Tabelas no desktop
* Cards no mobile

---

# Responsividade

O layout foi desenvolvido com abordagem **mobile-first**.

Estratégia:

Mobile:

```
Cards
```

Desktop:

```
Tables
Sidebar fixa
```

---

# Autor

Desenvolvido por **Paulo Eduardo Lima Rabelo**

Teste técnico — AutoFlex.
