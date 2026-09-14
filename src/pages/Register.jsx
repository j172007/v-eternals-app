import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Register.module.css'; // O el archivo CSS/Módulo que utilices para este diseño

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
    <div className={styles.registerPage || ''} style={{ maxWidth: '420px', margin: '50px auto', padding: '20px' }}>
      <div style={{ background: '#FFFFFF', padding: '30px', borderRadius: '12px', border: '1px solid #E0E0E0', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '8px', color: 'var(--color-text-main, #333)' }}>Crear Cuenta</h2>
        <p style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--color-text-muted, #666)', fontSize: '0.9rem' }}>
          Regístrate para personalizar tu experiencia y agilizar tus cotizaciones
        </p>

        {error && (
          <div style={{ backgroundColor: '#fde8e8', color: '#db2777', padding: '10px 14px', borderRadius: '6px', fontSize: '0.88rem', marginBottom: '16px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-main, #333)' }}>
              Nombre Completo
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Laura Gómez"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CCC', fontSize: '0.95rem', outline: 'none' }}
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            />
          </div>

          {/* 📱 CAMPO DE TELÉFONO / WHATSAPP */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-main, #333)' }}>
              Teléfono / WhatsApp
            </label>
            <input
              type="tel"
              required
              placeholder="Ej: 3001234567"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CCC', fontSize: '0.95rem', outline: 'none' }}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-main, #333)' }}>
              Correo Electrónico
            </label>
            <input
              type="email"
              required
              placeholder="correo@ejemplo.com"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CCC', fontSize: '0.95rem', outline: 'none' }}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--color-text-main, #333)' }}>
              Contraseña
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CCC', fontSize: '0.95rem', outline: 'none' }}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: '8px',
              padding: '12px',
              backgroundColor: 'var(--color-primary, #C9A9A6)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'opacity 0.2s'
            }}
          >
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.88rem', color: 'var(--color-text-muted, #666)' }}>
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary, #C9A9A6)', fontWeight: '600', textDecoration: 'none' }}>
            Inicia Sesión
          </Link>
        </p>
      </div>
    </div>
  );
}