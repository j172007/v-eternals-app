import styles from './ProductCard.module.css';
import { useQuote } from '../../context/useQuote';
import { PRODUCT_CATEGORIES } from '../../data/categories';

export default function ProductCard({ product }) {
  const { addToQuote } = useQuote();

  const category = PRODUCT_CATEGORIES.find((item) => item.value === product.category);
  const badgeClass = product.category === 'Naturales'
    ? styles.badgeNatural
    : product.category === 'Detalles'
      ? styles.badgeDetails
      : styles.badgeEterna;

  return (
    <article className={styles.card}>
      <span className={`${styles.categoryBadge} ${badgeClass}`}>
        {category?.label || product.category || 'Eternas'}
      </span>

      <div className={styles.imageContainer}>
        <img src={product.image} alt={product.name} className={styles.image} loading="lazy" decoding="async" />
      </div>
      
      <div className={styles.infoBox}>
        <div className={styles.details}>
          <h3 className={styles.name}>{product.name}</h3>
          <p className={styles.shortDescription}>{product.details}</p>
          <span className={styles.price}>${product.price}</span>
        </div>
        
        <button 
          className={styles.cartButton} 
          onClick={() => addToQuote(product)}
          title="Añadir a cotización"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className={styles.cartIcon}>
            <path d="M160 112c0-44.2 35.8-80 80-80s80 35.8 80 80v48H160V112zm-48 48H48c-26.5 0-48 21.5-48 48V416c0 53 43 96 96 96h256c53 0 96-43 96-96V208c0-26.5-21.5-48-48-48H336V112C336 50.1 285.9 0 224 0S112 50.1 112 112v48zm24 48a24 24 0 1 1 0 48 24 24 0 1 1 0-48zm152 24a24 24 0 1 1 48 0 24 24 0 1 1 -48 0z"/>
          </svg>
        </button>
      </div>
    </article>
  );
}