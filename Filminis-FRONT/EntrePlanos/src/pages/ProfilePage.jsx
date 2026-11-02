import { useState } from "react";
import PropTypes from "prop-types";
import { api } from "../services/api";
import { Button, Field, MovieGrid, Status } from "../components/ui";
import { safeImage } from "../utils/movies";

export default function ProfilePage({ user, favorites, refresh }) {
  const [tab, setTab] = useState("favorites");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage("");
    try {
      await api.editMe(Object.fromEntries(new FormData(event.currentTarget)));
      await refresh();
      setMessage("Perfil atualizado com sucesso.");
    } catch (failure) {
      setError(failure);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <div className="profile-cover">
        <img
          src="/design/profile.png"
          alt="Paisagem de cinema à beira de um lago"
        />
      </div>
      <div className="page profile-page">
        <section className="profile-heading">
          <div className="profile-avatar">
            {safeImage(user.foto) ? (
              <img src={safeImage(user.foto)} alt="Sua foto de perfil" />
            ) : (
              user.nome?.slice(0, 1)
            )}
          </div>
          <div>
            <h1>
              {[user.nome, user.sobrenome].filter(Boolean).join(" ")}{" "}
              <span className="role-badge">
                {user.role === "admin" ? "Admin" : "User"}
              </span>
            </h1>
            <p>{user.apelido}</p>
            {user.data_criacao && (
              <small>
                Usuário desde{" "}
                {new Date(user.data_criacao).toLocaleDateString("pt-BR")}
              </small>
            )}
          </div>
          <p className="favorite-count">
            <strong>{favorites.length}</strong>Favoritos
          </p>
        </section>
        <div className="tabs" role="tablist" aria-label="Meu perfil">
          {[
            ["favorites", "Meus favoritos"],
            ["requests", "Minhas Solicitações"],
            ["personal", "Dados Pessoais"],
          ].map(([key, label]) => (
            <button
              role="tab"
              id={`tab-${key}`}
              aria-controls="profile-content"
              aria-selected={tab === key}
              key={key}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <section
          id="profile-content"
          role="tabpanel"
          aria-labelledby={`tab-${tab}`}
          tabIndex="0"
        >
          {tab === "favorites" && (
            <>
              <p className="muted">Favoritos salvos apenas neste navegador.</p>
              <Status empty={!favorites.length} />
              <MovieGrid movies={favorites} />
            </>
          )}
          {tab === "requests" && (
            <div className="panel">
              <h2>Minhas Solicitações</h2>
              <p>
                O servidor ainda não disponibiliza o histórico de solicitações
                por usuário.
              </p>
              <a className="button" href="#/adicionar">
                Adicionar Filme
              </a>
            </div>
          )}
          {tab === "personal" && (
            <form className="panel profile-form" onSubmit={save}>
              <h2>Dados Pessoais</h2>
              <div className="form-row">
                <Field
                  label="Nome"
                  name="nome"
                  defaultValue={user.nome || ""}
                  required
                />
                <Field
                  label="Sobrenome"
                  name="sobrenome"
                  defaultValue={user.sobrenome || ""}
                />
              </div>
              <Field
                label="Apelido"
                name="apelido"
                defaultValue={user.apelido || ""}
              />
              <Field
                label="Data de nascimento"
                type="date"
                name="data_nascimento"
                defaultValue={user.data_nascimento?.slice(0, 10) || ""}
              />
              <Field
                label="URL da foto"
                type="url"
                name="foto"
                defaultValue={user.foto || ""}
              />
              <Status error={error} />
              {message && <p role="status">{message}</p>}
              <Button type="submit" busy={busy}>
                Salvar Alterações
              </Button>
            </form>
          )}
        </section>
      </div>
    </>
  );
}
ProfilePage.propTypes = {
  user: PropTypes.object.isRequired,
  favorites: PropTypes.array.isRequired,
  refresh: PropTypes.func.isRequired,
};
