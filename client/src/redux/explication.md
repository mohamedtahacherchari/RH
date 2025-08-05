# Guide Redux & RTK Query - Code Expliqué

## Table des matières

1. [Store Principal](#1-storets---le-magasin-principal)
2. [Hooks Typés](#2-hooksts---hooks-typés-pour-redux)
3. [API Slice](#3-apislicets---configuration-de-base-pour-les-api)
4. [Auth Slice](#4-authslicets---gestion-de-lauthentification)
5. [Auth Service](#5-authservicets---services-pour-les-appels-api)
6. [Auth API](#6-authapits---endpoints-rtk-query-pour-lauth)
7. [Devis API](#7-devisapits---endpoints-pour-les-devis)
8. [Cart Context](#8-cartecontexttsx---context-pour-le-panier)
9. [Résumé](#résumé-pour-un-débutant)

---

## 1. STORE.TS - Le magasin principal

**File:** `src/redux/store.ts`

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import authReducer from './slices/authSlice';
import { apiSlice } from './api/apiSlice';

// Le STORE est comme un grand coffre-fort qui contient TOUTES les données de votre app
// C'est le cerveau central où on stocke l'état global (user connecté, panier, etc.)
export const store = configureStore({
  reducer: {
    // 'auth' : gère tout ce qui concerne l'authentification (login, user info)
    auth: authReducer,
    
    // '[apiSlice.reducerPath]' : gère les appels API et leur cache
    // apiSlice.reducerPath = 'api', donc c'est comme écrire api: apiSlice.reducer
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  
  // Les middlewares sont comme des "intercepteurs"
  // Ils traitent les actions avant qu'elles arrivent aux reducers
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      // On ajoute le middleware d'apiSlice pour gérer les appels API automatiquement
      .concat(apiSlice.middleware),
});

//    Cette ligne active des fonctionnalités automatiques comme :
// - Refetch quand on revient sur l'onglet (refetchOnFocus)
// - Refetch quand on retrouve la connexion (refetchOnReconnect)
setupListeners(store.dispatch);

// Ces types TypeScript nous aident à avoir l'autocomplétion
export type RootState = ReturnType<typeof store.getState>; // Type de tout l'état
export type AppDispatch = typeof store.dispatch; // Type du dispatch
```

---

## 2. HOOKS.TS - Hooks typés pour Redux

**File:** `src/redux/hooks.ts`

```typescript
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from './store';

// Ces hooks sont des versions "améliorées" des hooks Redux de base
// Ils incluent automatiquement nos types TypeScript

// Au lieu d'utiliser useDispatch() normal, on utilise celui-ci
// Il sait automatiquement quelles actions on peut envoyer
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Au lieu d'utiliser useSelector() normal, on utilise celui-ci  
// Il sait automatiquement quelle est la structure de notre état  
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// UTILISATION DANS UN COMPOSANT :
// const dispatch = useAppDispatch(); // Pour envoyer des actions
// const user = useAppSelector(state => state.auth.user); // Pour lire l'état
```

---

## 3. APISLICE.TS - Configuration de base pour les API

**File:** `src/redux/api/apiSlice.ts`

```typescript
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

// RTK Query nous aide à gérer les appels API automatiquement
// Plus besoin d'écrire du code pour loading, success, error !

export const apiSlice = createApi({
  // Le nom dans le store (on l'a utilisé dans store.ts)
  reducerPath: 'api',
  
  // Configuration de base pour tous nos appels API
  baseQuery: fetchBaseQuery({
    // L'URL de base de notre API (définie dans .env)
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    
    // Cette fonction s'exécute avant chaque appel API
    prepareHeaders: (headers, { getState }) => {
      // On récupère le token d'authentification depuis le store
      const token = (getState() as RootState).auth.token;
      
      // Si on a un token, on l'ajoute dans les headers
      // L'API pourra ainsi savoir qui fait la requête
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      
      return headers;
    },
  }),
  
  // Les "tags" servent pour le cache et les mises à jour automatiques
  // Si on modifie un 'User', tous les appels avec tag 'User' se remettront à jour
  tagTypes: ['User', 'Devis'],
  
  // On définit les endpoints (appels API) dans d'autres fichiers
  endpoints: () => ({}),
});
```

---

## 4. AUTHSLICE.TS - Gestion de l'authentification

**File:** `src/redux/slices/authSlice.ts`

### Interfaces et types

```typescript
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { login } from '../services/authService';

// Interface TypeScript : définit la structure d'un utilisateur
export interface User {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  address?: string;
  codePostal?: string;
  isVerified: boolean;
  createdAt: string;
}

// Interface pour l'état d'authentification
interface AuthState {
  user: User | null; // null si pas connecté, User si connecté
  token: string | null; // JWT token pour l'API
  status: 'idle' | 'loading' | 'succeeded' | 'failed'; // État du login
  error: string | null; // Message d'erreur s'il y en a une
}
```

### Persistance des données

```typescript
// Fonction pour récupérer les données sauvegardées dans localStorage
// Quand on recharge la page, on ne perd pas la connexion !
const loadStoredAuthState = (): { user: User | null; token: string | null } => {
  try {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    let user = null;
    
    if (storedUser && storedUser !== 'undefined') {
      user = JSON.parse(storedUser);
    }
    
    return { user, token };
  } catch {
    // Si erreur (localStorage corrompu), on retourne null
    return { user: null, token: null };
  }
};

const { user, token } = loadStoredAuthState();

// État initial : ce qu'on a au démarrage de l'app
const initialState: AuthState = {
  user, // Récupéré du localStorage
  token, // Récupéré du localStorage  
  status: 'idle', // Pas de login en cours
  error: null, // Pas d'erreur
};
```

### Action asynchrone pour le login

```typescript
// Action asynchrone pour le login
// createAsyncThunk gère automatiquement pending/fulfilled/rejected
export const loginUser = createAsyncThunk(
  'auth/login', // Nom de l'action
  async ({ email, code }: { email: string; code: string }, { rejectWithValue }) => {
    try {
      // On appelle le service de login
      const response = await login(email, code);
      
      // On sauvegarde dans localStorage pour persister après rechargement
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      return response; // Succès : les données vont dans action.payload
    } catch (error: any) {
      // Erreur : le message va dans action.payload (avec rejected)
      return rejectWithValue(error.message || 'Échec de connexion');
    }
  }
);
```

### Le Slice principal

```typescript
// Le SLICE : définit comment l'état change selon les actions
const authSlice = createSlice({
  name: 'auth',
  initialState,
  
  // Reducers pour les actions synchrones (instantanées)
  reducers: {
    // Action pour se déconnecter
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      // On supprime aussi du localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    
    // Action pour mettre à jour le profil utilisateur
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        // On fusionne les nouvelles données avec les anciennes
        state.user = { ...state.user, ...action.payload };
        // On sauvegarde dans localStorage
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
  },
  
  // ExtraReducers pour les actions asynchrones (comme loginUser)
  extraReducers: (builder) => {
    builder
      // Quand le login commence
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      // Quand le login réussit
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      // Quand le login échoue
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});
```

### Exports et selectors

```typescript
// On exporte les actions pour les utiliser dans les composants
export const { logout, updateUserProfile } = authSlice.actions;

// SELECTORS : fonctions pour lire facilement l'état
// Au lieu d'écrire state.auth.user, on écrit selectUser(state)
export const selectUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.token;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectIsAuthenticated = (state: RootState) => !!state.auth.token;
export const selectAuthError = (state: RootState) => state.auth.error;

// On exporte le reducer pour l'utiliser dans store.ts
export default authSlice.reducer;
```

---

## 5. AUTHSERVICE.TS - Services pour les appels API

**File:** `src/redux/services/authService.ts`

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Interface pour la réponse du login
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
    [key: string]: any; // Permet d'avoir d'autres propriétés
  };
}

// Fonction pour envoyer un code de vérification par email
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

// Fonction pour vérifier le code et se connecter
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
```

---

## 6. AUTHAPI.TS - Endpoints RTK Query pour l'auth

**File:** `src/redux/api/authApi.ts`

### Interfaces

```typescript
import { apiSlice } from './apiSlice';
import { User } from '../slices/authSlice';

// Interface pour le profil utilisateur (peut être différente de User)
export interface UserProfile {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  address?: string;
  codePostal?: string;
  isVerified: boolean;
  createdAt: string;
}

// Interface pour la requête de mise à jour du profil
export interface UpdateProfileRequest {
  id: string;
  userData: Partial<UserProfile>; // Partial = tous les champs sont optionnels
}
```

### Endpoints

```typescript
// On injecte des nouveaux endpoints dans apiSlice
export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // QUERY = pour récupérer des données (GET)
    getProfile: builder.query<UserProfile, void>({
      query: () => '/auth/me', // URL à appeler
      providesTags: ['User'], // Ce endpoint "fournit" des données User
    }),
    
    // MUTATION = pour modifier des données (POST, PUT, DELETE)
    updateProfile: builder.mutation<UserProfile, UpdateProfileRequest>({
      query: ({ id, userData }) => ({
        url: `/auth/profile/${id}`,
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User'], // Après cette action, on recharge les données User
    }),
    
    deleteProfile: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/auth/profile/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
    
    sendVerificationCode: builder.mutation<{ success: boolean; message: string }, string>({
      query: (email) => ({
        url: '/auth/send-code',
        method: 'POST',
        body: { email },
      }),
    }),
  }),
});

// RTK Query génère automatiquement ces hooks !
// useGetProfileQuery : pour récupérer le profil
// useUpdateProfileMutation : pour modifier le profil  
// etc.
export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useDeleteProfileMutation,
  useSendVerificationCodeMutation,
} = authApi;
```

---

## 7. DEVISAPI.TS - Endpoints pour les devis

**File:** `src/redux/api/devisApi.ts`

### Interfaces

```typescript
import { apiSlice } from './apiSlice';

// Interface pour créer un devis
export interface DevisRequest {
  genre?: string;
  couverture?: string;
  dateNaissance?: string;
  regimeSocial?: string;
  codePostal?: string;
  selectedCode?: null;
  dateDebutAssurance?: string;
  typeCouverture?: string;
  nom: string;
  prenom?: string;
  email: string;
  telephone?: string;
  accepteAppel?: string;
  conditionsAcceptees?: boolean;
  niveauRemboursement?: {
    soinsCourants: string;
    hospitalisation: string;
    dentaire: string;
    optique: string;
  };
  categories?: string;
}

// Interface pour la réponse
export interface DevisResponse {
  _id: string;
  nom: string;
  email: string;
  // autres champs selon votre API
}

// Interface pour mettre à jour un devis
export interface UpdateDevisRequest {
  id: string;
  data: Partial<DevisRequest>;
}
```

### Endpoints CRUD

```typescript
export const devisApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Créer un nouveau devis
    registerDevis: builder.mutation<DevisResponse, DevisRequest>({
      query: (data) => ({
        url: '/api/devis',
        method: 'POST',
        body: { ...data, categories: 'sante' }, // On force la catégorie à 'sante'
      }),
      invalidatesTags: ['Devis'], // On recharge tous les devis après création
    }),
    
    // Récupérer un devis par son ID
    getDevisById: builder.query<DevisResponse, string>({
      query: (id) => `/api/devis/${id}`,
      providesTags: (result, error, id) => [{ type: 'Devis', id }], // Tag spécifique à cet ID
    }),
    
    // Mettre à jour un devis
    updateDevis: builder.mutation<DevisResponse, UpdateDevisRequest>({
      query: ({ id, data }) => ({
        url: `/api/devis/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Devis', id }], // On recharge ce devis spécifique
    }),
    
    // Récupérer les devis par catégorie et email
    getDevisByCategory: builder.query<DevisResponse[], { categorie: string; email: string }>({
      query: ({ categorie, email }) => 
        `/api/devis/categorie?email=${encodeURIComponent(email)}&categories=${categorie}`,
      providesTags: ['Devis'],
    }),
    
    // Supprimer un devis
    deleteDevis: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/api/devis/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Devis'], // On recharge tous les devis après suppression
    }),
  }),
});

// Hooks générés automatiquement
export const {
  useRegisterDevisMutation,
  useGetDevisByIdQuery,
  useUpdateDevisMutation,
  useGetDevisByCategoryQuery,
  useDeleteDevisMutation,
} = devisApi;
```

---

## 8. CARTECONTEXT.TSX - Context pour le panier

**File:** `src/contexts/CartContext.tsx`

> ⚠️ **Attention :** Ce fichier utilise React Context, pas Redux. C'est une alternative à Redux pour gérer l'état local.

### Interfaces et Context

```typescript
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";

// Structure d'un article dans le panier
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

// Ce que notre contexte peut faire
interface CartContextType {
  cart: CartItem[]; // Liste des articles
  addToCart: (item: CartItem) => void; // Ajouter un article
  removeFromCart: (index: number) => void; // Supprimer un article
  updateQuantity: (index: number, quantity: number) => void; // Modifier la quantité
  calculateTotal: () => number; // Calculer le total
  clearCart: () => void; // Vider le panier
  itemCount: number; // Nombre total d'articles
}

// Création du contexte
const CartContext = createContext<CartContextType | undefined>(undefined);

// Hook pour utiliser le contexte (avec sécurité)
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
```

### Provider et logique

```typescript
interface CartProviderProps {
  children: ReactNode;
}

// Fonction pour charger le panier depuis localStorage
const loadCartFromStorage = (): CartItem[] => {
  try {
    const storedCart = localStorage.getItem("cart");
    return storedCart ? JSON.parse(storedCart) : [];
  } catch {
    return []; // Si erreur, panier vide
  }
};

// Le Provider : composant qui fournit le contexte
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(loadCartFromStorage);
  const [itemCount, setItemCount] = useState<number>(0);

  // À chaque changement du panier, on sauvegarde et on recalcule
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    setItemCount(cart.reduce((acc, item) => acc + item.quantity, 0));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart((prevCart) => {
      // On cherche si l'article existe déjà
      const existingItemIndex = prevCart.findIndex((i) => i.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Article existe : on augmente la quantité
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += item.quantity;
        updatedCart[existingItemIndex].total = 
          updatedCart[existingItemIndex].price * updatedCart[existingItemIndex].quantity;
        return updatedCart;
      }
      
      // Nouvel article : on l'ajoute
      return [...prevCart, { ...item, total: item.price * item.quantity }];
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prevCart) => {
      const updatedCart = [...prevCart];
      updatedCart.splice(index, 1); // Supprime l'élément à l'index donné
      return updatedCart;
    });
  };

  const updateQuantity = (index: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(index); // Si quantité 0, on supprime
      return;
    }

    setCart((prevCart) => {
      const updatedCart = [...prevCart];
      updatedCart[index].quantity = quantity;
      updatedCart[index].total = updatedCart[index].price * quantity;
      return updatedCart;
    });
  };

  const calculateTotal = (): number => {
    return cart.reduce((sum, item) => sum + item.total, 0);
  };

  const clearCart = () => {
    setCart([]);
  };

  // On "fournit" toutes ces fonctions aux composants enfants
  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        calculateTotal,
        clearCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
```

---

## Résumé pour un débutant

### Rôle de chaque fichier

1. **STORE.TS** = Le coffre-fort principal qui contient tout l'état de l'app

2. **HOOKS.TS** = Des outils pour faciliter l'utilisation de Redux avec TypeScript

3. **APISLICE.TS** = Configuration de base pour tous les appels API
   - Ajoute automatiquement le token d'auth
   - Gère le cache automatiquement

4. **AUTHSLICE.TS** = Gère la connexion/déconnexion
   - Sauvegarde dans localStorage
   - Actions sync (logout) et async (login)

5. **AUTHSERVICE.TS** = Fonctions pour appeler l'API d'authentification
   - `sendCode()` : envoie un code par email
   - `login()` : vérifie le code et connecte

6. **AUTHAPI.TS** = Endpoints RTK Query pour le profil utilisateur
   - Génère automatiquement les hooks (`useGetProfileQuery`, etc.)
   - Gère le cache et les mises à jour automatiques

7. **DEVISAPI.TS** = Endpoints RTK Query pour les devis
   - CRUD complet (Create, Read, Update, Delete)

8. **CARTECONTEXT.TSX** = Alternative à Redux pour le panier
   - Plus simple pour des données temporaires
   - Utilise React Context au lieu de Redux

### Différence Redux vs Context

- **Redux** : pour l'état global complexe (user, auth, données serveur)
- **Context** : pour l'état local simple (panier, modales, thème)

### Concepts clés

- **Store** : Le state global de l'application
- **Slice** : Une portion du state avec ses reducers
- **Actions** : Les événements qui modifient le state
- **Selectors** : Les fonctions pour lire le state
- **RTK Query** : Simplifie les appels API avec cache automatique
- **Middleware** : Intercepte les actions (pour les API, logs, etc.)