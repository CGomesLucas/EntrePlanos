import { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { api } from "../services/api";
import { useResource } from "../hooks/useResource";
import { Button, ChoiceGroup, Field, Poster, Status } from "../components/ui";

const lookupTypes = [
  "categorias",
  "produtoras",
  "paises",
  "linguagens",
  "diretores",
  "atores",
];
const emptyMovie = {
  titulo: "",
  imagem: "",
  ano: "",
  duracao: "",
  sinopse: "",
  orcamento: "",
  categoria_id: [],
  produtora_id: [],
  pais_origem_id: [],
  linguagem_id: [],
  diretor_id: [],
  atores_ids: [],
};
const relations = {
  categoria_id: "categorias",
  produtora_id: "produtoras",
  pais_origem_id: "paises",
  linguagem_id: "linguagens",
  diretor_id: "diretores",
  atores_ids: "atores",
};

async function loadLookups(signal) {
  const values = await Promise.all(
    lookupTypes.map((type) => api.lookup(type, signal)),
  );
  return Object.fromEntries(
    lookupTypes.map((type, index) => [type, values[index]]),
  );
}

// Detail responses contain names rather than IDs. Resolve against lookups
// to preserve existing relationships when editing a film.
function resolveRelations(movie, lookups) {
  const result = {};
  for (const [field, resource] of Object.entries(relations)) {
    const names = (movie[resource] || []).map((item) =>
      typeof item === "string" ? item : item.nome || item.valor,
    );
    result[field] = lookups[resource]
      .filter(
        (item) =>
          names.includes(
            [item.nome, item.sobrenome].filter(Boolean).join(" "),
          ) || names.includes(item.nome),
      )
      .map((item) => item.id);
  }
  return result;
}

export default function MovieFormPage({ id, user }) {
  const loader = useCallback(
    async (signal) => {
      const [lookups, movie] = await Promise.all([
        loadLookups(signal),
        id ? api.movie(id, signal) : Promise.resolve(null),
      ]);
      return {
        lookups,
        initial: movie
          ? {
              ...emptyMovie,
              ...movie,
              orcamento: String(movie.orcamento || 0),
              ...resolveRelations(movie, lookups),
            }
          : emptyMovie,
      };
    },
    [id],
  );
  const resource = useResource(loader);
  if (!resource.data)
    return (
      <div className="page">
        <Status
          loading={resource.loading}
          error={resource.error}
          onRetry={resource.reload}
        />
      </div>
    );
  return <MovieForm key={id || "new"} {...resource.data} id={id} user={user} />;
}
MovieFormPage.propTypes = {
  id: PropTypes.string,
  user: PropTypes.object.isRequired,
};

function MovieForm({ initial, lookups, id, user }) {
  const [movie, setMovie] = useState(initial);
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [changedRelations, setChangedRelations] = useState([]);
  const update = (field, value) =>
    setMovie((current) => ({ ...current, [field]: value }));
  const input = (field, label, props = {}) => (
    <Field
      label={label}
      value={movie[field]}
      onChange={(event) => update(field, event.target.value)}
      {...props}
    />
  );
  const choices = (field, label) => (
    <ChoiceGroup
      label={label}
      options={lookups[relations[field]]}
      value={movie[field]}
      onChange={(value) => {
        update(field, value);
        setChangedRelations((current) => [...new Set([...current, field])]);
      }}
    />
  );
  async function submit(event) {
    event.preventDefault();
    setError(null);
    if (!id && step === 1) {
      if (!movie.categoria_id.length) {
        setError(new Error("Selecione ao menos uma categoria."));
        return;
      }
      setStep(2);
      return;
    }
    setBusy(true);
    try {
      if (
        (!id || changedRelations.includes("produtora_id")) &&
        !movie.produtora_id.length
      )
        throw new Error("Selecione ao menos uma produtora.");
      const payload = {
        titulo: movie.titulo,
        imagem: movie.imagem,
        duracao: movie.duracao,
        sinopse: movie.sinopse,
        ano: Number(movie.ano),
        orcamento: String(movie.orcamento || "0"),
      };
      const response = id
        ? await api.editMovie(id, {
            ...payload,
            ...(changedRelations.includes("produtora_id")
              ? { id_produtora_principal: movie.produtora_id[0] }
              : {}),
            ...Object.fromEntries(
              Object.entries(relations)
                .filter(([field]) => changedRelations.includes(field))
                .map(([field, resource]) => [resource, movie[field]]),
            ),
          })
        : await api.createMovie({
            ...payload,
            ...Object.fromEntries(
              Object.keys(relations).map((field) => [field, movie[field]]),
            ),
          });
      setResult(response);
    } catch (failure) {
      setError(failure);
    } finally {
      setBusy(false);
    }
  }
  if (result)
    return (
      <section className="page success-page">
        <p className="success-kicker">¡ NOVO FILME EM CARTAZ !</p>
        <h1>
          {id
            ? "ALTERAÇÕES SALVAS"
            : user.role === "admin"
              ? "FILME ADICIONADO COM SUCESSO!"
              : "FILME ENVIADO PARA APROVAÇÃO!"}
        </h1>
        {user.role === "admin" && (
          <img
            src="/design/success.png"
            alt="Martin Scorsese celebra o cinema"
          />
        )}
        <p role="status">{result.message}</p>
        <div className="actions">
          <Button
            onClick={() => {
              setMovie(emptyMovie);
              setStep(1);
              setResult(null);
            }}
          >
            Adicionar Outro Filme
          </Button>
          <a className="button button-secondary" href="#/buscar">
            Ver Catálogo
          </a>
        </div>
      </section>
    );
  return (
    <div className="page">
      <h1>{id ? "Editar Filme" : "Adicionar Filme"}</h1>
      {!id && (
        <ol className="steps" aria-label="Etapas">
          <li aria-current={step === 1 ? "step" : undefined}>
            1. Informações Principais
          </li>
          <li aria-current={step === 2 ? "step" : undefined}>
            2. Produção e Elenco
          </li>
        </ol>
      )}
      <div className="editor-layout">
        <aside>
          <Poster src={movie.imagem} />
        </aside>
        <form onSubmit={submit} className="movie-form">
          {(step === 1 || id) && (
            <section className="panel">
              <h2>Informações Principais</h2>
              {input("titulo", "Título", {
                required: true,
                maxLength: 255,
                placeholder: "Ex: Interestelar",
              })}
              {input("imagem", "URL do pôster", {
                type: "url",
                required: true,
                placeholder: "https://exemplo.com/poster.jpg",
              })}
              <div className="form-row">
                {input("ano", "Ano", {
                  type: "number",
                  required: true,
                  min: 1888,
                  max: new Date().getFullYear() + 10,
                  placeholder: "Ex: 2014",
                })}
                {input("duracao", "Duração (HH:MM:SS)", {
                  required: true,
                  pattern: "[0-9]{1,2}:[0-5][0-9]:[0-5][0-9]",
                  placeholder: "02:49:00",
                })}
              </div>
              {input("sinopse", "Sinopse", {
                multiline: true,
                required: true,
                rows: 5,
              })}
              {choices("categoria_id", "Categoria")}
            </section>
          )}
          {(step === 2 || id) && (
            <>
              <section className="panel">
                <h2>Produção</h2>
                {choices("produtora_id", "Produtora")}
                {input("orcamento", "Orçamento (R$)", {
                  type: "number",
                  min: 0,
                  step: 1,
                  placeholder: "165000000",
                })}
                {choices("pais_origem_id", "País")}
                {choices("linguagem_id", "Idioma")}
              </section>
              <section className="panel">
                <h2>Direção e Elenco</h2>
                {choices("diretor_id", "Diretores")}
                {choices("atores_ids", "Atores")}
              </section>
            </>
          )}
          <Status error={error} />
          <div className="actions">
            {step === 2 && !id ? (
              <Button secondary onClick={() => setStep(1)} disabled={busy}>
                Anterior
              </Button>
            ) : (
              <a
                className="button button-secondary"
                href={id ? `#/filme/${id}` : "#/buscar"}
              >
                Cancelar
              </a>
            )}
            <Button type="submit" busy={busy}>
              {id ? "Salvar Alterações" : step === 1 ? "Próximo" : "Concluir"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
MovieForm.propTypes = {
  initial: PropTypes.object.isRequired,
  lookups: PropTypes.object.isRequired,
  id: PropTypes.string,
  user: PropTypes.object.isRequired,
};
