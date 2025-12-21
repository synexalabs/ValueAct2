/**
 * Reusable Calculator Components
 * Provides consistent styling templates for all calculator components
 */

import React from 'react';
import { InlineMath } from 'react-katex';
import { getCalculatorColors, getStatusColors, designSystem } from '../utils/designSystem';

/**
 * Calculator Card Component
 * Provides consistent card styling for calculator sections
 */
export const CalculatorCard = ({ calculatorType, title, children, className = "" }) => {
  const colors = getCalculatorColors(calculatorType);
  
  return (
    <div className={`card ${className}`}>
      <h3 className={`text-xl font-semibold text-gray-800 mb-4 ${designSystem.spacing.title}`}>
        {title}
      </h3>
      <div className={`space-y-4 ${designSystem.spacing.content}`}>
        {children}
      </div>
    </div>
  );
};

/**
 * Result Card Component
 * Provides consistent styling for calculation results
 */
export const ResultCard = ({ status, title, value, formula, children, className = "" }) => {
  const colors = getStatusColors(status);
  
  return (
    <div className={`bg-gradient-to-r ${colors.gradient} ${designSystem.sizing.cardPadding} rounded-lg border ${colors.border} ${className}`}>
      <h4 className={`font-semibold ${colors.text} mb-3 ${designSystem.spacing.label}`}>
        {title}
      </h4>
      <div className={`text-2xl font-bold ${colors.value} ${designSystem.spacing.label}`}>
        {value}
      </div>
      {formula && (
        <div className={`text-sm ${colors.text} mt-2 ${designSystem.spacing.label}`}>
          <InlineMath math={formula} />
        </div>
      )}
      {children}
    </div>
  );
};

/**
 * Primary Button Component
 * Provides consistent primary button styling
 */
export const PrimaryButton = ({ calculatorType, onClick, children, className = "", disabled = false }) => {
  const colors = getCalculatorColors(calculatorType);
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex-1 bg-gradient-to-r ${colors.gradient} text-white ${designSystem.sizing.button} rounded-lg hover:bg-gradient-to-r ${colors.hover} transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
};

/**
 * Secondary Button Component
 * Provides consistent secondary button styling
 */
export const SecondaryButton = ({ onClick, children, className = "", disabled = false }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${designSystem.sizing.button} bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
};

/**
 * Form Input Component
 * Provides consistent input styling
 */
export const FormInput = ({ 
  type = "number", 
  value, 
  onChange, 
  label, 
  step, 
  placeholder,
  className = "",
  disabled = false 
}) => {
  return (
    <div className={className}>
      <label className={`${designSystem.typography.label} mb-2 ${designSystem.spacing.label}`}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        step={step}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full ${designSystem.sizing.input} border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed`}
      />
    </div>
  );
};

/**
 * Form Select Component
 * Provides consistent select styling
 */
export const FormSelect = ({ 
  value, 
  onChange, 
  label, 
  options, 
  className = "",
  disabled = false 
}) => {
  return (
    <div className={className}>
      <label className={`${designSystem.typography.label} mb-2 ${designSystem.spacing.label}`}>
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full ${designSystem.sizing.input} border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

/**
 * Button Group Component
 * Provides consistent button group styling
 */
export const ButtonGroup = ({ children, className = "" }) => {
  return (
    <div className={`flex space-x-3 ${designSystem.spacing.button} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Grid Item Component
 * Provides consistent grid item styling for metrics
 */
export const GridItem = ({ label, value, className = "" }) => {
  return (
    <div className={`text-center ${designSystem.sizing.cardPaddingSmall} bg-gray-50 rounded-lg ${className}`}>
      <div className={`font-medium text-gray-600 ${designSystem.spacing.label}`}>
        {label}
      </div>
      <div className={`font-semibold text-gray-800 ${designSystem.spacing.label}`}>
        {value}
      </div>
    </div>
  );
};

/**
 * Tab Button Component
 * Provides consistent tab button styling
 */
export const TabButton = ({ calculatorType, isActive, onClick, children }) => {
  const colors = getCalculatorColors(calculatorType);
  
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
        isActive
          ? `bg-gradient-to-r ${colors.gradient} text-white shadow-lg`
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      {children}
    </button>
  );
};

/**
 * Calculator Header Component
 * Provides consistent header styling for calculators
 */
export const CalculatorHeader = ({ title, description, className = "" }) => {
  return (
    <div className={`mb-8 ${designSystem.spacing.container} ${className}`}>
      <h1 className={`${designSystem.typography.title} mb-2 ${designSystem.spacing.title}`}>
        {title}
      </h1>
      <p className={`${designSystem.typography.description} ${designSystem.spacing.title}`}>
        {description}
      </p>
    </div>
  );
};

/**
 * Tab Navigation Component
 * Provides consistent tab navigation styling
 */
export const TabNavigation = ({ calculatorType, tabs, activeTab, onTabChange, className = "" }) => {
  return (
    <div className={`flex flex-wrap gap-2 mb-6 ${designSystem.spacing.container} ${className}`}>
      {tabs.map(tab => (
        <TabButton
          key={tab.id}
          calculatorType={calculatorType}
          isActive={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
        >
          <tab.icon className="h-4 w-4" />
          <span className={designSystem.spacing.label}>{tab.label}</span>
        </TabButton>
      ))}
    </div>
  );
};

/**
 * Calculator Container Component
 * Provides consistent container styling for calculators
 */
export const CalculatorContainer = ({ children, className = "" }) => {
  return (
    <div className={`max-w-6xl mx-auto p-6 ${className}`}>
      {children}
    </div>
  );
};

/**
 * Grid Container Component
 * Provides consistent grid layout styling
 */
export const GridContainer = ({ children, cols = "1", lgCols = "2", className = "" }) => {
  return (
    <div className={`grid grid-cols-${cols} lg:grid-cols-${lgCols} gap-6 ${designSystem.spacing.container} ${className}`}>
      {children}
    </div>
  );
};
