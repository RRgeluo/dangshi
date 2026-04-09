import React, { useState } from 'react';
import {
  HistoricalEvent,
  HistoricalEventDraft,
  IconConfig,
  Side,
  TimelineLayoutMode,
} from '../types';
import { AppIcon } from './AppIcon';
import { EventModal } from './EventModal';
import { FlagIcon } from './FlagIcon';

interface EventCardProps {
  event: HistoricalEvent;
  position: 'top' | 'bottom';
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<HistoricalEvent>) => void;
  iconConfig: IconConfig;
  layoutMode: TimelineLayoutMode;
}

const getYearWatermark = (event: HistoricalEvent) => {
  const match = event.year.match(/\d{4}/) ?? event.dateStr.match(/\d{4}/);
  return match ? match[0] : event.year;
};

const getCardGlow = (side: Side, isMajor: boolean) => {
  const baseGlow = isMajor
    ? 'shadow-[0_0_28px_rgba(245,158,11,0.18),0_40px_90px_rgba(0,0,0,1)]'
    : 'shadow-[0_40px_90px_rgba(0,0,0,1)]';

  switch (side) {
    case Side.CCP:
      return `${baseGlow} before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top,rgba(255,120,60,0.07),transparent_42%)] before:pointer-events-none`;
    case Side.KMT:
      return `${baseGlow} before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top,rgba(88,145,255,0.08),transparent_42%)] before:pointer-events-none`;
    case Side.JAPAN:
      return `${baseGlow} before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_42%)] before:pointer-events-none`;
    case Side.JOINT:
      return `${baseGlow} before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.08),transparent_42%)] before:pointer-events-none`;
    default:
      return baseGlow;
  }
};

const PersonGlyph = () => (
  <svg
    viewBox="0 0 24 24"
    className="w-3 h-3 md:w-[14px] md:h-[14px]"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M20 21a8 8 0 0 0-16 0" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export const EventCard: React.FC<EventCardProps> = ({
  event,
  position,
  onDelete,
  onUpdate,
  iconConfig,
  layoutMode,
}) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const isVertical = layoutMode === 'vertical';
  const showFlag = event.side !== Side.OTHER;
  const yearWatermark = getYearWatermark(event);
  const hasMeaning = Boolean(event.meaning?.trim());
  const hasPeople = Boolean(event.people?.trim());

  const handleDeleteClick = (mouseEvent: React.MouseEvent) => {
    mouseEvent.preventDefault();
    mouseEvent.stopPropagation();

    if (window.confirm('确定要删除这条史实吗？删除后会立即保存到本地。')) {
      onDelete(event.id);
    }
  };

  const handleEditClick = (mouseEvent: React.MouseEvent) => {
    mouseEvent.preventDefault();
    mouseEvent.stopPropagation();
    setIsEditOpen(true);
  };

  const handleSaveEvent = (nextEvent: HistoricalEventDraft) => {
    onUpdate(event.id, nextEvent);
    setIsEditOpen(false);
  };

  // 主卡片容器：压缩字号、加宽卡片，配合更大旗帜区域
  // 主卡片容器：压缩字号、加宽卡片，兼顾桌面和移动阅读
  const cardContent = (
    <div
      data-event-id={event.id}
      className={`group relative overflow-hidden bg-gradient-to-br from-[#3d1a1a] via-[#1a0505] to-[#0d0202] border-2 border-amber-900/40 p-6 md:p-12 rounded-[2rem] md:rounded-[3.4rem] transition-all duration-700 hover:-translate-y-4 ${getCardGlow(
        event.side,
        Boolean(event.isMajor),
      )}`}
    >
      <div className="absolute top-0 right-0 w-40 h-40 md:w-64 md:h-64 bg-amber-500/[0.03] blur-[80px] md:blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 md:-bottom-24 md:-left-24 w-40 h-40 md:w-64 md:h-64 bg-amber-500/[0.03] blur-[80px] md:blur-[100px] pointer-events-none" />

      <div className="relative z-10">
        {event.isMajor && (
          <div className="absolute right-0 top-0 w-5 h-5 rounded-full bg-amber-400 text-[#1a0505] flex items-center justify-center z-20">
            <AppIcon slot="markerMajor" iconConfig={iconConfig} label="重点史实" className="w-3 h-3 text-[0.75rem]" />
          </div>
        )}

        <div className="flex justify-between items-end gap-4 md:gap-6 mb-5 md:mb-7">
          <span className="text-amber-500 font-black text-[0.88rem] md:text-lg tracking-[0.2em] md:tracking-[0.26em] border-b-2 border-amber-600/40 pb-2 leading-none">
            {event.dateStr}
          </span>

          <div className="relative shrink-0">
            {showFlag && (
              <div className="w-16 h-12 md:w-20 md:h-[60px] rounded-none bg-amber-950/60 flex items-center justify-center shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] overflow-hidden">
                <FlagIcon
                  side={event.side}
                  iconConfig={iconConfig}
                  variant={event.side === Side.CCP ? 'event' : 'flag'}
                  className="w-full h-full border-0 shadow-none"
                />
              </div>
            )}

          </div>
        </div>

        <h3 className="text-[0.95rem] md:text-[2rem] font-black text-amber-100 mb-4 md:mb-6 tracking-tight leading-[1.06] drop-shadow-xl font-serif">
          {event.title}
        </h3>

        {hasPeople && (
          <div className="mb-5 md:mb-7 flex flex-wrap gap-3 md:gap-3.5">
            <span className="inline-flex items-center gap-2 md:gap-2.5 bg-amber-950/80 text-amber-400 text-[10px] md:text-xs px-4 md:px-6 py-1.5 md:py-2 rounded-full border border-amber-500/40 font-black tracking-[0.12em] md:tracking-[0.16em] shadow-2xl">
              <PersonGlyph />
              <span className="tracking-normal">{event.people}</span>
            </span>
          </div>
        )}

        <div className="mb-5 md:mb-6 bg-white/[0.02] p-5 md:p-6 rounded-[1.8rem] md:rounded-3xl border border-white/5 shadow-inner">
          <p className="text-amber-50/82 leading-[1.8] text-[0.92rem] md:text-[1rem] font-serif">
            {event.description}
          </p>
        </div>

        {hasMeaning && (
          <div className="relative">
            <span className="absolute -top-2 -left-1 text-[2.8rem] md:text-[4.2rem] leading-none text-amber-800/25 pointer-events-none">
              “
            </span>
            <p className="text-amber-400/72 leading-[1.75] text-[0.88rem] md:text-[0.98rem] italic font-light font-serif border-l-4 border-amber-900/80 pl-6 md:pl-7 py-2 relative z-10">
              {event.meaning}
            </p>
          </div>
        )}

        <div className="mt-6 md:mt-8 pt-5 md:pt-6 border-t border-white/5 flex justify-end gap-3 md:gap-5 opacity-100 md:opacity-0 transform md:translate-y-4 md:group-hover:translate-y-0 md:group-hover:opacity-100 transition-all duration-500">
          <button
            type="button"
            onClick={handleEditClick}
            className="text-amber-500/40 hover:text-amber-400 transition-colors"
            title="编辑史实"
            aria-label="编辑史实"
          >
            <AppIcon slot="actionEdit" iconConfig={iconConfig} label="编辑史实" className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <button
            type="button"
            onClick={handleDeleteClick}
            className="text-red-900/45 hover:text-red-500 transition-colors"
            title="删除史实"
            aria-label="删除史实"
          >
            <AppIcon slot="actionDelete" iconConfig={iconConfig} label="删除史实" className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {isVertical ? (
        <div className="relative w-full pl-12 md:pl-20">
          <div className="absolute left-[14px] md:left-[26px] top-16 bottom-0 w-[2px] bg-gradient-to-b from-amber-600/60 to-transparent" />
          <div className="absolute left-[8px] md:left-[20px] top-12 w-4 h-4 rounded-full border border-amber-200/60 bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.35)] z-10" />

          <div className="relative w-full max-w-[1400px] pb-12 md:pb-16">
            <div className="absolute right-2 top-4 md:-right-16 md:top-10 text-[4.5rem] md:text-[10rem] font-black text-amber-500/[0.05] pointer-events-none select-none z-0 leading-none">
              {yearWatermark}
            </div>
            {cardContent}
          </div>
        </div>
      ) : (
        <div
          // 横向长卷单卡 史实卡片：宽度缩小到原设定的一半
          className={`flex flex-col items-center w-[96vw] max-w-[300px] md:w-[600px] min-w-[380px] flex-shrink-0 relative ${
            position === 'top' ? 'flex-col-reverse' : ''
          }`}
        >
          <div className={`w-full ${position === 'top' ? 'mb-12 md:mb-20' : 'mt-12 md:mt-20'}`}>{cardContent}</div>

          <div
            className={`w-[4px] h-18 md:h-28 bg-gradient-to-b ${
              position === 'top' ? 'from-amber-600/60 to-transparent' : 'from-transparent to-amber-600/60'
            } absolute left-1/2 -translate-x-1/2 ${position === 'top' ? 'bottom-0' : 'top-0'}`}
          />

          <div
            className={`absolute left-1/2 -translate-x-1/2 font-black text-amber-500/[0.05] text-[6.5rem] md:text-[16rem] pointer-events-none select-none z-0 whitespace-nowrap ${
              position === 'top' ? 'top-full mt-3 md:mt-6' : 'bottom-full mb-3 md:mb-6'
            }`}
          >
            {yearWatermark}
          </div>
        </div>
      )}

      <EventModal
        isOpen={isEditOpen}
        mode="edit"
        initialEvent={{
          title: event.title,
          dateStr: event.dateStr,
          year: event.year,
          description: event.description,
          people: event.people ?? '',
          meaning: event.meaning ?? '',
          side: event.side,
          era: event.era,
          isMajor: Boolean(event.isMajor),
        }}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleSaveEvent}
      />
    </>
  );
};
