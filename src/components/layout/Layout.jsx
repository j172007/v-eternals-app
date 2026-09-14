import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import styles from './Layout.module.css';

export default function Layout() {
  return (
    <div className={styles.layoutContainer}>
      <Header />
      <main className={styles.mainContent}>
        {/* <Outlet /> es el marcador donde React Router carga la vista actual */}
        <Outlet /> 
      </main>
      <Footer />
    </div>
  );
}