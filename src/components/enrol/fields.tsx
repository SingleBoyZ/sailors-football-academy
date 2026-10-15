import type { ChangeEvent, ReactNode } from "react";

type FieldWrapperProps = {
  label: string;
  error?: string;
  className?: string;
  children: ReactNode;
};

function FieldWrapper({ label, error, className, children }: FieldWrapperProps) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm ${className ?? ""}`}>
      <span>{label}</span>
      {children}
      {error && <span className="text-brand-red-dark text-xs">{error}</span>}
    </label>
  );
}

const inputClass = "border border-brand-ink/15 bg-brand-white px-3 py-2.5 outline-none focus:border-brand-red";

type TextFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  error?: string;
  className?: string;
  placeholder?: string;
};

export function TextField({ label, value, onChange, type = "text", error, className, placeholder }: TextFieldProps) {
  return (
    <FieldWrapper label={label} error={error} className={className}>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        className={inputClass}
      />
    </FieldWrapper>
  );
}

export function TextAreaField({ label, value, onChange, error, className, placeholder }: Omit<TextFieldProps, "type">) {
  return (
    <FieldWrapper label={label} error={error} className={className}>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
        rows={4}
        className={inputClass}
      />
    </FieldWrapper>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  error?: string;
  className?: string;
  placeholder?: string;
};

export function SelectField({ label, value, onChange, options, error, className, placeholder }: SelectFieldProps) {
  return (
    <FieldWrapper label={label} error={error} className={className}>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass}>
        <option value="" disabled>
          {placeholder ?? "Select"}
        </option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
}

type CheckboxFieldProps = {
  label: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
};

export function CheckboxField({ label, checked, onChange, error }: CheckboxFieldProps) {
  return (
    <div>
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="accent-brand-red mt-0.5 h-4 w-4"
        />
        <span>{label}</span>
      </label>
      {error && <span className="text-brand-red-dark mt-1 block text-xs">{error}</span>}
    </div>
  );
}
