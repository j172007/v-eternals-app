import { useState } from 'react';
import styles from './OurWorks.module.css';

// Edita esta lista para cambiar las imagenes de la galeria.
const WORKS = [
  { id: 'ramo-grande', name: 'Ramo de flores eternas', category: 'Eternas', image_url: '/Productos/RamoGrande.jpeg' },
  { id: 'caja-corazon', name: 'Caja de corazon doble', category: 'Detalles', image_url: '/Productos/CajaCorazonDoble.jpeg' },
  { id: 'oso-rosado', name: 'Oso eterno rosado', category: 'Eternas', image_url: '/Productos/OsoEternoRosado.jpeg' },
  { id: 'ramo-girasol', name: 'Ramo de girasoles', category: 'Naturales', image_url: '/Productos/RamoGirasol.jpeg' },
  { id: 'corazon-ferrero', name: 'Corazon con chocolates', category: 'Detalles', image_url: '/Productos/CorazonFerrero.jpeg' },
  { id: 'ramo-natural', name: 'Ramo natural', category: 'Naturales', image_url: '/Productos/RamoNatural.jpeg' },
  { id: 'conejo-eterno', name: 'Conejo eterno', category: 'Eternas', image_url: '/Productos/ConejoEterno.jpeg' },
];

export default function OurWorks() {
  const works = WORKS;
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <span className={styles.badge}>Galería</span>
        <h2 className={styles.title}>Nuestros Trabajos</h2>
        <p className={styles.subtitle}>
          Echa un vistazo a la variedad de arreglos y creaciones exclusivas que hemos entregado a nuestros clientes.
        </p>
      </div>

      {/* MURAL COLLAGE GRID */}
      <div className={styles.collageGrid}>
        {works.map((work, index) => (
          <div
            key={work.id}
            className={`${styles.collageItem} ${styles[`item${index + 1}`] || ''}`}
            onClick={() => setSelectedImage(work)}
          >
            <img src={work.image_url} alt={work.name} className={styles.image} loading="lazy" decoding="async" />
            <div className={styles.overlay}>
              <span className={styles.category}>{work.category || 'V_Eternals'}</span>
              <h3 className={styles.workTitle}>{work.name}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL / LIGHTBOX PARA VER LA FOTO EN GRANDE */}
      {selectedImage && (
        <div className={styles.lightbox} onClick={() => setSelectedImage(null)}>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={() => setSelectedImage(null)}>✕</button>
            <img src={selectedImage.image_url} alt={selectedImage.name} className={styles.lightboxImage} decoding="async" />
            <div className={styles.lightboxDetails}>
              <span>{selectedImage.category || 'Diseño Exclusivo'}</span>
              <h3>{selectedImage.name}</h3>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}