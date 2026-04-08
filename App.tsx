import React, { useEffect, useMemo, useRef, useState } from 'react';
import { jsPDF } from 'jspdf';
import 'svg2pdf.js';
import {
  loadStoredEvents,
  loadStoredIconConfig,
  loadStoredLayoutMode,
  saveStoredEvents,
  saveStoredIconConfig,
  saveStoredLayoutMode,
} from './appState';
import {
  ERA_LABELS,
  FILTER_ERA_MAP,
  MAIN_NAV_ITEMS,
  TimelineFilterKey,
} from './eraConfig';
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
import { Timeline } from './components/Timeline';

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

const splitNavLabel = (label: string) => {
  const match = label.match(/^(.*?)(\s*[（(][^）)]+[）)])$/);
  if (!match) {
    return { title: label, period: '' };
  }

  return {
    title: match[1].trim(),
    period: match[2].trim(),
  };
};

let simHeiFontLoadPromise: Promise<string> | null = null;

const loadSimHeiFontBase64 = async () => {
  if (!simHeiFontLoadPromise) {
    simHeiFontLoadPromise = fetch('/fonts/simhei.ttf')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load SimHei font file.');
        }
        return response.arrayBuffer();
      })
      .then((buffer) => {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        const chunkSize = 0x8000;
        for (let index = 0; index < bytes.length; index += chunkSize) {
          const chunk = bytes.subarray(index, index + chunkSize);
          binary += String.fromCharCode(...chunk);
        }
        return btoa(binary);
      });
  }

  return simHeiFontLoadPromise;
};

const App: React.FC = () => {
  const [events, setEvents] = useState<HistoricalEvent[]>(() => loadStoredEvents());
  const [iconConfig, setIconConfig] = useState(() => loadStoredIconConfig());
  const [selectedFilter, setSelectedFilter] = useState<TimelineFilterKey>('ALL');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isIconSettingsOpen, setIsIconSettingsOpen] = useState(false);
  const [deletedHistory, setDeletedHistory] = useState<DeletedEventSnapshot[]>([]);
  const [layoutMode, setLayoutMode] = useState<TimelineLayoutMode>(() => loadStoredLayoutMode());
  const [hoveredNav, setHoveredNav] = useState<TimelineFilterKey | null>(null);
  const [scrollContainer, setScrollContainer] = useState<HTMLDivElement | null>(null);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeSearchIndex, setActiveSearchIndex] = useState(0);
  const [searchIconPosition, setSearchIconPosition] = useState({ left: 16, bottom: 16 });
  const exportMenuRef = useRef<HTMLDivElement | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; left: number; bottom: number } | null>(null);
  const hasDraggedRef = useRef(false);

  useEffect(() => {
    saveStoredEvents(events);
  }, [events]);

  useEffect(() => {
    saveStoredIconConfig(iconConfig);
  }, [iconConfig]);

  useEffect(() => {
    saveStoredLayoutMode(layoutMode);
  }, [layoutMode]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (!exportMenuRef.current) {
        return;
      }

      if (!exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, []);

  const filteredEvents = useMemo(() => {
    const eras = FILTER_ERA_MAP[hoveredNav ?? selectedFilter] ?? FILTER_ERA_MAP.ALL;
    const nextEvents = events.filter((event) => eras.includes(event.era));

    return sortEventsByDate(nextEvents);
  }, [events, hoveredNav, selectedFilter]);
  const exportEvents = filteredEvents;
  const searchResults = useMemo(() => {
    const keyword = searchKeyword.trim().toLowerCase();
    if (!keyword) {
      return [];
    }

    return sortEventsByDate(events).filter((event) =>
      [event.title, event.dateStr, event.year, event.people ?? '', event.description, event.meaning ?? '']
        .join(' ')
        .toLowerCase()
        .includes(keyword),
    );
  }, [events, searchKeyword]);

  const jumpToSearchResult = (targetIndex: number) => {
    if (!searchResults.length) return;
    const normalized = (targetIndex + searchResults.length) % searchResults.length;
    const targetEvent = searchResults[normalized];
    setActiveSearchIndex(normalized);

    const visibleIds = new Set(filteredEvents.map((event) => event.id));
    if (!visibleIds.has(targetEvent.id)) {
      setSelectedFilter('ALL');
    }

    window.setTimeout(() => {
      const node = document.querySelector(`[data-event-id="${targetEvent.id}"]`);
      if (node instanceof HTMLElement) {
        node.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
    }, visibleIds.has(targetEvent.id) ? 30 : 180);
  };

  useEffect(() => {
    setActiveSearchIndex(0);
  }, [searchKeyword]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const dragState = dragStartRef.current;
      if (!dragState) return;

      const nextLeft = dragState.left + (event.clientX - dragState.mouseX);
      const nextBottom = dragState.bottom - (event.clientY - dragState.mouseY);
      const clampedLeft = Math.min(Math.max(nextLeft, 8), window.innerWidth - 48);
      const clampedBottom = Math.min(Math.max(nextBottom, 8), window.innerHeight - 48);

      if (Math.abs(event.clientX - dragState.mouseX) > 3 || Math.abs(event.clientY - dragState.mouseY) > 3) {
        hasDraggedRef.current = true;
      }

      setSearchIconPosition({ left: clampedLeft, bottom: clampedBottom });
    };

    const handleMouseUp = () => {
      dragStartRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const scrollToStart = () => {
    if (!scrollContainer) return;
    if (layoutMode === 'horizontal') {
      scrollContainer.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
      const isUndoShortcut = (event.ctrlKey || event.metaKey)
        && !event.shiftKey
        && !event.altKey
        && event.key.toLowerCase() === 'z';

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
    const svgString = generateTimelineSVG(exportEvents, iconConfig, layoutMode);
    const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `modern-chinese-revolution-epic-${Date.now()}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = async () => {
    const svgString = generateTimelineSVG(exportEvents, iconConfig, layoutMode);
    const parser = new DOMParser();
    const svgDocument = parser.parseFromString(svgString, 'image/svg+xml');
    const svgElement = svgDocument.documentElement as unknown as SVGSVGElement;
    const width = Number(svgElement.getAttribute('width')) || 980;
    const height = Number(svgElement.getAttribute('height')) || 1400;

    const pdf = new jsPDF({
      orientation: layoutMode === 'horizontal' ? 'landscape' : 'portrait',
      unit: 'pt',
      format: [width, height],
      compress: true,
    });
    const simHeiFontBase64 = await loadSimHeiFontBase64();
    const pdfWithSvg = pdf as jsPDF & {
      addFileToVFS: (filename: string, filecontent: string) => void;
      addFont: (postScriptName: string, fontName: string, fontStyle: string) => void;
      setFont: (fontName: string, fontStyle?: string) => jsPDF;
      svg: (
        element: SVGSVGElement,
        options: {
          x: number;
          y: number;
          width: number;
          height: number;
          fontCallback?: (
            family: string,
            bold: boolean,
            italic: boolean,
            options?: Record<string, unknown>,
          ) => string;
        },
      ) => Promise<void>;
    };
    pdfWithSvg.addFileToVFS('simhei.ttf', simHeiFontBase64);
    pdfWithSvg.addFont('simhei.ttf', 'SimHei', 'normal');
    pdfWithSvg.addFont('simhei.ttf', 'SimHei', 'bold');
    pdfWithSvg.setFont('SimHei', 'normal');
    await pdfWithSvg.svg(svgElement, {
      x: 0,
      y: 0,
      width,
      height,
      // 强制把 SVG 文本映射到已注入的中文字体，避免导出乱码。
      fontCallback: (_family, bold) => (bold ? 'SimHei-bold' : 'SimHei-normal'),
    });
    pdf.save(`modern-chinese-revolution-epic-${Date.now()}.pdf`);
  };

  const handleExportHtml = () => {
    const rootEl = document.getElementById('root');
    if (!rootEl) {
      return;
    }

    const rootClone = rootEl.cloneNode(true) as HTMLElement;
    const absolutizeUrl = (rawUrl: string | null) => {
      if (!rawUrl) return rawUrl;
      if (/^(data:|https?:|blob:|\/\/)/i.test(rawUrl)) return rawUrl;
      if (rawUrl.startsWith('/')) return `${window.location.origin}${rawUrl}`;
      return rawUrl;
    };

    rootClone.querySelectorAll<HTMLElement>('[src]').forEach((node) => {
      const src = node.getAttribute('src');
      const absoluteSrc = absolutizeUrl(src);
      if (absoluteSrc && absoluteSrc !== src) {
        node.setAttribute('src', absoluteSrc);
      }
    });

    rootClone.querySelectorAll<HTMLElement>('[href]').forEach((node) => {
      const href = node.getAttribute('href');
      const absoluteHref = absolutizeUrl(href);
      if (absoluteHref && absoluteHref !== href) {
        node.setAttribute('href', absoluteHref);
      }
    });

    const headClone = document.head.cloneNode(true) as HTMLHeadElement;
    headClone.querySelectorAll('script').forEach((node) => node.remove());
    const headHtml = headClone.innerHTML;
    const rootHtml = rootClone.innerHTML;
    const htmlContent = `<!doctype html>
<html lang="zh-CN">
  <head>${headHtml}</head>
  <body>
    <div id="root">${rootHtml}</div>
  </body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `modern-chinese-revolution-epic-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="h-screen min-h-0 flex flex-col overflow-hidden bg-[#160505] font-sans text-history-paper selection:bg-red-900 selection:text-white">
      <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_50%_-20%,rgba(139,0,0,0.65),transparent_45%),radial-gradient(circle_at_0%_100%,rgba(80,0,0,0.55),transparent_35%),radial-gradient(circle_at_100%_100%,rgba(80,0,0,0.45),transparent_35%),linear-gradient(to_bottom,#2d0a0a,#1a0505)]" />
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.12] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="fixed top-0 left-1/2 z-0 h-screen w-screen -translate-x-1/2 pointer-events-none bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.08),transparent_70%)]" />

      <header className="relative z-20 w-full shrink-0 bg-gradient-to-b from-black/85 via-black/45 to-transparent px-4 pb-5 pt-5 md:px-6 md:pt-6 shadow-2xl border-b border-history-gold/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-r from-history-gold via-yellow-300 to-history-gold drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] tracking-wide">
              中国近代革命史诗
            </h1>
            <p className="text-red-300/90 text-[11px] md:text-sm mt-2 tracking-[0.3em] md:tracking-widest uppercase font-serif font-bold italic">
              THE EPIC OF MODERN CHINESE REVOLUTION (1840-1956)
            </p>
            <p className="text-history-gold/60 text-xs mt-3 font-serif">
              本地自动保存已开启，录入、编辑、删除和图标替换都会在重启后保留。
            </p>
            <p className="text-history-gold/45 text-[11px] mt-1 font-serif">
              删除史实后可按 Ctrl+Z 撤销恢复，手机默认使用纵向长卷阅读。
            </p>
          </div>

          <div className="flex flex-col items-stretch md:items-end gap-3 w-full md:w-auto">
            <div className="flex flex-wrap gap-4 justify-end">
              <div className="flex items-center gap-2">
                <div className="w-8 h-6 overflow-hidden rounded-none bg-black/20 flex items-center justify-center">
                  <FlagIcon side={Side.CCP} iconConfig={iconConfig} className="w-full h-full" />
                </div>
                <span className="text-xs text-history-gold/60 font-serif">共产党</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-6 overflow-hidden rounded-none bg-black/20 flex items-center justify-center">
                  <FlagIcon side={Side.KMT} iconConfig={iconConfig} className="w-full h-full" />
                </div>
                <span className="text-xs text-gray-300 font-serif">国民党</span>
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
                横向长卷
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

              <div ref={exportMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsExportMenuOpen((current) => !current)}
                  className="px-3 py-1 bg-black/40 hover:bg-white/5 text-white border border-white/20 rounded text-xs tracking-wider transition-all duration-300 shadow-lg inline-flex items-center gap-1.5"
                >
                  <AppIcon
                    slot="actionExport"
                    iconConfig={iconConfig}
                    label="导出"
                    className="w-3.5 h-3.5"
                  />
                  <span>导出</span>
                </button>

                {isExportMenuOpen && (
                  <div className="absolute right-0 mt-2 w-[132px] rounded border border-white/20 bg-[#1a0606]/95 shadow-[0_14px_28px_rgba(0,0,0,0.45)] overflow-hidden z-40">
                    <button
                      type="button"
                      onClick={() => {
                        handleExport();
                        setIsExportMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs tracking-wider text-amber-100 hover:bg-white/10 transition-colors"
                    >
                      导出SVG
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void handleExportPdf();
                        setIsExportMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs tracking-wider text-amber-100 hover:bg-white/10 transition-colors border-t border-white/10"
                    >
                      导出PDF
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleExportHtml();
                        setIsExportMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs tracking-wider text-amber-100 hover:bg-white/10 transition-colors border-t border-white/10"
                    >
                      导出HTML
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8">
          <div className="relative flex items-center justify-center gap-3 md:gap-6 px-4 py-3 rounded-2xl bg-black/15 backdrop-blur-sm">
            {MAIN_NAV_ITEMS.map((item) => (
              <div
                key={item.key}
                className="relative group"
                onMouseEnter={() => setHoveredNav(item.key)}
                onMouseLeave={() => setHoveredNav(null)}
              >
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFilter(item.key);
                    setHoveredNav(null);
                    scrollToStart();
                  }}
                  className={`px-4 md:px-6 py-2 rounded-full font-serif tracking-[0.12em] text-xs md:text-sm transition-all duration-300 border ${
                    (hoveredNav ?? selectedFilter) === item.key
                      ? 'bg-gradient-to-r from-[#8d1a12] to-[#b2331f] text-amber-50 border-amber-400/60 shadow-[0_0_28px_rgba(255,215,0,0.35)]'
                      : 'bg-black/40 text-amber-200/80 border-white/10 hover:border-amber-300/50 hover:text-amber-100'
                  }`}
                >
                  {(() => {
                    const { title, period } = splitNavLabel(item.label);
                    if (!period) {
                      return <span className="whitespace-nowrap">{title}</span>;
                    }

                    return (
                      <span className="inline-flex flex-col items-center leading-tight">
                        <span className="whitespace-nowrap">{title}</span>
                        <span className="text-[10px] md:text-xs tracking-[0.06em] text-amber-100/85 mt-0.5">
                          {period}
                        </span>
                      </span>
                    );
                  })()}
                </button>

                {item.children && (
                  <div
                    className={`absolute left-1/2 -translate-x-1/2 top-full min-w-[240px] rounded-2xl border ${
                      hoveredNav === item.key ? 'border-amber-400/60' : 'border-transparent'
                    } bg-[#1a0606]/98 backdrop-blur-md shadow-[0_25px_60px_rgba(0,0,0,0.6)] transition duration-150 origin-top z-30 ${
                      hoveredNav === item.key ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'
                    }`}
                    onMouseEnter={() => setHoveredNav(item.key)}
                    onMouseLeave={() => setHoveredNav(null)}
                  >
                    <div className="flex flex-col divide-y divide-white/5">
                      {item.children.map((child) => (
                        <button
                          key={child.key}
                          type="button"
                          onClick={() => {
                            setSelectedFilter(child.key);
                            setHoveredNav(null);
                            scrollToStart();
                          }}
                          className={`text-left px-4 py-3 font-serif text-sm tracking-[0.12em] transition ${
                            selectedFilter === child.key
                              ? 'bg-amber-900/30 text-amber-50'
                              : 'text-amber-100/85 hover:bg-white/5'
                          }`}
                        >
                          {(() => {
                            const { title, period } = splitNavLabel(child.label);
                            if (!period) {
                              return <span className="whitespace-nowrap">{title}</span>;
                            }

                            return (
                              <span className="inline-flex flex-col leading-tight">
                                <span className="whitespace-nowrap">{title}</span>
                                <span className="text-xs tracking-[0.06em] text-amber-100/70 mt-0.5">
                                  {period}
                                </span>
                              </span>
                            );
                          })()}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      <main className="relative flex-1 min-h-0 w-full overflow-hidden">
        <Timeline
          events={filteredEvents}
          onDelete={handleDeleteEvent}
          onUpdate={handleUpdateEvent}
          iconConfig={iconConfig}
          layoutMode={layoutMode}
          registerScrollContainer={setScrollContainer}
        />
      </main>

      <footer className="relative z-20 w-full shrink-0 bg-black/80 py-3 border-t border-history-gold/10 text-center text-xs text-history-gold/30 font-serif tracking-[0.4em] uppercase">
        救亡图存 路 改天换地 路 1840 - 1956
      </footer>

      <div
        className="fixed z-40 flex items-end gap-2"
        style={{ left: `${searchIconPosition.left}px`, bottom: `${searchIconPosition.bottom}px` }}
      >
        {isSearchOpen && (
          <div className="px-3 py-2 rounded-xl border border-white/15 bg-black/25 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.45)] flex items-center gap-2">
            <input
              value={searchKeyword}
              onChange={(event) => setSearchKeyword(event.target.value)}
              placeholder="搜索时间轴内容"
              className="w-52 bg-transparent text-sm text-amber-50 placeholder:text-amber-100/40 outline-none"
            />
            <span className="text-xs text-amber-200/70 whitespace-nowrap">
              {searchResults.length ? `${activeSearchIndex + 1}/${searchResults.length}` : '0 条'}
            </span>
            <button
              type="button"
              onClick={() => jumpToSearchResult(activeSearchIndex - 1)}
              className="text-amber-100/80 hover:text-amber-50 text-xs px-1"
              title="上一个"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => jumpToSearchResult(activeSearchIndex + 1)}
              className="text-amber-100/80 hover:text-amber-50 text-xs px-1"
              title="下一个"
            >
              ↓
            </button>
          </div>
        )}
        <button
          type="button"
          onMouseDown={(event) => {
            if (event.button !== 0) return;
            dragStartRef.current = {
              mouseX: event.clientX,
              mouseY: event.clientY,
              left: searchIconPosition.left,
              bottom: searchIconPosition.bottom,
            };
            hasDraggedRef.current = false;
          }}
          onClick={() => {
            if (hasDraggedRef.current) {
              hasDraggedRef.current = false;
              return;
            }
            setIsSearchOpen((current) => !current);
          }}
          onDoubleClick={() => {
            setSearchIconPosition({ left: 16, bottom: 16 });
          }}
          className="w-10 h-10 rounded-full border border-white/25 bg-transparent text-amber-100/85 hover:text-amber-50 transition-colors flex items-center justify-center"
          title="搜索"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="11" cy="11" r="6.5" />
            <path d="M16.2 16.2 21 21" strokeLinecap="round" />
          </svg>
        </button>
      </div>

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
