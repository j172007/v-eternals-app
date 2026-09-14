import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, profile, signOut } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Obtener la foto de Gmail/Google o fallback
  const googleAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  const userName = profile?.full_name || user?.user_metadata?.full_name || 'Usuario';
  const initial = userName.charAt(0).toUpperCase();

  // Cerrar el menú desplegable al hacer clic fuera de él
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
    <nav className={styles.navbar}>
      <div className={styles.logoContainer}>
        <Link to="/" className={styles.logo}>V_Eternals</Link>
      </div>

      <div className={styles.rightMenu}>
        <ul className={styles.navLinks}>
          <li>
            <Link to="/catalogo">Catálogo</Link>
          </li>
          <li>
            <Link to="/cotizacion">Mi Cotización</Link>
          </li>
        </ul>

        {/* SI EL USUARIO ESTÁ CONECTADO MOSTRAR AVATAR + DROPDOWN */}
        {user ? (
          <div className={styles.profileMenuContainer} ref={dropdownRef}>
            <button 
              className={styles.avatarBtn} 
              onClick={() => setDropdownOpen(!dropdownOpen)}
              title={userName}
            >
              {googleAvatar ? (
                <img src={googleAvatar} alt={userName} className={styles.avatarImg} />
              ) : (
                <div className={styles.avatarFallback}>{initial}</div>
              )}
            </button>

            {dropdownOpen && (
              <div className={styles.dropdownMenu}>
                <div className={styles.userInfoHeader}>
                  <span className={styles.userName}>{userName}</span>
                  <span className={styles.userEmail}>{user.email}</span>
                </div>

                <div className={styles.dropdownDivider} />

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

                <div className={styles.dropdownDivider} />

                <button onClick={handleLogout} className={styles.logoutBtn}>
                  🚪 Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        ) : (
          /* SI NO HAY SESIÓN MOSTRAR INICIAR SESIÓN Y REGISTRO */
          <div className={styles.authButtons}>
            <Link to="/login" className={styles.loginLink}>Iniciar Sesión</Link>
            <Link to="/register" className={styles.registerBtn}>Registrarse</Link>
          </div>
        )}
      </div>
    </nav>
  );
}