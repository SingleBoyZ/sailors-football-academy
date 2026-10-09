import { AlertCircle, ChevronDown } from "lucide-react";

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  options: string[];
  placeholder: string;
  required?: boolean;
  error?: string;
  onChange: (value: string) => void;
  onBlur: () => void;
}

export function SelectField({
  label,
  name,
  value,
  options,
  placeholder,
  required,
  error,
  onChange,
  onBlur,
}: SelectFieldProps) {
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
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          required={required}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`w-full appearance-none rounded-lg border bg-white px-3.5 py-2.5 pr-10 text-[15px] text-navy-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-400/60 ${
            value === "" ? "text-slate-400" : "text-navy-900"
          } ${error ? "border-red-400 focus:border-red-400" : "border-slate-300 focus:border-navy-500"}`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option} value={option} className="text-navy-900">
              {option}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}
