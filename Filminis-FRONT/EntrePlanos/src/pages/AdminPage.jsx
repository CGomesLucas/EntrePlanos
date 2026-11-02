import { useState } from "react";
import { api } from "../services/api";
import { useResource } from "../hooks/useResource";
import { Button, Field, Poster, Status } from "../components/ui";

async function loadMovies(signal) {
  const [movies, pending] = await Promise.all([
    api.movies(signal),
    api.pending(signal),
  ]);
  return [
    ...new Map(
      [...pending, ...movies].map((movie) => [movie.id, movie]),
    ).values(),
  ];
}

export default function AdminPage() {
  const { data, loading, error, reload } = useResource(loadMovies);
  const [filter, setFilter] = useState("todos");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [message, setMessage] = useState("");
  const [deleting, setDeleting] = useState(null);
  const filtered = (data || []).filter(
    (movie) =>
      (filter === "todos" || movie.istatus === filter) &&
      movie.titulo
        .toLocaleLowerCase("pt-BR")
        .includes(query.toLocaleLowerCase("pt-BR")),
  );
  async function act(movie, remove = false) {
    setBusy(movie.id);
    setActionError(null);
    setMessage("");
    try {
      const result = remove
        ? await api.remove("filme", movie.id)
        : await api.approve(movie.id);
      setMessage(result?.message || "Operação concluída.");
      setDeleting(null);
      reload();
    } catch (failure) {
      setActionError(failure);
    } finally {
      setBusy(null);
    }
  }
  return (
    <div className="page">
      <div className="page-title">
        <h1>Gerenciar Filme</h1>
        <p>Visualize e aprove solicitações de novos filmes.</p>
      </div>
      <div className="tabs">
        {[
          ["todos", "Todos"],
          ["pendente", "Pendentes"],
          ["aprovado", "Aprovados"],
        ].map(([key, label]) => (
          <button
            key={key}
            aria-pressed={filter === key}
            className={filter === key ? "active" : ""}
            onClick={() => setFilter(key)}
          >
            {label} (
            {
              (data || []).filter(
                (movie) => key === "todos" || movie.istatus === key,
              ).length
            }
            )
          </button>
        ))}
      </div>
      <Field
        label="Buscar filme"
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar por título…"
      />
      <Status
        loading={loading}
        error={error}
        onRetry={reload}
        empty={!loading && !error && !filtered.length}
      />
      <Status error={actionError} />
      {message && <p role="status">{message}</p>}
      {deleting && (
        <div className="panel confirmation" role="alert">
          <p>Excluir permanentemente “{deleting.titulo}”?</p>
          <Button
            secondary
            disabled={busy !== null}
            onClick={() => setDeleting(null)}
          >
            Cancelar
          </Button>
          <Button
            busy={busy === deleting.id}
            onClick={() => act(deleting, true)}
          >
            Confirmar exclusão
          </Button>
        </div>
      )}
      {!!filtered.length && (
        <div className="table-scroll">
          <table>
            <caption className="sr-only">Filmes e solicitações</caption>
            <thead>
              <tr>
                <th scope="col">Filme</th>
                <th scope="col">Categoria</th>
                <th scope="col">Status</th>
                <th scope="col">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((movie) => (
                <tr key={movie.id}>
                  <td>
                    <a className="table-film" href={`#/filme/${movie.id}`}>
                      <Poster src={movie.imagem} />
                      <span>
                        <strong>{movie.titulo}</strong>
                        <small>{movie.ano}</small>
                      </span>
                    </a>
                  </td>
                  <td>
                    <div className="chips">
                      {movie.categorias.map((item) => (
                        <span key={item.nome} className="chip selected">
                          {item.nome}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${movie.istatus}`}>
                      {movie.istatus === "aprovado"
                        ? "Aprovado"
                        : movie.istatus === "pendente"
                          ? "Para Aprovação"
                          : movie.istatus || "Não informado"}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      {movie.istatus === "pendente" && (
                        <Button
                          busy={busy === movie.id}
                          disabled={busy !== null}
                          onClick={() => act(movie)}
                        >
                          Aprovar
                        </Button>
                      )}
                      {movie.istatus === "aprovado" && (
                        <a
                          className="button button-secondary"
                          href={`#/editar/${movie.id}`}
                        >
                          Editar
                        </a>
                      )}
                      <Button
                        secondary
                        disabled={busy !== null}
                        onClick={() => setDeleting(movie)}
                      >
                        Excluir
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="muted">
        Recusa de solicitações ainda não está disponível na API.
      </p>
    </div>
  );
}
