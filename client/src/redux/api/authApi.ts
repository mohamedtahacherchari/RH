// File: src/redux/api/authApi.ts
import { apiSlice } from './apiSlice';
import { User } from '../slices/authSlice';

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

export interface UpdateProfileRequest {
  id: string;
  userData: Partial<UserProfile>;
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<UserProfile, void>({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation<UserProfile, UpdateProfileRequest>({
      query: ({ id, userData }) => ({
        url: `/auth/profile/${id}`,
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: ['User'],
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

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useDeleteProfileMutation,
  useSendVerificationCodeMutation,
} = authApi;