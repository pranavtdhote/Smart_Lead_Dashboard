import * as React from 'react';
import { cn } from '../../lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options, id, ...props }, ref) => {
    const selectId = id || React.useId();

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-gray-700">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              'flex h-10 w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-10 text-sm text-gray-900',
              'transition-colors focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500',
              'disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500',
              error && 'border-red-500 focus:ring-red-500',
              className
            )}
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <ChevronDown size={16} />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
