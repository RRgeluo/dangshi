import { EVENTS } from './data';
import { createDefaultIconConfig } from './iconConfig';
import {
  Era,
  HistoricalEvent,
  HistoricalEventDraft,
  IconConfig,
  IconReplacement,
  IconSlot,
  Side,
  TimelineLayoutMode,
} from './types';
import { sortEventsByDate } from './utils';

const EVENTS_STORAGE_KEY = 'history-roadbook.events.v1';
const ICONS_STORAGE_KEY = 'history-roadbook.icons.v1';
const LAYOUT_STORAGE_KEY = 'history-roadbook.layout.v1';

export const DEFAULT_EVENT_DRAFT: HistoricalEventDraft = {
  title: '',
  dateStr: '',
  year: '',
  description: '',
  people: '',
  meaning: '',
  side: Side.CCP,
  era: Era.NATIONAL_REVOLUTION,
  isMajor: false,
};

const canUseStorage = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
};

const isEra = (value: unknown): value is Era => {
  return Object.values(Era).includes(value as Era);
};

const migrateLegacyEra = (value: unknown, eventId?: string): Era | null => {
  if (isEra(value)) {
    if (eventId === '1919-may-fourth' && value === Era.OLD_DEMOCRATIC) {
      return Era.NATIONAL_REVOLUTION;
    }

    if (eventId === '1921-cpc-founded' && value === Era.LAND_REVOLUTION) {
      return Era.NATIONAL_REVOLUTION;
    }

    if (eventId === '1924-kmt-first-congress' && value === Era.LAND_REVOLUTION) {
      return Era.NATIONAL_REVOLUTION;
    }

    return value;
  }

  switch (value) {
    case 'Anti-Japanese War':
      return Era.ANTI_JAPAN;
    case 'Liberation War':
      return Era.LIBERATION;
    case 'Korean War':
      return Era.KOREAN;
    case 'National Revolution':
      return Era.NATIONAL_REVOLUTION;
    default:
      return null;
  }
};

const isSide = (value: unknown): value is Side => {
  return Object.values(Side).includes(value as Side);
};

const sanitizeEvent = (value: unknown, index: number): HistoricalEvent | null => {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<HistoricalEvent>;
  const era = migrateLegacyEra(candidate.era, candidate.id);
  if (!era || !isSide(candidate.side)) {
    return null;
  }

  const title = typeof candidate.title === 'string' ? candidate.title.trim() : '';
  const dateStr = typeof candidate.dateStr === 'string' ? candidate.dateStr.trim() : '';
  const year = typeof candidate.year === 'string' ? candidate.year.trim() : '';
  const description = typeof candidate.description === 'string' ? candidate.description.trim() : '';
  const people = typeof candidate.people === 'string' ? candidate.people.trim() : '';
  const meaning = typeof candidate.meaning === 'string' ? candidate.meaning.trim() : '';

  if (!title || !dateStr || !year || !description) {
    return null;
  }

  return {
    id: typeof candidate.id === 'string' && candidate.id.trim() ? candidate.id : `event-${index}`,
    title,
    dateStr,
    year,
    description,
    people,
    meaning,
    side: candidate.side,
    era,
    isMajor: Boolean(candidate.isMajor),
  };
};

const sanitizeIconReplacement = (value: unknown): IconReplacement => {
  if (!value || typeof value !== 'object') {
    return { mode: 'default', value: '' };
  }

  const candidate = value as Partial<IconReplacement>;
  const mode = candidate.mode === 'text' || candidate.mode === 'image' ? candidate.mode : 'default';
  const iconValue = typeof candidate.value === 'string' ? candidate.value : '';

  if (mode !== 'default' && !iconValue) {
    return { mode: 'default', value: '' };
  }

  return {
    mode,
    value: mode === 'default' ? '' : iconValue,
  };
};

export const loadStoredEvents = (): HistoricalEvent[] => {
  const defaultEvents = sortEventsByDate(EVENTS);
  if (!canUseStorage()) {
    return defaultEvents;
  }

  try {
    const raw = window.localStorage.getItem(EVENTS_STORAGE_KEY);
    if (!raw) {
      return defaultEvents;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return defaultEvents;
    }

    const storedEvents = parsed
      .map((event, index) => sanitizeEvent(event, index))
      .filter((event): event is HistoricalEvent => Boolean(event));
    // 本地有存档时，严格按存档恢复（包含对默认事件的编辑与删除）。
    return sortEventsByDate(storedEvents);
  } catch {
    return defaultEvents;
  }
};

export const saveStoredEvents = (events: HistoricalEvent[]) => {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(EVENTS_STORAGE_KEY, JSON.stringify(events));
  } catch {
  }
};

export const loadStoredIconConfig = (): IconConfig => {
  const defaultConfig = createDefaultIconConfig();
  if (!canUseStorage()) {
    return defaultConfig;
  }

  try {
    const raw = window.localStorage.getItem(ICONS_STORAGE_KEY);
    if (!raw) {
      return defaultConfig;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return defaultConfig;
    }

    const nextConfig = createDefaultIconConfig();
    (Object.keys(nextConfig) as IconSlot[]).forEach((slot) => {
      nextConfig[slot] = sanitizeIconReplacement((parsed as Partial<Record<IconSlot, IconReplacement>>)[slot]);
    });

    return nextConfig;
  } catch {
    return defaultConfig;
  }
};

export const saveStoredIconConfig = (iconConfig: IconConfig) => {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(ICONS_STORAGE_KEY, JSON.stringify(iconConfig));
  } catch {
  }
};

const getDefaultLayoutMode = (): TimelineLayoutMode => {
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(max-width: 767px)').matches ? 'vertical' : 'horizontal';
  }

  return 'horizontal';
};

export const loadStoredLayoutMode = (): TimelineLayoutMode => {
  const defaultLayoutMode = getDefaultLayoutMode();
  if (!canUseStorage()) {
    return defaultLayoutMode;
  }

  try {
    const raw = window.localStorage.getItem(LAYOUT_STORAGE_KEY);
    return raw === 'horizontal' || raw === 'vertical' ? raw : defaultLayoutMode;
  } catch {
    return defaultLayoutMode;
  }
};

export const saveStoredLayoutMode = (layoutMode: TimelineLayoutMode) => {
  if (!canUseStorage()) {
    return;
  }

  try {
    window.localStorage.setItem(LAYOUT_STORAGE_KEY, layoutMode);
  } catch {
  }
};
