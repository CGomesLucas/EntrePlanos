import PropTypes from "prop-types";
import { safeImage } from "../utils/movies";

export function Button({
  children,
  secondary = false,
  busy = false,
  className = "",
  ...props
}) {
  return (
    <button
      type="button"
      {...props}
      disabled={busy || props.disabled}
      className={`button ${secondary ? "button-secondary" : ""} ${className}`}
      aria-busy={busy}
    >
      {busy ? "Aguarde…" : children}
    </button>
  );
}
Button.propTypes = {
  children: PropTypes.node.isRequired,
  secondary: PropTypes.bool,
  busy: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
};

export function Field({ label, multiline = false, ...props }) {
  const Input = multiline ? "textarea" : "input";
  return (
    <label className="field">
      <span>{label}</span>
      <Input {...props} />
    </label>
  );
}
Field.propTypes = {
  label: PropTypes.string.isRequired,
  multiline: PropTypes.bool,
};

export function Status({ loading, error, onRetry, empty = false }) {
  if (loading)
    return (
      <div className="feedback" role="status">
        <span className="spinner" />
        Carregando…
      </div>
    );
  if (error)
    return (
      <div className="feedback error" role="alert">
        <p>{error.message || error}</p>
        {onRetry && (
          <Button secondary onClick={onRetry}>
            Tentar novamente
          </Button>
        )}
      </div>
    );
  if (empty) return <p className="feedback">Nenhum filme encontrado.</p>;
  return null;
}
Status.propTypes = {
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
  onRetry: PropTypes.func,
  empty: PropTypes.bool,
};

export function Poster({ src, title = "", className = "" }) {
  const url = safeImage(src);
  return (
    <div className={`poster ${className}`}>
      {url ? (
        <img
          key={url}
          src={url}
          alt={title}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.hidden = true;
          }}
        />
      ) : null}
      <span className="poster-fallback">{title || "Insira o pôster"}</span>
    </div>
  );
}
Poster.propTypes = {
  src: PropTypes.string,
  title: PropTypes.string,
  className: PropTypes.string,
};

export function MovieGrid({ movies }) {
  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <a
          className="movie-card"
          key={movie.id}
          href={`#/filme/${movie.id}`}
          aria-label={`Ver ${movie.titulo}`}
        >
          <Poster src={movie.imagem} title={movie.titulo} />
          <span className="movie-caption">{movie.titulo}</span>
        </a>
      ))}
    </div>
  );
}
MovieGrid.propTypes = {
  movies: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      titulo: PropTypes.string.isRequired,
      imagem: PropTypes.string,
    }),
  ).isRequired,
};

export function ChoiceGroup({ label, options, value, onChange }) {
  return (
    <fieldset className="choices">
      <legend>{label}</legend>
      <div className="chips">
        {options.map((option) => (
          <button
            type="button"
            className={`chip ${value.includes(option.id) ? "selected" : ""}`}
            key={option.id}
            aria-pressed={value.includes(option.id)}
            onClick={() =>
              onChange(
                value.includes(option.id)
                  ? value.filter((id) => id !== option.id)
                  : [...value, option.id],
              )
            }
          >
            {[option.nome, option.sobrenome].filter(Boolean).join(" ")}
          </button>
        ))}
      </div>
      {!options.length && <small>Nenhuma opção cadastrada.</small>}
    </fieldset>
  );
}
ChoiceGroup.propTypes = {
  label: PropTypes.string.isRequired,
  options: PropTypes.array.isRequired,
  value: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
};
