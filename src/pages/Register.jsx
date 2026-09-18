import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import styles from './Register.module.css';

export default function Register() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      setLoading(true);

      // Enviamos el objeto con fullName, phone, email y password a la función de AuthContext
      await signUp(formData);

      alert('¡Cuenta creada exitosamente! Revisa tu correo si requiere confirmación.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Ocurrió un error al crear la cuenta.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerPage}>
      <div className={styles.card}>
        <h2 className={styles.title}>Crear Cuenta</h2>
        <p className={styles.subtitle}>
          Regístrate para personalizar tu experiencia y agilizar tus cotizaciones
        </p>

        {error && (
          <div className={styles.errorMessage}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            label="Nombre Completo"
            name="fullName"
            type="text"
            required
            placeholder="Ej: Laura Gómez"
            autoComplete="name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
          />
          <Input
            label="Teléfono / WhatsApp"
            name="phone"
            type="tel"
            required
            placeholder="Ej: 3001234567"
            autoComplete="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
          <Input
            label="Correo Electrónico"
            name="email"
            type="email"
            required
            placeholder="correo@ejemplo.com"
            autoComplete="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Contraseña"
            name="password"
            type="password"
            required
            placeholder="••••••••"
            autoComplete="new-password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />
          <Button type="submit" variant="primary" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </Button>
        </form>

        <p className={styles.footerText}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className={styles.loginLink}>
            Inicia Sesión
          </Link>
        </p>
      </div>
    </div>
  );
}