import { useState } from "react";
import PropTypes from "prop-types";
import { api } from "../services/api";
import { Button, Field, Status } from "../components/ui";

export default function LoginPage({ onLogin, next = "/perfil" }) {
  const [register, setRegister] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      if (register) {
        await api.register({ ...data, senha: data.password });
        setRegister(false);
        setMessage("Conta criada. Entre com seu email e senha.");
      } else {
        await onLogin({ email: data.email, password: data.password });
        window.location.hash =
          next.startsWith("/") && !next.startsWith("//") ? next : "/perfil";
      }
    } catch (failure) {
      setError(failure);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="login-page">
      <section className="login-visual">
        <img
          src="/design/login.png"
          alt="Câmera de cinema em um cenário ao ar livre"
        />
        <div>
          <p>Bem Vindo ao</p>
          <h2>Entre Planos Community</h2>
          <p>Casa de amantes do cinema ao redor do mundo!</p>
        </div>
      </section>
      <section className="login-panel">
        <a href="#/" className="brand">
          EntrePlanos
        </a>
        <form onSubmit={submit}>
          <h1>{register ? "Crie sua conta" : "Bem vindo"}</h1>
          <p>Seja parte de uma comunidade de amantes do cinema</p>
          {register && (
            <>
              <Field
                label="Nome"
                name="nome"
                required
                autoComplete="given-name"
              />
              <Field
                label="Sobrenome"
                name="sobrenome"
                autoComplete="family-name"
              />
              <Field label="Apelido" name="apelido" autoComplete="nickname" />
              <Field
                label="Data de nascimento"
                name="data_nascimento"
                type="date"
                required
              />
            </>
          )}
          <Field
            label="Email"
            name="email"
            type="email"
            required
            autoComplete="email"
          />
          <Field
            label="Senha"
            name="password"
            type="password"
            required
            minLength={register ? 8 : 1}
            autoComplete={register ? "new-password" : "current-password"}
          />
          <Status error={error} />
          {message && <p role="status">{message}</p>}
          <Button type="submit" busy={busy}>
            {register ? "Criar conta" : "Entrar"}
          </Button>
          <Button
            secondary
            onClick={() => {
              setRegister(!register);
              setError(null);
            }}
          >
            {register ? "Já tenho uma conta" : "Criar uma conta"}
          </Button>
        </form>
      </section>
    </div>
  );
}
LoginPage.propTypes = {
  onLogin: PropTypes.func.isRequired,
  next: PropTypes.string,
};
