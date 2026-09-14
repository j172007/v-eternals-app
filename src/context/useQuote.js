import { useContext } from 'react';
import { QuoteContext } from './QuoteContext.js';

export function useQuote() {
  const context = useContext(QuoteContext);
  if (!context) {
    throw new Error('useQuote debe usarse dentro de un QuoteProvider');
  }
  return context;
}