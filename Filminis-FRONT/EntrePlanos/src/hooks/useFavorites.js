import { useState } from "react";
import { config } from "../config";

export function useFavorites(user) {
  const key = `${config.storagePrefix}:favorites:${user?.id || user?.email || "guest"}`;
  const [, setVersion] = useState(0);
  let favorites = [];
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "[]");
    if (Array.isArray(saved))
      favorites = saved.filter(
        (item) => item && item.id != null && typeof item.titulo === "string",
      );
  } catch {
    /* Storage can be unavailable in private browsing. */
  }
  function toggle(movie) {
    const next = favorites.some((item) => item.id === movie.id)
      ? favorites.filter((item) => item.id !== movie.id)
      : [...favorites, movie];
    try {
      localStorage.setItem(key, JSON.stringify(next));
      setVersion((value) => value + 1);
    } catch {
      throw new Error("Não foi possível salvar os favoritos neste navegador.");
    }
  }
  return { favorites, toggle };
}
