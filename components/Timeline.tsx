import React, { useRef } from 'react';
import { HistoricalEvent, IconConfig, TimelineLayoutMode } from '../types';
import { AppIcon } from './AppIcon';
import { EventCard } from './EventCard';

interface TimelineProps {
  events: HistoricalEvent[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<HistoricalEvent>) => void;
  iconConfig: IconConfig;
  layoutMode: TimelineLayoutMode;
  registerScrollContainer?: (el: HTMLDivElement | null) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  events,
  onDelete,
  onUpdate,
  iconConfig,
  layoutMode,
  registerScrollContainer,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isVertical = layoutMode === 'vertical';

  const setScrollContainer = (el: HTMLDivElement | null) => {
    scrollContainerRef.current = el;
    registerScrollContainer?.(el);
  };

  const handleWheel = (event: React.WheelEvent) => {
    if (!scrollContainerRef.current || isVertical) {
      return;
    }

    scrollContainerRef.current.scrollLeft += event.deltaY;
  };

  if (isVertical) {
    return (
      <div className="relative w-full h-full min-h-0 overflow-hidden flex flex-col pt-6 md:pt-10 pb-6">
        <div
          ref={setScrollContainer}
          className="touch-scroll relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 md:px-8 pb-28 hide-scrollbar z-10"
        >
          <div className="relative max-w-6xl mx-auto">
            <div className="absolute left-[14px] md:left-[26px] top-0 bottom-0 w-[2px] bg-gradient-to-b from-amber-700/10 via-amber-500/40 to-transparent" />
            <div className="absolute left-0 top-0 right-0 h-48 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.12),transparent_70%)] pointer-events-none" />

            <div className="space-y-4 md:space-y-8">
              {events.map((event, index) => (
                <EventCard
                  key={event.id}
                  event={event}
                  position={index % 2 === 0 ? 'top' : 'bottom'}
                  onDelete={onDelete}
                  onUpdate={onUpdate}
                  iconConfig={iconConfig}
                  layoutMode={layoutMode}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 text-amber-200/25 text-[10px] tracking-[0.3em] uppercase animate-pulse pointer-events-none font-serif whitespace-nowrap">
          <AppIcon slot="hintScroll" iconConfig={iconConfig} label="滚动提示" className="w-4 h-4 text-sm" />
          <span>向下滚动阅读近代革命长卷</span>
          <AppIcon slot="hintScroll" iconConfig={iconConfig} label="滚动提示" className="w-4 h-4 text-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-0 overflow-hidden flex flex-col justify-center pt-8 md:pt-10 pb-10">
      <div className="absolute top-1/2 left-0 right-0 h-[6px] -translate-y-1/2 bg-gradient-to-r from-transparent via-amber-600/80 to-transparent z-0 shadow-[0_0_40px_rgba(212,175,55,0.25)]" />
      <div className="absolute top-1/2 left-0 right-0 h-10 -translate-y-1/2 bg-amber-500/5 blur-2xl z-0" />
      <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.06),transparent_70%)] pointer-events-none z-0" />

      <div
        ref={setScrollContainer}
        onWheel={handleWheel}
        className="timeline-scroll flex overflow-x-auto overflow-y-hidden px-8 sm:px-14 md:px-[20rem] pb-12 pt-8 items-center gap-14 md:gap-16 hide-scrollbar scroll-smooth h-full relative z-10"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="w-16 md:w-56 flex-shrink-0" />

        {events.map((event, index) => (
          <EventCard
            key={event.id}
            event={event}
            position={index % 2 === 0 ? 'top' : 'bottom'}
            onDelete={onDelete}
            onUpdate={onUpdate}
            iconConfig={iconConfig}
            layoutMode={layoutMode}
          />
        ))}

        <div className="w-16 md:w-56 flex-shrink-0" />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-amber-100/20 text-[10px] tracking-[0.35em] uppercase animate-pulse pointer-events-none font-serif whitespace-nowrap">
        <AppIcon slot="hintScroll" iconConfig={iconConfig} label="滚动提示" className="w-4 h-4 text-sm" />
        <span>滚动鼠标或横向滑动阅读近代革命长卷</span>
        <AppIcon slot="hintScroll" iconConfig={iconConfig} label="滚动提示" className="w-4 h-4 text-sm" />
      </div>
    </div>
  );
};
