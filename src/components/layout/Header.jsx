import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import styles from "./Header.module.css";
import { useQuote } from '../../context/useQuote';
import { useAuth } from '../../context/useAuth';

import LogoVE from "../../assets/LogoVEt.png";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { quoteItems } = useQuote();
  const { user, profile, signOut } = useAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const googleAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const userName = profile?.full_name || user?.user_metadata?.full_name || 'Usuario';
  const initial = userName.charAt(0).toUpperCase();

  const totalItems = quoteItems.reduce(
    (total, item) => total + item.quantity,
    0,
  );

  useEffect(() => {
    if (location.hash === "#sobre-nosotros") {
      document.getElementById("sobre-nosotros")?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await signOut();
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <Link to="/" className={styles.mobileLogo} aria-label="Ir al inicio">
        <img src={LogoVE} alt="Logo V_Eternals" />
      </Link>

      <button
        type="button"
        className={styles.menuButton}
        onClick={() => setMobileMenuOpen((isOpen) => !isOpen)}
        aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={mobileMenuOpen}
      >
        <span />
        <span />
        <span />
      </button>

      {/* Navegación principal */}
      <nav
        className={`${styles.nav} ${mobileMenuOpen ? styles.navOpen : ''}`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <ul className={styles.navLinks}>
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              Inicio
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/catalogo"
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              Catálogo
            </NavLink>
          </li>
          <div className={styles.logoContainer}>
            <Link to="/">
              <img src={LogoVE} alt="Logo V_Eternals" className={styles.logo} />
            </Link>
          </div>
          <li>
            <NavLink
              to="/cotizacion"
              className={({ isActive }) =>
                isActive ? `${styles.link} ${styles.active}` : styles.link
              }
            >
              <span className={styles.quoteWrapper}>
                Mi Cotización
                {totalItems > 0 && (
                  <span className={styles.badge}>{totalItems}</span>
                )}
              </span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/#sobre-nosotros" className={styles.link}>
              Sobre Nosotros
            </NavLink>
          </li>
          {user && (
            <li className={styles.mobileLogoutItem}>
              <button type="button" onClick={handleLogout} className={styles.mobileLogoutBtn}>
                Cerrar Sesión
              </button>
            </li>
          )}
        </ul>
      </nav>

      <div className={styles.container}>
        {user ? (
          <div className={styles.profileContainer} ref={dropdownRef}>
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)} 
              className={styles.iconButton} 
              title={userName}
            >
              {googleAvatar ? (
                <img 
                  src={googleAvatar} 
                  alt={userName} 
                  className={styles.avatarImage}
                />
              ) : (
                <div className={styles.avatarInitials}>
                  {initial}
                </div>
              )}
            </button>

            {/* Menú Desplegable Flotante */}
            {dropdownOpen && (
              <div className={styles.dropdownMenu}>
                <div className={styles.userInfoHeader}>
                  <span className={styles.userName}>{userName}</span>
                  <span className={styles.userEmail}>{user.email}</span>
                </div>

                {/* 👤 Opción de Perfil de Usuario */}
                <Link 
                  to="/perfil" 
                  className={styles.dropdownItem}
                  onClick={() => setDropdownOpen(false)}
                >
                  👤 Mi Perfil
                </Link>

                <Link 
                  to="/mis-cotizaciones" 
                  className={styles.dropdownItem}
                  onClick={() => setDropdownOpen(false)}
                >
                  🌸 Mis Cotizaciones
                </Link>

                {profile?.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    className={styles.dropdownItem}
                    onClick={() => setDropdownOpen(false)}
                  >
                    👑 Panel de Admin
                  </Link>
                )}

                <button onClick={handleLogout} className={styles.logoutBtn}>
                  🚪 Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className={styles.iconButton} title="Iniciar Sesión">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 640 640"
              className={styles.svgIcon}
            >
              <path d="M320 312C386.3 312 440 258.3 440 192C440 125.7 386.3 72 320 72C253.7 72 200 125.7 200 192C200 258.3 253.7 312 320 312zM290.3 368C191.8 368 112 447.8 112 546.3C112 562.7 125.3 576 141.7 576L498.3 576C514.7 576 528 562.7 528 546.3C528 447.8 448.2 368 349.7 368L290.3 368z" />
            </svg>
          </Link>
        )}
      </div>
    </header>
  );
}