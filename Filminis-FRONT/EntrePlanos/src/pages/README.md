# Page components

| Component     | Inputs                                   | Data / behavior                                                              |
| ------------- | ---------------------------------------- | ---------------------------------------------------------------------------- |
| CatalogPage   | search?, initialQuery?, initialCategory? | Approved catalog; client-side title/category filters                         |
| LoginPage     | onLogin, next?                           | Login, register, busy and server error handling                              |
| MoviePage     | id, user?, favorites, onFavorite         | Film details and browser-local favorites                                     |
| MovieFormPage | id?, user                                | Lookup resources; create wizard or admin edit; mutation confirmation         |
| ProfilePage   | user, favorites, refresh                 | Profile data, favorites, personal-data update                                |
| AdminPage     | none                                     | Admin catalog, pending requests, approval, edit links and confirmed deletion |

App enforces login/admin guards before mounting protected pages. Backend authorization still validates every protected request. Page props are documented through PropTypes. useResource cancels stale/unmounted requests. Hash routing supports direct links without a production-server rewrite rule.
