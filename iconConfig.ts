import {
  IconConfig,
  IconReplacement,
  IconSlot,
  Side,
  SideIconSlot,
  UiIconSlot,
} from './types';

const createDefaultReplacement = (): IconReplacement => ({
  mode: 'default',
  value: '',
});

export const SIDE_ICON_SLOTS: SideIconSlot[] = [
  'sideCCP',
  'sideKMT',
  'sideJOINT',
  'sideJAPAN',
  'sideOTHER',
];

export const UI_ICON_SLOTS: UiIconSlot[] = [
  'actionAdd',
  'actionExport',
  'actionEdit',
  'actionDelete',
  'actionSettings',
  'markerMajor',
  'hintScroll',
];

export const ICON_SLOT_DETAILS: Record<IconSlot, { label: string; description: string }> = {
  sideCCP: {
    label: '共产党图标',
    description: '用于顶部图例、事件卡片和导出卷轴中的共产党图标。',
  },
  sideKMT: {
    label: '国民党图标',
    description: '用于顶部图例、事件卡片和导出卷轴中的国民党图标。',
  },
  sideJOINT: {
    label: '联合阵线图标',
    description: '用于联合阵线史实卡片和导出卷轴。',
  },
  sideJAPAN: {
    label: '日方图标',
    description: '用于日方相关史实卡片和导出卷轴。',
  },
  sideOTHER: {
    label: '其他阵营图标',
    description: '用于其他阵营相关史实卡片和导出卷轴。',
  },
  actionAdd: {
    label: '录入按钮图标',
    description: '显示在“录入史实”按钮左侧。',
  },
  actionExport: {
    label: '导出按钮图标',
    description: '显示在“导出卷轴”按钮左侧。',
  },
  actionEdit: {
    label: '编辑按钮图标',
    description: '显示在每张史实卡片右上角的编辑按钮中。',
  },
  actionDelete: {
    label: '删除按钮图标',
    description: '显示在每张史实卡片右上角的删除按钮中。',
  },
  actionSettings: {
    label: '图标设置图标',
    description: '显示在“图标设置”按钮左侧。',
  },
  markerMajor: {
    label: '重点史实标记',
    description: '显示在重点史实卡片左下角，并用于导出卷轴。',
  },
  hintScroll: {
    label: '滚动提示图标',
    description: '显示在页面底部的横向浏览提示中。',
  },
};

export const ICON_SLOT_SECTIONS: Array<{ title: string; slots: IconSlot[] }> = [
  {
    title: '阵营图标',
    slots: [...SIDE_ICON_SLOTS],
  },
  {
    title: '操作图标',
    slots: [...UI_ICON_SLOTS],
  },
];

export const createDefaultIconConfig = (): IconConfig => ({
  sideCCP: createDefaultReplacement(),
  sideKMT: createDefaultReplacement(),
  sideJOINT: createDefaultReplacement(),
  sideJAPAN: createDefaultReplacement(),
  sideOTHER: createDefaultReplacement(),
  actionAdd: createDefaultReplacement(),
  actionExport: createDefaultReplacement(),
  actionEdit: createDefaultReplacement(),
  actionDelete: createDefaultReplacement(),
  actionSettings: createDefaultReplacement(),
  markerMajor: createDefaultReplacement(),
  hintScroll: createDefaultReplacement(),
});

export const cloneIconConfig = (iconConfig: IconConfig): IconConfig => {
  const defaults = createDefaultIconConfig();
  const nextConfig = {} as IconConfig;

  (Object.keys(defaults) as IconSlot[]).forEach((slot) => {
    nextConfig[slot] = {
      ...defaults[slot],
      ...(iconConfig[slot] ?? {}),
    };
  });

  return nextConfig;
};

export const isSideIconSlot = (slot: IconSlot): slot is SideIconSlot => {
  return SIDE_ICON_SLOTS.includes(slot as SideIconSlot);
};

export const getSideIconSlot = (side: Side): SideIconSlot => {
  switch (side) {
    case Side.CCP:
      return 'sideCCP';
    case Side.KMT:
      return 'sideKMT';
    case Side.JOINT:
      return 'sideJOINT';
    case Side.JAPAN:
      return 'sideJAPAN';
    default:
      return 'sideOTHER';
  }
};

export const getSideForIconSlot = (slot: SideIconSlot): Side => {
  switch (slot) {
    case 'sideCCP':
      return Side.CCP;
    case 'sideKMT':
      return Side.KMT;
    case 'sideJOINT':
      return Side.JOINT;
    case 'sideJAPAN':
      return Side.JAPAN;
    default:
      return Side.OTHER;
  }
};
