import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/useAuth';
import styles from './AdminSidebar.module.css';
import LogoVE from '../../assets/LogoVEt.png';

export default function AdminSidebar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoSection}>
        <Link to="/admin">
          <img src={LogoVE} alt="V_Eternals Logo" className={styles.logo} />
        </Link>
        <span className={styles.brandTitle}>V_Eternals Admin</span>
        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setMenuOpen((isOpen) => !isOpen)}
          aria-label={menuOpen ? 'Cerrar menú administrativo' : 'Abrir menú administrativo'}
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <nav
        className={`${styles.navMenu} ${menuOpen ? styles.navOpen : ''}`}
        onClick={() => setMenuOpen(false)}
      >
        <span className={styles.sectionHeader}>GESTIÓN</span>

        <NavLink
          to="/admin"
          end
          className={({ isActive }) =>
            isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
          }
        >
          <span className={styles.icon}>📋</span>
          <span>Cotizaciones</span>
        </NavLink>

        <NavLink
          to="/admin/productos"
          className={({ isActive }) =>
            isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
          }
        >
          <span className={styles.icon}>📦</span>
          <span>Gestión Productos</span>
        </NavLink>

        <NavLink
          to="/admin/analitica"
          className={({ isActive }) =>
            isActive ? `${styles.navItem} ${styles.active}` : styles.navItem
          }
        >
          <span className={styles.icon}>📊</span>
          <span>Analítica</span>
        </NavLink>

        <span className={styles.sectionHeader}>TIENDA</span>
        <Link to="/" className={styles.navItem} target="_blank">
          <span className={styles.icon}>🌐</span>
          <span>Ver Tienda Pública</span>
        </Link>
      </nav>

      <div className={styles.footer}>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          <span className={styles.icon}>🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}