// File: src/redux/services/authService.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface LoginResponse {
  token: string;
  user: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
    isVerified: boolean;
    createdAt: string;
    [key: string]: any;
  };
}

// Envoi du code à l'e-mail
export const sendCode = async (email: string): Promise<{ success: boolean; message: string }> => {
  const response = await fetch(`${API_BASE_URL}/auth/send-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Erreur lors de l'envoi du code");
  }
 
  return response.json();
};

// Vérification du code et login
export const login = async (email: string, code: string): Promise<LoginResponse> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/verify-code`, { email, code });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Code de vérification invalide');
    }
    throw new Error('Une erreur est survenue');
  }
};