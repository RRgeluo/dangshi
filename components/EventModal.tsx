import React, { useEffect, useState } from 'react';
import { DEFAULT_EVENT_DRAFT } from '../appState';
import { ERA_LABELS, ERA_ORDER } from '../eraConfig';
import { Era, HistoricalEventDraft, Side } from '../types';

interface EventModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  initialEvent?: HistoricalEventDraft;
  onClose: () => void;
  onSubmit: (event: HistoricalEventDraft) => void;
}

const SIDE_LABELS: Record<Side, string> = {
  [Side.CCP]: '共产党',
  [Side.KMT]: '国民党',
  [Side.JOINT]: '统一战线',
  [Side.JAPAN]: '日本侵略者',
  [Side.OTHER]: '其他',
};

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
      people: formData.people?.trim() ?? '',
      meaning: formData.meaning?.trim() ?? '',
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4">
      <div className="w-full max-w-2xl overflow-hidden rounded-[2rem] border border-amber-500/30 bg-[#1a0606] text-[#f8f0da] shadow-[0_40px_120px_rgba(0,0,0,0.75)]">
        <div className="flex items-center justify-between border-b border-white/8 bg-gradient-to-r from-[#2f0909] to-[#160404] px-6 py-5">
          <div>
            <h2 className="text-xl md:text-2xl font-black font-serif text-amber-100">{title}</h2>
            <p className="mt-1 text-xs md:text-sm tracking-[0.18em] text-amber-300/60">
              保存后会自动写入本地，下次打开仍会保留
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-amber-100 hover:bg-white/10"
            aria-label="关闭"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6 font-serif">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold tracking-[0.24em] text-amber-300/60">
                时间标记
              </label>
              <input
                type="text"
                placeholder="例如 1937.7"
                required
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-amber-50 outline-none transition focus:border-amber-500/60"
                value={formData.dateStr}
                onChange={(event) => setFormData({ ...formData, dateStr: event.target.value })}
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold tracking-[0.24em] text-amber-300/60">
                年份
              </label>
              <input
                type="text"
                placeholder="例如 1937"
                required
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-amber-50 outline-none transition focus:border-amber-500/60"
                value={formData.year}
                onChange={(event) => setFormData({ ...formData, year: event.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold tracking-[0.24em] text-amber-300/60">
              史实标题
            </label>
            <input
              type="text"
              placeholder="请输入史实标题"
              required
              className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-amber-50 outline-none transition focus:border-amber-500/60"
              value={formData.title}
              onChange={(event) => setFormData({ ...formData, title: event.target.value })}
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold tracking-[0.24em] text-amber-300/60">
              事件概述
            </label>
            <textarea
              placeholder="请输入史实说明"
              required
              className="h-28 w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-amber-50 outline-none transition focus:border-amber-500/60"
              value={formData.description}
              onChange={(event) => setFormData({ ...formData, description: event.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold tracking-[0.24em] text-amber-300/60">
                阵营
              </label>
              <select
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-amber-50 outline-none transition focus:border-amber-500/60"
                value={formData.side}
                onChange={(event) => setFormData({ ...formData, side: event.target.value as Side })}
              >
                {Object.values(Side).map((side) => (
                  <option key={side} value={side}>
                    {SIDE_LABELS[side]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold tracking-[0.24em] text-amber-300/60">
                阶段
              </label>
              <select
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-amber-50 outline-none transition focus:border-amber-500/60"
                value={formData.era}
                onChange={(event) => setFormData({ ...formData, era: event.target.value as Era })}
              >
                {ERA_ORDER.map((era) => (
                  <option key={era} value={era}>
                    {ERA_LABELS[era]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-xs font-bold tracking-[0.24em] text-amber-300/60">
                相关人物
              </label>
              <input
                type="text"
                placeholder="例如 孙中山、毛泽东"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-amber-50 outline-none transition focus:border-amber-500/60"
                value={formData.people ?? ''}
                onChange={(event) => setFormData({ ...formData, people: event.target.value })}
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-bold tracking-[0.24em] text-amber-300/60">
                历史意义
              </label>
              <input
                type="text"
                placeholder="用一句话概括"
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-amber-50 outline-none transition focus:border-amber-500/60"
                value={formData.meaning ?? ''}
                onChange={(event) => setFormData({ ...formData, meaning: event.target.value })}
              />
            </div>
          </div>

          <label className="flex items-center gap-3 rounded-xl border border-white/6 bg-white/[0.03] px-4 py-3">
            <input
              type="checkbox"
              checked={Boolean(formData.isMajor)}
              onChange={(event) => setFormData({ ...formData, isMajor: event.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm text-amber-100/85">标记为重点史实</span>
          </label>

          <div className="flex flex-col-reverse gap-3 pt-2 md:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-5 py-3 font-bold text-amber-50/80 hover:bg-white/10 md:w-auto"
            >
              取消
            </button>
            <button
              type="submit"
              className="w-full flex-1 rounded-xl border border-amber-400/30 bg-gradient-to-r from-[#8d1a12] to-[#b2331f] px-5 py-3 font-bold tracking-[0.24em] text-white shadow-[0_10px_24px_rgba(120,0,0,0.35)] hover:brightness-110"
            >
              {submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
