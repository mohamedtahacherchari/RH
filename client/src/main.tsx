import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';

import App from './App'; // ne pas mettre .js en TypeScript
import { AuthProvider } from './context/AuthContext';
import { Provider } from 'react-redux';
import {store }from './redux/store';

// Récupérer l'élément racine
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error("L'élément avec l'ID 'root' est introuvable.");
}

// Créer la racine React et démarrer le rendu
createRoot(rootElement).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </Provider>
  </StrictMode>
);
