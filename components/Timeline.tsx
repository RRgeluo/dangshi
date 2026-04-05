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
}

export const Timeline: React.FC<TimelineProps> = ({
  events,
  onDelete,
  onUpdate,
  iconConfig,
  layoutMode,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isVertical = layoutMode === 'vertical';

  const handleWheel = (event: React.WheelEvent) => {
    if (!scrollContainerRef.current || isVertical) {
      return;
    }

    scrollContainerRef.current.scrollLeft += event.deltaY;
  };

  if (isVertical) {
    return (
      <div className="relative w-full h-full min-h-0 overflow-hidden flex flex-col py-4 md:py-8">
        <div
          ref={scrollContainerRef}
          className="touch-scroll relative flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-4 md:px-8 pb-24 pt-2 hide-scrollbar z-10"
        >
          <div className="relative max-w-5xl mx-auto">
            <div className="absolute left-4 md:left-7 top-0 bottom-0 w-[2px] bg-history-gold/25"></div>
            <div className="absolute left-4 md:left-7 top-0 bottom-0 w-5 -translate-x-[9px] bg-history-gold/5 blur-xl"></div>

            <div className="space-y-5 md:space-y-6">
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

        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 text-history-gold/25 text-[10px] tracking-[0.3em] uppercase animate-pulse pointer-events-none font-serif whitespace-nowrap">
          <AppIcon
            slot="hintScroll"
            iconConfig={iconConfig}
            label="滚动提示"
            className="w-4 h-4 text-sm"
          />
          <span>向下滚动以阅览长卷</span>
          <AppIcon
            slot="hintScroll"
            iconConfig={iconConfig}
            label="滚动提示"
            className="w-4 h-4 text-sm"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-0 overflow-hidden flex flex-col justify-center py-6 md:py-10">
      <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-history-gold/20 z-0"></div>
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-history-gold to-transparent z-0 opacity-40 blur-[1px]"></div>
      <div className="absolute top-1/2 left-0 right-0 h-4 -translate-y-1/2 bg-history-gold/5 blur-xl z-0"></div>

      <div
        ref={scrollContainerRef}
        onWheel={handleWheel}
        className="flex overflow-x-auto overflow-y-hidden px-4 md:px-[8vw] pb-16 md:pb-12 pt-12 items-center hide-scrollbar scroll-smooth h-full relative z-10"
        style={{ scrollBehavior: 'smooth' }}
      >
        <div className="w-4 md:w-[6vw] flex-shrink-0"></div>

        {events.map((event, index) => {
          const position = index % 2 === 0 ? 'top' : 'bottom';
          return (
            <EventCard
              key={event.id}
              event={event}
              position={position}
              onDelete={onDelete}
              onUpdate={onUpdate}
              iconConfig={iconConfig}
              layoutMode={layoutMode}
            />
          );
        })}

        <div className="w-6 md:w-[10vw] flex-shrink-0"></div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 text-history-gold/20 text-[10px] tracking-[0.3em] uppercase animate-pulse pointer-events-none font-serif whitespace-nowrap">
        <AppIcon
          slot="hintScroll"
          iconConfig={iconConfig}
          label="滚动提示"
          className="w-4 h-4 text-sm"
        />
        <span>滚动鼠标或侧向滑动以阅览长卷</span>
        <AppIcon
          slot="hintScroll"
          iconConfig={iconConfig}
          label="滚动提示"
          className="w-4 h-4 text-sm"
        />
      </div>
    </div>
  );
};
