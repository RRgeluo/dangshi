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

export const EventCard: React.FC<EventCardProps> = ({
  event,
  position,
  onDelete,
  onUpdate,
  iconConfig,
  layoutMode,
}) => {
  const isCCP = event.side === Side.CCP;
  const isKMT = event.side === Side.KMT;
  const isMajor = Boolean(event.isMajor);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const isVertical = layoutMode === 'vertical';

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

  const cardBorderColor = isCCP
    ? 'border-red-600'
    : isKMT
      ? 'border-blue-600'
      : event.side === Side.JAPAN
        ? 'border-gray-500'
        : 'border-yellow-600';

  const titleColor = isCCP
    ? 'text-red-700'
    : isKMT
      ? 'text-blue-800'
      : 'text-gray-800';

  const bgGradient = isMajor ? 'bg-gradient-to-br from-white to-orange-50' : 'bg-white';
  const cardHeightClass = isVertical ? 'min-h-[188px] md:min-h-[200px]' : 'h-[220px]';

  return (
    <>
      <div
        className={
          isVertical
            ? 'relative w-full pl-10 md:pl-14'
            : `relative flex flex-col group w-[17rem] md:w-[18rem] h-[500px] flex-shrink-0 mx-2 md:mx-3 ${position === 'top' ? 'justify-start' : 'justify-end'}`
        }
      >
        {isVertical && (
          <div
            className={`
              absolute left-[10px] md:left-[18px] top-10 w-3 h-3 rounded-full border-2 z-10
              ${isCCP ? 'bg-red-600 border-yellow-400' : isKMT ? 'bg-blue-600 border-white' : 'bg-gray-600 border-gray-300'}
            `}
          />
        )}

        <div
          className={`
            relative w-full p-4 md:p-5 rounded-sm shadow-lg border-l-4 transition-all duration-300 hover:scale-[1.02] z-10
            ${bgGradient} ${cardBorderColor} ${cardHeightClass}
            ${isVertical ? 'max-w-3xl' : ''}
          `}
        >
          <div
            className="absolute top-2 right-2 flex gap-2 opacity-100 md:opacity-40 md:group-hover:opacity-100 transition-opacity duration-200 z-50"
            onClick={(mouseEvent) => mouseEvent.stopPropagation()}
          >
            <button
              type="button"
              onClick={handleEditClick}
              className="p-1.5 bg-white hover:bg-blue-50 text-blue-600 rounded shadow-md border border-blue-200 cursor-pointer hover:scale-110 transition-transform"
              title="编辑史实"
              aria-label="编辑史实"
            >
              <AppIcon
                slot="actionEdit"
                iconConfig={iconConfig}
                label="编辑史实"
                className="w-3.5 h-3.5"
              />
            </button>
            <button
              type="button"
              onClick={handleDeleteClick}
              className="p-1.5 bg-white hover:bg-red-50 text-red-600 rounded shadow-md border border-red-200 cursor-pointer hover:scale-110 transition-transform"
              title="删除史实"
              aria-label="删除史实"
            >
              <AppIcon
                slot="actionDelete"
                iconConfig={iconConfig}
                label="删除史实"
                className="w-3.5 h-3.5"
              />
            </button>
          </div>

          <div className={`absolute -top-3 -right-3 ${isVertical ? 'w-11 h-8' : 'w-10 h-8'} rounded shadow-sm overflow-hidden z-20 pointer-events-none`}>
            <FlagIcon side={event.side} iconConfig={iconConfig} className="w-full h-full" />
          </div>

          <div className="font-mono text-sm font-bold text-gray-500 mb-1 border-b border-gray-200 pb-1 pr-12">
            {event.dateStr}
          </div>

          <h3 className={`font-serif text-lg font-bold leading-tight mb-2 min-h-[52px] ${titleColor}`}>
            {event.title}
          </h3>

          <div className={isVertical ? 'max-h-24 md:max-h-28 overflow-y-auto pr-1' : 'h-[92px] overflow-y-auto pr-1'}>
            <p className="text-xs md:text-[13px] text-gray-700 leading-relaxed font-serif text-justify opacity-90">
              {event.description}
            </p>
          </div>

          {isMajor && (
            <div
              className={`absolute ${isVertical ? '-top-3 left-4' : '-bottom-3 -left-3'} text-history-gold drop-shadow-md pointer-events-none`}
              title="重点史实"
            >
              <AppIcon
                slot="markerMajor"
                iconConfig={iconConfig}
                label="重点史实标记"
                className="w-7 h-7 text-2xl"
              />
            </div>
          )}
        </div>

        {!isVertical && (
          <>
            <div
              className={`absolute left-1/2 -translate-x-1/2 w-0.5 bg-gray-400 group-hover:bg-history-gold transition-colors duration-300
              ${position === 'top' ? 'top-[220px] h-[30px]' : 'bottom-[220px] h-[30px]'}
              `}
            />

            <div
              className={`
                  absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 z-0
                  ${isCCP ? 'bg-red-600 border-yellow-400' : isKMT ? 'bg-blue-600 border-white' : 'bg-gray-600 border-gray-300'}
              `}
            />
          </>
        )}
      </div>

      <EventModal
        isOpen={isEditOpen}
        mode="edit"
        initialEvent={{
          title: event.title,
          dateStr: event.dateStr,
          year: event.year,
          description: event.description,
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
