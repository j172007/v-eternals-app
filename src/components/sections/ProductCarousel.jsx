import styles from './ProductCarousel.module.css';
import { Link } from 'react-router-dom';

const PRODUCT_IMAGES = [
  { src: '/Productos/RamoGrande.jpeg', alt: 'Ramo de flores eternas' },
  { src: '/Productos/CajaCorazonDoble.jpeg', alt: 'Caja de corazones' },
  { src: '/Productos/OsoEternoRosado.jpeg', alt: 'Oso eterno rosado' },
  { src: '/Productos/RamoGirasol.jpeg', alt: 'Ramo de girasoles' },
  { src: '/Productos/CorazonFerrero.jpeg', alt: 'Corazon con chocolates' },
  { src: '/Productos/RamoRosasNaturales.jpeg', alt: 'Rosas naturales' },
];

export default function ProductCarousel() {
  return (
    <section className={styles.carousel} aria-label="Nuestros productos">
      <div className={styles.track}>
        {PRODUCT_IMAGES.map((image, index) => (
          <div
            className={styles.slide}
            key={image.src}
            style={{ '--slide-index': index }}
          >
            {/* Contenedor de la Imagen */}
            <div className={styles.imageContainer}>
              <img src={image.src} alt={index === 0 ? image.alt : ''} />
            </div>

            {/* Contenedor del Texto */}
            <div className={styles.contentContainer}>
              <span className={styles.eyebrow}>Detalles que perduran</span>
              <h1>Regalos hechos para recordar</h1>
              <p>Arreglos únicos para convertir cada ocasión en un momento especial.</p>
              <Link to="/catalogo" className={styles.cta}>Ver colección</Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}