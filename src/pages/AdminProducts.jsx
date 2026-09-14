import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../lib/supabase';
import { PRODUCT_CATEGORIES } from '../data/categories';
import styles from './AdminProducts.module.css';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [file, setFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [supportsPublishing, setSupportsPublishing] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: '',
    image_url: '',
    description: '',
    is_active: true,
    sort_order: 0
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const loadedProducts = data || [];
      setProducts(loadedProducts);
      setSupportsPublishing(loadedProducts.some((product) => Object.hasOwn(product, 'is_active')));
    } catch (err) {
      alert('Error al cargar productos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialProducts = async () => {
      await fetchProducts();
    };

    void loadInitialProducts();
  }, []);

  // Abrir modal en modo Crear
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFile(null);
    setFormData({ name: '', price: '', category: '', image_url: '', description: '', is_active: true, sort_order: 0 });
    setIsModalOpen(true);
  };

  // Abrir modal en modo Editar
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setFile(null);
    setFormData({
      name: product.name || '',
      price: product.price || '',
      category: product.category || '',
      image_url: product.image || product.image_url || '',
      description: product.details || product.description || '',
      is_active: product.is_active !== false,
      sort_order: product.sort_order || 0
    });
    setIsModalOpen(true);
  };

  // Eliminar producto (DELETE)
  const handleToggleActive = async (product) => {
    if (!supportsPublishing) {
      alert('Aplica la migración de Supabase para activar la publicación y ocultar productos.');
      return;
    }

    const nextActive = product.is_active === false;
    if (!confirm(nextActive ? '¿Publicar este producto en el catálogo?' : '¿Ocultar este producto del catálogo?')) return;

    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: nextActive })
        .eq('id', product.id);
      if (error) throw error;

      setProducts((prev) => prev.map((item) => item.id === product.id ? { ...item, is_active: nextActive } : item));
    } catch (err) {
      alert('Error al cambiar la visibilidad: ' + err.message);
    }
  };

  // Guardar (CREATE / UPDATE)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingProduct && !file) {
      alert('Por favor selecciona una imagen');
      return;
    }

    try {
      let imageUrl = editingProduct
        ? editingProduct.image || editingProduct.image_url || ''
        : '';

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `catalog/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products-image')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('products-image')
          .getPublicUrl(filePath);

        imageUrl = publicUrlData.publicUrl;
      }

      const payload = {
        name: formData.name,
        price: Number(formData.price),
        category: formData.category,
        image: imageUrl,
        details: formData.description,
        is_active: formData.is_active,
        sort_order: Number(formData.sort_order) || 0
      };

      if (editingProduct) {
        const updateResult = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);

        if (updateResult.error?.message?.match(/is_active|sort_order/)) {
          const legacyPayload = Object.fromEntries(
            Object.entries(payload).filter(([key]) => !['is_active', 'sort_order'].includes(key)),
          );
          const legacyResult = await supabase
            .from('products')
            .update(legacyPayload)
            .eq('id', editingProduct.id);
          if (legacyResult.error) throw legacyResult.error;
        } else if (updateResult.error) {
          throw updateResult.error;
        }
      } else {
        const insertResult = await supabase.from('products').insert([payload]);
        if (insertResult.error?.message?.match(/is_active|sort_order/)) {
          const legacyPayload = Object.fromEntries(
            Object.entries(payload).filter(([key]) => !['is_active', 'sort_order'].includes(key)),
          );
          const legacyResult = await supabase.from('products').insert([legacyPayload]);
          if (legacyResult.error) throw legacyResult.error;
        } else if (insertResult.error) {
          throw insertResult.error;
        }
      }

      setIsModalOpen(false);
  setFile(null);
      fetchProducts();
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(val);

  const visibleProducts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    return products.filter((product) => {
      const matchesVisibility = showInactive || product.is_active !== false;
      const matchesSearch = !normalizedSearch
        || `${product.name} ${product.category}`.toLowerCase().includes(normalizedSearch);
      return matchesVisibility && matchesSearch;
    });
  }, [products, searchTerm, showInactive]);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Gestión de Productos</h1>
          <p className={styles.subtitle}>Administra los arreglos florales del catálogo</p>
        </div>
        <button onClick={handleOpenCreate} className={styles.createBtn}>
          ➕ Nuevo Producto
        </button>
      </header>

      <div className={styles.toolbar}>
        <input
          type="search"
          placeholder="Buscar por nombre o categoría..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          aria-label="Buscar productos"
        />
        <label>
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(event) => setShowInactive(event.target.checked)}
          />
          Mostrar ocultos
        </label>
      </div>

      {loading ? (
        <div className={styles.loading}>Cargando catálogo...</div>
      ) : (
        <div className={styles.grid}>
          {visibleProducts.length === 0 ? (
            <div className={styles.emptyState}>No hay productos que coincidan con los filtros.</div>
          ) : visibleProducts.map((product) => (
            <div key={product.id} className={styles.card}>
              <img
                src={product.image || product.image_url || 'https://via.placeholder.com/150'}
                alt={product.name}
                className={styles.image}
              />
              <div className={styles.cardBody}>
                <span className={styles.category}>{product.category || 'General'}</span>
                <span className={product.is_active === false ? styles.inactiveBadge : styles.activeBadge}>
                  {product.is_active === false ? 'Oculto' : 'Publicado'}
                </span>
                <h3 className={styles.productName}>{product.name}</h3>
                <strong className={styles.price}>{formatCurrency(product.price)}</strong>
                <p className={styles.description}>{product.details || product.description}</p>
                
                <div className={styles.actions}>
                  <button onClick={() => handleOpenEdit(product)} className={styles.editBtn}>
                    ✏️ Editar
                  </button>
                  <button onClick={() => handleToggleActive(product)} className={styles.deleteBtn}>
                    {product.is_active === false ? '👁️ Publicar' : '🙈 Ocultar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CREAR / EDITAR */}
      {isModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.inputGroup}>
                <label>Nombre del Arreglo</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label>Orden del catálogo</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                  />
                </div>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  />
                  Publicar en el catálogo
                </label>
              </div>

              <div className={styles.row}>
                <div className={styles.inputGroup}>
                  <label>Precio (COP)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>

                <div className={styles.inputGroup}>
                  <label>Categoría</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="" disabled>Selecciona una categoría</option>
                    {PRODUCT_CATEGORIES.map((productCategory) => (
                      <option key={productCategory.value} value={productCategory.value}>
                        {productCategory.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label>Imagen del producto {editingProduct ? '(opcional para reemplazar)' : ''}</label>
                <input
                  type="file"
                  accept="image/*"
                  required={!editingProduct}
                  onChange={(e) => setFile(e.target.files[0] || null)}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Descripción</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={() => setIsModalOpen(false)} className={styles.cancelBtn}>
                  Cancelar
                </button>
                <button type="submit" className={styles.saveBtn}>
                  {editingProduct ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}