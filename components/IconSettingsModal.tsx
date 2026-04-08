import React, { useEffect, useState } from 'react';
import {
  cloneIconConfig,
  createDefaultIconConfig,
  ICON_SLOT_DETAILS,
  ICON_SLOT_SECTIONS,
  getSideForIconSlot,
  isSideIconSlot,
} from '../iconConfig';
import { IconConfig, IconMode, IconSlot } from '../types';
import { AppIcon } from './AppIcon';
import { FlagIcon } from './FlagIcon';

interface IconSettingsModalProps {
  isOpen: boolean;
  iconConfig: IconConfig;
  onClose: () => void;
  onSave: (iconConfig: IconConfig) => void;
}

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('读取图片失败'));
    reader.readAsDataURL(file);
  });

export const IconSettingsModal: React.FC<IconSettingsModalProps> = ({
  isOpen,
  iconConfig,
  onClose,
  onSave,
}) => {
  const [draft, setDraft] = useState<IconConfig>(() => cloneIconConfig(iconConfig));

  useEffect(() => {
    if (isOpen) {
      setDraft(cloneIconConfig(iconConfig));
    }
  }, [iconConfig, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleModeChange = (slot: IconSlot, mode: IconMode) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [slot]: {
        mode,
        value: mode === currentDraft[slot].mode ? currentDraft[slot].value : '',
      },
    }));
  };

  const handleTextChange = (slot: IconSlot, value: string) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [slot]: {
        mode: 'text',
        value,
      },
    }));
  };

  const handleImageChange = async (slot: IconSlot, file: File) => {
    try {
      const dataUrl = await readFileAsDataUrl(file);
      setDraft((currentDraft) => ({
        ...currentDraft,
        [slot]: {
          mode: 'image',
          value: dataUrl,
        },
      }));
    } catch {
      window.alert('图片读取失败，请重新选择。');
    }
  };

  const handleResetSlot = (slot: IconSlot) => {
    setDraft((currentDraft) => ({
      ...currentDraft,
      [slot]: {
        mode: 'default',
        value: '',
      },
    }));
  };

  const handleResetAll = () => {
    setDraft(createDefaultIconConfig());
  };

  const handleSave = () => {
    onSave(cloneIconConfig(draft));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#fdfbf7] text-[#1a0505] rounded shadow-2xl w-full max-w-5xl border-2 border-history-gold">
        <div className="bg-history-red p-4 border-b border-history-gold flex justify-between items-center gap-4">
          <div>
            <h2 className="text-history-gold font-serif text-xl font-bold">图标设置</h2>
            <p className="text-history-paper/80 text-xs mt-1">
              所有图标保存到本地。建议上传小尺寸图标，打开会更快。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-history-gold hover:text-white font-bold text-xl"
            aria-label="关闭"
          >
            &times;
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-6 space-y-6 font-serif">
          {ICON_SLOT_SECTIONS.map((section) => (
            <section key={section.title} className="space-y-3">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-lg font-bold text-history-red">{section.title}</h3>
                <button
                  type="button"
                  onClick={handleResetAll}
                  className="text-xs px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  全部恢复默认
                </button>
              </div>

              <div className="space-y-4">
                {section.slots.map((slot) => {
                  const replacement = draft[slot];
                  const details = ICON_SLOT_DETAILS[slot];

                  return (
                    <div
                      key={slot}
                      className="grid grid-cols-1 lg:grid-cols-[140px_1fr] gap-4 rounded border border-[#d8ccb0] bg-white/80 p-4"
                    >
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="w-20 h-[60px] rounded-none bg-red-950/5 flex items-center justify-center overflow-hidden">
                          {isSideIconSlot(slot) ? (
                            <FlagIcon
                              side={getSideForIconSlot(slot)}
                              iconConfig={draft}
                              className="w-full h-full"
                            />
                          ) : (
                            <AppIcon
                              slot={slot}
                              iconConfig={draft}
                              label={details.label}
                              className="w-8 h-8 text-2xl text-history-red"
                            />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleResetSlot(slot)}
                          className="text-xs px-3 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                        >
                          当前项恢复默认
                        </button>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="font-bold text-base">{details.label}</div>
                          <div className="text-sm text-gray-500">{details.description}</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-3 items-start">
                          <label className="text-sm font-bold text-gray-700 pt-2">替换方式</label>
                          <select
                            value={replacement.mode}
                            onChange={(event) => handleModeChange(slot, event.target.value as IconMode)}
                            className="w-full p-2 border border-gray-300 rounded focus:border-red-800 outline-none"
                          >
                            <option value="default">使用默认图标</option>
                            <option value="text">使用文字或 Emoji</option>
                            <option value="image">上传图片</option>
                          </select>
                        </div>

                        {replacement.mode === 'text' && (
                          <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-3 items-start">
                            <label className="text-sm font-bold text-gray-700 pt-2">文字内容</label>
                            <input
                              type="text"
                              value={replacement.value}
                              onChange={(event) => handleTextChange(slot, event.target.value)}
                              placeholder="例如 ★、⚑、中共、删"
                              className="w-full p-2 border border-gray-300 rounded focus:border-red-800 outline-none"
                            />
                          </div>
                        )}

                        {replacement.mode === 'image' && (
                          <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-3 items-start">
                            <label className="text-sm font-bold text-gray-700 pt-2">上传图片</label>
                            <div className="space-y-2">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(event) => {
                                  const file = event.target.files?.[0];
                                  if (file) {
                                    void handleImageChange(slot, file);
                                  }
                                }}
                                className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-history-red file:text-white hover:file:bg-red-800"
                              />
                              <p className="text-xs text-gray-500">
                                图片会转成浏览器本地数据并自动保存，推荐使用小图标。
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        <div className="border-t border-history-gold/20 p-4 flex flex-col-reverse md:flex-row gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full md:w-auto px-5 py-3 border border-gray-300 rounded font-bold text-gray-700 hover:bg-gray-100 transition-colors"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="w-full md:w-auto px-5 py-3 bg-history-red text-white font-bold tracking-widest rounded shadow-lg hover:bg-red-800 transition-colors border border-history-gold"
          >
            保存图标设置
          </button>
        </div>
      </div>
    </div>
  );
};
