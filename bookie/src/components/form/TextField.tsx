import { AlertCircle } from "lucide-react";

interface TextFieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "tel";
  value: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  autoComplete?: string;
}

export function TextField({
  label,
  name,
  type = "text",
  value,
  placeholder,
  required,
  error,
  onChange,
  onBlur,
  autoComplete,
}: TextFieldProps) {
  const errorId = `${name}-error`;

  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-navy-800">
        {label}
        {required && (
          <span className="ml-0.5 text-gold-600" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-[15px] text-navy-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-400/60 ${
          error
            ? "border-red-400 focus:border-red-400"
            : "border-slate-300 focus:border-navy-500"
        }`}
      />
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
