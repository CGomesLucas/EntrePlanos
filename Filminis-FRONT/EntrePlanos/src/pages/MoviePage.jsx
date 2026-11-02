import { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { api } from "../services/api";
import { useResource } from "../hooks/useResource";
import { Button, Poster, Status } from "../components/ui";
import { money, personName } from "../utils/movies";

export default function MoviePage({ id, user, favorites, onFavorite }) {
  const loader = useCallback((signal) => api.movie(id, signal), [id]);
  const { data: movie, loading, error, reload } = useResource(loader);
  const [actionError, setActionError] = useState(null);
  if (!movie)
    return (
      <div className="page">
        <Status loading={loading} error={error} onRetry={reload} />
      </div>
    );
  const saved = favorites.some((item) => item.id === movie.id);
  return (
    <div className="page movie-page">
      <div className="movie-presentation">
        <aside>
          <Poster src={movie.imagem} title={movie.titulo} />
          <Button
            aria-pressed={saved}
            onClick={() => {
              if (!user) {
                window.location.hash = `/login?next=${encodeURIComponent(`/filme/${id}`)}`;
                return;
              }
              try {
                onFavorite(movie);
              } catch (failure) {
                setActionError(failure);
              }
            }}
          >
            {saved ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
          </Button>
          <small className="muted">Favoritos salvos neste navegador.</small>
        </aside>
        <section>
          <div className="chips">
            {movie.categorias.map((item) => (
              <a
                className="chip selected"
                key={item.nome}
                href={`#/buscar?categoria=${encodeURIComponent(item.nome)}`}
              >
                {item.nome}
              </a>
            ))}
          </div>
          <h1>{movie.titulo}</h1>
          <p>
            {movie.ano} <span aria-hidden="true"> · </span> {movie.duracao}
          </p>
          <dl className="movie-facts">
            <div>
              <dt>Diretor</dt>
              <dd>
                {movie.diretores?.map(personName).join(", ") || "Não informado"}
              </dd>
            </div>
            <div>
              <dt>Produtora</dt>
              <dd>{movie.produtora_principal || "Não informada"}</dd>
            </div>
            <div>
              <dt>Orçamento</dt>
              <dd>{money(movie.orcamento)}</dd>
            </div>
            <div>
              <dt>Idioma</dt>
              <dd>{movie.linguagens?.join(", ") || "Não informado"}</dd>
            </div>
          </dl>
          <p className="synopsis">{movie.sinopse}</p>
          {user?.role === "admin" && movie.istatus === "aprovado" && (
            <a className="button button-secondary" href={`#/editar/${id}`}>
              Editar Filme
            </a>
          )}
          <Status error={actionError} />
        </section>
      </div>
      <section className="cast">
        <h2>Elenco Principal</h2>
        <div className="cast-grid">
          {movie.atores?.map((actor, index) => (
            <article key={`${personName(actor)}-${index}`}>
              <div className="cast-avatar" aria-hidden="true">
                {personName(actor).slice(0, 1)}
              </div>
              <h3>{personName(actor)}</h3>
            </article>
          ))}
        </div>
        {!movie.atores?.length && (
          <p className="muted">Elenco não informado.</p>
        )}
      </section>
    </div>
  );
}
MoviePage.propTypes = {
  id: PropTypes.string.isRequired,
  user: PropTypes.object,
  favorites: PropTypes.array.isRequired,
  onFavorite: PropTypes.func.isRequired,
};
