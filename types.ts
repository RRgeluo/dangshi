export enum Era {
  OLD_DEMOCRATIC = 'OLD_DEMOCRATIC',
  NATIONAL_REVOLUTION = 'NATIONAL_REVOLUTION',
  LAND_REVOLUTION = 'LAND_REVOLUTION',
  ANTI_JAPAN = 'ANTI_JAPAN',
  LIBERATION = 'LIBERATION',
  KOREAN = 'KOREAN',
  SOCIALIST = 'SOCIALIST',
}

export enum Side {
  CCP = 'CCP',
  KMT = 'KMT',
  JOINT = 'JOINT',
  JAPAN = 'JAPAN',
  OTHER = 'OTHER',
}

export interface HistoricalEvent {
  id: string;
  year: string;
  dateStr: string;
  title: string;
  description: string;
  people?: string;
  meaning?: string;
  side: Side;
  era: Era;
  isMajor?: boolean;
}

export type HistoricalEventDraft = Omit<HistoricalEvent, 'id'>;

export type SideIconSlot =
  | 'sideCCP'
  | 'sideKMT'
  | 'sideJOINT'
  | 'sideJAPAN'
  | 'sideOTHER';

export type UiIconSlot =
  | 'actionAdd'
  | 'actionExport'
  | 'actionEdit'
  | 'actionDelete'
  | 'actionSettings'
  | 'markerMajor'
  | 'hintScroll';

export type IconSlot = SideIconSlot | UiIconSlot;
export type IconMode = 'default' | 'text' | 'image';

export interface IconReplacement {
  mode: IconMode;
  value: string;
}

export type IconConfig = Record<IconSlot, IconReplacement>;

export type TimelineLayoutMode = 'horizontal' | 'vertical';
