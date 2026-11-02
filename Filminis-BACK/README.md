# Filminis API

Sistema de gerenciamento de filmes com autenticação JWT, controle de usuários, moderação de conteúdo e gerenciamento de atores, diretores, categorias, produtoras, linguagens e países.

---

# Sobre o Projeto

O **Filminis API** é um backend desenvolvido em **Python + MySQL** que permite o gerenciamento completo de um catálogo de filmes.

A aplicação possui:

- Cadastro de usuários
- Login com JWT
- Refresh Token
- Logout com blacklist
- Controle de permissões (Admin/User)
- Cadastro de filmes
- Aprovação de filmes
- Cadastro de atores e diretores
- Cadastro de categorias
- Cadastro de produtoras
- Cadastro de linguagens
- Cadastro de países
- Fotos por URL para atores, diretores e usuários
- Edição parcial utilizando PATCH
- Testes automatizados

---

# Tecnologias Utilizadas

- Python 3
- MySQL
- JWT (implementação própria)
- SimpleHTTPRequestHandler
- unittest
- requests
- Swagger / OpenAPI

---

# Estrutura do Projeto

```text
FILMESERVER/
│
├── api/
│   ├── auth.py
│   ├── endpoints.py
│   │
│   └── handlers/
│       ├── auth.py
│       ├── users.py
│       └── filme.py
│
├── infra/
│   ├── database.py
│   ├── users_database.py
│   ├── actorsDirectors.py
│   └── genresProducers.py
│
├── etc/
│   └── colors.py
│
├── docs/
│   ├── swagger.yaml
│   └── index.html
│
├── test/
│   ├── test_filmes.py
│   ├── test_actor_director.py
│   ├── test_users.py
│   └── ...
│
├── server.py
└── README.md
```

---

# Como Rodar o Projeto

## 1. Clonar o repositório

```bash
git clone https://github.com/marianymorais/Filminis-BACK

cd FILMESERVER
```

---

## 2. Criar ambiente virtual

### Windows

```bash
python -m venv venv

venv\Scripts\activate
```

### Linux

```bash
python -m venv venv

source venv/bin/activate
```

---

## 3. Instalar dependências

```bash
pip install -r requirements.txt
```

---

## 4. Configurar Banco de Dados

Crie o banco:

```sql
CREATE DATABASE filme_mari;
```

Execute:

```text
filme_Mari-DDL-DML.sql
```

---

## 5. Configurar credenciais

Atualize os dados de conexão:
Faça uma copia do arquivo

```text
.env.example
```
Para um arquivo
```text
.env
```
---

## 6. Executar servidor

```bash
python server.py
```

Ou:

```bash
.\start-dev.bat
```

---

# Autenticação JWT

A API utiliza:

- Access Token
- Refresh Token
- Blacklist de Refresh Tokens
- Controle de permissões por Role

---

## Roles Disponíveis

### User

Pode:

- Cadastrar filmes
- Cadastrar atores
- Cadastrar diretores
- Cadastrar categorias
- Cadastrar produtoras
- Cadastrar linguagens
- Cadastrar países

---

### Admin

Possui todas as permissões do usuário comum e também pode:

- Aprovar filmes
- Editar filmes
- Excluir filmes
- Editar atores
- Editar diretores
- Excluir atores
- Excluir diretores
- Alterar roles de usuários
- Acessar filmes pendentes

---

# Fluxo de Aprovação de Filmes

Quando um usuário comum cria um filme:

```text
istatus = pendente
```

Quando um administrador cria um filme:

```text
istatus = aprovado
```

Depois um administrador pode aprovar o filme utilizando:

```http
PUT /aprovafilme?id=...
```

---

# Endpoints de Autenticação

| Método | Endpoint | Descrição | Proteção |
|----------|----------|----------|----------|
| POST | `/send_loginho` | Login | Público |
| POST | `/register` | Cadastro de usuário | Público |
| POST | `/refresh` | Renovar Access Token | Público |
| POST | `/logout` | Logout | Público |

---

# Usuários

| Método | Endpoint | Descrição | Proteção |
|----------|----------|----------|----------|
| GET | `/me` | Retorna usuário logado | Autenticado |
| PATCH | `/edit/me` | Atualiza perfil | Autenticado |
| GET | `/usuarios` | Lista usuários | Admin |
| PATCH | `/user/role?id=...` | Altera role | Admin |

---

# Filmes

| Método | Endpoint | Descrição | Proteção |
|----------|----------|----------|----------|
| GET | `/listagem` | Lista filmes | Público |
| GET | `/filme?id=...` | Busca filme por ID | Público |
| POST | `/cadastrani` | Cria filme | Autenticado |
| PATCH | `/filme?id=...` | Atualiza filme | Admin |
| GET | `/filmes-pendentes` | Lista filmes pendentes | Admin |
| PUT | `/aprovafilme?id=...` | Aprova filme | Admin |
| DELETE | `/filme?id=...` | Exclui filme | Admin |

---

# Atores

| Método | Endpoint | Descrição | Proteção |
|----------|----------|----------|----------|
| GET | `/atores` | Lista atores | Público |
| GET | `/ator?id=...` | Busca ator por ID | Público |
| PATCH | `/ator?id=...` | Edita ator | Admin |
| DELETE | `/atores?id=...` | Remove ator | Admin |

---

## Exemplo de retorno

```json
{
  "id": 12,
  "nome": "Tom",
  "sobrenome": "Hardy",
  "foto": "https://imagem.com/tom.jpg",
  "id_genero": 1
}
```

---

# Diretores

| Método | Endpoint | Descrição | Proteção |
|----------|----------|----------|----------|
| GET | `/diretores` | Lista diretores | Público |
| GET | `/diretor?id=...` | Busca diretor por ID | Público |
| PATCH | `/diretor?id=...` | Edita diretor | Admin |
| DELETE | `/diretores?id=...` | Remove diretor | Admin |

---

## Exemplo de retorno

```json
{
  "id": 4,
  "nome": "Denis",
  "sobrenome": "Villeneuve",
  "foto": "https://imagem.com/denis.jpg",
  "id_genero": 1
}
```

---

# Dados Auxiliares

| Método | Endpoint | Descrição | Proteção |
|----------|----------|----------|----------|
| GET | `/categorias` | Lista categorias | Público |
| GET | `/produtoras` | Lista produtoras | Público |
| GET | `/linguagens` | Lista linguagens | Público |
| GET | `/paises` | Lista países | Público |

---

# Cadastro de Dados Auxiliares

Endpoint utilizado para criar:

- Atores
- Diretores
- Categorias
- Produtoras
- Linguagens
- Países

---

## Endpoint

```http
POST /addCat
```

### Proteção

```text
Usuário autenticado
```

---

## Exemplo - Ator

```text
cat=Atores Principais
nome=Tom Hardy
genero=1
foto=https://imagem.com/tom.jpg
```

---

## Exemplo - Diretor

```text
cat=Diretores
nome=Denis Villeneuve
genero=1
foto=https://imagem.com/denis.jpg
```

---

## Exemplo - Categoria

```text
cat=Categorias
nome=Aventura
```

---

## Exemplo - Produtora

```text
cat=Produtora
nome=Warner Bros.
```

---

# Testes Automatizados

Executar todos os testes:

```bash
python -m unittest discover test -v
```

---

Executar apenas o CRUD de atores e diretores:

```bash
python -m unittest test.test_actor_director -v
```

---

Executar um único teste:

```bash
python -m unittest test.test_actor_director.TestActorDirectorCRUD.test_01_cadastra_ator
```

---

# Swagger / OpenAPI

A documentação interativa está disponível em:

```http
http://localhost:8000/docs
```

Com ela é possível:

- Visualizar endpoints
- Testar requisições
- Validar JWT
- Consultar exemplos de payloads
- Ver códigos de retorno

---

# Recursos Implementados

- JWT Authentication
- Refresh Token
- Logout
- Controle Admin/User
- CRUD de Filmes
- CRUD de Atores
- CRUD de Diretores
- Fotos por URL
- Aprovação de Filmes
- PATCH Parcial
- Testes Automatizados
- Swagger/OpenAPI
- Integração MySQL

---

# Desenvolvido para o Projeto Filminis

Backend acadêmico desenvolvido para gerenciamento colaborativo de filmes, atores e diretores, com fluxo de moderação e autenticação baseada em JWT.