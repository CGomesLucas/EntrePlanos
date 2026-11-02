import { config } from "../config";
import { normalizeMovie } from "../utils/movies";

let tokens = null;
let refreshPromise = null;
export const session = {
  get: () => tokens,
  set: (value) => {
    tokens = value;
    window.dispatchEvent(new Event("sessionchange"));
  },
  clear: () => {
    tokens = null;
    window.dispatchEvent(new Event("sessionchange"));
  },
};

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export async function request(
  path,
  { method = "GET", body, form = false, signal, retry = true } = {},
) {
  const controller = new AbortController();
  const abort = () => controller.abort(signal?.reason);
  if (signal?.aborted) abort();
  signal?.addEventListener("abort", abort, { once: true });
  const timeout = setTimeout(() => controller.abort(), config.requestTimeout);
  const headers = { Accept: "application/json" };
  if (tokens?.access_token)
    headers.Authorization = `Bearer ${tokens.access_token}`;
  if (body !== undefined)
    headers["Content-Type"] = form
      ? "application/x-www-form-urlencoded"
      : "application/json";
  try {
    const response = await fetch(`${config.apiUrl}${path}`, {
      method,
      headers,
      signal: controller.signal,
      body:
        body === undefined
          ? undefined
          : form
            ? new URLSearchParams(body)
            : JSON.stringify(body),
    });
    // Share one refresh between simultaneous protected requests, then retry once.
    if (
      response.status === 401 &&
      retry &&
      tokens?.refresh_token &&
      !["/refresh", "/send_loginho", "/logout"].includes(path)
    ) {
      if (!refreshPromise) {
        refreshPromise = request("/refresh", {
          method: "POST",
          body: { refresh_token: tokens.refresh_token },
          retry: false,
        })
          .then((result) => session.set({ ...tokens, ...result }))
          .catch((error) => {
            session.clear();
            throw error;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }
      await refreshPromise;
      return request(path, { method, body, form, signal, retry: false });
    }
    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      throw new ApiError(
        "O servidor retornou uma resposta inválida.",
        response.status,
      );
    }
    if (!response.ok || data?.error)
      throw new ApiError(
        data?.error || `Falha na requisição (${response.status}).`,
        response.status,
      );
    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (signal?.aborted) throw error;
    throw new ApiError(
      error.name === "AbortError"
        ? "O servidor demorou para responder. Tente novamente."
        : "Não foi possível conectar ao servidor. Verifique se a API está disponível.",
      0,
    );
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}

const query = (path, id) => `${path}?${new URLSearchParams({ id })}`;
export const api = {
  movies: async (signal) =>
    ((await request("/listagem", { signal })) || []).map(normalizeMovie),
  movie: async (id, signal) => {
    const data = await request(query("/filme", id), { signal });
    if (!data) throw new ApiError("Filme não encontrado.", 404);
    return normalizeMovie(data);
  },
  lookup: (type, signal) => request(`/${type}`, { signal }),
  login: async (body) => {
    const result = await request("/send_loginho", {
      method: "POST",
      body,
      form: true,
    });
    session.set(result);
    return result;
  },
  register: (body) => request("/register", { method: "POST", body }),
  me: (signal) => request("/me", { signal }),
  editMe: (body) => request("/edit/me", { method: "PATCH", body }),
  logout: async () => {
    try {
      if (tokens?.refresh_token)
        await request("/logout", {
          method: "POST",
          body: { refresh_token: tokens.refresh_token },
          retry: false,
        });
    } finally {
      session.clear();
    }
  },
  createMovie: (body) => request("/cadastrani", { method: "POST", body }),
  editMovie: (id, body) =>
    request(query("/filme", id), { method: "PATCH", body }),
  pending: async (signal) =>
    ((await request("/filmesPendentes", { signal })) || []).map(normalizeMovie),
  approve: (id) => request(query("/aprovafilme", id), { method: "PUT" }),
  remove: (resource, id) =>
    request(query(`/${resource}`, id), { method: "DELETE" }),
  users: (signal) => request("/usuarios", { signal }),
  setRole: (id, role) =>
    request(query("/user/role", id), { method: "PATCH", body: { role } }),
  addLookup: (body) => request("/addCat", { method: "POST", body, form: true }),
  person: (type, id, signal) => request(query(`/${type}`, id), { signal }),
  editPerson: (type, id, body) =>
    request(query(`/${type}`, id), { method: "PATCH", body }),
};
