import React, { useEffect, useId, useState } from 'react';
import { DefaultFlagVariant, getDefaultFlagDataUrl } from '../defaultFlagAssets';
import { getSideIconSlot } from '../iconConfig';
import { IconConfig, Side } from '../types';

interface FlagIconProps {
  side: Side;
  className?: string;
  iconConfig?: IconConfig;
  variant?: DefaultFlagVariant;
}

// 所有旗帜统一直接拉伸到外层 4:3 容器中，不额外添加底色或描边。
const getSharedImageStyle = (): React.CSSProperties => ({
  width: '100%',
  height: '100%',
  objectPosition: 'center',
  objectFit: 'fill',
});

// 联合阵营暂时仍用程序图形兜底，因为用户还没有提供对应图片。
const renderJointFlag = (baseClasses: string, jointGradientId: string) => (
  <svg viewBox="0 0 300 200" className={baseClasses} aria-label="联合阵营旗帜">
    <defs>
      <linearGradient id={jointGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#de2910" />
        <stop offset="100%" stopColor="#000095" />
      </linearGradient>
    </defs>
    <rect width="300" height="200" fill={`url(#${jointGradientId})`} />
    <text x="150" y="114" textAnchor="middle" fill="white" fontSize="38" fontWeight="bold">
      联合
    </text>
  </svg>
);

export const FlagIcon: React.FC<FlagIconProps> = ({
  side,
  className = '',
  iconConfig,
  variant = 'flag',
}) => {
  if (side === Side.OTHER) {
    return null;
  }

  const baseClasses = `inline-block h-full w-full ${className}`;
  const override = iconConfig?.[getSideIconSlot(side)];
  const jointGradientId = useId();
  const [imageLoadFailed, setImageLoadFailed] = useState(false);
  const defaultFlagDataUrl = getDefaultFlagDataUrl(side, variant);
  const sharedImageStyle = getSharedImageStyle();

  useEffect(() => {
    setImageLoadFailed(false);
  }, [side, override?.mode, override?.value]);

  if (override?.mode === 'image' && override.value && !imageLoadFailed) {
    return (
      <img
        src={override.value}
        alt={`${side} icon`}
        className={baseClasses}
        style={sharedImageStyle}
        onError={() => setImageLoadFailed(true)}
      />
    );
  }

  if (override?.mode === 'text' && override.value) {
    return (
      <div
        aria-label={`${side} icon`}
        className={`${baseClasses} flex items-center justify-center text-[10px] font-bold leading-none text-white`}
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
        style={sharedImageStyle}
      />
    );
  }

  if (side === Side.JOINT) {
    return renderJointFlag(baseClasses, jointGradientId);
  }

  return null;
};
