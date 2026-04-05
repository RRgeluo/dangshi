import React from 'react';
import { IconConfig, UiIconSlot } from '../types';

interface AppIconProps {
  slot: UiIconSlot;
  iconConfig: IconConfig;
  label: string;
  className?: string;
}

const textIconClasses = 'inline-flex items-center justify-center leading-none';

export const AppIcon: React.FC<AppIconProps> = ({
  slot,
  iconConfig,
  label,
  className = '',
}) => {
  const customIcon = iconConfig[slot];

  if (customIcon.mode === 'image' && customIcon.value) {
    return (
      <img
        src={customIcon.value}
        alt={label}
        className={className}
        style={{ objectFit: 'contain' }}
      />
    );
  }

  if (customIcon.mode === 'text' && customIcon.value) {
    return (
      <span aria-label={label} className={`${textIconClasses} ${className}`}>
        {customIcon.value}
      </span>
    );
  }

  switch (slot) {
    case 'actionAdd':
      return (
        <span aria-label={label} className={`${textIconClasses} font-black ${className}`}>
          +
        </span>
      );
    case 'actionExport':
      return (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-label={label}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 16v1a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3v-1m-4-4-4 4m0 0-4-4m4 4V4"
          />
        </svg>
      );
    case 'actionEdit':
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-label={label}
        >
          <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
        </svg>
      );
    case 'actionDelete':
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-label={label}
        >
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      );
    case 'actionSettings':
      return (
        <svg
          className={className}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-label={label}
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.02A1.65 1.65 0 0 0 10 3.09V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h.02a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.02a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case 'markerMajor':
      return (
        <span aria-label={label} className={`${textIconClasses} ${className}`}>
          ★
        </span>
      );
    case 'hintScroll':
      return (
        <span aria-label={label} className={`${textIconClasses} ${className}`}>
          ↔
        </span>
      );
    default:
      return null;
  }
};
