import { getDefaultFlagDataUrl } from './defaultFlagAssets';
import { getSideIconSlot } from './iconConfig';
import { HistoricalEvent, IconConfig, Side } from './types';
export type ExportLayout = 'horizontal' | 'vertical';

export const parseDateValue = (dateStr: string): number => {
  if (!dateStr) {
    return 0;
  }

  const yearMonthMatch = dateStr.match(/(\d{4})[./-](\d{1,2})/);
  if (yearMonthMatch) {
    return parseInt(yearMonthMatch[1], 10) * 100 + parseInt(yearMonthMatch[2], 10);
  }

  const yearMatch = dateStr.match(/(\d{4})/);
  if (yearMatch) {
    return parseInt(yearMatch[1], 10) * 100;
  }

  return 0;
};

// 所有史实在渲染和导出前都先按日期排序，避免页面顺序和导出顺序不一致。
export const sortEventsByDate = (events: HistoricalEvent[]) => {
  return [...events].sort((leftEvent, rightEvent) => {
    return parseDateValue(leftEvent.dateStr) - parseDateValue(rightEvent.dateStr);
  });
};

// 导出 SVG 时先转义特殊字符，避免标题或说明中的符号破坏 SVG 结构。
const escapeXml = (text: string) =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

// 简单按长度换行，让导出的说明文字不会挤出卡片。
const wrapText = (text: string, maxCharsPerLine: number) => {
  const lines: string[] = [];
  let currentLine = '';
  let count = 0;

  for (let index = 0; index < text.length; index += 1) {
    currentLine += text[index];
    count += text.charCodeAt(index) > 255 ? 2 : 1;

    if (count > maxCharsPerLine) {
      lines.push(currentLine);
      currentLine = '';
      count = 0;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
};

// 导出 SVG 时复用页面上的图标优先级：
// 用户自定义图片 -> 用户自定义文字 -> 内置默认党旗 -> 其他 SVG 兜底。
const getSvgFlagMarkup = (side: Side, iconConfig?: IconConfig) => {
  if (side === Side.OTHER) {
    return '';
  }

  const override = iconConfig?.[getSideIconSlot(side)];

  if (override?.mode === 'image' && override.value) {
    return `<image href="${escapeXml(override.value)}" width="40" height="26" preserveAspectRatio="xMidYMid slice" />`;
  }

  if (override?.mode === 'text' && override.value) {
    return `
      <rect width="40" height="26" rx="4" fill="#2a0a0a" opacity="0.92" />
      <text x="20" y="17" text-anchor="middle" fill="#ffffff" font-family="SimHei" font-size="10" font-weight="bold">${escapeXml(override.value)}</text>
    `;
  }

  const defaultFlagDataUrl = getDefaultFlagDataUrl(side);
  if (defaultFlagDataUrl) {
    return `<image href="${escapeXml(defaultFlagDataUrl)}" width="40" height="26" preserveAspectRatio="xMidYMid slice" />`;
  }

  if (side === Side.JOINT) {
    return `
      <defs>
        <linearGradient id="jointGradExport" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#DE2910" />
          <stop offset="100%" stop-color="#000095" />
        </linearGradient>
      </defs>
      <rect width="40" height="26" fill="url(#jointGradExport)" />
      <text x="20" y="17" text-anchor="middle" fill="white" font-family="SimHei" font-size="8" font-weight="bold">联合</text>
    `;
  }

  if (side === Side.JAPAN) {
    return `
      <rect width="40" height="26" fill="#ffffff" />
      <circle cx="20" cy="13" r="8" fill="#bd0029" />
    `;
  }

  return `
    <rect width="40" height="26" fill="#444444" />
    <text x="20" y="17" text-anchor="middle" fill="white" font-family="sans-serif" font-size="8" font-weight="bold">其他</text>
  `;
};

// 重点史实右下角的小标记，同样支持图片、文字和默认星标。
const getMajorMarkerMarkup = (cardWidth: number, cardHeight: number, iconConfig?: IconConfig) => {
  const override = iconConfig?.markerMajor;
  const x = cardWidth - 26;
  const y = cardHeight - 26;

  if (override?.mode === 'image' && override.value) {
    return `<image href="${escapeXml(override.value)}" x="${cardWidth - 38}" y="${cardHeight - 38}" width="26" height="26" preserveAspectRatio="xMidYMid contain" />`;
  }

  if (override?.mode === 'text' && override.value) {
    return `<text x="${x + 13}" y="${y + 18}" text-anchor="middle" font-family="SimHei" font-size="14" fill="#1a0505">${escapeXml(override.value)}</text>`;
  }

  return `
    <g transform="translate(${x}, ${y})">
      <circle cx="13" cy="13" r="12" fill="#facc15" />
      <polygon points="13,5 15.2,10 20.6,10.4 16.5,13.8 17.8,19 13,16.1 8.2,19 9.5,13.8 5.4,10.4 10.8,10" fill="#1a0505" />
    </g>
  `;
};

// 生成“导出卷轴”用的 SVG 字符串。
// 页面点击导出时，最终就是把这里生成的内容保存成 svg 文件。
const getCardMarkup = (
  event: HistoricalEvent,
  x: number,
  y: number,
  cardWidth: number,
  cardHeight: number,
  iconConfig?: IconConfig,
) => {
  let titleColor = '#333333';
  let borderColor = '#888888';
  let dotFill = '#666666';

  if (event.side === Side.CCP) {
    titleColor = '#b91c1c';
    borderColor = '#ef4444';
    dotFill = '#DE2910';
  } else if (event.side === Side.KMT) {
    titleColor = '#1e40af';
    borderColor = '#3b82f6';
    dotFill = '#000095';
  } else if (event.side === Side.JAPAN) {
    titleColor = '#444444';
    borderColor = '#999999';
    dotFill = '#666666';
  }

  const exportBody = event.meaning
    ? `${event.description} 意义：${event.meaning}`
    : event.description;
  const lines = wrapText(exportBody, 34);
  const textStartY = event.people ? 108 : 90;

  let markup = '';
  markup += `<g transform="translate(${x}, ${y})">`;
  markup += `<rect width="${cardWidth}" height="${cardHeight}" rx="12" fill="#fdfbf7" stroke="${borderColor}" stroke-width="${event.isMajor ? 4 : 1.5}" filter="url(#shadow)" />`;
  const flagMarkup = getSvgFlagMarkup(event.side, iconConfig);
  if (flagMarkup) {
    markup += `<g transform="translate(${cardWidth - 45}, -10)">${flagMarkup}</g>`;
  }
  markup += `<text x="15" y="30" font-family="SimHei" font-weight="bold" font-size="14" fill="#666666">${escapeXml(event.dateStr)}</text>`;
  markup += `<text x="15" y="58" font-family="SimHei" font-weight="bold" font-size="20" fill="${titleColor}">${escapeXml(event.title)}</text>`;

  if (event.people) {
    markup += `<text x="15" y="84" font-family="SimHei" font-size="11" fill="#7c2d12">${escapeXml(event.people)}</text>`;
  }

  lines.forEach((line, lineIndex) => {
    markup += `<text x="15" y="${textStartY + lineIndex * 18}" font-family="SimHei" font-size="12" fill="#333333">${escapeXml(line)}</text>`;
  });

  if (event.isMajor) {
    markup += getMajorMarkerMarkup(cardWidth, cardHeight, iconConfig);
  }

  markup += `</g>`;

  return { markup, borderColor, dotFill };
};

export const generateTimelineSVG = (
  events: HistoricalEvent[],
  iconConfig?: IconConfig,
  layout: ExportLayout = 'horizontal',
) => {
  const cardWidth = 260;
  const cardHeight = 235;
  const gap = layout === 'horizontal' ? 40 : 48;
  const startX = layout === 'horizontal' ? 100 : 90;
  const startY = layout === 'horizontal' ? 0 : 150;
  const totalWidth = layout === 'horizontal' ? startX + events.length * (cardWidth + gap) + 100 : 980;
  const totalHeight = layout === 'horizontal'
    ? 860
    : startY + events.length * (cardHeight + gap) + 140;
  const centerY = totalHeight / 2;
  const centerX = totalWidth / 2;

  let svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#1a0505" />
          <stop offset="50%" stop-color="#2a0a0a" />
          <stop offset="100%" stop-color="#1a0505" />
        </linearGradient>
        <filter id="shadow">
          <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
        </filter>
      </defs>

      <!-- 纯色背景兜底：避免 PDF 引擎忽略渐变后出现白底 -->
      <rect width="100%" height="100%" fill="#1a0505" />
      <rect width="100%" height="100%" fill="url(#bgGrad)" />

      <text x="50" y="80" fill="#FFD700" font-family="SimHei" font-size="48" font-weight="bold">中国近代革命史诗 (1840-1956)</text>
      <text x="50" y="120" fill="#ccaaaa" font-family="SimHei" font-size="24">The Epic of Modern Chinese Revolution</text>

      ${layout === 'horizontal'
    ? `<line x1="0" y1="${centerY}" x2="${totalWidth}" y2="${centerY}" stroke="#FFD700" stroke-width="4" opacity="0.8" />`
    : `<line x1="${centerX}" y1="120" x2="${centerX}" y2="${totalHeight - 20}" stroke="#FFD700" stroke-width="4" opacity="0.8" />`}
  `;

  events.forEach((event, index) => {
    const isPrimaryRow = index % 2 === 0;

    if (layout === 'horizontal') {
      const x = startX + index * (cardWidth + gap);
      const y = isPrimaryRow ? centerY - 60 - cardHeight : centerY + 60;
      const lineStartY = centerY;
      const lineEndY = isPrimaryRow ? y + cardHeight : y;
      const card = getCardMarkup(event, x, y, cardWidth, cardHeight, iconConfig);

      svgContent += `<line x1="${x + cardWidth / 2}" y1="${lineStartY}" x2="${x + cardWidth / 2}" y2="${lineEndY}" stroke="${card.borderColor}" stroke-width="2" />`;
      svgContent += `<circle cx="${x + cardWidth / 2}" cy="${centerY}" r="6" fill="${card.dotFill}" stroke="white" stroke-width="2" />`;
      svgContent += card.markup;
      return;
    }

    const y = startY + index * (cardHeight + gap);
    const x = isPrimaryRow ? centerX - 56 - cardWidth : centerX + 56;
    const lineStartX = centerX;
    const lineEndX = isPrimaryRow ? x + cardWidth : x;
    const card = getCardMarkup(event, x, y, cardWidth, cardHeight, iconConfig);

    svgContent += `<line x1="${lineStartX}" y1="${y + cardHeight / 2}" x2="${lineEndX}" y2="${y + cardHeight / 2}" stroke="${card.borderColor}" stroke-width="2" />`;
    svgContent += `<circle cx="${centerX}" cy="${y + cardHeight / 2}" r="6" fill="${card.dotFill}" stroke="white" stroke-width="2" />`;
    svgContent += card.markup;
  });

  svgContent += `</svg>`;
  return svgContent;
};
