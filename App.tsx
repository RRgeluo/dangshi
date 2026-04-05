import React, { useEffect, useMemo, useState } from 'react';
import {
  loadStoredEvents,
  loadStoredIconConfig,
  loadStoredLayoutMode,
  saveStoredEvents,
  saveStoredIconConfig,
  saveStoredLayoutMode,
} from './appState';
import { Timeline } from './components/Timeline';
import {
  Era,
  HistoricalEvent,
  HistoricalEventDraft,
  Side,
  TimelineLayoutMode,
} from './types';
import { FlagIcon } from './components/FlagIcon';
import { EventModal } from './components/EventModal';
import { IconSettingsModal } from './components/IconSettingsModal';
import { AppIcon } from './components/AppIcon';
import { generateTimelineSVG, sortEventsByDate } from './utils';

interface DeletedEventSnapshot {
  event: HistoricalEvent;
  index: number;
}

const isEditableTarget = (target: EventTarget | null) => {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  const tagName = target.tagName.toLowerCase();
  return target.isContentEditable || tagName === 'input' || tagName === 'textarea' || tagName === 'select';
};

const App: React.FC = () => {
  const [events, setEvents] = useState<HistoricalEvent[]>(() => loadStoredEvents());
  const [iconConfig, setIconConfig] = useState(() => loadStoredIconConfig());
  const [selectedEra, setSelectedEra] = useState<Era | 'ALL'>('ALL');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isIconSettingsOpen, setIsIconSettingsOpen] = useState(false);
  const [deletedHistory, setDeletedHistory] = useState<DeletedEventSnapshot[]>([]);
  const [layoutMode, setLayoutMode] = useState<TimelineLayoutMode>(() => loadStoredLayoutMode());

  useEffect(() => {
    saveStoredEvents(events);
  }, [events]);

  useEffect(() => {
    saveStoredIconConfig(iconConfig);
  }, [iconConfig]);

  useEffect(() => {
    saveStoredLayoutMode(layoutMode);
  }, [layoutMode]);

  const filteredEvents = useMemo(() => {
    const nextEvents = selectedEra === 'ALL'
      ? events
      : events.filter((event) => event.era === selectedEra);

    return sortEventsByDate(nextEvents);
  }, [events, selectedEra]);

  const handleAddEvent = (eventData: HistoricalEventDraft) => {
    const newEvent: HistoricalEvent = {
      ...eventData,
      id: Date.now().toString(),
    };

    setEvents((currentEvents) => sortEventsByDate([...currentEvents, newEvent]));
    setIsEventModalOpen(false);
  };

  const handleDeleteEvent = (id: string) => {
    const deletedIndex = events.findIndex((event) => event.id === id);
    const deletedEvent = deletedIndex >= 0 ? events[deletedIndex] : null;

    if (!deletedEvent) {
      return;
    }

    setDeletedHistory((currentHistory) => [
      ...currentHistory,
      {
        event: deletedEvent,
        index: deletedIndex,
      },
    ]);
    setEvents((currentEvents) => currentEvents.filter((event) => event.id !== id));
  };

  const handleUpdateEvent = (id: string, updates: Partial<HistoricalEvent>) => {
    setEvents((currentEvents) =>
      sortEventsByDate(
        currentEvents.map((event) => (event.id === id ? { ...event, ...updates } : event)),
      ),
    );
  };

  const handleUndoDelete = () => {
    const snapshot = deletedHistory[deletedHistory.length - 1];
    if (!snapshot) {
      return false;
    }

    setDeletedHistory((currentHistory) => currentHistory.slice(0, -1));
    setEvents((currentEvents) => {
      if (currentEvents.some((event) => event.id === snapshot.event.id)) {
        return currentEvents;
      }

      const nextEvents = [...currentEvents];
      const insertIndex = Math.min(Math.max(snapshot.index, 0), nextEvents.length);
      nextEvents.splice(insertIndex, 0, snapshot.event);
      return sortEventsByDate(nextEvents);
    });

    return true;
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isUndoShortcut = (event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey && event.key.toLowerCase() === 'z';
      if (!isUndoShortcut || isEditableTarget(event.target)) {
        return;
      }

      if (handleUndoDelete()) {
        event.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deletedHistory]);

  const handleExport = () => {
    const svgString = generateTimelineSVG(filteredEvents, iconConfig);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `red_history_timeline_${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen min-h-0 flex flex-col bg-history-dark font-sans text-history-paper overflow-hidden selection:bg-red-900 selection:text-white">
      <div className="fixed inset-0 pointer-events-none opacity-20 texture-overlay z-0"></div>
      <div className="fixed inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/60 z-0 pointer-events-none"></div>

      <header className="relative z-10 w-full shrink-0 bg-gradient-to-b from-black/90 to-transparent pt-5 md:pt-6 pb-4 px-4 md:px-6 shadow-2xl border-b border-history-gold/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-history-gold via-yellow-400 to-history-gold drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] tracking-wide">
              中国革命战争史诗
            </h1>
            <p className="text-red-400/90 text-[11px] md:text-sm mt-2 tracking-[0.3em] md:tracking-widest uppercase font-serif font-bold italic">
              THE EPIC SAGA OF CHINESE REVOLUTIONARY WARS (1931-1953)
            </p>
            <p className="text-history-gold/60 text-xs mt-3 font-serif">
              本地自动保存已开启，录入、编辑、删除和图标替换都会在重启后保留。
            </p>
            <p className="text-history-gold/45 text-[11px] mt-1 font-serif">
              删除史实后可按 Ctrl+Z 撤销恢复，手机默认使用纵向长卷。
            </p>
          </div>

          <div className="flex flex-col items-stretch md:items-end gap-3 w-full md:w-auto">
            <div className="flex flex-wrap gap-4 justify-end">
              <div className="flex items-center gap-2">
                <div className="w-8 h-5 overflow-hidden rounded border border-history-gold/30 bg-black/20 flex items-center justify-center">
                  <FlagIcon side={Side.CCP} iconConfig={iconConfig} className="w-full h-full" />
                </div>
                <span className="text-xs text-history-gold/60 font-serif">共产党</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-5 overflow-hidden rounded border border-white/20 bg-black/20 flex items-center justify-center">
                  <FlagIcon side={Side.KMT} iconConfig={iconConfig} className="w-full h-full" />
                </div>
                <span className="text-xs text-gray-400 font-serif">国民党</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={() => setLayoutMode('horizontal')}
                className={`px-3 py-1.5 rounded text-xs tracking-wider transition-all duration-300 shadow-lg border ${
                  layoutMode === 'horizontal'
                    ? 'bg-history-gold text-history-dark border-history-gold'
                    : 'bg-black/40 text-history-paper border-white/20 hover:bg-white/5'
                }`}
              >
                横向鱼骨
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('vertical')}
                className={`px-3 py-1.5 rounded text-xs tracking-wider transition-all duration-300 shadow-lg border ${
                  layoutMode === 'vertical'
                    ? 'bg-history-gold text-history-dark border-history-gold'
                    : 'bg-black/40 text-history-paper border-white/20 hover:bg-white/5'
                }`}
              >
                纵向长卷
              </button>
            </div>

            <div className="flex flex-wrap gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsEventModalOpen(true)}
                className="px-3 py-1 bg-red-950/40 hover:bg-red-900/60 text-history-gold border border-history-gold/30 rounded text-xs tracking-wider transition-all duration-300 shadow-lg inline-flex items-center gap-1.5"
              >
                <AppIcon
                  slot="actionAdd"
                  iconConfig={iconConfig}
                  label="录入史实"
                  className="w-3.5 h-3.5 text-base"
                />
                <span>录入史实</span>
              </button>

              <button
                type="button"
                onClick={() => setIsIconSettingsOpen(true)}
                className="px-3 py-1 bg-black/40 hover:bg-white/5 text-history-paper border border-white/20 rounded text-xs tracking-wider transition-all duration-300 shadow-lg inline-flex items-center gap-1.5"
              >
                <AppIcon
                  slot="actionSettings"
                  iconConfig={iconConfig}
                  label="图标设置"
                  className="w-3.5 h-3.5"
                />
                <span>图标设置</span>
              </button>

              <button
                type="button"
                onClick={handleExport}
                className="px-3 py-1 bg-black/40 hover:bg-white/5 text-white border border-white/20 rounded text-xs tracking-wider transition-all duration-300 shadow-lg inline-flex items-center gap-1.5"
              >
                <AppIcon
                  slot="actionExport"
                  iconConfig={iconConfig}
                  label="导出卷轴"
                  className="w-3.5 h-3.5"
                />
                <span>导出卷轴</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={() => setSelectedEra('ALL')}
            className={`px-6 py-2 rounded-sm font-serif transition-all duration-500 uppercase tracking-widest text-sm
              ${selectedEra === 'ALL'
                ? 'bg-red-800 text-history-gold border border-history-gold shadow-[0_0_20px_rgba(255,215,0,0.3)] scale-105'
                : 'bg-black/60 text-gray-400 hover:bg-red-900/20 border border-white/5'
              }`}
          >
            全景历程
          </button>

          {Object.values(Era).map((era) => (
            <button
              key={era}
              type="button"
              onClick={() => setSelectedEra(era)}
              className={`px-6 py-2 rounded-sm font-serif transition-all duration-500 uppercase tracking-widest text-sm relative overflow-hidden group
              ${selectedEra === era
                ? 'bg-red-800 text-white border border-red-400 shadow-[0_0_20px_rgba(255,0,0,0.3)] scale-105'
                : 'bg-black/60 text-gray-400 hover:bg-red-900/20 border border-white/5'
              }`}
            >
              <span className="relative z-10">{era}</span>
              {selectedEra === era && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-history-gold/10 to-transparent animate-shimmer" />
              )}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 min-h-0 relative w-full overflow-hidden epic-gradient">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-red-700 rounded-full blur-[150px]"></div>
          <div className="absolute bottom-[20%] right-[10%] w-[600px] h-[600px] bg-black rounded-full blur-[180px]"></div>
        </div>

        <Timeline
          events={filteredEvents}
          onDelete={handleDeleteEvent}
          onUpdate={handleUpdateEvent}
          iconConfig={iconConfig}
          layoutMode={layoutMode}
        />
      </main>

      <footer className="w-full shrink-0 bg-black/90 py-3 border-t border-history-gold/10 text-center text-xs text-history-gold/30 font-serif tracking-[0.5em] uppercase">
        薪火相传 · 铭记历史 • 1931 - 1953
      </footer>

      <EventModal
        isOpen={isEventModalOpen}
        mode="add"
        onClose={() => setIsEventModalOpen(false)}
        onSubmit={handleAddEvent}
      />

      <IconSettingsModal
        isOpen={isIconSettingsOpen}
        iconConfig={iconConfig}
        onClose={() => setIsIconSettingsOpen(false)}
        onSave={setIconConfig}
      />
    </div>
  );
};

export default App;
