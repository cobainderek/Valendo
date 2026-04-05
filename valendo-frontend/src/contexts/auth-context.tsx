"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User, AuthResponse, LoginCredentials, RegisterCredentials } from "@/types";
import { api } from "@/lib/api";
import { mockLogin, mockRegister } from "@/lib/mock-auth";
import { saveToken, getToken, removeToken, getUser, isTokenExpired } from "@/lib/auth";

const isMock = process.env.NEXT_PUBLIC_MOCK_AUTH === "true";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token && !isTokenExpired()) {
      setUser(getUser());
    } else if (token) {
      removeToken();
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const data = isMock
      ? await mockLogin(credentials)
      : await api<AuthResponse>("/auth/login", {
          method: "POST",
          body: credentials,
        });
    saveToken(data.access_token);
    setUser(data.user);
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    const data = isMock
      ? await mockRegister(credentials)
      : await api<AuthResponse>("/auth/register", {
          method: "POST",
          body: credentials,
        });
    saveToken(data.access_token);
    setUser(data.user);
  }, []);

  const logout = useCallback(() => {
    removeToken();
    setUser(null);
    window.location.href = "/login";
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
