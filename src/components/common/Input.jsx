import styles from './Input.module.css';

export default function Input({ label, id, name, className = '', ...inputProps }) {
    const inputId = id || name;

    return (
        <div className={styles.group}>
            {label && <label htmlFor={inputId}>{label}</label>}
            <input id={inputId} name={name} className={`${styles.input} ${className}`.trim()} {...inputProps} />
        </div>
    );
}