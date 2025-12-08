"use client";

import {
  createContext,
  useEffect,
  useRef,
  ReactNode,
  useCallback,
} from "react";
import { redirect, useRouter } from "next/navigation";
import { useUserDataStore } from "../store/useUserDataStore";
import { EliminarCookie, VerifyCookie } from "../actions/cookie.action";

interface SessionContextValue {
  logout: () => Promise<void>;
  ensureValidSession: () => Promise<boolean>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

interface SessionActivityProviderProps {
  children: ReactNode;
}

const CHECK_INTERVAL_MS = 15000; // 15 segundos

export default function SessionActivityProvider({
  children,
}: SessionActivityProviderProps) {
  const router = useRouter();
  const { resetUserData } = useUserDataStore();

  const isLoggingOutRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const logout = useCallback(async () => {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    console.log("🚪 Cerrando sesión...");

    try {
      await EliminarCookie(); // Puede fallar, pero no importa
    } catch (err) {
      // console.error("⚠️ Error al eliminar cookie:", err);
    }

    resetUserData();
    redirect("/auth");
  }, [resetUserData, router]);

  // 🔥 Monitoreo automático sin usar ObtenerSesion()
  useEffect(() => {
    const check = async () => {
      try {
        if (isLoggingOutRef.current) return;
        console.log("verificando cookie 😒😒😒")
        const valid = await VerifyCookie();

        if (!valid) {
          console.warn("⛔ Cookie expirada – cerrando sesión");
          logout(); // Cierra automáticamente
        }
      } catch {
        logout();
      }
    };

    // Primera verificación
    check();

    intervalRef.current = setInterval(check, CHECK_INTERVAL_MS);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [logout]);

  // 🔥 Para llamadas manuales desde páginas protegidas
  const ensureValidSession = useCallback(async () => {
    const valid = await VerifyCookie();
    if (!valid) {
      await logout();
      return false;
    }
    return true;
  }, [logout]);

  return (
    <SessionContext.Provider value={{ logout, ensureValidSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export { SessionContext };
