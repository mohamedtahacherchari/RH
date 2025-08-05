import { Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext"; // Assure-toi de modifier le chemin si nécessaire
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();
  
  // Si l'utilisateur n'est pas authentifié, le rediriger vers la page de connexion
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  // Si l'utilisateur est authentifié, afficher le contenu de la route protégée
  return <>{children}</>;
};
 
export default ProtectedRoute;
