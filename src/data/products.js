export const products = [
  {
    id: 'ramo-rosas-eternas',
    name: 'Ramo de Rosas Eternas',
    category: 'Eternas',
    description: 'Flores eternas personalizables. Incluye mensaje/fotos y mariposas decorativas.',
    // Precios base según la cantidad de rosas:
    variants: [
      { size: '12 Rosas', price: 57000 },
      { size: '25 Rosas', price: 93000 },
      { size: '50 Rosas', price: 152000 },
      { size: '100 Rosas', price: 300000 },
      { size: '200 Rosas', price: 595000 }
    ]
  },
  {
    id: 'ramo-rosas-naturales',
    name: 'Ramo de Rosas Naturales',
    category: 'Naturales',
    description: 'Incluye mensaje/fotografías y mariposas decorativas.',
    variants: [
      { size: 'Aprox. 20 rosas (1 tono)', price: 104000 },
      { size: 'Aprox. 35-40 rosas (1-2 tonos)', price: 130000 },
      { size: 'Aprox. 60-65 rosas (1-3 tonos)', price: 180000 },
      { size: 'Aprox. 80-90 rosas (1-4 tonos)', price: 210000 }
    ]
  }
];