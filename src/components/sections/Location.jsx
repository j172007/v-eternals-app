import styles from './Location.module.css';

export default function Location() {
  return (
    <section className={styles.section} id="ubicacion">
      <div className={styles.header}>
        <span className={styles.subtitle}>Encuéntranos</span>
        <h2 className={styles.title}>Ubicación</h2>
        <p className={styles.description}>
          Estamos en Marinilla, Antioquia. Coordina tu pedido por WhatsApp y acordamos entrega o envío.
        </p>
      </div>

      <div className={styles.contentGrid}>
        
        {/* Columna Izquierda: Tarjetas de Información */}
        <div className={styles.cardsContainer}>
          
          {/* Tarjeta 1: Dirección (Ancho completo) */}
          <div className={`${styles.card} ${styles.fullWidthCard}`}>
            <div className={styles.iconCircle}>
              <svg viewBox="0 0 384 512"><path d="M215.7 499.2C267 435 384 279.4 384 192C384 86 298 0 192 0S0 86 0 192c0 87.4 117 243 168.3 307.2c12.3 15.3 35.1 15.3 47.4 0zM192 128a64 64 0 1 1 0 128 64 64 0 1 1 0-128z"/></svg>
            </div>
            <div className={styles.cardText}>
              <h3>Dirección</h3>
              <p>Marinilla, Antioquia 054020, Colombia</p>
            </div>
          </div>

          {/* Tarjeta 2: Horario (Mitad de ancho) */}
          <div className={styles.card}>
            <div className={styles.iconCircle}>
              <svg viewBox="0 0 512 512"><path d="M256 0a256 256 0 1 1 0 512A256 256 0 1 1 256 0zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"/></svg>
            </div>
            <div className={styles.cardText}>
              <h3>Horario</h3>
              <p>Lunes a sábado<br/>9:00 a.m. - 6:00 p.m.</p>
            </div>
          </div>

          {/* Tarjeta 3: Contacto (Mitad de ancho) */}
          <div className={styles.card}>
            <div className={styles.iconCircle}>
              <svg viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157.1zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>
            </div>
            <div className={styles.cardText}>
              <h3>Contacto</h3>
              <p>WhatsApp<br/>+57 302 3172619</p>
            </div>
          </div>

        </div>

        {/* Columna Derecha: Mapa de Google */}
        <div className={styles.mapContainer}>
          <iframe 
            src="https://www.google.com/maps?q=Marinilla,+Antioquia&z=14&output=embed" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen="" 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade"
            title="Mapa de Marinilla"
          ></iframe>
        </div>

      </div>
    </section>
  );
}