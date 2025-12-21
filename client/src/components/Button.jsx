import React from 'react'
import { Loader2 } from 'lucide-react'

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ariaLabel,
  ...props
}) => {
  const baseClasses = 'font-heading font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 focus-visible:outline-none'
  
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-sm hover:shadow-lg active:shadow-inner',
    secondary: 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 active:bg-blue-100',
    outline: 'border border-gray-300 text-gray-700 hover:bg-gray-50 active:bg-gray-100',
    gradient: 'bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white shadow-sm hover:shadow-lg active:shadow-inner'
  }
  
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-6 py-3 text-base min-h-[44px]',
    lg: 'px-8 py-4 text-lg min-h-[48px]'
  }

  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-busy={loading}
      aria-disabled={isDisabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      <div className="flex items-center justify-center space-x-2">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        <span>{children}</span>
      </div>
    </button>
  )
}

export default Button
