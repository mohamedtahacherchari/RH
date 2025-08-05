import React, {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";

// 👉 Définition du type du contexte
interface AuthContextType {
  isAuthenticated: boolean;
  checkAuth: () => void;
  logout: () => void;
}

// 👉 Contexte typé (initialisé comme undefined pour sécuriser)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 👉 Typage des props de AuthProvider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, checkAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Hook personnalisé avec gestion d'erreur
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

