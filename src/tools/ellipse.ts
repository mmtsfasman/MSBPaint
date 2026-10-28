import { DrawTool, Point, AppState, DrawButton } from "../core/types";
import { drawColour } from "../core/state";

let startPoint: Point | null = null;
let savedImageData: ImageData | null = null;

export const ellipseTool: DrawTool = {
  name: "ellipse",
  label: "Ellipse",
  icon: "◯",

  onPointerDown(ctx: CanvasRenderingContext2D, point: Point): void {
    startPoint = point;
    savedImageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  },

  onPointerMove(ctx: CanvasRenderingContext2D, point: Point, state: AppState, button: DrawButton): void {
    if (!startPoint || !savedImageData) return;
    ctx.putImageData(savedImageData, 0, 0);
    drawEllipse(ctx, startPoint, point, drawColour(state, button), state.brushSize);
  },

  onPointerUp(ctx: CanvasRenderingContext2D, point: Point, state: AppState, button: DrawButton): void {
    if (!startPoint) return;
    if (savedImageData) ctx.putImageData(savedImageData, 0, 0);
    drawEllipse(ctx, startPoint, point, drawColour(state, button), state.brushSize);
    startPoint = null;
    savedImageData = null;
  },
};

// TODO: support filled ellipses
function drawEllipse(
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  colour: string,
  size: number
): void {
  const cx = (from.x + to.x) / 2;
  const cy = (from.y + to.y) / 2;
  const rx = Math.abs(to.x - from.x) / 2;
  const ry = Math.abs(to.y - from.y) / 2;

  ctx.strokeStyle = colour;
  ctx.lineWidth = size;
  ctx.beginPath();
  ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
  ctx.stroke();
}
