import { Era } from './types';

export const ERA_LABELS: Record<Era, string> = {
  [Era.OLD_DEMOCRATIC]: '旧民主主义革命（1840-1919）',
  [Era.NATIONAL_REVOLUTION]: '国民革命时期（1924-1927）',
  [Era.LAND_REVOLUTION]: '土地革命（1927-1937）',
  [Era.ANTI_JAPAN]: '全面抗战（1937-1945）',
  [Era.LIBERATION]: '解放战争（1945-1949）',
  [Era.KOREAN]: '抗美援朝战争（1950-1953）',
  [Era.SOCIALIST]: '社会主义革命（1949-1956）',
};

export const ERA_ORDER: Era[] = [
  Era.OLD_DEMOCRATIC,
  Era.NATIONAL_REVOLUTION,
  Era.LAND_REVOLUTION,
  Era.ANTI_JAPAN,
  Era.LIBERATION,
  Era.KOREAN,
  Era.SOCIALIST,
];

export type TimelineFilterKey =
  | 'ALL'
  | 'OLD_DEMOCRATIC_GROUP'
  | 'NEW_DEMOCRATIC_GROUP'
  | 'POST_1949_GROUP'
  | Era;

export interface NavChildItem {
  key: Era;
  label: string;
  eras: Era[];
}

export interface MainNavItem {
  key: TimelineFilterKey;
  label: string;
  eras: Era[];
  children?: NavChildItem[];
}

export const MAIN_NAV_ITEMS: MainNavItem[] = [
  {
    key: 'ALL',
    label: '全景脉络',
    eras: ERA_ORDER,
  },
  {
    key: 'OLD_DEMOCRATIC_GROUP',
    label: '旧民主主义革命（1840-1919）',
    eras: [Era.OLD_DEMOCRATIC],
  },
  {
    key: 'NEW_DEMOCRATIC_GROUP',
    label: '新民主主义革命（1919-1949）',
    eras: [
      Era.NATIONAL_REVOLUTION,
      Era.LAND_REVOLUTION,
      Era.ANTI_JAPAN,
      Era.LIBERATION,
    ],
    children: [
      {
        key: Era.NATIONAL_REVOLUTION,
        label: '国民革命时期（1924-1927）',
        eras: [Era.NATIONAL_REVOLUTION],
      },
      {
        key: Era.LAND_REVOLUTION,
        label: '土地革命（1927-1937）',
        eras: [Era.LAND_REVOLUTION],
      },
      {
        key: Era.ANTI_JAPAN,
        label: '全面抗战（1937-1945）',
        eras: [Era.ANTI_JAPAN],
      },
      {
        key: Era.LIBERATION,
        label: '解放战争（1945-1949）',
        eras: [Era.LIBERATION],
      },
    ],
  },
  {
    key: Era.KOREAN,
    label: '抗美援朝战争（1950-1953）',
    eras: [Era.KOREAN],
  },
  {
    key: Era.SOCIALIST,
    label: '社会主义革命（1949-1956）',
    eras: [Era.SOCIALIST],
  },
];

export const FILTER_ERA_MAP: Record<TimelineFilterKey, Era[]> = {
  ALL: ERA_ORDER,
  OLD_DEMOCRATIC_GROUP: [Era.OLD_DEMOCRATIC],
  NEW_DEMOCRATIC_GROUP: [
    Era.NATIONAL_REVOLUTION,
    Era.LAND_REVOLUTION,
    Era.ANTI_JAPAN,
    Era.LIBERATION,
  ],
  [Era.OLD_DEMOCRATIC]: [Era.OLD_DEMOCRATIC],
  [Era.NATIONAL_REVOLUTION]: [Era.NATIONAL_REVOLUTION],
  [Era.LAND_REVOLUTION]: [Era.LAND_REVOLUTION],
  [Era.ANTI_JAPAN]: [Era.ANTI_JAPAN],
  [Era.LIBERATION]: [Era.LIBERATION],
  [Era.KOREAN]: [Era.KOREAN],
  [Era.SOCIALIST]: [Era.SOCIALIST],
};
