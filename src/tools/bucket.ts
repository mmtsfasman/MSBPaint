import { DrawTool, Point, AppState, DrawButton } from "../core/types";
import { drawColour } from "../core/state";

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function colourMatch(
  data: Uint8ClampedArray,
  idx: number,
  target: [number, number, number]
): boolean {
  return (
    data[idx] === target[0] &&
    data[idx + 1] === target[1] &&
    data[idx + 2] === target[2]
  );
}

export const bucketTool: DrawTool = {
  name: "bucket",
  label: "Fill",
  icon: "🪣",

  onPointerDown(ctx: CanvasRenderingContext2D, point: Point, state: AppState, button: DrawButton): void {
    const { width, height } = ctx.canvas;
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    const startIdx = (point.y * width + point.x) * 4;
    const targetColour: [number, number, number] = [
      data[startIdx],
      data[startIdx + 1],
      data[startIdx + 2],
    ];
    const fillColour = hexToRgb(drawColour(state, button));

    if (
      targetColour[0] === fillColour[0] &&
      targetColour[1] === fillColour[1] &&
      targetColour[2] === fillColour[2]
    ) {
      return;
    }

    const stack: [number, number][] = [[point.x, point.y]];

    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      const idx = (y * width + x) * 4;

      if (x < 0 || x >= width || y < 0 || y >= height) continue;
      if (!colourMatch(data, idx, targetColour)) continue;

      data[idx] = fillColour[0];
      data[idx + 1] = fillColour[1];
      data[idx + 2] = fillColour[2];
      data[idx + 3] = 255;

      stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
    }

    ctx.putImageData(imageData, 0, 0);
  },

  onPointerMove(): void {},
  onPointerUp(): void {},
};
