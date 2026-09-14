import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './routes/AppRouter';
import { AuthProvider } from './context/AuthContext.jsx';
import { QuoteProvider } from './context/QuoteContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <QuoteProvider>
        <AppRouter />
      </QuoteProvider>
    </AuthProvider>
  </React.StrictMode>
);