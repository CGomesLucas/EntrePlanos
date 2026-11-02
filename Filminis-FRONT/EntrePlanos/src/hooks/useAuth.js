import { useCallback, useEffect, useState } from "react";
import { api, session } from "../services/api";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const loadUser = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.me();
      setUser(result);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    const changed = () => {
      if (!session.get()) setUser(null);
    };
    window.addEventListener("sessionchange", changed);
    return () => window.removeEventListener("sessionchange", changed);
  }, []);
  const login = async (credentials) => {
    await api.login(credentials);
    try {
      return await loadUser();
    } catch (error) {
      session.clear();
      throw error;
    }
  };
  return { user, loading, login, logout: api.logout, refresh: loadUser };
}
