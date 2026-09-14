import styles from './AboutUs.module.css';

export default function AboutUs() {
  return (
    <section className={styles.section} id="sobre-nosotros">
      <div className={styles.sectionHeader}>
        <span className={styles.subtitle}>Conócenos</span>
        <h2 className={styles.title}>Sobre Nosotros</h2>
      </div>

      <div className={styles.overlapContainer}>
        
        {/* Recuadro 1: ¿Quiénes Somos? (Equivalente al cuadro negro) */}
        <div className={styles.leftBox}>
          <h3 className={styles.heading}>¿Quiénes somos?</h3>
          <p className={styles.text}>
            Somos una tienda dedicada a crear detalles únicos que convierten sentimientos en recuerdos. Diseñamos arreglos con flores eternas, naturales y adorables ositos, pensados para sorprender y expresar eso que a veces las palabras no pueden decir. 🌹✨
          </p>
        </div>

        {/* Recuadro 2: Imagen (Equivalente al cuadro rosado) */}
        <div className={styles.centerBox}>
          <img 
            src="/Productos/ConejoEterno.jpeg" 
            alt="Detalle V_Eternals" 
            className={styles.image} 
          />
        </div>

        {/* Recuadro 3: ¿Por qué elegirnos? (Equivalente al cuadro amarillo) */}
        <div className={styles.rightBox}>
          <h3 className={styles.heading}>¿Por qué elegirnos?</h3>
          <p className={styles.introText}>
            Creemos que un regalo debe ser especial y memorable.
          </p>
          <ul className={styles.list}>
            <li><span className={styles.listIcon}>✨</span> Diseños con amor y dedicación.</li>
            <li><span className={styles.listIcon}>🌹</span> Flores eternas que conservan su belleza.</li>
            <li><span className={styles.listIcon}>🌸</span> Opciones con flores naturales.</li>
            <li><span className={styles.listIcon}>🧸</span> Detalles originales y personalizados.</li>
            <li><span className={styles.listIcon}>🎁</span> Presentaciones muy cuidadas.</li>
          </ul>
        </div>

      </div>
    </section>
  );
}