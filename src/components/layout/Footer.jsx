import { Link, NavLink } from 'react-router-dom';
import styles from './Footer.module.css';
import LogoVE from '../../assets/LogoVEt.png';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInfo}>
        <p>&copy; {new Date().getFullYear()} V_Eternals. Todos los derechos reservados.</p>
        <p>Catálogo y Cotizaciones a tu medida.</p>
      </div>

      <Link to="/" className={styles.logoLink} aria-label="Ir al inicio">
        <img src={LogoVE} alt="Logo V_Eternals" className={styles.logo} />
      </Link>

      <nav className={styles.footerNav} aria-label="Navegación del pie de página">
        <NavLink to="/" className={styles.navLink}>Inicio</NavLink>
        <NavLink to="/catalogo" className={styles.navLink}>Catálogo</NavLink>
        <NavLink to="/cotizacion" className={styles.navLink}>Mi Cotización</NavLink>
        <NavLink to="/#sobre-nosotros" className={styles.navLink}>Sobre Nosotros</NavLink>
      </nav>
    </footer>
  );
}