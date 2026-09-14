import { useState } from 'react';
import { useQuote } from '../context/useQuote';
import { useAuth } from '../context/useAuth';
import { supabase } from '../lib/supabase';
import { PRODUCT_CATEGORIES } from '../data/categories';
import { calculateItemTotal, calculateQuoteTotal, formatCurrency, parsePrice } from '../utils/quote';
import styles from './Quote.module.css';

const ROSAS_ETERNAS_VARIANTS = [
  { label: '12 Rosas', price: 57000, pepitaPrice: 3000 },
  { label: '25 Rosas', price: 93000, pepitaPrice: 3000 },
  { label: '50 Rosas', price: 152000, pepitaPrice: 6000 },
  { label: '100 Rosas', price: 300000, pepitaPrice: 6000 },
  { label: '200 Rosas', price: 595000, pepitaPrice: 6000 }
];

const ROSAS_NATURALES_VARIANTS = [
  { label: 'Aprox. 20 rosas (1 tono)', price: 104000, maxTonos: 1 },
  { label: 'Aprox. 35-40 rosas (1-2 tonos)', price: 130000, maxTonos: 2 },
  { label: 'Aprox. 60-65 rosas (1-3 tonos)', price: 180000, maxTonos: 3 },
  { label: 'Aprox. 80-90 rosas (1-3 tonos)', price: 210000, maxTonos: 3 }
];

const COLOR_OPTIONS_NATURALES = ['Rojas', 'Rosadas', 'Blancas'];
const COLOR_OPTIONS_ETERNAS = [
  'Rojas', 'Rosadas', 'Blancas', 'Verdes', 'Azul claro', 
  'Azul oscuro', 'Moradas', 'Lila', 'Café', 'Amarillas'
];

const getMinimumDeliveryDate = () => {
  const minimumDate = new Date();
  // Deja tres días completos entre hoy y la fecha mínima de entrega.
  minimumDate.setDate(minimumDate.getDate() + 4);
  return [
    minimumDate.getFullYear(),
    String(minimumDate.getMonth() + 1).padStart(2, '0'),
    String(minimumDate.getDate()).padStart(2, '0'),
  ].join('-');
};

export default function Quote() {
  const { quoteItems, removeFromQuote, updateItem, toggleAddon, clearQuote } = useQuote();
  const { user, profile } = useAuth();
  const userMetadata = user?.user_metadata || {};
  
  const [customerData, setCustomerData] = useState({
    name: profile?.full_name || profile?.name || userMetadata.full_name || '',
    phone: profile?.phone || profile?.phone_number || userMetadata.phone || '',
    occasion: '', 
    notes: '',
    deliveryDate: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isNaturalProduct = (item) => {
    const category = (item.category || '').toLowerCase();
    const name = (item.name || '').toLowerCase();
    return category.includes('natural') || name.includes('natural');
  };

  const isDetailProduct = (item) => item.category === 'Detalles';

  const getVariantsForProduct = (item) => {
    if (item.variants && item.variants.length > 0) {
      return item.variants.map((variant) => ({
        ...variant,
        label: variant.label || variant.size,
      }));
    }
    if (isDetailProduct(item)) {
      return [{ label: 'Unidad', price: parsePrice(item.price) }];
    }
    return isNaturalProduct(item) ? ROSAS_NATURALES_VARIANTS : ROSAS_ETERNAS_VARIANTS;
  };

  const getAvailableAddons = (item) => {
    const variants = getVariantsForProduct(item);
    const selectedVariant = variants.find(v => v.label === item.size);
    const pepitaPrice = selectedVariant?.pepitaPrice || 3000;

    const addons = [
      { name: 'Corona básica', price: 4000 },
      { name: 'Corona Premium', price: 16000 },
      { name: 'Tarjeta / Fotos / Mariposas', price: 0 },
      { name: 'Domicilio Zona Urbana', price: 6000 },
      { name: 'Domicilio Zona Rural (A convenir)', price: 0 }
    ];

    if (!isNaturalProduct(item) && !isDetailProduct(item)) {
      addons.unshift({ name: 'Pepita en flor', price: pepitaPrice });
    }

    return addons;
  };

  const calculateGrandTotal = () => calculateQuoteTotal(quoteItems);

  const handleVariantChange = (item, selectedLabel) => {
    const variants = getVariantsForProduct(item);
    const selectedVariant = variants.find(v => v.label === selectedLabel);
    
    updateItem(item.id, 'size', selectedLabel);
    if (selectedVariant && selectedVariant.price > 0) {
      updateItem(item.id, 'price', selectedVariant.price);
    }
    updateItem(item.id, 'customColors', []);
  };

  const handleCustomColorToggle = (item, colorName, maxAllowed) => {
    const currentCustomColors = item.customColors || [];
    let updated;
    
    if (currentCustomColors.includes(colorName)) {
      updated = currentCustomColors.filter(c => c !== colorName);
    } else {
      if (maxAllowed && currentCustomColors.length >= maxAllowed) {
        alert(`Para este tamaño solo puedes seleccionar máximo ${maxAllowed} tono(s).`);
        return;
      }
      updated = [...currentCustomColors, colorName];
    }
    
    updateItem(item.id, 'customColors', updated);
  };

  const handleSendWhatsApp = async () => {
    if (quoteItems.length === 0) return;
    if (!customerData.name.trim() || !customerData.phone.trim()) {
      alert('Completa tu nombre y teléfono antes de enviar la cotización.');
      return;
    }
    if (!customerData.deliveryDate) {
      alert('Selecciona una fecha de entrega para continuar.');
      return;
    }
    if (customerData.deliveryDate && customerData.deliveryDate < getMinimumDeliveryDate()) {
      alert(`La fecha de entrega debe ser desde el ${getMinimumDeliveryDate()} en adelante.`);
      return;
    }

    try {
      setIsSubmitting(true);
      const grandTotal = calculateGrandTotal();

      const quotePayload = {
        user_id: user ? user.id : null,
        customer_name: customerData.name || 'Anónimo',
        phone: customerData.phone || 'No especificado',
        occasion: customerData.occasion || null,
        notes: customerData.notes || null,
        delivery_date: customerData.deliveryDate || null,
        total_amount: grandTotal,
        items: quoteItems,
      };

      let { error: dbError } = await supabase.from('quotes').insert([quotePayload]);

      // Permite operar mientras la migración de columnas opcionales aún no se aplica.
      if (dbError?.message?.match(/column .* does not exist|schema cache/i)) {
        const legacyPayload = {
          user_id: quotePayload.user_id,
          customer_name: quotePayload.customer_name,
          phone: quotePayload.phone,
          total_amount: quotePayload.total_amount,
          items: quotePayload.items,
        };
        ({ error: dbError } = await supabase.from('quotes').insert([legacyPayload]));
      }

      if (dbError) {
        alert('Error al guardar en la base de datos Supabase: ' + dbError.message);
        console.error('Detalle del error:', dbError);
        return;
      }

      // Estructura del mensaje para WhatsApp
      const rose = String.fromCodePoint(0x1F339);
      const loveLetter = String.fromCodePoint(0x1F48C);
      const gift = String.fromCodePoint(0x1F381);
      const dizzyDashes = String.fromCodePoint(0x1F4AB);
      const cherryBlossom = String.fromCodePoint(0x1F338);
      const tulip = String.fromCodePoint(0x1F337);
      const sparkles = String.fromCodePoint(0x2728);
      const hearts = String.fromCodePoint(0x1F495);

      let message = `${rose} *COTIZACIÓN - V_ETERNALS* ${rose}\n`;
      message += `---------------------------------------\n\n`;

      message += `${loveLetter} *DATOS DEL CLIENTE*\n`;
      message += `*Nombre:* ${customerData.name || 'No especificado'}\n`;
      message += `*Teléfono:* ${customerData.phone || 'No especificado'}\n`;
      message += `*Ocasión:* ${customerData.occasion || 'No especificada'}\n`;
      message += `*Fecha deseada:* ${customerData.deliveryDate || 'Por confirmar'}\n`;
      if (customerData.notes) {
        message += `*Notas:* ${customerData.notes}\n`;
      }
      message += `\n---------------------------------------\n\n`;

      message += `${gift} *DETALLE DEL PEDIDO*\n\n`;

      quoteItems.forEach((item, index) => {
        let colorDisplay = item.color;
        if (item.color === 'Personalizado / Varios tonos' && item.customColors && item.customColors.length > 0) {
          colorDisplay = `Combinación (${item.customColors.join(', ')})`;
        }

        const tipoProducto = isDetailProduct(item)
          ? 'Detalles'
          : isNaturalProduct(item) ? 'Natural' : 'Eterna';

        message += `*${index + 1}. ${item.name} (${tipoProducto}) (x${item.quantity})* ${dizzyDashes}\n`;
        message += `${cherryBlossom} Tamaño/Cantidad: ${item.size || 'No seleccionado'}\n`;
        if (!isDetailProduct(item)) {
          message += `${cherryBlossom} Tonos/Color: ${colorDisplay || 'No seleccionado'}\n`;
        }
        if (item.addons && item.addons.length > 0) {
          const extrasStr = item.addons.map(a => {
            if (a.name.includes('Zona Rural')) return `${a.name} (Por cotizar)`;
            return a.price > 0 ? `${a.name} (+${formatCurrency(a.price)})` : a.name;
          }).join(', ');
          message += `${cherryBlossom} Extras: ${extrasStr}\n`;
        }
        message += `*Subtotal:* ${formatCurrency(calculateItemTotal(item))} ${tulip}\n\n`;
      });

      message += `---------------------------------------\n`;
      message += `${sparkles} *TOTAL ESTIMADO: ${formatCurrency(grandTotal)}* ${sparkles}\n`;
      message += `---------------------------------------\n\n`;
      message += `¡Hola! Me gustaría confirmar este pedido. Quedo atento/a. ${hearts}`;

      const utf8Bytes = new TextEncoder().encode(message);
      const encodedText = Array.from(utf8Bytes)
        .map(byte => '%' + byte.toString(16).padStart(2, '0'))
        .join('');

      window.open(`https://api.whatsapp.com/send?phone=573023172619&text=${encodedText}`, '_blank');

      clearQuote();
      setCustomerData({ name: '', occasion: '', notes: '', phone: '', deliveryDate: '' });
    } catch (err) {
      alert('Ocurrió un inconveniente al enviar la cotización: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (quoteItems.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <h2 className={styles.title}>Arma tu cotización</h2>
        <p className={styles.subtitle}>Tu lista está vacía. Visita nuestro catálogo para agregar productos.</p>
      </div>
    );
  }

  return (
    <div className={styles.quotePage}>
      <div className={styles.header}>
        <span className={styles.preTitle}>PERSONALIZA TU PEDIDO</span>
        <h1 className={styles.title}>Arma tu cotización</h1>
      </div>

      <div className={styles.contentGrid}>
        <div className={styles.itemsList}>
          {quoteItems.map((item) => {
            const isNatural = isNaturalProduct(item);
            const isDetail = isDetailProduct(item);
            const currentVariants = getVariantsForProduct(item);
            const selectedVariant = currentVariants.find(v => v.label === item.size);
            const maxTonosAllowed = selectedVariant?.maxTonos || null;
            const availableAddons = getAvailableAddons(item);
            const rawColors = isDetail
              ? ['No aplica']
              : isNatural ? COLOR_OPTIONS_NATURALES : COLOR_OPTIONS_ETERNAS;
            const availableColors = isDetail || maxTonosAllowed === 1
              ? rawColors
              : [...rawColors, 'Personalizado / Varios tonos'];

            const isCustomColor = !isDetail && item.color === 'Personalizado / Varios tonos';
            const categoryLabel = PRODUCT_CATEGORIES.find((category) => category.value === item.category)?.label
              || (isNatural ? 'Rosas Naturales' : 'Rosas Eternas');

            return (
              <div key={item.id} className={styles.itemCard}>
                <div className={styles.itemHeader}>
                  <div>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <span className={`${styles.categoryBadge} ${isNatural ? styles.badgeNatural : isDetail ? styles.badgeDetails : styles.badgeEterna}`}>
                      {categoryLabel}
                    </span>
                  </div>
                  <button className={styles.deleteBtn} onClick={() => removeFromQuote(item.id)}>
                    Borrar
                  </button>
                </div>

                <div className={styles.optionsGrid}>
                  <div className={styles.optionGroup}>
                    <label>{isDetail ? 'Presentación' : 'Cantidad de Rosas / Tamaño'}</label>
                    <select 
                      value={item.size || ''} 
                      onChange={(e) => handleVariantChange(item, e.target.value)}
                    >
                      <option value="" disabled>Selecciona el tamaño</option>
                      {currentVariants.map((v) => (
                        <option key={v.label} value={v.label}>
                          {v.label} {v.price > 0 ? `(${formatCurrency(v.price)})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.optionGroup}>
                    <label>{isDetail ? 'Personalización' : 'Tonos / Color'}</label>
                    <select 
                      value={item.color || ''} 
                      onChange={(e) => updateItem(item.id, 'color', e.target.value)}
                    >
                      <option value="" disabled>Selecciona el color</option>
                      {availableColors.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  </div>
                </div>

                {isCustomColor && (
                  <div className={styles.customColorsBox}>
                    <label className={styles.customColorLabel}>
                      Selecciona hasta {maxTonosAllowed || 'varios'} tonos a combinar:
                    </label>
                    <div className={styles.customColorsGrid}>
                      {rawColors.map(color => {
                        const isChecked = (item.customColors || []).includes(color);
                        return (
                          <label key={color} className={`${styles.colorChip} ${isChecked ? styles.colorChipActive : ''}`}>
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleCustomColorToggle(item, color, maxTonosAllowed)}
                            />
                            {color}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className={styles.addonsSection}>
                  <label>Adiciones y Complementos</label>
                  <div className={styles.addonsList}>
                    {availableAddons.map((addon) => {
                      const isActive = (item.addons || []).some(a => a.name === addon.name);
                      return (
                        <button 
                          key={addon.name}
                          type="button"
                          className={`${styles.addonPill} ${isActive ? styles.addonActive : ''}`}
                          onClick={() => toggleAddon(item.id, addon)}
                        >
                          {addon.name} {addon.price > 0 ? `(+$${addon.price.toLocaleString('es-CO')})` : addon.name.includes('Zona Rural') ? '(Por cotizar)' : '(Gratis)'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className={styles.itemFooter}>
                  <div className={styles.quantityControl}>
                    <button type="button" onClick={() => updateItem(item.id, 'quantity', Math.max(1, item.quantity - 1))}>-</button>
                    <span className={styles.qtyValue}>{item.quantity}</span>
                    <button type="button" onClick={() => updateItem(item.id, 'quantity', item.quantity + 1)}>+</button>
                  </div>
                  <div className={styles.itemPrice}>
                    {formatCurrency(calculateItemTotal(item))}
                  </div>
                </div>
              </div>
            );
          })}
          <button className={styles.clearBtn} onClick={clearQuote}>Vaciar cotización</button>
        </div>

        <div className={styles.summarySidebar}>
          <div className={styles.invoiceContainer}>
            <div className={styles.invoiceHeader}>
              <h2 className={styles.invoiceLogo}>V_Eternals</h2>
              <span className={styles.invoiceDate}>{new Date().toLocaleDateString('es-CO')}</span>
            </div>
            
            <h3 className={styles.invoiceTitle}>Resumen de Cotización</h3>
            
            <div className={styles.invoiceCustomer}>
              <input 
                type="text" 
                placeholder="Nombre completo" 
                className={styles.invoiceInput} 
                value={customerData.name} 
                onChange={(e) => setCustomerData({...customerData, name: e.target.value})} 
              />
              <input 
                type="tel" 
                placeholder="Teléfono / WhatsApp" 
                className={styles.invoiceInput} 
                value={customerData.phone} 
                onChange={(e) => setCustomerData({...customerData, phone: e.target.value})} 
              />
              <input 
                type="text" 
                placeholder="Ocasión especial" 
                className={styles.invoiceInput} 
                value={customerData.occasion} 
                onChange={(e) => setCustomerData({...customerData, occasion: e.target.value})} 
              />
              <input
                type="date"
                min={getMinimumDeliveryDate()}
                required
                className={styles.invoiceInput}
                value={customerData.deliveryDate}
                onChange={(e) => setCustomerData({...customerData, deliveryDate: e.target.value})}
                aria-label="Fecha deseada de entrega"
              />
              <textarea 
                placeholder="Notas adicionales..." 
                className={styles.invoiceInput} 
                value={customerData.notes} 
                onChange={(e) => setCustomerData({...customerData, notes: e.target.value})} 
              />
            </div>

            <div className={styles.invoiceItems}>
              {quoteItems.map(item => (
                <div key={item.id} className={styles.invoiceRow}>
                  <div className={styles.invoiceItemInfo}>
                    <strong>{item.quantity}x {item.name}</strong>
                    <span>
                      {item.size || 'Sin tamaño'} | {item.color === 'Personalizado / Varios tonos' && item.customColors?.length 
                        ? item.customColors.join(', ') 
                        : (item.color || 'Sin color')}
                    </span>
                    {(item.addons || []).map(a => <span key={a.name}>+ {a.name}</span>)}
                  </div>
                  <div className={styles.invoiceItemPrice}>
                    {formatCurrency(calculateItemTotal(item))}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.invoiceTotal}>
              <span>Total Estimado</span>
              <strong>{formatCurrency(calculateGrandTotal())}</strong>
            </div>
          </div>

          <button 
            className={styles.whatsappBtn} 
            onClick={handleSendWhatsApp}
            disabled={isSubmitting}
          >
            <svg viewBox="0 0 448 512" style={{width: "20px", fill: "white", marginRight: "10px"}}>
              <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157.1zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6z"/>
            </svg>
            {isSubmitting ? 'Procesando...' : 'Enviar Cotización por WhatsApp'}
          </button>
        </div>
      </div>
    </div>
  );
}