import React from 'react'

const AxiomAIIcon = ({ className = "w-12 h-12", ...props }) => {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      {/* Background Circle */}
      <circle cx="32" cy="32" r="30" fill="url(#axiomGradient)" stroke="url(#axiomBorder)" strokeWidth="2"/>
      
      {/* Brain/AI Core */}
      <path
        d="M20 24C20 20 24 18 28 20C30 18 34 18 36 20C40 18 44 20 44 24V28C44 32 42 36 38 38C40 40 42 44 40 48C38 50 34 50 32 48C30 50 26 50 24 48C22 44 24 40 26 38C22 36 20 32 20 28V24Z"
        fill="white"
        opacity="0.9"
      />
      
      {/* Neural Network Nodes */}
      <circle cx="28" cy="26" r="2" fill="url(#nodeGradient)"/>
      <circle cx="36" cy="26" r="2" fill="url(#nodeGradient)"/>
      <circle cx="32" cy="30" r="2" fill="url(#nodeGradient)"/>
      <circle cx="26" cy="34" r="2" fill="url(#nodeGradient)"/>
      <circle cx="38" cy="34" r="2" fill="url(#nodeGradient)"/>
      
      {/* Neural Network Connections */}
      <path d="M28 26L32 30" stroke="url(#connectionGradient)" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M36 26L32 30" stroke="url(#connectionGradient)" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M32 30L26 34" stroke="url(#connectionGradient)" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M32 30L38 34" stroke="url(#connectionGradient)" strokeWidth="1.5" strokeLinecap="round"/>
      
      {/* AI Symbol */}
      <path d="M22 42H26L24 38L22 42Z" fill="url(#aiGradient)"/>
      <path d="M38 42H42L40 38L38 42Z" fill="url(#aiGradient)"/>
      
      {/* Mathematical Elements */}
      <path d="M16 16L20 20" stroke="url(#mathGradient)" strokeWidth="2" strokeLinecap="round"/>
      <path d="M44 16L48 20" stroke="url(#mathGradient)" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="16" cy="16" r="1.5" fill="url(#mathGradient)"/>
      <circle cx="48" cy="16" r="1.5" fill="url(#mathGradient)"/>
      
      {/* Data Flow Lines */}
      <path d="M12 32L16 32" stroke="url(#dataGradient)" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M48 32L52 32" stroke="url(#dataGradient)" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M32 12L32 16" stroke="url(#dataGradient)" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M32 48L32 52" stroke="url(#dataGradient)" strokeWidth="1.5" strokeLinecap="round"/>
      
      {/* Gradients */}
      <defs>
        <linearGradient id="axiomGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6"/>
          <stop offset="100%" stopColor="#10B981"/>
        </linearGradient>
        
        <linearGradient id="axiomBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB"/>
          <stop offset="100%" stopColor="#059669"/>
        </linearGradient>
        
        <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#60A5FA"/>
          <stop offset="100%" stopColor="#34D399"/>
        </linearGradient>
        
        <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#93C5FD"/>
          <stop offset="100%" stopColor="#6EE7B7"/>
        </linearGradient>
        
        <linearGradient id="aiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6"/>
          <stop offset="100%" stopColor="#10B981"/>
        </linearGradient>
        
        <linearGradient id="mathGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6"/>
          <stop offset="100%" stopColor="#06B6D4"/>
        </linearGradient>
        
        <linearGradient id="dataGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F59E0B"/>
          <stop offset="100%" stopColor="#EF4444"/>
        </linearGradient>
      </defs>
    </svg>
  )
}

export default AxiomAIIcon
