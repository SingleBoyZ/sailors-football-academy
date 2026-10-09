import { AlertCircle, Check } from "lucide-react";

interface CheckboxGroupFieldProps {
  legend: string;
  name: string;
  options: string[];
  value: string[];
  required?: boolean;
  error?: string;
  onChange: (value: string[]) => void;
  onBlur: () => void;
}

export function CheckboxGroupField({
  legend,
  name,
  options,
  value,
  required,
  error,
  onChange,
  onBlur,
}: CheckboxGroupFieldProps) {
  const errorId = `${name}-error`;

  function toggleOption(option: string) {
    if (value.includes(option)) {
      onChange(value.filter((item) => item !== option));
    } else {
      onChange([...value, option]);
    }
  }

  return (
    <fieldset onBlur={onBlur}>
      <legend className="mb-1.5 block text-sm font-medium text-navy-800">
        {legend}
        {required && (
          <span className="ml-0.5 text-gold-600" aria-hidden="true">
            *
          </span>
        )}
      </legend>
      <div
        className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
        role="group"
        aria-describedby={error ? errorId : undefined}
      >
        {options.map((option) => {
          const checked = value.includes(option);
          return (
            <label
              key={option}
              className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-[15px] transition-colors ${
                checked
                  ? "border-navy-600 bg-navy-50 text-navy-900"
                  : "border-slate-300 bg-white text-navy-700 hover:border-navy-400"
              }`}
            >
              <input
                type="checkbox"
                name={name}
                value={option}
                checked={checked}
                onChange={() => toggleOption(option)}
                className="sr-only"
              />
              <span
                className={`flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border ${
                  checked ? "border-navy-600 bg-navy-600" : "border-slate-400 bg-white"
                }`}
                aria-hidden="true"
              >
                {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
              </span>
              {option}
            </label>
          );
        })}
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 flex items-center gap-1.5 text-sm text-red-600">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </fieldset>
  );
}
