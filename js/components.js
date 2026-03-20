// Кнопка
const Button = ({ children, onClick, variant = "primary", className = "", disabled = false, type = "button" }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`btn btn-${variant} ${className} ${disabled ? 'btn-disabled' : ''}`}
        >
            {children}
        </button>
    );
};

// Поле ввода
const Input = ({ label, type = "text", placeholder, value, onChange, name, required = false }) => (
    <div className="form-group">
        {label && <label className="form-label">{label}</label>}
        <input
            type={type}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            required={required}
            className="form-input"
        />
    </div>
);