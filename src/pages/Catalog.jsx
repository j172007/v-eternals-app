import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useQuote } from '../context/useQuote';
import { PRODUCT_CATEGORIES } from '../data/categories';
import styles from './Catalog.module.css';

const normalizeSearchText = (value = '') => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^\p{L}\p{N}]/gu, '');

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchTerm, setSearchTerm] = useState('');
  const { addToQuote } = useQuote();

  // Carga de productos optimizada dentro del useEffect
  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setErrorMessage('');
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        const activeProducts = (data || [])
          .filter((product) => product.is_active !== false)
          .sort((first, second) => (first.sort_order || 0) - (second.sort_order || 0));
        if (isMounted) setProducts(activeProducts);
      } catch (error) {
        console.error('Error al cargar productos:', error.message);
        if (isMounted) setErrorMessage('No pudimos cargar el catálogo. Intenta nuevamente.');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtrado dinámico por categoría y término de búsqueda
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'Todas' || product.category === selectedCategory;
    const normalizedName = normalizeSearchText(product.name);
    const normalizedSearchTerm = normalizeSearchText(searchTerm);
    const matchesSearch = normalizedName.includes(normalizedSearchTerm);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className={styles.catalogPage}>
      <div className={styles.headerSection}>
        <span className={styles.preTitle}>COLECCIÓN EXCLUSIVA</span>
        <h1 className={styles.title}>Catálogo de Flores</h1>
      </div>

      {/* Controles de Búsqueda y Filtros */}
      <div className={styles.controlsContainer}>
        <input
          type="text"
          className={styles.searchBar}
          placeholder="Buscar por nombre del detalle..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className={styles.categoryTabs}>
          {['Todas', ...PRODUCT_CATEGORIES.map(({ value }) => value)].map((category) => (
            <button
              key={category}
              className={`${styles.tabBtn} ${
                selectedCategory === category ? styles.activeTab : ''
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'Todas'
                ? 'Todas las Categorías'
                : PRODUCT_CATEGORIES.find((item) => item.value === category)?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Productos cargados dinámicamente */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Cargando catálogo...</div>
      ) : errorMessage ? (
        <div className={styles.emptyState} role="alert">
          <p>{errorMessage}</p>
          <button type="button" onClick={() => window.location.reload()}>Reintentar</button>
        </div>
      ) : (
        <div className={styles.productsGrid}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => {
              const category = PRODUCT_CATEGORIES.find((item) => item.value === product.category);
              const badgeClass = product.category === 'Naturales'
                ? styles.badgeNatural
                : product.category === 'Detalles'
                  ? styles.badgeDetails
                  : styles.badgeEterna;

              return (
                <div key={product.id} className={styles.productCard}>
                  <div className={styles.imageFrame}>
                    <img
                      src={product.image_url || product.image || 'https://via.placeholder.com/300?text=Sin+Imagen'}
                      alt={product.name}
                      className={styles.productImage}
                    />
                  </div>

                  <span className={`${styles.categoryBadge} ${badgeClass}`}>
                    {category?.label || product.category || 'Eternas'}
                  </span>

                  <div className={styles.productInfo}>
                    <div className={styles.productCopy}>
                      <h3 className={styles.productName}>{product.name}</h3>
                      <p className={styles.productDetails}>{product.details || product.description}</p>
                    </div>

                    <div className={styles.productFooter}>
                      <div className={styles.productPrice}>
                        ${Number(product.price).toLocaleString('es-CO')}
                      </div>

                      <button
                        className={styles.addBtn}
                        onClick={() => addToQuote(product)}
                        title="Agregar a cotización"
                        aria-label={`Agregar ${product.name} a cotización`}
                      >
                        <svg viewBox="0 0 640 640" aria-hidden="true">
                          <path d="M256 64C256 46.3 241.7 32 224 32C206.3 32 192 46.3 192 64V96H160C124.7 96 96 124.7 96 160V192H544V160C544 124.7 515.3 96 480 96H448V64C448 46.3 433.7 32 416 32C398.3 32 384 46.3 384 64V96H256V64ZM96 240V480C96 515.3 124.7 544 160 544H480C515.3 544 544 515.3 544 480V240H96ZM224 304C241.7 304 256 318.3 256 336V416C256 433.7 241.7 448 224 448C206.3 448 192 433.7 192 416V336C192 318.3 206.3 304 224 304ZM416 304C433.7 304 448 318.3 448 336V416C448 433.7 433.7 448 416 448C398.3 448 384 433.7 384 416V336C384 318.3 398.3 304 416 304Z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={styles.emptyState}>
              No hay productos registrados o ninguno coincide con tu búsqueda.
            </div>
          )}
        </div>
      )}
    </div>
  );
}