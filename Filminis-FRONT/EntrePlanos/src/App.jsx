import { useState } from "react";
import Layout from "./components/Layout";
import { Button, Status } from "./components/ui";
import { useRoute } from "./hooks/useRoute";
import { useAuth } from "./hooks/useAuth";
import { useFavorites } from "./hooks/useFavorites";
import CatalogPage from "./pages/CatalogPage";
import LoginPage from "./pages/LoginPage";
import MoviePage from "./pages/MoviePage";
import MovieFormPage from "./pages/MovieFormPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";

export default function App() {
  const { path, params } = useRoute();
  const auth = useAuth();
  const { favorites, toggle } = useFavorites(auth.user);
  const [error, setError] = useState(null);
  const movieMatch = path.match(/^\/filme\/(\d+)$/);
  const editMatch = path.match(/^\/editar\/(\d+)$/);
  const protectedPage =
    ["/perfil", "/adicionar", "/admin"].includes(path) || editMatch;
  let content;
  if (path === "/login")
    return (
      <LoginPage onLogin={auth.login} next={params.get("next") || "/perfil"} />
    );
  if (protectedPage && !auth.user)
    content = (
      <section className="page feedback">
        <h1>Entre para continuar</h1>
        <a className="button" href={`#/login?next=${encodeURIComponent(path)}`}>
          Entrar
        </a>
      </section>
    );
  else if ((path === "/admin" || editMatch) && auth.user?.role !== "admin")
    content = (
      <section className="page feedback">
        <h1>Acesso restrito</h1>
        <p>Esta área está disponível para administradores.</p>
        <a href="#/">Voltar ao início</a>
      </section>
    );
  else if (path === "/") content = <CatalogPage />;
  else if (path === "/buscar")
    content = (
      <CatalogPage
        key={params.toString()}
        search
        initialQuery={params.get("q") || ""}
        initialCategory={params.get("categoria") || ""}
      />
    );
  else if (movieMatch)
    content = (
      <MoviePage
        key={movieMatch[1]}
        id={movieMatch[1]}
        user={auth.user}
        favorites={favorites}
        onFavorite={toggle}
      />
    );
  else if (path === "/adicionar" || editMatch)
    content = <MovieFormPage key={path} id={editMatch?.[1]} user={auth.user} />;
  else if (path === "/perfil")
    content = (
      <ProfilePage
        user={auth.user}
        favorites={favorites}
        refresh={auth.refresh}
      />
    );
  else if (path === "/admin") content = <AdminPage />;
  else
    content = (
      <section className="page feedback">
        <h1>Página não encontrada</h1>
        <a className="button" href="#/">
          Voltar ao início
        </a>
      </section>
    );
  async function logout() {
    try {
      await auth.logout();
      window.location.hash = "/";
    } catch (failure) {
      setError(failure);
    }
  }
  return (
    <Layout
      user={auth.user}
      onLogout={logout}
      overlay={path === "/" || path === "/perfil"}
    >
      {error && (
        <div className="page">
          <Status error={error} />
          <Button secondary onClick={() => setError(null)}>
            Fechar
          </Button>
        </div>
      )}
      {content}
    </Layout>
  );
}
