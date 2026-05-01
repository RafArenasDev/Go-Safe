import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { db, sesionClear, sesionGet, sesionSet, inicializarDatos } from "@/lib/storage";
import type { Usuario } from "@/lib/types";

interface AuthCtx {
  usuario: Usuario | null;
  login: (email: string, password: string) => { ok: true } | { ok: false; error: string };
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    inicializarDatos();
    setUsuario(sesionGet());
  }, []);

  const login = useCallback((email: string, password: string) => {
    const u = db.usuarios.list().find(x => x.email.toLowerCase() === email.toLowerCase().trim());
    if (!u || u.password !== password) return { ok: false as const, error: "Correo o contraseña incorrectos." };
    sesionSet(u);
    setUsuario(u);
    return { ok: true as const };
  }, []);

  const logout = useCallback(() => {
    sesionClear();
    setUsuario(null);
  }, []);

  const value = useMemo(() => ({ usuario, login, logout }), [usuario, login, logout]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth fuera de AuthProvider");
  return ctx;
}