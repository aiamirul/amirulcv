/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

interface CollapsibleTextProps {
  text: string;
  maxLength?: number;
  className?: string;
}

export const CollapsibleText: React.FC<CollapsibleTextProps> = ({
  text,
  maxLength = 180,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return null;

  const shouldCollapse = text.length > maxLength;

  if (!shouldCollapse) {
    return (
      <p className={`text-[11px] sm:text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap ${className}`}>
        {text}
      </p>
    );
  }

  const displayText = isExpanded ? text : `${text.substring(0, maxLength)}...`;

  return (
    <div className="space-y-1">
      <p className={`text-[11px] sm:text-xs md:text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap transition-all duration-200 ${className}`}>
        {displayText}
      </p>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsExpanded(!isExpanded);
        }}
        className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--accent-primary)] hover:text-[var(--accent-hover)] transition-colors cursor-pointer select-none py-0.5"
        title={isExpanded ? "Show less text" : "Read more text"}
      >
        <span>{isExpanded ? 'Show Less ▴' : 'View More ▾'}</span>
      </button>
    </div>
  );
};
