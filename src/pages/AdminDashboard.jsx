import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { calculateItemTotal, formatCurrency } from '../utils/quote';
import styles from './AdminDashboard.module.css';

const STATUS_OPTIONS = ['En proceso', 'Confirmado', 'Entregado', 'Cancelado'];

export default function AdminDashboard() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [adminNotes, setAdminNotes] = useState('');

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      const { data, error } = await supabase
        .from('quotes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuotes(data || []);
    } catch (err) {
      console.error('Error al cargar cotizaciones:', err.message);
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialQuotes = async () => {
      await fetchQuotes();
    };

    void loadInitialQuotes();
  }, []);

  // Función para cambiar el estado de la cotización en Supabase
  const handleStatusChange = async (quoteId, newStatus) => {
    try {
      setUpdatingId(quoteId);

      const { error } = await supabase
        .from('quotes')
        .update({ status: newStatus })
        .eq('id', quoteId);

      if (error) throw error;

      // Actualizar estado localmente
      setQuotes((prevQuotes) =>
        prevQuotes.map((q) => (q.id === quoteId ? { ...q, status: newStatus } : q))
      );

      if (selectedQuote && selectedQuote.id === quoteId) {
        setSelectedQuote((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert('Error al actualizar el estado: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleNotesSave = async () => {
    if (!selectedQuote) return;
    const { error } = await supabase
      .from('quotes')
      .update({ admin_notes: adminNotes })
      .eq('id', selectedQuote.id);

    if (error) {
      alert('Error al guardar la nota: ' + error.message);
      return;
    }

    setQuotes((prev) => prev.map((quote) => quote.id === selectedQuote.id
      ? { ...quote, admin_notes: adminNotes }
      : quote));
    setSelectedQuote((prev) => ({ ...prev, admin_notes: adminNotes }));
  };

  const filteredQuotes = quotes.filter((quote) => {
    const term = searchTerm.trim().toLowerCase();
    const matchesTerm = !term || `${quote.customer_name || ''} ${quote.phone || ''} ${quote.id}`.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'Todos' || (quote.status || 'En proceso') === statusFilter;
    return matchesTerm && matchesStatus;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('es-CO', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Confirmado':
        return styles.statusConfirmed;
      case 'Entregado':
        return styles.statusDelivered;
      case 'Cancelado':
        return styles.statusCancelled;
      default:
        return styles.statusInProcess;
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Panel de Cotizaciones</h1>
          <p className={styles.subtitle}>Gestión y seguimiento del estado de pedidos recibidos</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={fetchQuotes} className={styles.detailBtn}>
            🔄 Recargar
          </button>
          <div className={styles.statsCard}>
            <span>Total Cotizaciones</span>
            <strong>{quotes.length}</strong>
          </div>
        </div>
      </header>

      {errorMessage && (
        <div style={{ padding: '16px', backgroundColor: '#fde8e8', color: '#db2777', borderRadius: '8px', marginBottom: '20px' }}>
          <strong>Error de consulta:</strong> {errorMessage}
        </div>
      )}

      <div className={styles.filtersBar}>
        <input
          type="search"
          placeholder="Buscar por cliente, teléfono o ID..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          aria-label="Buscar cotizaciones"
        />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filtrar por estado">
          <option>Todos</option>
          {STATUS_OPTIONS.map((status) => <option key={status}>{status}</option>)}
        </select>
      </div>

      {loading ? (
        <div className={styles.loadingState}>Cargando cotizaciones...</div>
      ) : quotes.length === 0 ? (
        <div className={styles.emptyState}>No se han recibido cotizaciones hasta el momento o no cuentas con los permisos adecuados.</div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredQuotes.map((quote) => {
                const grandTotal = quote.total_amount ?? quote.total ?? 0;
                const currentStatus = quote.status || 'En proceso';

                return (
                  <tr key={quote.id}>
                    <td>{formatDate(quote.created_at)}</td>
                    <td>
                      <strong>{quote.customer_name || 'Anónimo'}</strong>
                    </td>
                    <td>{quote.phone || 'No especificado'}</td>
                    <td>
                      <select
                        value={currentStatus}
                        disabled={updatingId === quote.id}
                        onChange={(e) => handleStatusChange(quote.id, e.target.value)}
                        className={`${styles.statusSelect} ${getStatusClass(currentStatus)}`}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className={styles.totalCell}>{formatCurrency(grandTotal)}</td>
                    <td>
                      <button
                        className={styles.detailBtn}
                        onClick={() => {
                          setSelectedQuote(quote);
                          setAdminNotes(quote.admin_notes || '');
                        }}
                      >
                        Ver Detalle
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL CON EL DESGLOSE Y ESTADO DE LA COTIZACIÓN */}
      {selectedQuote && (
        <div className={styles.modalOverlay} onClick={() => setSelectedQuote(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Cotización #{selectedQuote.id.slice(0, 8)}</h2>
              <button className={styles.closeBtn} onClick={() => setSelectedQuote(null)}>✕</button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.infoGroup}>
                <p><strong>Fecha:</strong> {formatDate(selectedQuote.created_at)}</p>
                <p><strong>Cliente:</strong> {selectedQuote.customer_name}</p>
                <p><strong>Teléfono:</strong> {selectedQuote.phone}</p>
                <p><strong>Ocasión:</strong> {selectedQuote.occasion || 'No especificada'}</p>
                <p><strong>Fecha deseada:</strong> {selectedQuote.delivery_date || 'Por confirmar'}</p>
                <p><strong>Notas:</strong> {selectedQuote.notes || 'Sin notas adicionales'}</p>
                <p style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <strong>Estado:</strong>
                  <select
                    value={selectedQuote.status || 'En proceso'}
                    onChange={(e) => handleStatusChange(selectedQuote.id, e.target.value)}
                    className={`${styles.statusSelect} ${getStatusClass(selectedQuote.status || 'En proceso')}`}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </p>
              </div>

              <label className={styles.notesField}>
                Nota interna
                <textarea
                  value={adminNotes}
                  onChange={(event) => setAdminNotes(event.target.value)}
                  placeholder="Seguimiento, pago, entrega o acuerdos..."
                  rows="3"
                />
                <button type="button" className={styles.detailBtn} onClick={handleNotesSave}>Guardar nota</button>
              </label>

              <h3>Productos Solicitados</h3>
              <div className={styles.itemsDetailList}>
                {Array.isArray(selectedQuote.items) &&
                  selectedQuote.items.map((item, idx) => (
                    <div key={idx} className={styles.detailCard}>
                      <div className={styles.detailCardHeader}>
                        <strong>{item.quantity}x {item.name}</strong>
                        <span>{formatCurrency(calculateItemTotal(item))}</span>
                      </div>
                      <p className={styles.subDetail}>
                        <strong>Tamaño:</strong> {item.size || 'N/A'} | <strong>Color:</strong>{' '}
                        {item.color === 'Personalizado / Varios tonos' && item.customColors?.length
                          ? item.customColors.join(', ')
                          : item.color || 'N/A'}
                      </p>
                      {item.addons && item.addons.length > 0 && (
                        <p className={styles.subDetail}>
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