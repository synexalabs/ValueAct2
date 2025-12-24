'use client';

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

/**
 * Reveal Component
 * Hides sensitive information from web scrapers and visual snooping.
 * Requires user interaction to display the content.
 * 
 * Usage:
 * <Reveal text="service@synexalabs.org" label="Show Email" />
 */
const Reveal = ({ text, label = "Reveal", className = "" }) => {
    const [isRevealed, setIsRevealed] = useState(false);

    const handleReveal = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsRevealed(true);
    };

    if (isRevealed) {
        return (
            <span className={`inline-flex items-center gap-2 font-medium text-trust-900 ${className}`}>
                {text}
            </span>
        );
    }

    return (
        <button
            onClick={handleReveal}
            className={`inline-flex items-center gap-2 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-gray-500 uppercase tracking-wider transition-colors ${className}`}
            title="Click to reveal sensitive information"
        >
            <Eye size={12} />
            {label}
        </button>
    );
};

export default Reveal;
