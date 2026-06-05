/**
 * seg-js — 在 Canvas 上绘制斜体红色 7 段数码管(支持小数点、辉光、自动居中)。
 *
 * 核心: createSegDisplay(canvas, options) —— 创建一个参数化的数码管显示器。
 */
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
export declare const SEGMENT_BITS: Record<SegSegment, number>;
/**
 * 参数化数码管显示器。调用方只需要 update 数据和样式, 不需要接触 Canvas 绘制流程。
 */
export declare class SegDisplay {
    readonly canvas: HTMLCanvasElement;
    private readonly ctx;
    private options;
    private pendingRender;
    private ro?;
    constructor(canvas: HTMLCanvasElement, options?: SegDisplayOptions);
    /** 更新显示内容、位数、区域或样式。 */
    update(next: SegDisplayUpdate): void;
    /** 释放 ResizeObserver 和待处理的重绘任务。 */
    destroy(): void;
    /** 按 devicePixelRatio 适配画布分辨率。 */
    fit(): void;
    private requestRender;
    private render;
}
export declare function createSegDisplay(canvas: HTMLCanvasElement, options?: SegDisplayOptions): SegDisplay;
