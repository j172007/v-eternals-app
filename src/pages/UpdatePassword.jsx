import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import styles from './Auth.module.css';

export default function UpdatePassword() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (password !== confirmation) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setLoading(true);
      await updatePassword(password);
      setMessage('Tu contraseña fue actualizada correctamente.');
      setPassword('');
      setConfirmation('');
    } catch (updateError) {
      setError(updateError.message || 'No fue posible actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authPage}>
      <div className={styles.authCard}>
        <span className={styles.preTitle}>RECUPERAR ACCESO</span>
        <h1 className={styles.title}>Nueva contraseña</h1>
        <p>Escribe y confirma tu nueva contraseña para recuperar el acceso.</p>

        {message && <div className={styles.successBox}>{message}</div>}
        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label htmlFor="new-password">Nueva contraseña</label>
            <input
              id="new-password"
              type="password"
              minLength={6}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="confirm-password">Confirmar contraseña</label>
            <input
              id="confirm-password"
              type="password"
              minLength={6}
              required
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder="Repite la contraseña"
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar contraseña'}
          </button>
        </form>

        {message && (
          <button type="button" className={styles.toggleBtn} onClick={() => navigate('/login')}>
            Volver a iniciar sesión
          </button>
        )}
      </div>
    </div>
  );
}
