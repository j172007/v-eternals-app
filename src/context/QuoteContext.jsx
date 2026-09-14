import { useState, useEffect } from 'react';
import { QuoteContext } from './QuoteContext.js';

export function QuoteProvider({ children }) {
  const [quoteItems, setQuoteItems] = useState(() => {
    try {
      const saved = localStorage.getItem('v_eternals_quote');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error al cargar la cotización de localStorage:', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('v_eternals_quote', JSON.stringify(quoteItems));
    } catch (e) {
      console.error('Error al guardar en localStorage:', e);
    }
  }, [quoteItems]);

  const addToQuote = (product) => {
    setQuoteItems((prev) => {
      const lineId = `${product.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      return [
        ...prev,
        {
          ...product,
          id: lineId,
          product_id: product.id,
          quantity: 1,
          size: product.size || '',
          color: 'Rojas',
          addons: [],
          customColors: [],
        }
      ];
    });
  };

  const removeFromQuote = (id) => {
    setQuoteItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (id, key, value) => {
    setQuoteItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [key]: value } : item))
    );
  };

  const toggleAddon = (itemId, addon) => {
    setQuoteItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const exists = item.addons.some((a) => a.name === addon.name);
        const newAddons = exists
          ? item.addons.filter((a) => a.name !== addon.name)
          : [...item.addons, addon];
        return { ...item, addons: newAddons };
      })
    );
  };

  const clearQuote = () => {
    setQuoteItems([]);
    localStorage.removeItem('v_eternals_quote');
  };

  const totalItems = quoteItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <QuoteContext.Provider
      value={{
        quoteItems,
        totalItems,
        addToQuote,
        removeFromQuote,
        updateItem,
        toggleAddon,
        clearQuote
      }}
    >
      {children}
    </QuoteContext.Provider>
  );
}
