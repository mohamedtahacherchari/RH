import React, { ReactNode } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import AppRoutes from './AppRoutes'





const App: React.FC = () => {
  return (
    <Provider store={store}>
      <Router>
        <AuthProvider>
          <CartProvider>
          <AppRoutes />
          </CartProvider>
        </AuthProvider>
      </Router>
    </Provider>
  );
};

export default App;
