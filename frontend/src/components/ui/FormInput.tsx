/**
 * FormInput Component - ShadCN Input + Label with PropIQ Glass Styling
 *
 * Reusable form input component that combines ShadCN's accessible
 * Input and Label primitives with PropIQ's glassmorphism aesthetic.
 */

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface FormInputProps {
  id: string
  label: string
  type?: 'text' | 'number' | 'email' | 'password'
  value: string | number
  placeholder?: string
  onChange: (value: string) => void
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
  step?: string
  min?: string
  max?: string
  className?: string
  inputClassName?: string
  labelClassName?: string
  required?: boolean
  disabled?: boolean
  error?: string
  helpText?: string
}

export const FormInput = ({
  id,
  label,
  type = 'text',
  value,
  placeholder,
  onChange,
  onFocus,
  step,
  min,
  max,
  className,
  inputClassName,
  labelClassName,
  required = false,
  disabled = false,
  error,
  helpText,
}: FormInputProps) => {
  return (
    <div className={cn('space-y-2', className)}>
      <Label
        htmlFor={id}
        className={cn(
          'text-gray-300 text-sm font-medium',
          error && 'text-red-400',
          labelClassName
        )}
      >
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </Label>

      <Input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        step={step}
        min={min}
        max={max}
        disabled={disabled}
        className={cn(
          // Glass styling for PropIQ
          'bg-surface-200 border-glass-border',
          'text-gray-100 placeholder:text-gray-500',
          'focus:ring-primary focus:border-primary',
          'transition-all duration-200',
          // Hover effect
          'hover:border-glass-border-hover',
          // Error state
          error && 'border-red-500 focus:ring-red-400',
          // Disabled state
          disabled && 'opacity-50 cursor-not-allowed',
          inputClassName
        )}
        aria-label={label}
        aria-describedby={error ? `${id}-error` : helpText ? `${id}-help` : undefined}
        aria-invalid={error ? true : undefined}
      />

      {/* Help text */}
      {helpText && !error && (
        <p id={`${id}-help`} className="text-xs text-gray-400">
          {helpText}
        </p>
      )}

      {/* Error message */}
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-400 flex items-center gap-1">
          <span className="inline-block">⚠</span>
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * Numeric Input Helper
 * Handles parsing and validation for number inputs
 */
interface NumericInputProps extends Omit<FormInputProps, 'type' | 'onChange'> {
  value: number
  onChange: (value: number) => void
  allowZero?: boolean
  allowNegative?: boolean
}

export const NumericInput = ({
  value,
  onChange,
  allowZero = true,
  allowNegative = false,
  onFocus,
  ...props
}: NumericInputProps) => {
  const handleChange = (strValue: string) => {
    // Allow empty string for better UX while typing
    if (strValue === '') {
      onChange(0)
      return
    }

    const numValue = parseFloat(strValue)

    // Validate
    if (isNaN(numValue)) return
    if (!allowNegative && numValue < 0) return
    if (!allowZero && numValue === 0) return

    onChange(numValue)
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Select all text on focus for easy editing
    e.target.select()
    onFocus?.(e)
  }

  return (
    <FormInput
      {...props}
      type="number"
      value={value || ''}
      onChange={handleChange}
      onFocus={handleFocus}
    />
  )
}

export default FormInput
