import styles from './Button.module.css';

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled = false,
  className = '',
  ...buttonProps
}) {
  const buttonClass = `${styles.btn} ${styles[variant] || styles.primary} ${className}`.trim();

  return (
    <button
      type={type}
      onClick={onClick}
      className={buttonClass}
      disabled={disabled}
      {...buttonProps}
    >
      {children}
    </button>
  );
}