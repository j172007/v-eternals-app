export default function Input({
    label,
    type = "text",
    name,
    value,
    onChange,
    placeholder
}) {
    return (
        <div className="input-group">
            {label && <label htmlFor={name}>{label}</label>}
            <input
                id={name}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="form-input"
            >
            </input>
        </div>
    );
}