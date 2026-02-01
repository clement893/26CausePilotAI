/** * Radio Component * Radio button component */ 'use client';
import { forwardRef, type InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { useComponentConfig } from '@/lib/theme/use-component-config';
interface RadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}
const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, error, className, fullWidth = false, id, ...props }, ref) => {
    const radioId = id || `radio-${Math.random().toString(36).substring(7)}`;
    const { getSize } = useComponentConfig('radio');
    const sizeConfig = getSize('md');
    const size = sizeConfig?.minHeight || '1rem';
    return (
      <div className={clsx('flex items-center', fullWidth && 'w-full')}>
        {' '}
        <input
          ref={ref}
          type="radio"
          id={radioId}
          className={clsx(
            'text-blue-500 dark:text-primary-400 border-gray-700 dark:border-border',
            'bg-[#1C1C26] dark:bg-background',
            'focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:ring-offset-0',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'checked:bg-gradient-to-r checked:from-blue-500 checked:to-purple-500',
            error && 'border-error-500 dark:border-error-400',
            className
          )}
          style={{ width: size, height: size }}
          {...props}
        />
        {label && (
          <label
            htmlFor={radioId}
            className={clsx(
              'ml-2 text-sm font-medium text-gray-300 dark:text-foreground',
              error && 'text-error-600 dark:text-error-400',
              props.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);
Radio.displayName = 'Radio';
export default Radio;
