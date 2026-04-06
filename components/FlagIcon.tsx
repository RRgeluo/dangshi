import React, { useEffect, useId, useState } from 'react';
import { getDefaultFlagDataUrl } from '../defaultFlagAssets';
import { getSideIconSlot } from '../iconConfig';
import { IconConfig, Side } from '../types';

interface FlagIconProps {
  side: Side;
  className?: string;
  iconConfig?: IconConfig;
}

const renderDefaultFlag = (side: Side, baseClasses: string, jointGradientId: string) => {
  if (side === Side.CCP) {
    return (
      <svg viewBox="0 0 300 200" className={baseClasses} aria-label="CCP Flag">
        <rect width="300" height="200" fill="#c40000" />
        <polygon points="72,34 80,56 104,56 85,70 92,92 72,78 52,92 59,70 40,56 64,56" fill="#ffd700" />
        <path
          d="M122 64c18-20 49-19 60 7 6 16-4 31-18 40l13 31h-19l-12-28-20 8-7-17 20-8c14-6 22-15 17-28-6-13-23-15-33-4z"
          fill="#ffd700"
        />
        <path
          d="M158 58 202 101 190 113 147 71z"
          fill="#ffd700"
        />
      </svg>
    );
  }

  if (side === Side.KMT) {
    return (
      <svg viewBox="0 0 300 200" className={baseClasses} aria-label="KMT Flag">
        <rect width="300" height="200" fill="#000095" />
        <circle cx="150" cy="100" r="35" fill="white" />
        <g stroke="white" strokeWidth="8">
          {[...Array(12)].map((_, index) => (
            <line
              key={index}
              x1="150"
              y1="100"
              x2="150"
              y2="40"
              transform={`rotate(${index * 30} 150 100)`}
            />
          ))}
        </g>
      </svg>
    );
  }

  if (side === Side.JOINT) {
    return (
      <svg viewBox="0 0 300 200" className={baseClasses} aria-label="Joint Flag">
        <defs>
          <linearGradient id={jointGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#DE2910" />
            <stop offset="100%" stopColor="#000095" />
          </linearGradient>
        </defs>
        <rect width="300" height="200" fill={`url(#${jointGradientId})`} />
        <text x="150" y="110" textAnchor="middle" fill="white" fontSize="40" fontWeight="bold">
          合作
        </text>
      </svg>
    );
  }

  if (side === Side.JAPAN) {
    return (
      <svg viewBox="0 0 300 200" className={baseClasses} aria-label="Japan Flag">
        <rect width="300" height="200" fill="#ffffff" />
        <circle cx="150" cy="100" r="50" fill="#bd0029" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 300 200" className={baseClasses} aria-label="Other Flag">
      <rect width="300" height="200" fill="#444" />
      <text x="150" y="115" textAnchor="middle" fill="white" fontSize="36" fontWeight="bold">
        其他
      </text>
    </svg>
  );
};

export const FlagIcon: React.FC<FlagIconProps> = ({ side, className = '', iconConfig }) => {
  const baseClasses = `inline-block w-full h-full shadow-md border border-white/20 ${className}`;
  const override = iconConfig?.[getSideIconSlot(side)];
  const jointGradientId = useId();
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const defaultFlagDataUrl = getDefaultFlagDataUrl(side);

  useEffect(() => {
    setImageLoadFailed(false);
  }, [side, override?.mode, override?.value]);

  if (override?.mode === 'image' && override.value && !imageLoadFailed) {
    return (
      <img
        src={override.value}
        alt={`${side} icon`}
        className={baseClasses}
        style={{ objectFit: 'cover' }}
        onError={() => setImageLoadFailed(true)}
      />
    );
  }

  if (override?.mode === 'text' && override.value) {
    return (
      <div
        aria-label={`${side} icon`}
        className={`${baseClasses} flex items-center justify-center bg-black/70 text-white text-[10px] font-bold leading-none`}
      >
        {override.value}
      </div>
    );
  }

  if (defaultFlagDataUrl) {
    return (
      <img
        src={defaultFlagDataUrl}
        alt={`${side} icon`}
        className={baseClasses}
        style={{ objectFit: 'cover' }}
      />
    );
  }

  return renderDefaultFlag(side, baseClasses, jointGradientId);
};
