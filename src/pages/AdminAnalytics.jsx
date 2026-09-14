import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import styles from './AdminAnalytics.module.css';

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    totalIngresos: 0,
    ingresosConfirmados: 0,
    totalCotizaciones: 0,
    confirmadasCount: 0,
    entregadasCount: 0,
    canceladasCount: 0,
    enProcesoCount: 0,
    ticketPromedio: 0,
    topProductos: [],
  });

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const { data: quotes, error } = await supabase.from('quotes').select('*');

      if (error) throw error;

      if (!quotes || quotes.length === 0) {
        setLoading(false);
        return;
      }

      let totalIngresos = 0;
      let ingresosConfirmados = 0;
      let confirmadasCount = 0;
      let entregadasCount = 0;
      let canceladasCount = 0;
      let enProcesoCount = 0;
      const productMap = {};

      quotes.forEach((q) => {
        const amount = Number(q.total_amount || q.total || 0);
        const status = q.status || 'En proceso';

        totalIngresos += amount;

        if (status === 'Confirmado' || status === 'Entregado') {
          ingresosConfirmados += amount;
        }

        if (status === 'Confirmado') confirmadasCount++;
        else if (status === 'Entregado') entregadasCount++;
        else if (status === 'Cancelado') canceladasCount++;
        else enProcesoCount++;

        // Recuento de productos solicitados
        if (Array.isArray(q.items)) {
          q.items.forEach((item) => {
            const name = item.name || 'Producto';
            const qty = item.quantity || 1;
            productMap[name] = (productMap[name] || 0) + qty;
          });
        }
      });

      // Ordenar top productos
      const topProductos = Object.entries(productMap)
        .map(([name, qty]) => ({ name, qty }))
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);

      const totalCotizaciones = quotes.length;
      const ventasEfectivas = confirmadasCount + entregadasCount;
      const ticketPromedio = ventasEfectivas > 0 ? ingresosConfirmados / ventasEfectivas : 0;

      setMetrics({
        totalIngresos,
        ingresosConfirmados,
        totalCotizaciones,
        confirmadasCount,
        entregadasCount,
        canceladasCount,
        enProcesoCount,
        ticketPromedio,
        topProductos,
      });
    } catch (err) {
      console.error('Error al calcular analíticas:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialAnalytics = async () => {
      await fetchAnalyticsData();
    };

    void loadInitialAnalytics();
  }, []);

  const formatCurrency = (val) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);

  if (loading) {
    return <div className={styles.loading}>Calculando métricas...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Analítica y Métricas</h1>
        <p className={styles.subtitle}>Resumen del rendimiento comercial de V_Eternals</p>
      </header>

      {/* TARJETAS DE MÉTRICAS CLAVE (KPIs) */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Ventas Confirmadas / Entregadas</span>
          <strong className={styles.kpiValueHighlight}>{formatCurrency(metrics.ingresosConfirmados)}</strong>
          <span className={styles.kpiSubtext}>Ingreso real proyectado</span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Valor Total Solicitado</span>
          <strong className={styles.kpiValue}>{formatCurrency(metrics.totalIngresos)}</strong>
          <span className={styles.kpiSubtext}>Suma de todas las cotizaciones</span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Ticket Promedio</span>
          <strong className={styles.kpiValue}>{formatCurrency(metrics.ticketPromedio)}</strong>
          <span className={styles.kpiSubtext}>Por pedido confirmado</span>
        </div>

        <div className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Total de Cotizaciones</span>
          <strong className={styles.kpiValue}>{metrics.totalCotizaciones}</strong>
          <span className={styles.kpiSubtext}>Solicitudes procesadas</span>
        </div>
      </div>

      {/* SECCIÓN INFERIOR: ESTADOS Y PRODUCTOS MÁS PEDIDOS */}
      <div className={styles.detailsGrid}>
        {/* Distribución por Estados */}
        <div className={styles.panelCard}>
          <h3>Distribución por Estado</h3>
          <div className={styles.statusList}>
            <div className={styles.statusRow}>
              <span>⏳ En proceso</span>
              <strong>{metrics.enProcesoCount}</strong>
            </div>
            <div className={styles.statusRow}>
              <span>🔵 Confirmados</span>
              <strong>{metrics.confirmadasCount}</strong>
            </div>
            <div className={styles.statusRow}>
              <span>🟢 Entregados</span>
              <strong>{metrics.entregadasCount}</strong>
            </div>
            <div className={styles.statusRow}>
              <span>🔴 Cancelados</span>
              <strong>{metrics.canceladasCount}</strong>
            </div>
          </div>
        </div>

        {/* Top Arreglos Solicitados */}
        <div className={styles.panelCard}>
          <h3>Arreglos Más Solicitados</h3>
          {metrics.topProductos.length === 0 ? (
            <p className={styles.emptyText}>No hay productos registrados aún.</p>
          ) : (
            <ul className={styles.topList}>
              {metrics.topProductos.map((p, idx) => (
                <li key={p.name} className={styles.topItem}>
                  <span className={styles.rank}>#{idx + 1}</span>
                  <span className={styles.productName}>{p.name}</span>
                  <strong className={styles.productQty}>{p.qty} un.</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}