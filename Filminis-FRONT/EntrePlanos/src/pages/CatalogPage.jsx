import { useState } from "react";
import PropTypes from "prop-types";
import { api } from "../services/api";
import { useResource } from "../hooks/useResource";
import { Field, MovieGrid, Status } from "../components/ui";

export default function CatalogPage({
  search = false,
  initialQuery = "",
  initialCategory = "",
}) {
  const { data, loading, error, reload } = useResource(api.movies);
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState(initialCategory);
  const approved = (data || []).filter(
    (movie) => !movie.istatus || movie.istatus === "aprovado",
  );
  const options = [
    ...new Set(
      approved.flatMap((movie) => movie.categorias.map((item) => item.nome)),
    ),
  ].sort();
  const filtered = approved.filter(
    (movie) =>
      movie.titulo
        .toLocaleLowerCase("pt-BR")
        .includes(query.toLocaleLowerCase("pt-BR")) &&
      (!category || movie.categorias.some((item) => item.nome === category)),
  );
  return (
    <>
      {!search && (
        <section className="home-hero" aria-label="Cinema em destaque">
          <img
            src="/design/hero.png"
            alt="Cena de Babylon"
            fetchPriority="high"
          />
        </section>
      )}
      <div className={`page catalog ${search ? "" : "home-catalog"}`}>
        {search ? (
          <>
            <h1>Buscar filmes</h1>
            <div className="filters">
              <Field
                label="Pesquisar por título"
                type="search"
                placeholder="Encontre seu próximo filme…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <div className="field">
                <label htmlFor="catalog-category">Categoria</label>
                <select
                  id="catalog-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <option value="">Todas as categorias</option>
                  {options.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="muted" aria-live="polite">
              {filtered.length} filmes encontrados
            </p>
          </>
        ) : (
          <h2 className="section-title">Recomendações para você</h2>
        )}
        <Status
          loading={loading}
          error={error}
          onRetry={reload}
          empty={!loading && !error && !filtered.length}
        />
        {!loading && !error && (
          <MovieGrid movies={search ? filtered : approved.slice(0, 6)} />
        )}
        {!search && !loading && !error && (
          <>
            <h2 className="section-title">Opções pra Família</h2>
            <MovieGrid
              movies={approved
                .filter((movie) =>
                  movie.categorias.some((item) =>
                    /fam[ií]lia|anima[çc][aã]o|aventura/i.test(item.nome),
                  ),
                )
                .slice(0, 6)}
            />
          </>
        )}
      </div>
    </>
  );
}
CatalogPage.propTypes = {
  search: PropTypes.bool,
  initialQuery: PropTypes.string,
  initialCategory: PropTypes.string,
};
