# EntrePlanos / Filminis frontend

JavaScript React application implemented from the supplied Filminis Figma file and connected to the existing Python backend. Includes homepage, searchable catalog, film details, login and registration, profile editing, browser-local favorites, a two-step film submission wizard with confirmation, and administrator approval/edit/delete screens.

## Run locally

1. Open PowerShell in `Filminis-FRONT/EntrePlanos`.
2. Use a Node version supported by the installed Vite version (Node 22.12+ or current LTS).
3. Install dependencies and create local configuration:

   ```powershell
   npm install
   Copy-Item .env.example .env
   ```

4. Set `VITE_API_URL` to the backend origin. Default: `http://localhost:8000`. `VITE_REQUEST_TIMEOUT_MS` defaults to `15000`. Vite variables are public and must never contain secrets. Restart Vite after changing them.
5. Start the backend in another terminal. Its environment must contain HOST, PORT, DB_HOST, DB_PORT, DB_NAME, DB_USER and DB_PASSWORD, and its MySQL database must be provisioned with the repository SQL. Do not overwrite an existing backend `.env`.

   ```powershell
   cd ..\..\Filminis-BACK\FILMESERVER
   python -m pip install -r requirements.txt
   python server.py
   ```

6. Start the frontend from the frontend directory:

   ```powershell
   npm run dev
   ```

7. Open the URL printed by Vite, normally `http://localhost:5173`.

Create a user through the registration form or use an existing backend account. Admin pages require an account whose backend role is `admin`. The UI does not grant roles. Authentication tokens stay in memory; reloading requires signing in again. Favorites persist per account in this browser.

## Build and checks

```powershell
npm run lint
npx playwright install chromium
npm test
npm run build
npm run preview
```

`npm test` builds the production bundle and tests it in headless Chromium. The tests serve bundled files through request interception and mock the inspected backend contract, so no listening web server or MySQL instance is needed. Screenshots are written to ignored `test-results/`. Tests cover viewport overflow at 320/768/1024/1440px, filtering, login encoding, protected routes, favorites, submission payloads, approval, retries and token refresh.

Deploy `dist/` to static hosting. Hash routes work without a rewrite rule. Serve over HTTPS and set the production API origin before building.

## Structure

```text
src/
  components/   Shared presentation components and layout; PropTypes contracts
  pages/        Route containers and page-specific interaction
  hooks/        Resource lifecycle, session, routing, local favorites
  services/     Fetch transport and all backend endpoint wrappers
  styles/       Design tokens, responsive CSS and interaction states
  utils/        Data normalization, image URL validation, formatting
  config.js     Public environment configuration
public/design/  Local Figma images/icons, fonts and font licenses
tests/          Browser integration tests against mocked API contracts
docs/           Figma audit and backend contract / gaps
```

Only PropTypes was added as a runtime dependency. Playwright is a development dependency. The existing React, Vite, CSS and React Compiler setup is retained.

## Design and backend limits

See [design audit](docs/DESIGN.md), [API contract](docs/API.md), [component documentation](src/components/README.md) and [page documentation](src/pages/README.md).

Figma rate limits blocked some frame contexts and the search context request timed out. Those variants reuse retrieved design foundations; exact parity for them remains unverified. The API lacks favorites, per-user submission history and rejection endpoints. Favorites are explicitly local; unsupported actions are explained rather than simulated. Film posters and account details come from the API rather than Figma sample records.

The live backend was not running during implementation. Validate authentication, database serialization and mutations against your actual MySQL-backed server before deployment.
