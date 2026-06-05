# seg-js

在 HTML Canvas 上绘制**斜体红色 7 段数码管**的小型库：支持固定显示位数、小数点、辉光、未点亮段"鬼影"、按矩形自动水平+垂直居中与高清（devicePixelRatio）渲染。零依赖。

源自一个把动态数码管叠加到电路板图片数码管区域的需求。

## 安装 / 构建

```bash
pnpm install
pnpm build        # 用 Vite 生成 dist/index.js，并通过 unplugin-dts 生成 index.d.ts
pnpm preview      # 构建后用 Vite 本地预览 examples/
```

包内已附带构建好的 `dist/`，也可直接在浏览器以 ES Module 方式引入。

## 快速开始

```ts
import { createSegDisplay } from 'seg-js';

const display = createSegDisplay(document.getElementById('cv'), {
  digits: 8,
  value: '12345678',
  dots: [1, 3, 5],
  digitGap: 0.35,
  color: '#ff2d18',
});

display.update({ value: '87654321' });
```

浏览器直接用（无需打包器）：

```html
<canvas id="cv" style="width:720px;height:220px"></canvas>
<script type="module">
  import { createSegDisplay } from './dist/index.js';
  createSegDisplay(document.getElementById('cv'), {
    digits: 8,
    value: '12345678',
    dots: [1, 3, 5],
  });
</script>
```

## API

### `createSegDisplay(canvas, options?)`

创建一个参数化数码管显示器。调用方只传入显示内容、位数、区域与样式；Canvas 分辨率、ResizeObserver、清屏和绘制流程都由库内部处理。

```ts
const display = createSegDisplay(canvas, {
  digits: 6,
  value: 123456,
  dots: [1, 3],
  thickness: 0.78,
});

display.update({ value: 654321, color: '#20f7ff' });
```

### `SegDisplay`

- `update(options)` —— 更新显示内容、位数、区域或样式。
- `fit()` —— 手动按 `devicePixelRatio` 适配画布分辨率。
- `destroy()` —— 释放监听和待处理的重绘任务。

### 显示参数

| 选项 | 默认 | 说明 |
| --- | --- | --- |
| `value` | `''` | 显示内容，支持 `0-9`、`-`、空格 |
| `digits` | 内容长度 | 固定显示位数；内容不足补齐，超出截断 |
| `dots` | `[]` | 需点亮小数点的位索引集合 |
| `align` | `'right'` | 补齐或截断方向 |
| `padChar` | `' '` | 内容不足 `digits` 时的填充字符 |
| `area` | 全画布 | 显示区域，默认使用 0-1 比例 |

`area` 默认按画布比例计算：

```ts
area: { x: 0.1, y: 0.2, w: 0.8, h: 0.3 }
```

需要 CSS 像素时：

```ts
area: { x: 20, y: 30, w: 320, h: 80, unit: 'px' }
```

### 样式参数

| 选项 | 默认 | 说明 |
| --- | --- | --- |
| `color` | `#ff2d18` | 点亮颜色 |
| `offColor` | `rgba(120,20,12,.18)` | 熄灭段颜色（鬼影） |
| `glowColor` | `rgba(255,45,24,.9)` | 辉光颜色 |
| `glow` | `0.9` | 辉光模糊半径（单位 = u；0 关闭） |
| `skewDeg` | `5` | 斜体角度（度，正值前倾） |
| `thickness` | `0.78` | 段厚（单位 = u） |
| `digitGap` | `0.35` | 位间距（单位 = u） |
| `padX` | `2.0` | 水平内边距（单位 = u，每侧） |
| `padY` | `0.65` | 垂直内边距（单位 = u，每侧） |

> `u` 是自动算出的单位：`u = min(h/(9+2·padY), w/(内容宽+2·padX))`，
> 一位的标称尺寸为 5u×9u（外加 1u 小数点位），所有几何均按 u 缩放，因此随 `box` 自适应。
> 居中是按"全部段码（含未点亮）+ 小数点"的斜切包围盒对齐显示区域中心，水平与垂直都精确居中。

## 示例

- `examples/clock.html` —— 应用层定时调用 `update` 的最小时钟。
- `examples/board.html` —— 在电路板图片上叠加两个独立的数码管显示器。

本地查看（示例用 ES Module，需经 HTTP 提供）：

```bash
pnpm preview
# 打开 http://localhost:5173/examples/board.html
```

## 发布

仓库包含 GitHub Actions 自动发布配置：发布 GitHub Release 时会运行构建并发布到 npm。

发布前需要：

1. 在 npm 包设置里配置 Trusted Publisher，workflow 文件名填 `publish.yml`。
2. 确认 Release tag 和 `package.json` 版本一致，例如 `v0.1.0` 对应 `"version": "0.1.0"`。
3. 发布 GitHub Release。

如果暂时不用 Trusted Publishing，也可以在 GitHub 仓库 Secrets 中添加 `NPM_TOKEN`。

## License

MIT
