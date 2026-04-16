import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean; // <--- Added: Tracks if we are still checking local storage
  username: string;
  login: (name: string, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("Guest");
  const [isLoading, setIsLoading] = useState(true); // <--- Start loading immediately

  useEffect(() => {
    // Check local storage on initial load
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("username");

    if (token) {
      setIsAuthenticated(true);
      if (storedUser) setUsername(storedUser);
    }

    // Done checking, stop loading
    setIsLoading(false);
  }, []);

  const login = (name: string, token: string) => {
    localStorage.setItem("token", token);
    localStorage.setItem("username", name);
    setUsername(name);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsAuthenticated(false);
    setUsername("Guest");
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, username, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
