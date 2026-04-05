import React, { useEffect, useState } from 'react';
import { DEFAULT_EVENT_DRAFT } from '../appState';
import { Era, HistoricalEventDraft, Side } from '../types';

interface EventModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  initialEvent?: HistoricalEventDraft;
  onClose: () => void;
  onSubmit: (event: HistoricalEventDraft) => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  mode,
  initialEvent,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<HistoricalEventDraft>({ ...DEFAULT_EVENT_DRAFT });

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormData({
      ...DEFAULT_EVENT_DRAFT,
      ...(initialEvent ?? {}),
    });
  }, [initialEvent, isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextEvent: HistoricalEventDraft = {
      ...formData,
      title: formData.title.trim(),
      dateStr: formData.dateStr.trim(),
      year: formData.year.trim(),
      description: formData.description.trim(),
    };

    if (!nextEvent.title || !nextEvent.dateStr || !nextEvent.year || !nextEvent.description) {
      window.alert('请完整填写史实信息后再保存。');
      return;
    }

    onSubmit(nextEvent);
  };

  const title = mode === 'add' ? '录入史实' : '编辑史实';
  const submitLabel = mode === 'add' ? '保存新增史实' : '保存修改';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#fdfbf7] text-[#1a0505] rounded shadow-2xl w-full max-w-xl border-2 border-history-gold">
        <div className="bg-history-red p-4 border-b border-history-gold flex justify-between items-center">
          <div>
            <h2 className="text-history-gold font-serif text-xl font-bold">{title}</h2>
            <p className="text-history-paper/80 text-xs mt-1">保存后会自动写入本地，下次打开仍会保留。</p>
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-serif">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-500">
                时间标记
              </label>
              <input
                type="text"
                placeholder="例如 1937.7"
                required
                className="w-full p-2 border border-gray-300 rounded focus:border-red-800 outline-none"
                value={formData.dateStr}
                onChange={(event) => setFormData({ ...formData, dateStr: event.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-500">
                年份
              </label>
              <input
                type="text"
                placeholder="例如 1937"
                required
                className="w-full p-2 border border-gray-300 rounded focus:border-red-800 outline-none"
                value={formData.year}
                onChange={(event) => setFormData({ ...formData, year: event.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-500">
              史实标题
            </label>
            <input
              type="text"
              placeholder="请输入史实标题"
              required
              className="w-full p-2 border border-gray-300 rounded focus:border-red-800 outline-none font-bold"
              value={formData.title}
              onChange={(event) => setFormData({ ...formData, title: event.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-500">
              史实说明
            </label>
            <textarea
              placeholder="请输入史实说明"
              required
              className="w-full p-2 border border-gray-300 rounded focus:border-red-800 outline-none h-28 resize-none"
              value={formData.description}
              onChange={(event) => setFormData({ ...formData, description: event.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-500">
                阵营
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded focus:border-red-800 outline-none"
                value={formData.side}
                onChange={(event) => setFormData({ ...formData, side: event.target.value as Side })}
              >
                {Object.values(Side).map((side) => (
                  <option key={side} value={side}>
                    {side}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-gray-500">
                阶段
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded focus:border-red-800 outline-none text-sm"
                value={formData.era}
                onChange={(event) => setFormData({ ...formData, era: event.target.value as Era })}
              >
                {Object.values(Era).map((era) => (
                  <option key={era} value={era}>
                    {era}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              checked={Boolean(formData.isMajor)}
              onChange={(event) => setFormData({ ...formData, isMajor: event.target.checked })}
              className="w-4 h-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <span className="text-sm font-bold text-gray-700">标记为重点史实</span>
          </label>

          <div className="flex flex-col-reverse md:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full md:w-auto px-5 py-3 border border-gray-300 rounded font-bold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="w-full md:flex-1 py-3 bg-history-red text-white font-bold tracking-widest rounded shadow-lg hover:bg-red-800 transition-colors border border-history-gold"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
