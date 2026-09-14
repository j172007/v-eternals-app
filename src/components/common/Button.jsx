import styles from './Button.module.css';

export default function Button({ children, onClick, type = "button", variant = "primary", disabled = false }) {
  // Une la clase base .btn con la variante (.primary o .secondary)
  const buttonClass = `${styles.btn} ${styles[variant]}`;

  return (
    <button type={type} onClick={onClick} className={buttonClass} disabled={disabled}>
      {children}
    </button>
  );
}