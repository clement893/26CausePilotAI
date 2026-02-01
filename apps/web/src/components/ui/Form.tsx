/**
 * Form Component
 * Complete form component with validation for ERP applications
 */
'use client';

import { type ReactNode, type FormEvent, type ReactElement, cloneElement, isValidElement } from 'react';
import { clsx } from 'clsx';

export interface FormField {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
  placeholder?: string;
  required?: boolean;
  validation?: (value: unknown) => string | null;
  options?: { label: string; value: string }[];
  helpText?: string;
  disabled?: boolean;
}

export interface FormProps {
  fields?: FormField[];
  onSubmit: (data: Record<string, unknown>) => void | Promise<void>;
  initialValues?: Record<string, unknown>;
  children?: ReactNode;
  className?: string;
  submitLabel?: string;
  showSubmitButton?: boolean;
  loading?: boolean;
  errors?: Record<string, string>;
}

export default function Form({
  fields,
  onSubmit,
  initialValues = {},
  children,
  className,
  submitLabel = 'Submit',
  showSubmitButton = true,
  loading = false,
  errors: externalErrors = {},
}: FormProps) {
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};

    if (fields && fields.length > 0) {
      fields.forEach((field) => {
        if (field.type === 'checkbox') {
          data[field.name] = formData.get(field.name) === 'on';
        } else {
          data[field.name] = formData.get(field.name) ?? '';
        }
      });
    } else {
      // When using children with FormField, collect all form data
      for (const [key, value] of formData.entries()) {
        const input = e.currentTarget.elements.namedItem(key) as HTMLInputElement;
        if (input?.type === 'checkbox') {
          data[key] = input.checked;
        } else {
          data[key] = value;
        }
      }
    }

    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className={clsx('space-y-6', className)}>
      {fields &&
        fields.map((field) => {
          const error = externalErrors[field.name];
          const value = initialValues[field.name] ?? '';

          return (
            <div key={field.name} className="space-y-2">
              <label htmlFor={field.name} className="block text-sm font-medium text-white">
                {field.label}
                {field.required && <span className="text-red-400 text-red-400 ml-1">*</span>}
              </label>

              {field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  placeholder={field.placeholder}
                  required={field.required}
                  disabled={field.disabled}
                  defaultValue={String(value)}
                  rows={4}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-md form-input-glow',
                    'bg-[#1C1C26] bg-[#1C1C26]',
                    'text-white text-white',
                    'border-gray-700 border-gray-800',
                    'placeholder:text-gray-500 placeholder-gray-400',
                    'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent',
                    error && 'border-red-500 border-red-500/30',
                    field.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                />
              ) : field.type === 'select' ? (
                <select
                  id={field.name}
                  name={field.name}
                  required={field.required}
                  disabled={field.disabled}
                  defaultValue={String(value)}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-md form-input-glow',
                    'bg-[#1C1C26] bg-[#1C1C26]',
                    'text-white text-white',
                    'border-gray-700 border-gray-800',
                    'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent',
                    error && 'border-red-500 border-red-500/30',
                    field.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <option value="" className="bg-[#1C1C26]">Select {field.label}</option>
                  {field.options?.map((option) => (
                    <option key={option.value} value={option.value} className="bg-[#1C1C26]">
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'checkbox' ? (
                <div className="flex items-center">
                  <input
                    id={field.name}
                    name={field.name}
                    type="checkbox"
                    defaultChecked={Boolean(value)}
                    disabled={field.disabled}
                    className={clsx(
                      'w-4 h-4 text-blue-400 rounded',
                      'border-gray-700 border-gray-800',
                      'focus:ring-primary-500 focus:ring-blue-400',
                      field.disabled && 'opacity-50 cursor-not-allowed'
                    )}
                  />
                  <label htmlFor={field.name} className="ml-2 text-sm text-white">
                    {field.helpText}
                  </label>
                </div>
              ) : (
                <input
                  id={field.name}
                  name={field.name}
                  type={field.type ?? 'text'}
                  placeholder={field.placeholder}
                  required={field.required}
                  disabled={field.disabled}
                  defaultValue={String(value)}
                  className={clsx(
                    'w-full px-3 py-2 border rounded-md form-input-glow',
                    'bg-[#1C1C26] bg-[#1C1C26]',
                    'text-white text-white',
                    'border-gray-700 border-gray-800',
                    'placeholder:text-gray-500 placeholder-gray-400',
                    'focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent',
                    error && 'border-red-500 border-red-500/30',
                    field.disabled && 'opacity-50 cursor-not-allowed'
                  )}
                />
              )}

              {error && <p className="text-sm text-red-400">{error}</p>}
              {field.helpText && !error && <p className="text-sm text-gray-400">{field.helpText}</p>}
            </div>
          );
        })}

      {children}

      {showSubmitButton && (
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={clsx(
              'px-4 py-2 rounded-md font-medium',
              'bg-gradient-to-r from-blue-500 to-purple-500 text-white',
              'hover:from-blue-600 hover:to-purple-600',
              'focus:outline-none focus:ring-2 focus:ring-blue-400',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors'
            )}
          >
            {loading ? 'Loading...' : submitLabel}
          </button>
        </div>
      )}
    </form>
  );
}

// Form Field Component (for more control)
export interface FormFieldProps {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  children: ReactNode;
}

export function FormField({ label, name, required, error, helpText, children }: FormFieldProps) {
  // Handle multiple children - clone the first element if it's a valid React element
  const childrenArray = Array.isArray(children) ? children : children ? [children] : [];
  const firstChild = childrenArray[0];
  const restChildren = childrenArray.slice(1);

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="block text-sm font-medium text-white">
        {label}
        {required && <span className="text-red-400 text-red-400 ml-1">*</span>}
      </label>

      {firstChild && isValidElement(firstChild)
        ? cloneElement(firstChild as ReactElement<Record<string, unknown>>, {
            id: name,
            name,
            'aria-invalid': error ? 'true' : 'false',
            'aria-describedby': error ? `${name}-error` : helpText ? `${name}-help` : undefined,
          })
        : firstChild}

      {restChildren.length > 0 && restChildren}

      {error && (
        <p id={`${name}-error`} className="text-sm text-red-400">
          {error}
        </p>
      )}

      {helpText && !error && (
        <p id={`${name}-help`} className="text-sm text-gray-400">
          {helpText}
        </p>
      )}
    </div>
  );
}
