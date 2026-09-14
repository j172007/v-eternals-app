import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/useAuth';
import { calculateItemTotal, formatCurrency } from '../utils/quote';
import styles from './UserDashboard.module.css';

export default function UserDashboard() {
  const { user, profile } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchUserQuotes = async () => {
      try {
        if (!user) return;
        setLoading(true);

        const { data, error } = await supabase
          .from('quotes')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        if (isMounted) setQuotes(data || []);
      } catch (err) {
        console.error('Error al cargar historial de cotizaciones:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserQuotes();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  return (
    <div className={styles.userDashboardContainer}>
      <header className={styles.header}>
        <div>
          <span className={styles.welcomeBadge}>MI CUENTA</span>
          <h1 className={styles.title}>Hola, {profile?.full_name || 'Cliente'}</h1>
          <p className={styles.subtitle}>Consulta el historial detallado de tus cotizaciones solicitadas</p>
        </div>
        <div className={styles.statsCard}>
          <span>Cotizaciones Realizadas</span>
          <strong>{quotes.length}</strong>
        </div>
      </header>

      {loading ? (
        <div className={styles.loadingState}>Cargando tu historial...</div>
      ) : quotes.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Aún no has solicitado cotizaciones con tu cuenta.</p>
        </div>
      ) : (
        <div className={styles.quotesGrid}>
          {quotes.map((quote) => {
            const items = Array.isArray(quote.items) ? quote.items : [];
            const grandTotal = quote.total_amount ?? quote.total ?? 0;

            return (
              <div key={quote.id} className={styles.quoteCard}>
                <div className={styles.cardHeader}>
                  <div>
                    <span className={styles.quoteId}>Cotización #{quote.id.slice(0, 8)}</span>
                    <span className={styles.quoteDate}>{formatDate(quote.created_at)}</span>
                    <span className={styles.statusBadge}>{quote.status || 'En proceso'}</span>
                  </div>
                  <strong className={styles.quoteTotal}>{formatCurrency(grandTotal)}</strong>
                </div>

                <div className={styles.itemsPreview}>
                  <p>
                    <strong>{items.length} producto(s):</strong>{' '}
                    {items.map((i) => i.name).join(', ')}
                  </p>
                </div>

                <button
                  className={styles.detailBtn}
                  onClick={() => setSelectedQuote(quote)}
                >
                  Ver Desglose Completo
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DETALLADO DE COTIZACIÓN */}
      {selectedQuote && (
        <div className={styles.modalOverlay} onClick={() => setSelectedQuote(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Detalle de Cotización #{selectedQuote.id.slice(0, 8)}</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedQuote(null)}>✕</button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.infoBox}>
                <p><strong>Fecha de solicitud:</strong> {formatDate(selectedQuote.created_at)}</p>
                <p><strong>Contacto:</strong> {selectedQuote.customer_name} ({selectedQuote.phone})</p>
                <p><strong>Estado:</strong> {selectedQuote.status || 'En proceso'}</p>
                <p><strong>Ocasión:</strong> {selectedQuote.occasion || 'No especificada'}</p>
                <p><strong>Fecha deseada:</strong> {selectedQuote.delivery_date || 'Por confirmar'}</p>
                <p><strong>Notas:</strong> {selectedQuote.notes || 'Sin notas adicionales'}</p>
              </div>

              <h3>Arreglos Seleccionados</h3>
              <div className={styles.itemsList}>
                {Array.isArray(selectedQuote.items) &&
                  selectedQuote.items.map((item, idx) => (
                    <div key={idx} className={styles.itemDetailCard}>
                      <div className={styles.itemDetailHeader}>
                        <strong>{item.quantity}x {item.name}</strong>
                        <span>{formatCurrency(calculateItemTotal(item))}</span>
                      </div>
                      <p className={styles.subText}>
                        <strong>Tamaño:</strong> {item.size || 'N/A'}
                      </p>
                      <p className={styles.subText}>
                        <strong>Color / Tonos:</strong>{' '}
                        {item.color === 'Personalizado / Varios tonos' && item.customColors?.length
                          ? item.customColors.join(', ')
                          : item.color || 'N/A'}
                      </p>
                      {item.addons && item.addons.length > 0 && (
                        <p className={styles.subText}>
                          <strong>Adiciones:</strong>{' '}
                          {item.addons.map((a) => a.name).join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
              </div>

              <div className={styles.modalFooter}>
                <span>Total Estimado:</span>
                <strong>{formatCurrency(selectedQuote.total_amount ?? selectedQuote.total ?? 0)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}