import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

// Serve the production build through browser request interception. This tests
// the actual bundled app without requiring a listening server in restricted CI.
test.beforeEach(async ({ page }) => {
  await page.route("http://filminis.test/**", async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    const file = pathname === "/" ? "index.html" : pathname.slice(1);
    if (file.includes("..")) return route.abort();
    try {
      const body = await readFile(new URL(`../dist/${file}`, import.meta.url));
      const extension = file.split(".").pop();
      const types = {
        html: "text/html",
        js: "text/javascript",
        css: "text/css",
        svg: "image/svg+xml",
        png: "image/png",
        ttf: "font/ttf",
      };
      await route.fulfill({
        body,
        contentType: types[extension] || "application/octet-stream",
      });
    } catch {
      await route.fulfill({ status: 404, body: "Not found" });
    }
  });
});

const movie = {
  id: 1,
  titulo: "The Empire Strikes Back",
  ano: 1980,
  duracao: "02:04:00",
  sinopse: "Luke inicia seu treinamento Jedi.",
  istatus: "aprovado",
  imagem: "",
  orcamento: 18000000,
  categorias: '[{"id":1,"nome":"Ficção Científica"}]',
};
const lookups = {
  categorias: [{ id: 1, nome: "Ficção Científica" }],
  produtoras: [{ id: 2, nome: "Lucasfilm Ltd." }],
  paises: [{ id: 3, nome: "Estados Unidos" }],
  linguagens: [{ id: 4, nome: "Inglês" }],
  diretores: [{ id: 5, nome: "Irvin", sobrenome: "Kershner" }],
  atores: [{ id: 6, nome: "Mark", sobrenome: "Hamill" }],
};

async function mockApi(page, role = "user") {
  const calls = [];
  await page.route("http://localhost:8000/**", async (route) => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    calls.push({
      path,
      method: request.method(),
      body: request.postData(),
      headers: request.headers(),
    });
    let data = lookups[path.slice(1)] || {};
    if (path === "/listagem")
      data = [
        movie,
        {
          ...movie,
          id: 2,
          titulo: "Toy Story",
          categorias: [{ id: 7, nome: "Animação" }],
        },
      ];
    if (path === "/filme")
      data = {
        ...movie,
        poster: movie.imagem,
        categorias: ["Ficção Científica"],
        diretores: [{ nome: "Irvin Kershner" }],
        produtoras: [{ nome: "Lucasfilm Ltd." }],
        linguagens: ["Inglês"],
        atores: [{ nome: "Mark Hamill" }],
      };
    if (path === "/send_loginho")
      data = { access_token: "test-access", refresh_token: "test-refresh" };
    if (path === "/me")
      data = {
        id: 1,
        nome: "Lucas",
        sobrenome: "Gomes",
        email: "lucas@example.com",
        role,
      };
    if (path === "/filmesPendentes")
      data = [{ ...movie, id: 3, titulo: "Novo filme", istatus: "pendente" }];
    if (path === "/cadastrani")
      data = {
        id: 4,
        status: role === "admin" ? "aprovado" : "pendente",
        message: "Filme enviado para aprovação",
      };
    if (path === "/aprovafilme")
      data = { message: "Filme aprovado com sucesso" };
    await route.fulfill({
      json: data,
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  });
  return calls;
}

async function login(page, next = "/perfil") {
  await page.goto(`/#/login?next=${encodeURIComponent(next)}`);
  await page.getByLabel("Email", { exact: true }).fill("lucas@example.com");
  await page.getByLabel("Senha", { exact: true }).fill("senha123");
  await page.getByRole("button", { name: "Entrar", exact: true }).click();
}

for (const width of [320, 768, 1024, 1440]) {
  test(`catalog and login fit viewport ${width}`, async ({ page }) => {
    await mockApi(page);
    await page.setViewportSize({ width, height: 1024 });
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Recomendações para você" }),
    ).toBeVisible();
    await expect(page.locator(".movie-card")).toHaveCount(3);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    expect(
      await page
        .locator(".home-hero > img")
        .evaluate((img) => img.complete && img.naturalWidth > 0),
    ).toBe(true);
    await page.screenshot({
      path: `test-results/home-${width}.png`,
      fullPage: true,
    });
    await page.goto("/#/login");
    if (width === 1440) await page.screenshot({ path: 'test-results/login-1440.png', fullPage: true });
    await expect(
      page.getByRole("heading", { name: "Bem vindo", exact: true }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  });
}

test("search filters JSON categories and title", async ({ page }) => {
  await mockApi(page);
  await page.goto("/#/buscar");
  await expect(page.locator(".movie-card")).toHaveCount(2);
  await page.getByLabel("Pesquisar por título").fill("empire");
  await expect(page.locator(".movie-card")).toHaveCount(1);
  await page.getByLabel("Categoria", { exact: true }).selectOption("Animação");
  await expect(page.getByText("Nenhum filme encontrado.")).toBeVisible();
});

test("login uses form encoding, favorites persist, user cannot access admin", async ({
  page,
}) => {
  const calls = await mockApi(page);
  await login(page, "/filme/1");
  await page.getByRole("button", { name: "Adicionar aos Favoritos" }).click();
  await expect(
    page.getByRole("button", { name: "Remover dos Favoritos" }),
  ).toHaveAttribute("aria-pressed", "true");
  const loginCall = calls.find((call) => call.path === "/send_loginho");
  expect(loginCall.headers["content-type"]).toBe(
    "application/x-www-form-urlencoded",
  );
  expect(new URLSearchParams(loginCall.body).get("email")).toBe(
    "lucas@example.com",
  );
  await page.goto("/#/perfil");
  await expect(page.locator(".movie-card")).toHaveCount(1);
  await page.goto("/#/admin");
  await expect(
    page.getByRole("heading", { name: "Acesso restrito" }),
  ).toBeVisible();
  expect(calls.some((call) => call.path === "/filmesPendentes")).toBe(false);
});

test("two-step submission preserves draft and sends backend relationship IDs", async ({
  page,
}) => {
  const calls = await mockApi(page);
  await page.setViewportSize({ width: 320, height: 900 });
  await login(page, "/adicionar");
  await page.getByLabel("Título", { exact: true }).fill("Meu filme");
  await page.getByLabel("URL do pôster").fill("https://example.com/poster.png");
  await page.getByLabel("Ano", { exact: true }).fill("2024");
  await page.getByLabel("Duração").fill("02:04:00");
  await page.getByLabel("Sinopse").fill("Uma nova história.");
  await page
    .getByRole("button", { name: "Ficção Científica", exact: true })
    .click();
  await page.getByRole("button", { name: "Próximo", exact: true }).click();
  await page.getByRole("button", { name: "Anterior", exact: true }).click();
  await expect(page.getByLabel("Título", { exact: true })).toHaveValue(
    "Meu filme",
  );
  await page.getByRole("button", { name: "Próximo", exact: true }).click();
  await page
    .getByRole("button", { name: "Lucasfilm Ltd.", exact: true })
    .click();
  await page.getByRole("button", { name: "Mark Hamill", exact: true }).click();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Concluir", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "FILME ENVIADO PARA APROVAÇÃO!" }),
  ).toBeVisible();
  const payload = JSON.parse(
    calls.find((call) => call.path === "/cadastrani").body,
  );
  expect(payload).toMatchObject({
    titulo: "Meu filme",
    ano: 2024,
    categoria_id: [1],
    produtora_id: [2],
    atores_ids: [6],
  });
  expect(payload).not.toHaveProperty("istatus");
});

test("admin can approve pending films", async ({ page }) => {
  const calls = await mockApi(page, "admin");
  await login(page, "/admin");
  await page.getByRole("button", { name: "Aprovar", exact: true }).click();
  await expect(page.getByText("Filme aprovado com sucesso")).toBeVisible();
  expect(calls.find((call) => call.path === "/aprovafilme").method).toBe("PUT");
});

test("server errors can be retried", async ({ page }) => {
  await mockApi(page);
  let failed = true;
  await page.route("http://localhost:8000/listagem", (route) =>
    route.fulfill({
      status: failed ? 500 : 200,
      json: failed ? { error: "Banco indisponível" } : [movie],
    }),
  );
  await page.goto("/#/buscar");
  await expect(page.getByRole("alert")).toContainText("Banco indisponível");
  failed = false;
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await expect(page.locator(".movie-card")).toHaveCount(1);
});

test("expired access token refreshes once and retries a protected call", async ({
  page,
}) => {
  await mockApi(page);
  let meCalls = 0;
  let refreshCalls = 0;
  await page.route("http://localhost:8000/me", (route) => {
    meCalls++;
    return route.fulfill({
      status: meCalls === 1 ? 401 : 200,
      json:
        meCalls === 1
          ? { error: "Token expirado" }
          : { nome: "Lucas", email: "lucas@example.com", role: "user" },
    });
  });
  await page.route("http://localhost:8000/refresh", (route) => {
    refreshCalls++;
    return route.fulfill({ json: { access_token: "new-access" } });
  });
  await login(page);
  await expect(page.getByRole("heading", { name: /Lucas/ })).toBeVisible();
  expect(refreshCalls).toBe(1);
  expect(meCalls).toBe(2);
});

test("admin edit preserves untouched relationships and supports mobile profile", async ({
  page,
}) => {
  const calls = await mockApi(page, "admin");
  await login(page, "/editar/1");
  await page.getByLabel("Título", { exact: true }).fill("Título corrigido");
  await page.getByLabel('URL do pôster').fill('https://example.com/poster.png');
  await page
    .getByRole("button", { name: "Salvar Alterações", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "ALTERAÇÕES SALVAS" }),
  ).toBeVisible();
  const payload = JSON.parse(
    calls.find((call) => call.path === "/filme" && call.method === "PATCH")
      .body,
  );
  expect(payload.titulo).toBe("Título corrigido");
  for (const key of [
    "paises",
    "atores",
    "categorias",
    "produtoras",
    "linguagens",
    "diretores",
  ])
    expect(payload).not.toHaveProperty(key);
  await expect(page.locator(".success-page > img")).toBeVisible();
  expect(
    await page
      .locator(".success-page > img")
      .evaluate((img) => img.complete && img.naturalWidth > 0),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/admin-success.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 320, height: 900 });
  await page.goto("/#/perfil");
  await expect(
    page.getByRole("heading", { name: /Lucas Gomes/ }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  expect(
    await page
      .locator(".profile-cover > img")
      .evaluate((img) => img.complete && img.naturalWidth > 0),
  ).toBe(true);
  await page.screenshot({
    path: "test-results/profile-320.png",
    fullPage: true,
  });
});
