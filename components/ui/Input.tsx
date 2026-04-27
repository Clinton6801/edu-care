import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full bg-zinc-800 border rounded-xl px-4 py-3 text-sm text-white
            placeholder-zinc-600 focus:outline-none focus:ring-1 transition
            ${error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
              : 'border-zinc-700 focus:border-indigo-500 focus:ring-indigo-500'
            }
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'
