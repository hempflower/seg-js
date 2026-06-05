/**
 * seg-js — 在 Canvas 上绘制斜体红色 7 段数码管(支持小数点、辉光、自动居中)。
 *
 * 核心: createSegDisplay(canvas, options) —— 创建一个参数化的数码管显示器。
 */

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SegStyle {
  /** 点亮颜色 */
  color?: string;
  /** 熄灭段颜色(暗色"鬼影") */
  offColor?: string;
  /** 辉光颜色 */
  glowColor?: string;
  /** 辉光模糊半径(单位 = u, 0 关闭) */
  glow?: number;
  /** 斜体角度(度), 正值使顶部向右倾(前倾斜体) */
  skewDeg?: number;
  /** 段厚(单位 = u) */
  thickness?: number;
  /** 相邻位间距(单位 = u) */
  digitGap?: number;
  /** 水平内边距(单位 = u, 每侧) */
  padX?: number;
  /** 垂直内边距(单位 = u, 每侧) */
  padY?: number;
}

interface SegOptions extends SegStyle {
  /** 需要点亮小数点的位索引集合 */
  dots?: Iterable<number>;
}

export interface SegArea {
  /** 区域左上角 x。默认按画布宽度比例计算 */
  x?: number;
  /** 区域左上角 y。默认按画布高度比例计算 */
  y?: number;
  /** 区域宽度。默认 1, 即完整画布宽度 */
  w?: number;
  /** 区域高度。默认 1, 即完整画布高度 */
  h?: number;
  /** ratio = 0-1 比例; px = CSS 像素 */
  unit?: 'ratio' | 'px';
}

export interface SegDisplayOptions extends SegStyle {
  /** 显示内容 */
  value?: string | number;
  /** 每一位要点亮的段, 优先级高于 value */
  segments?: Iterable<SegPattern>;
  /** 固定显示位数; 内容不足会补齐, 超出会截断 */
  digits?: number;
  /** 需要点亮小数点的位索引集合 */
  dots?: Iterable<number>;
  /** 在画布中的显示区域 */
  area?: SegArea;
  /** 内容补齐或截断方向 */
  align?: 'left' | 'right';
  /** 内容不足 digits 时使用的填充字符 */
  padChar?: string;
}

export type SegDisplayUpdate = SegDisplayOptions;

export type SegSegment = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'dp';
export type SegPattern = number | string | Iterable<SegSegment | 'dot'>;

export const SEGMENT_BITS: Record<SegSegment, number> = {
  a: 1 << 0,
  b: 1 << 1,
  c: 1 << 2,
  d: 1 << 3,
  e: 1 << 4,
  f: 1 << 5,
  g: 1 << 6,
  dp: 1 << 7,
};

const SEGMENT_ALIASES: Record<string, SegSegment> = {
  dot: 'dp',
  dp: 'dp',
};

/** 每个字符点亮哪些段 */
const DEFAULT_SEGMENTS: Record<string, string> = {
  '0': 'abcdef', '1': 'bc', '2': 'abged', '3': 'abgcd', '4': 'fgbc',
  '5': 'afgcd', '6': 'afgecd', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg',
  '-': 'g', ' ': '',
};
const SEGMENT_MAP: Record<string, number> = Object.fromEntries(
  Object.entries(DEFAULT_SEGMENTS).map(([key, pattern]) => [key, patternToMask(pattern)]),
);

const DEFAULTS: Required<Omit<SegOptions, 'dots'>> = {
  color: '#ff2d18',
  offColor: 'rgba(120,20,12,.18)',
  glowColor: 'rgba(255,45,24,.9)',
  glow: 0.9,
  skewDeg: 5,
  thickness: 0.78,
  digitGap: 0.35,
  padX: 2.0,
  padY: 0.65,
};

type Pt = [number, number];

/** 生成单个数码管(局部坐标, 原点=该位左上角)的 7 段多边形 */
function digitShapes(u: number, t: number): { s: SegSegment; pts: Pt[] }[] {
  const wH = 5 * u - 2 * t, hH = t;          // 水平段
  const wV = t, hV = (9 * u - 3 * t) / 2;    // 垂直段
  const hpoly = (x: number, y: number): Pt[] => [
    [x + 0.1 * wH, y], [x + 0.9 * wH, y], [x + wH, y + 0.5 * hH],
    [x + 0.9 * wH, y + hH], [x + 0.1 * wH, y + hH], [x, y + 0.5 * hH],
  ];
  const vpoly = (x: number, y: number): Pt[] => [
    [x, y + 0.1 * hV], [x + 0.5 * wV, y], [x + wV, y + 0.1 * hV],
    [x + wV, y + 0.9 * hV], [x + 0.5 * wV, y + hV], [x, y + 0.9 * hV],
  ];
  return [
    { s: 'a', pts: hpoly(t, 0) },
    { s: 'g', pts: hpoly(t, 4.5 * u - t / 2) },
    { s: 'd', pts: hpoly(t, 9 * u - t) },
    { s: 'f', pts: vpoly(0, t) },
    { s: 'b', pts: vpoly(5 * u - t, t) },
    { s: 'e', pts: vpoly(0, 4.5 * u + t / 2) },
    { s: 'c', pts: vpoly(5 * u - t, 4.5 * u + t / 2) },
  ];
}

/**
 * 把 text(每个字符一位)居中绘制到 box 内, 自带斜体、小数点、辉光, 水平+垂直居中。
 */
function drawSevenSegment(
  ctx: CanvasRenderingContext2D,
  box: Box,
  masks: number[],
  options: SegOptions = {},
): void {
  const o = { ...DEFAULTS, ...options };
  const dots = new Set<number>(options.dots ?? []);
  const n = masks.length;
  if (n === 0) return;

  const shear = Math.tan(-o.skewDeg * Math.PI / 180);
  const contentUnits = n * 6 + (n - 1) * o.digitGap;          // 不含边距的内容宽(单位 u)
  const u = Math.min(box.h / (9 + 2 * o.padY), box.w / (contentUnits + 2 * o.padX));
  const t = u * o.thickness;
  const pitch = 6 * u + o.digitGap * u;

  // 收集几何并求斜切后的内容包围盒(含未点亮段与小数点)
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const digits: { shapes: { s: SegSegment; pts: Pt[] }[]; dpC: Pt; dpR: number }[] = [];
  for (let i = 0; i < n; i++) {
    const ox = i * pitch;
    const shapes = digitShapes(u, t).map((sh) => ({
      s: sh.s, pts: sh.pts.map(([x, y]) => [x + ox, y] as Pt),
    }));
    const dpC: Pt = [5.25 * u + t / 2 + ox, 9 * u - t / 2];
    const dpR = t / 2;
    digits.push({ shapes, dpC, dpR });
    for (const sh of shapes) {
      for (const [x, y] of sh.pts) {
        const X = x + shear * y;
        if (X < minX) minX = X; if (X > maxX) maxX = X;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
    for (const cx of [dpC[0] - dpR, dpC[0] + dpR]) {
      for (const cy of [dpC[1] - dpR, dpC[1] + dpR]) {
        const X = cx + shear * cy;
        if (X < minX) minX = X; if (X > maxX) maxX = X;
        if (cy < minY) minY = cy; if (cy > maxY) maxY = cy;
      }
    }
  }
  const tx = (box.x + box.w / 2) - (minX + maxX) / 2;
  const ty = (box.y + box.h / 2) - (minY + maxY) / 2;
  const M = (x: number, y: number): Pt => [x + shear * y + tx, y + ty];

  const fillPoly = (pts: Pt[], lit: boolean) => {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
    setStyle(lit);
    ctx.fill();
    ctx.shadowBlur = 0;
  };
  const fillCircle = (cx: number, cy: number, r: number, lit: boolean) => {
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    setStyle(lit);
    ctx.fill();
    ctx.shadowBlur = 0;
  };
  const setStyle = (lit: boolean) => {
    if (lit) {
      ctx.fillStyle = o.color;
      ctx.shadowColor = o.glowColor;
      ctx.shadowBlur = o.glow * u;
    } else {
      ctx.fillStyle = o.offColor;
      ctx.shadowBlur = 0;
    }
  };

  for (let i = 0; i < n; i++) {
    const on = masks[i] ?? 0;
    const d = digits[i];
    for (const sh of d.shapes) fillPoly(sh.pts.map(([x, y]) => M(x, y)), (on & SEGMENT_BITS[sh.s]) !== 0);
    const [dx, dy] = M(d.dpC[0], d.dpC[1]);
    fillCircle(dx, dy, d.dpR, dots.has(i) || (on & SEGMENT_BITS.dp) !== 0);
  }
}

function pickStyle(options: SegDisplayOptions, dots: Iterable<number>): SegOptions {
  return {
    ...options,
    dots,
  };
}

function normalizeText(
  value: string | number | undefined,
  digits: number | undefined,
  align: 'left' | 'right',
  padChar: string,
): string {
  let text = value == null ? '' : String(value);
  if (!digits || digits <= 0) return text;

  if (text.length > digits) {
    text = align === 'right' ? text.slice(text.length - digits) : text.slice(0, digits);
  }

  const fill = padChar[0] ?? ' ';
  return align === 'right' ? text.padStart(digits, fill) : text.padEnd(digits, fill);
}

function patternToMask(pattern: SegPattern | undefined): number {
  if (pattern == null) return 0;
  if (typeof pattern === 'number') return pattern & 0xff;
  if (typeof pattern === 'string') {
    let mask = 0;
    for (let i = 0; i < pattern.length; i++) {
      if (pattern.startsWith('dot', i)) {
        mask |= SEGMENT_BITS.dp;
        i += 2;
        continue;
      }
      if (pattern.startsWith('dp', i)) {
        mask |= SEGMENT_BITS.dp;
        i += 1;
        continue;
      }
      const segment = pattern[i] === '.' ? 'dp' : pattern[i];
      mask |= SEGMENT_BITS[segment as SegSegment] ?? 0;
    }
    return mask;
  }

  let mask = 0;
  for (const segment of pattern) {
    const key = SEGMENT_ALIASES[segment] ?? segment;
    mask |= SEGMENT_BITS[key as SegSegment] ?? 0;
  }
  return mask;
}

function normalizeSegments(
  segments: Iterable<SegPattern> | undefined,
  value: string | number | undefined,
  digits: number | undefined,
  align: 'left' | 'right',
  padChar: string,
): number[] {
  if (segments) {
    let masks = Array.from(segments, patternToMask);
    if (!digits || digits <= 0) return masks;

    if (masks.length > digits) {
      masks = align === 'right' ? masks.slice(masks.length - digits) : masks.slice(0, digits);
    }

    const padMask = patternToMask(padChar);
    const pad = Array.from({ length: digits - masks.length }, () => padMask);
    return align === 'right' ? [...pad, ...masks] : [...masks, ...pad];
  }

  return Array.from(
    normalizeText(value, digits, align, padChar),
    (char) => SEGMENT_MAP[char] ?? 0,
  );
}

function resolveArea(area: SegArea | undefined, width: number, height: number): Box {
  const x = area?.x ?? 0;
  const y = area?.y ?? 0;
  const w = area?.w ?? 1;
  const h = area?.h ?? 1;
  if (area?.unit === 'px') return { x, y, w, h };
  return { x: x * width, y: y * height, w: w * width, h: h * height };
}

/**
 * 参数化数码管显示器。调用方只需要 update 数据和样式, 不需要接触 Canvas 绘制流程。
 */
export class SegDisplay {
  readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private options: SegDisplayOptions;
  private pendingRender = 0;
  private ro?: ResizeObserver;

  constructor(canvas: HTMLCanvasElement, options: SegDisplayOptions = {}) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('seg-js: 2D context unavailable');
    this.ctx = ctx;
    this.options = options;
    this.fit();

    if (typeof ResizeObserver !== 'undefined') {
      this.ro = new ResizeObserver(() => {
        this.fit();
        this.requestRender();
      });
      this.ro.observe(canvas);
    }

    this.requestRender();
  }

  /** 更新显示内容、位数、区域或样式。 */
  update(next: SegDisplayUpdate): void {
    this.options = { ...this.options, ...next };
    this.requestRender();
  }

  /** 释放 ResizeObserver 和待处理的重绘任务。 */
  destroy(): void {
    if (this.pendingRender) cancelAnimationFrame(this.pendingRender);
    this.pendingRender = 0;
    this.ro?.disconnect();
  }

  /** 按 devicePixelRatio 适配画布分辨率。 */
  fit(): void {
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    if (w && h) {
      const nextWidth = Math.round(w * dpr);
      const nextHeight = Math.round(h * dpr);
      if (this.canvas.width !== nextWidth) this.canvas.width = nextWidth;
      if (this.canvas.height !== nextHeight) this.canvas.height = nextHeight;
    }
  }

  private requestRender(): void {
    if (this.pendingRender) return;
    this.pendingRender = requestAnimationFrame(() => {
      this.pendingRender = 0;
      this.render();
    });
  }

  private render(): void {
    const width = this.canvas.clientWidth, height = this.canvas.clientHeight;
    if (!width || !height) return;

    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.clearRect(0, 0, width, height);

    const masks = normalizeSegments(
      this.options.segments,
      this.options.value,
      this.options.digits,
      this.options.align ?? 'right',
      this.options.padChar ?? ' ',
    );

    drawSevenSegment(
      this.ctx,
      resolveArea(this.options.area, width, height),
      masks,
      pickStyle(this.options, this.options.dots ?? []),
    );
  }
}

export function createSegDisplay(canvas: HTMLCanvasElement, options: SegDisplayOptions = {}): SegDisplay {
  return new SegDisplay(canvas, options);
}
