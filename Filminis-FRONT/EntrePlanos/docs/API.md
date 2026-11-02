# Backend contract

Services are implemented against Filminis-BACK/FILMESERVER/api/endpoints.py and its handlers. Configure the origin using VITE_API_URL. The default is http://localhost:8000. Backend routes have no /api prefix.

| Method | Endpoint                                                                   | Client method / encoding                                                                                    |
| ------ | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| GET    | /listagem                                                                  | movies, normalizes JSON-string category arrays                                                              |
| GET    | /filme?id=                                                                 | movie, accepts poster rather than imagem                                                                    |
| GET    | /categorias, /produtoras, /paises, /linguagens, /diretores, /atores        | lookup                                                                                                      |
| GET    | /ator?id=, /diretor?id=                                                    | person                                                                                                      |
| POST   | /send_loginho                                                              | login, URL-encoded email/password                                                                           |
| POST   | /register                                                                  | register, JSON nome/sobrenome/apelido/email/senha/data_nascimento/foto                                      |
| POST   | /refresh                                                                   | JSON refresh_token; concurrent protected calls share a refresh                                              |
| POST   | /logout                                                                    | JSON refresh_token; local session always cleared                                                            |
| GET    | /me                                                                        | me, Bearer access token                                                                                     |
| PATCH  | /edit/me                                                                   | editMe, JSON editable profile fields                                                                        |
| POST   | /cadastrani                                                                | createMovie, JSON titulo/ano/duracao/imagem/sinopse/orcamento and relationship ID arrays                    |
| PATCH  | /filme?id=                                                                 | editMovie, JSON; sends changed relationships using categorias/produtoras/paises/linguagens/diretores/atores |
| GET    | /filmesPendentes                                                           | pending, admin only                                                                                         |
| PUT    | /aprovafilme?id=                                                           | approve, admin only                                                                                         |
| DELETE | /filme?id=                                                                 | remove('filme', id), admin only                                                                             |
| DELETE | /atores, /diretores, /categorias, /produtoras, /linguagens, /paises + ?id= | remove(resource, id)                                                                                        |
| GET    | /usuarios                                                                  | users, admin only                                                                                           |
| PATCH  | /user/role?id=                                                             | setRole, JSON role                                                                                          |
| POST   | /addCat                                                                    | addLookup, form-encoded cat/nome and optional genero/foto                                                   |
| PATCH  | /ator?id=, /diretor?id=                                                    | editPerson, JSON                                                                                            |

The service exposes existing endpoints even where there is no corresponding Figma management screen. User administration and lookup CRUD do not have invented UI pages.

Create uses categoria_id, produtora_id, pais_origem_id, linguagem_id, diretor_id and atores_ids arrays. Editing uses different relationship names. The server chooses aprovado/pendente from the authenticated role. The client never sets that status. Budget is sent as an unformatted integer string to match backend parsing. Duration uses MySQL-compatible HH:MM:SS.

Access and refresh tokens stay in memory, so reloading the page requires logging in again. This avoids persistent browser token storage. Favorites alone use per-account localStorage. Network timeouts, HTTP errors, JSON error objects and malformed JSON produce readable messages; stale resource requests are cancelled.

## Backend gaps

- No favorites routes: favorites are browser-local and labeled accordingly.
- No per-user submission list/ownership data: the profile requests tab states that history is unavailable.
- No rejection route: admin approval and deletion are implemented; deletion is never presented as rejection.
- No poster backdrop or cast photo fields in film-detail results: these are not fabricated from the sample Figma film.
- Film details omit country IDs and relation IDs. Untouched relationships are omitted from PATCH to prevent silent clearing. Name-to-ID matching is used only for initial selection; duplicate human-readable names remain a backend contract limitation.
- Pending-film results omit categories. The admin loader merges them with catalog records where available.

The backend was not running during implementation. Browser integration tests mock these inspected contracts; a live MySQL-backed end-to-end run remains necessary in the deployment environment.
