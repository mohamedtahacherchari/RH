// File: src/redux/api/devisApi.ts
import { apiSlice } from './apiSlice';

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

export interface DevisResponse {
  selectedCode: any;
  niveauRemboursement: any;
  conditionsAcceptees: boolean;
  accepteAppel: string;
  telephone: string;
  prenom: string;
  dateDebutAssurance: string;
  regimeSocial: string;
  codePostal: string;
  genre: string;
  dateNaissance: string;
  couverture: string;
  _id: string;
  nom: string;
  email: string;
  // autres champs selon votre API
}

export interface UpdateDevisRequest {
  id: string;
  data: Partial<DevisRequest>;
}

export const devisApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    registerDevis: builder.mutation<DevisResponse, DevisRequest>({
      query: (data) => ({
        url: '/api/devis',
        method: 'POST',
        body: { ...data, categories: 'sante' },
      }),
      invalidatesTags: ['Devis'],
    }),
    getDevisById: builder.query<DevisResponse, string>({
      query: (id) => `/api/devis/${id}`,
      providesTags: (result, error, id) => [{ type: 'Devis', id }],
    }),
    updateDevis: builder.mutation<DevisResponse, UpdateDevisRequest>({
      query: ({ id, data }) => ({
        url: `/api/devis/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: 'Devis', id }],
    }),
    getDevisByCategory: builder.query<DevisResponse[], { categorie: string; email: string }>({
      query: ({ categorie, email }) => 
        `/api/devis/categorie?email=${encodeURIComponent(email)}&categories=${categorie}`,
      providesTags: ['Devis'],
    }),
    deleteDevis: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/api/devis/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Devis'],
    }),
  }),
});

export const {
  useRegisterDevisMutation,
  useGetDevisByIdQuery,
  useUpdateDevisMutation,
  useGetDevisByCategoryQuery,
  useDeleteDevisMutation,
} = devisApi;