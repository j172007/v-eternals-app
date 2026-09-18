import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import styles from './Auth.module.css';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

export default function Auth() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const sessionData = await signIn(formData);
      navigate(sessionData.profile?.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      const message = err.message?.toLowerCase();

      if (message?.includes('invalid login credentials')) {
        setErrorMsg('El correo o la contraseña no son correctos.');
      } else if (message?.includes('email not confirmed')) {
        setErrorMsg('Confirma tu correo electrónico antes de iniciar sesión.');
      } else {
        setErrorMsg(err.message || 'Ocurrió un error al iniciar sesión.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <span className={styles.preTitle}>ACCESO Y REGISTRO</span>
        <h1 className={styles.title}>Iniciar Sesión</h1>

        {errorMsg && <div className={styles.errorBox}>{errorMsg}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Correo Electrónico"
            name="email"
            type="email"
            placeholder="tu@email.com"
            autoComplete="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <Input
            label="Contraseña"
            name="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            required
            minLength={6}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => navigate('/recuperar-clave')}
          >
            ¿Olvidaste tu contraseña?
          </button>

          <Button type="submit" variant="dark" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Cargando...' : 'Entrar'}
          </Button>
        </form>

        <div className={styles.toggleBox}>
          <span>¿Aún no tienes cuenta?</span>
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => navigate('/register')}
          >
            Regístrate aquí
          </button>
        </div>
      </div>
    </div>
  );
}