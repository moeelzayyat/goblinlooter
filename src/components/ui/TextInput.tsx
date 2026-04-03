import styles from "./TextInput.module.css";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export function TextInput({
  label,
  error,
  helperText,
  id,
  className,
  ...props
}: TextInputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={`${styles.wrapper} ${error ? styles.error : ""} ${className || ""}`}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <input id={inputId} className={styles.input} {...props} />
      {error && <span className={styles.errorText}>{error}</span>}
      {!error && helperText && (
        <span className={styles.helperText}>{helperText}</span>
      )}
    </div>
  );
}
