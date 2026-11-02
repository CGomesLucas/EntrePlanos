import PropTypes from "prop-types";
import { api } from "../services/api";
import { useResource } from "../hooks/useResource";

const loadCategories = (signal) => api.lookup("categorias", signal);

export default function Layout({ children, user, onLogout, overlay = false }) {
  const { data: categories, error, reload } = useResource(loadCategories);
  return (
    <>
      <a
        href="#main"
        className="skip-link"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        Pular para o conteúdo
      </a>
      <header className={`header ${overlay ? "header-overlay" : ""}`}>
        <a className="brand" href="#/">
          EntrePlanos
        </a>
        <nav aria-label="Navegação principal">
          <a href="#/">Início</a>
          <details className="dropdown">
            <summary>
              Categorias <img src="/design/chevron.svg" alt="" />
            </summary>
            <div className="dropdown-menu">
              <a href="#/buscar">Todas as categorias</a>
              {categories?.map((category) => (
                <a
                  key={category.id}
                  href={`#/buscar?categoria=${encodeURIComponent(category.nome)}`}
                >
                  {category.nome}
                </a>
              ))}
              {error && <button onClick={reload}>Recarregar categorias</button>}
            </div>
          </details>
          <a href={user ? "#/perfil" : "#/login"}>Minha Área</a>
        </nav>
        <div className="header-actions">
          <a href="#/buscar" className="search-link" aria-label="Buscar filmes">
            <img src="/design/search.svg" alt="" />
          </a>
          {user ? (
            <details className="dropdown account-menu">
              <summary>
                {user.nome}
                <span aria-hidden="true"> ☰</span>
              </summary>
              <div className="dropdown-menu">
                <a href="#/perfil">Meu perfil</a>
                {user.role === "admin" && (
                  <a href="#/admin">Gerenciar filmes</a>
                )}
                <button onClick={onLogout}>Sair</button>
              </div>
            </details>
          ) : (
            <a href="#/login">Entrar</a>
          )}
          <a
            className="button"
            href={user ? "#/adicionar" : "#/login?next=%2Fadicionar"}
          >
            Adicionar Filme
          </a>
        </div>
      </header>
      <main id="main" tabIndex="-1">
        {children}
      </main>
      <footer className="footer">
        <a className="brand" href="#/">
          EntrePlanos
        </a>
        <a href="#/buscar">Catálogo</a>
        <a href={user ? "#/perfil" : "#/login"}>Minha Área</a>
        <span>
          <img src="/design/copyright.svg" alt="©" /> {new Date().getFullYear()}{" "}
          EntrePlanos. Todos os direitos reservados
        </span>
      </footer>
    </>
  );
}
Layout.propTypes = {
  children: PropTypes.node.isRequired,
  user: PropTypes.object,
  onLogout: PropTypes.func.isRequired,
  overlay: PropTypes.bool,
};
