import { Side } from './types';

export type DefaultFlagVariant = 'flag' | 'event';

// 统一使用用户提供的 4:3 阵营图。
export const DEFAULT_CCP_FLAG_DATA_URL = '/ccp-flag.jpg';
export const DEFAULT_KMT_FLAG_DATA_URL = '/kmt-flag.jpg';
export const DEFAULT_JAPAN_FLAG_DATA_URL = '/japan-flag.jpg';

// OTHER 阵营不显示任何图标，因此返回 null。
export const getDefaultFlagDataUrl = (
  side: Side,
  _variant: DefaultFlagVariant = 'flag',
): string | null => {
  switch (side) {
    case Side.CCP:
      return DEFAULT_CCP_FLAG_DATA_URL;
    case Side.KMT:
      return DEFAULT_KMT_FLAG_DATA_URL;
    case Side.JAPAN:
      return DEFAULT_JAPAN_FLAG_DATA_URL;
    default:
      return null;
  }
};
