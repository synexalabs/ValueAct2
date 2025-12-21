/**
 * ValidatedInput Component
 * A reusable input component with built-in validation and error display
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import { validateField } from '../utils/validation';

const ValidatedInput = ({
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  validationRules = [],
  placeholder,
  className = '',
  disabled = false,
  helpText,
  required = false,
  step,
  min,
  max,
  ...props
}) => {
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(true);
  const [isTouched, setIsTouched] = useState(false);

  const validate = (value) => {
    if (validationRules.length === 0) return;
    
    const result = validateField(value, validationRules);
    setError(result.message);
    setIsValid(result.isValid);
  };

  useEffect(() => {
    if (isTouched) {
      validate(value);
    }
  }, [value, isTouched]);

  const handleBlur = (e) => {
    setIsTouched(true);
    validate(value);
    if (onBlur) onBlur(e);
  };

  const handleChange = (e) => {
    const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    onChange(newValue);
  };

  const getInputClasses = () => {
    let baseClasses = 'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent transition-all duration-300 focus-visible:outline-none';
    
    if (disabled) {
      baseClasses += ' bg-gray-100 text-gray-500 cursor-not-allowed';
    } else if (isTouched) {
      if (isValid) {
        baseClasses += ' border-green-300 focus:ring-green-500 bg-green-50/30';
      } else {
        baseClasses += ' border-red-300 focus:ring-red-500 bg-red-50/30';
      }
    } else {
      baseClasses += ' border-gray-300 focus:ring-blue-500';
    }
    
    return `${baseClasses} ${className}`;
  };

  const getIcon = () => {
    if (disabled) return null;
    
    if (isTouched) {
      if (isValid) {
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      } else {
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      }
    }
    
    return null;
  };

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          step={step}
          min={min}
          max={max}
          className={getInputClasses()}
          aria-invalid={isTouched && !isValid}
          aria-describedby={error ? `${label}-error` : helpText ? `${label}-help` : undefined}
          {...props}
        />
        
        {getIcon() && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {getIcon()}
          </div>
        )}
      </div>
      
      {helpText && !error && (
        <div className="flex items-start space-x-1">
          <Info className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
          <p id={`${label}-help`} className="text-xs text-gray-600">{helpText}</p>
        </div>
      )}
      
      {error && (
        <div className="flex items-start space-x-1">
          <AlertCircle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
          <p id={`${label}-error`} className="text-xs text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ValidatedInput;
