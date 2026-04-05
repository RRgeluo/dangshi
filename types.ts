export enum Era {
  ANTI_JAPAN = 'Anti-Japanese War',
  LIBERATION = 'Liberation War',
  KOREAN = 'Korean War'
}

export enum Side {
  CCP = 'CCP',
  KMT = 'KMT',
  JOINT = 'JOINT', // United Front
  JAPAN = 'JAPAN', // For context
  OTHER = 'OTHER'
}

export interface HistoricalEvent {
  id: string;
  year: string;
  dateStr: string;
  title: string;
  description: string;
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
