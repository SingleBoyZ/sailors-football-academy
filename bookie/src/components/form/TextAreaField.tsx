interface TextAreaFieldProps {
  label: string;
  name: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}

export function TextAreaField({ label, name, value, placeholder, onChange }: TextAreaFieldProps) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-navy-800">
        {label}
        <span className="ml-1.5 text-xs font-normal text-slate-400">(optional)</span>
      </label>
      <textarea
        id={name}
        name={name}
        rows={4}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-y rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-[15px] text-navy-900 placeholder:text-slate-400 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-400/60 focus:border-navy-500"
      />
    </div>
  );
}
