/**
 * Input Component
 * Campo de entrada reutilizable
 */

export default function Input({ 
  label, 
  id,
  type = 'text', 
  value, 
  onChange, 
  placeholder,
  required = false,
  className = '',
  ...props 
}) {
  return (
    <div className="w-full">
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition-all ${className}`}
        {...props}
      />
    </div>
  );
}

