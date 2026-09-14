import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { PRODUCT_CATEGORIES } from '../data/categories';
import styles from './AdminAddProduct.module.css';

export default function AdminAddProduct() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Eternas');
  const [details, setDetails] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUploadAndSave = async (e) => {
    e.preventDefault();
    if (!file) return alert('Por favor selecciona una imagen');

    try {
      setLoading(true);

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `catalog/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products-image')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('products-image')
        .getPublicUrl(filePath);

      const imageUrl = publicUrlData.publicUrl;

      const { error: dbError } = await supabase
        .from('products')
        .insert([
          {
            name,
            category,
            details,
            price: parseFloat(price),
            image: imageUrl
          }
        ]);

      if (dbError) throw dbError;

      alert('¡Producto y foto creados exitosamente!');
      
      setName('');
      setDetails('');
      setPrice('');
      setFile(null);

    } catch (error) {
      console.error('Error:', error.message);
      alert('Error al guardar el producto: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.adminPage}>
      <div className={styles.card}>
        <span className={styles.preTitle}>PANEL ADMINISTRATIVO</span>
        <h1 className={styles.title}>Nuevo Producto</h1>

        <form onSubmit={handleUploadAndSave} className={styles.form}>
          <div className={styles.fieldGroup}>
            <label>Nombre del Producto</label>
            <input 
              type="text" 
              required 
              placeholder="Ej. Ramo de 50 Rosas"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Categoría</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)}>
              {PRODUCT_CATEGORIES.map((productCategory) => (
                <option key={productCategory.value} value={productCategory.value}>
                  {productCategory.label}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.fieldGroup}>
            <label>Precio Base ($ COP)</label>
            <input 
              type="number" 
              required 
              placeholder="57000"
              value={price} 
              onChange={(e) => setPrice(e.target.value)} 
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Detalles / Descripción</label>
            <textarea 
              placeholder="Descripción opcional del producto..."
              value={details} 
              onChange={(e) => setDetails(e.target.value)} 
            />
          </div>

          <div className={styles.fieldGroup}>
            <label>Foto del producto</label>
            <input 
              type="file" 
              accept="image/*" 
              required 
              className={styles.fileInput}
              onChange={(e) => setFile(e.target.files[0])} 
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? 'Subiendo e insertando...' : 'Guardar Producto'}
          </button>
        </form>
      </div>
    </div>
  );
}