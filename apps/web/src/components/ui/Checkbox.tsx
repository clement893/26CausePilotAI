import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { useComponentConfig } from '@/lib/theme/use-component-config';
import Text from './Text';

/**
 * Checkbox Component
 *
 * Checkbox input component with label, error handling, and indeterminate state support.
 * Fully accessible with proper ARIA attributes.
 *
 * @example
 * ```tsx
 * // Basic checkbox
 * <Checkbox label="Accept terms" checked={accepted} onChange={handleChange} />
 *
 * // With error
 * <Checkbox label="Subscribe" error="This field is required" />
 *
 * // Indeterminate state
 * <Checkbox label="Select all" indeterminate={isIndeterminate} />
 * ```
 */
interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Checkbox label text */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Make checkbox full width */
  fullWidth?: boolean;
  /** Show indeterminate state (partially checked) */
  indeterminate?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    { label, error, className, fullWidth = false, indeterminate = false, checked, ...props },
    ref
  ) => {
    const { getSize } = useComponentConfig('checkbox');
    const sizeConfig = getSize('md');
    const size = sizeConfig?.minHeight || '1rem';

    return (
      <div className={clsx('flex flex-col', fullWidth && 'w-full')}>
        <label className="flex items-center cursor-pointer group">
          <input
            ref={(node) => {
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
              if (node) {
                node.indeterminate = indeterminate;
              }
            }}
            type="checkbox"
            checked={checked}
            className={clsx(
              'text-blue-400 border-gray-700 border-gray-800 rounded',
              'bg-[#1C1C26] transition-all duration-200',
              'focus:ring-2 focus:ring-offset-0 focus:outline-none',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'checked:bg-gradient-to-r checked:from-blue-500 checked:to-purple-500',
              error
                ? 'border-red-500/30 focus:ring-error-500/20'
                : 'focus:ring-primary/20',
              className
            )}
            style={{
              width: size,
              height: size,
            }}
            {...props}
          />
          {label && (
            <span
              className={clsx(
                'ml-2 text-sm font-medium',
                error ? 'text-red-400' : 'text-white',
                props.disabled && 'opacity-50'
              )}
            >
              {label}
            </span>
          )}
        </label>
        {error && (
          <Text variant="small" className="mt-2 text-red-400" role="alert">
            {error}
          </Text>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
