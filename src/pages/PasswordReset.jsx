import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import styles from './Auth.module.css';

export default function PasswordReset() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      await resetPassword(email);
      setMessage('Revisa tu correo para continuar con el cambio de contraseña.');
    } catch (resetError) {
      setError(resetError.message || 'No fue posible enviar el correo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <span className={styles.preTitle}>RECUPERAR ACCESO</span>
        <h1 className={styles.title}>Restablecer contraseña</h1>
        <p>Escribe tu correo y te enviaremos un enlace para recuperar el acceso.</p>
        {message && <div className={styles.successBox}>{message}</div>}
        {error && <div className={styles.errorBox}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label htmlFor="reset-email">Correo Electrónico</label>
            <input
              id="reset-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar enlace'}
          </button>
        </form>
      </div>
    </div>
  );
}