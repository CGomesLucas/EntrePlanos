export function categories(value) {
  if (typeof value === "string") {
    try {
      return categories(JSON.parse(value));
    } catch {
      return value
        .split(",")
        .filter(Boolean)
        .map((nome) => ({ nome: nome.trim() }));
    }
  }
  return (value || [])
    .filter(Boolean)
    .map((item) => (typeof item === "string" ? { nome: item } : item))
    .filter((item) => item.nome);
}

export function normalizeMovie(movie) {
  return {
    ...movie,
    id: movie.id ?? movie.id_filme,
    imagem: safeImage(movie.imagem || movie.poster),
    categorias: categories(movie.categorias),
  };
}

export function safeImage(value) {
  if (!value) return "";
  try {
    const url = new URL(value, window.location.origin);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

export const personName = (person) =>
  [person.nome || person.valor, person.sobrenome].filter(Boolean).join(" ");
export const money = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
