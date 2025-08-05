// File: src/redux/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { login } from '../services/authService';

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

interface AuthState {
  user: User | null;
  token: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

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
    return { user: null, token: null };
  }
};

const { user, token } = loadStoredAuthState();

const initialState: AuthState = {
  user,
  token,
  status: 'idle',
  error: null,
};

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, code }: { email: string; code: string }, { rejectWithValue }) => {
    try {
      const response = await login(email, code);
      // Store in localStorage
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Échec de connexion');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload as string;
      });
  },
});

export const { logout, updateUserProfile } = authSlice.actions;

// Selectors
export const selectUser = (state: RootState) => state.auth.user;
export const selectToken = (state: RootState) => state.auth.token;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectIsAuthenticated = (state: RootState) => !!state.auth.token;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;