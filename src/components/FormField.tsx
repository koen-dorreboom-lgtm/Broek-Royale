import type { InputHTMLAttributes, ReactNode } from "react";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  trailing?: ReactNode;
}

export function FormField({ label, error, id, trailing, className = "", ...props }: FormFieldProps) {
  const errorId = error && id ? `${id}-error` : undefined;
  return (
    <div className="form-field">
      <label htmlFor={id}>{label}</label>
      <div className="form-field__control">
        <input
          id={id}
          className={className}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          {...props}
        />
        {trailing}
      </div>
      {error && <p id={errorId} className="form-error">{error}</p>}
    </div>
  );
}
