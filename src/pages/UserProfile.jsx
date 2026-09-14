import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import styles from './UserProfile.module.css';

export default function UserProfile() {
  const { user, profile, updatePassword, updateUserProfile } = useAuth();

  const [fullName, setFullName] = useState(profile?.full_name || profile?.name || user?.user_metadata?.full_name || '');
  const [phone, setPhone] = useState(profile?.phone || profile?.phone_number || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage(null);

      if (password && password !== passwordConfirmation) {
        throw new Error('Las contraseñas no coinciden.');
      }

      await updateUserProfile({ fullName, phone, email });
      if (password) await updatePassword(password);
      setPassword('');
      setPasswordConfirmation('');

      setMessage({ type: 'success', text: '¡Perfil actualizado exitosamente!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Error al actualizar el perfil.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.card}>
        <h1 className={styles.title}>Mi Perfil</h1>
        <p className={styles.subtitle}>Gestiona los datos de contacto para tus pedidos y cotizaciones</p>

        {message && (
          <div className={message.type === 'success' ? styles.successAlert : styles.errorAlert}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Datos de contacto editables */}
          <div className={styles.inputGroup}>
            <label htmlFor="fullName">Nombre Completo</label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="newPassword">Nueva contraseña (opcional)</label>
            <input
              id="newPassword"
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="passwordConfirmation">Confirmar nueva contraseña</label>
            <input
              id="passwordConfirmation"
              type="password"
              minLength={6}
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              placeholder="Repite la contraseña"
            />
          </div>

          {/* Campo Teléfono: Editable */}
          <div className={styles.inputGroup}>
            <label htmlFor="phone">Teléfono / WhatsApp</label>
            <input
              id="phone"
              type="tel"
              required
              placeholder="Ej: 3001234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Campo Correo: Editable */}
          <div className={styles.inputGroup}>
            <label htmlFor="email">Correo Electrónico</label>
            <input
              id="email"
              type="email"
              required
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button type="submit" disabled={loading} className={styles.saveBtn}>
            {loading ? 'Guardando cambios...' : 'Guardar Cambios'}
          </button>
        </form>
      </div>
    </div>
  );
}