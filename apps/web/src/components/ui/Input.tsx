import { InputHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import { useComponentConfig } from '@/lib/theme/use-component-config';
import Text from './Text';

/**
 * Input Component
 *
 * Text input component with label, error handling, helper text, and icon support.
 * Fully accessible with ARIA attributes and keyboard navigation.
 *
 * @example
 * ```tsx
 * // Basic input
 * <Input label="Email" type="email" placeholder="your@email.com" />
 *
 * // With error
 * <Input label="Email" error="Invalid email address" />
 *
 * // With icons
 * <Input
 *   label="Search"
 *   leftIcon={<SearchIcon />}
 *   rightIcon={<ClearIcon />}
 * />
 * ```
 */
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Input label text */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Helper text displayed below input */
  helperText?: string;
  /** Icon displayed on the left side */
  leftIcon?: React.ReactNode;
  /** Icon displayed on the right side */
  rightIcon?: React.ReactNode;
  /** Make input full width */
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, error, helperText, leftIcon, rightIcon, className, fullWidth = false, ...props },
    ref
  ) => {
    const { getSize } = useComponentConfig('input');
    // Use 'md' as default size for input
    const sizeConfig = getSize('md');

    const inputId = props.id || `input-${Math.random().toString(36).substring(7)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText && !error ? `${inputId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join('') || undefined;

    // Build input style - use theme config if available
    const inputStyle: React.CSSProperties = {};
    let paddingClasses = 'px-4 py-2';

    if (sizeConfig) {
      if (sizeConfig.paddingX || sizeConfig.paddingY) {
        paddingClasses = '';
        if (sizeConfig.paddingX) {
          inputStyle.paddingLeft = sizeConfig.paddingX;
          inputStyle.paddingRight = sizeConfig.paddingX;
        }
        if (sizeConfig.paddingY) {
          inputStyle.paddingTop = sizeConfig.paddingY;
          inputStyle.paddingBottom = sizeConfig.paddingY;
        }
      }
      if (sizeConfig.fontSize) {
        inputStyle.fontSize = sizeConfig.fontSize;
      }
      if (sizeConfig.minHeight) {
        inputStyle.minHeight = sizeConfig.minHeight;
      }
    }

    return (
      <div className={clsx('flex flex-col', fullWidth && 'w-full')}>
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-300 text-white mb-2">
            {label}
            {props.required && (
              <span className="text-error-500 text-red-400 ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        <div className="relative group">
          {leftIcon && (
            <div
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:text-blue-400 transition-colors duration-200"
              aria-hidden="true"
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'w-full border rounded-lg transition-all duration-200',
              paddingClasses,
              'bg-[#1C1C26] text-white',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50',
              'hover:border-gray-600',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'placeholder:text-gray-500',
              error
                ? 'border-red-500/50 focus:ring-red-500/30 focus:border-red-500/50'
                : 'border-gray-700',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            style={{ ...inputStyle, ...props.style }}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={describedBy}
            aria-required={props.required}
            {...props}
          />

          {rightIcon && (
            <div
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none group-focus-within:text-blue-400 transition-colors duration-200"
              aria-hidden="true"
            >
              {rightIcon}
            </div>
          )}
          
          {/* Glow effect on focus */}
          <div className="absolute inset-0 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none bg-gradient-to-r from-blue-500/5 to-purple-500/5" />
        </div>

        {error && (
          <Text
            id={errorId}
            variant="small"
            className="mt-2 text-error-600 text-red-400"
            role="alert"
            aria-live="polite"
          >
            {error}
          </Text>
        )}

        {helperText && !error && (
          <Text id={helperId} variant="small" className="mt-2 text-gray-400">
            {helperText}
          </Text>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
