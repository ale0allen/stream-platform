import { createContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { clearStoredToken, getStoredToken, setStoredToken } from "../../services/storage";
import { login, register, type LoginInput, type RegisterInput } from "./authService";
import type { AuthResponse, Role } from "../../services/types";

interface AuthUser {
  userId: string;
  email: string;
  role: Role;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (input: LoginInput) => Promise<void>;
  signUp: (input: RegisterInput) => Promise<void>;
  signOut: () => void;
}

function parseJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split(".");
    return JSON.parse(window.atob(payload));
  } catch {
    return null;
  }
}

function mapAuthResponse(authResponse: AuthResponse): AuthUser {
  return {
    userId: authResponse.userId,
    email: authResponse.email,
    role: authResponse.role
  };
}

function buildUserFromToken(token: string): AuthUser | null {
  const payload = parseJwtPayload(token);
  const email = typeof payload?.sub === "string" ? payload.sub : null;
  const role = payload?.role === "ADMIN" ? "ADMIN" : payload?.role === "USER" ? "USER" : null;
  const userId = typeof payload?.userId === "string" ? payload.userId : null;

  if (!email || !role || !userId) {
    return null;
  }

  return {
    userId,
    email,
    role
  };
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = getStoredToken();
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    const restoredUser = buildUserFromToken(storedToken);
    if (!restoredUser) {
      clearStoredToken();
      setIsLoading(false);
      return;
    }

    setToken(storedToken);
    setUser(restoredUser);
    setIsLoading(false);
  }, []);

  async function handleAuthRequest(request: Promise<AuthResponse>) {
    const authResponse = await request;
    setStoredToken(authResponse.token);
    setToken(authResponse.token);
    setUser(mapAuthResponse(authResponse));
  }

  async function signIn(input: LoginInput) {
    await handleAuthRequest(login(input));
  }

  async function signUp(input: RegisterInput) {
    await handleAuthRequest(register(input));
  }

  function signOut() {
    clearStoredToken();
    setToken(null);
    setUser(null);
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      isLoading,
      signIn,
      signUp,
      signOut
    }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
