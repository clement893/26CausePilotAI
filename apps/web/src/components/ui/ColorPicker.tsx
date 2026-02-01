'use client';
import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';
import { Check } from 'lucide-react';
export interface ColorPickerProps {
  value?: string;
  defaultValue?: string;
  onChange?: (color: string) => void;
  label?: string;
  presetColors?: string[];
  showInput?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
}
const defaultPresetColors = [
  '#000000',
  '#374151',
  '#6B7280',
  '#9CA3AF',
  '#D1D5DB',
  '#EF4444',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#FFFFFF',
];
export default function ColorPicker({
  value: controlledValue,
  defaultValue = '#000000',
  onChange,
  label,
  presetColors = defaultPresetColors,
  showInput = true,
  disabled = false,
  fullWidth = false,
  className,
}: ColorPickerProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
  const handleColorSelect = (color: string) => {
    if (!isControlled) {
      setInternalValue(color);
    }
    onChange?.(color);
    setIsOpen(false);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    if (!isControlled) {
      setInternalValue(newColor);
    }
    onChange?.(newColor);
  };
  return (
    <div className={clsx('flex flex-col gap-2', fullWidth && 'w-full', className)}>
      {label && <label className="text-sm font-medium text-gray-300 text-white">{label}</label>}
      <div className="relative" ref={pickerRef}>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={clsx(
              'w-10 h-10 rounded border-2 border-gray-700 border-gray-800',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              disabled && 'opacity-50 cursor-not-allowed',
              !disabled && 'cursor-pointer hover:border-gray-600 hover:border-gray-800 transition-colors'
            )}
            style={{ backgroundColor: currentValue }}
            aria-label={label || 'Sélectionner une couleur'}
            aria-expanded={isOpen}
          />
          {showInput && (
            <input
              type="text"
              value={currentValue}
              onChange={handleInputChange}
              disabled={disabled}
              className={clsx(
                'px-3 py-2 border border-gray-700 border-gray-800 rounded-lg',
                'bg-[#1C1C26] bg-[#1C1C26] text-white text-white',
                'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                disabled && 'opacity-50 cursor-not-allowed',
                'font-mono text-sm placeholder:text-gray-500 placeholder-gray-400'
              )}
              placeholder="#000000"
              pattern="^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$"
            />
          )}
        </div>
        {isOpen && (
          <div className="absolute z-50 mt-2 p-3 glass-effect bg-[#13131A] bg-[#1C1C26] border border-gray-800 border-gray-800 rounded-lg shadow-lg">
            <div className="grid grid-cols-6 gap-2">
              {presetColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorSelect(color)}
                  className={clsx(
                    'w-8 h-8 rounded border-2 transition-all',
                    'focus:outline-none focus:ring-2 focus:ring-primary-500',
                    currentValue.toLowerCase() === color.toLowerCase()
                      ? 'border-blue-500 border-gray-800 scale-110 ring-2 ring-blue-500'
                      : 'border-gray-700 border-gray-800 hover:border-gray-600 hover:border-gray-800'
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={`Sélectionner ${color}`}
                >
                  {currentValue.toLowerCase() === color.toLowerCase() && (
                    <Check className="w-4 h-4 text-white m-auto drop-shadow-lg" />
                  )}
                </button>
              ))}
            </div>
            {showInput && (
              <div className="mt-3 pt-3 border-t border-gray-800 border-gray-800">
                <input
                  type="color"
                  value={currentValue}
                  onChange={(e) => handleColorSelect(e.target.value)}
                  className="w-full h-10 cursor-pointer rounded"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
