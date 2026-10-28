import { DrawTool, Point, AppState, DrawButton } from "../core/types";
import { drawColour, fillColour } from "../core/state";

let startPoint: Point | null = null;
let savedImageData: ImageData | null = null;

export const rectangleTool: DrawTool = {
  name: "rectangle",
  label: "Rectangle",
  icon: "▭",

  onPointerDown(ctx: CanvasRenderingContext2D, point: Point): void {
    startPoint = point;
    savedImageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  },

  onPointerMove(ctx: CanvasRenderingContext2D, point: Point, state: AppState, button: DrawButton): void {
    if (!startPoint || !savedImageData) return;
    ctx.putImageData(savedImageData, 0, 0);
    drawRect(ctx, startPoint, point, state, button);
  },

  onPointerUp(ctx: CanvasRenderingContext2D, point: Point, state: AppState, button: DrawButton): void {
    if (!startPoint) return;
    if (savedImageData) ctx.putImageData(savedImageData, 0, 0);
    drawRect(ctx, startPoint, point, state, button);
    startPoint = null;
    savedImageData = null;
  },
};

function drawRect(
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  state: AppState,
  button: DrawButton
): void {
  const x = from.x;
  const y = from.y;
  const w = to.x - from.x;
  const h = to.y - from.y;

  if (state.shapeFillMode !== "outline") {
    ctx.fillStyle = fillColour(state, button);
    ctx.fillRect(x, y, w, h);
  }
  if (state.shapeFillMode !== "fill") {
    ctx.strokeStyle = drawColour(state, button);
    ctx.lineWidth = state.brushSize;
    ctx.strokeRect(x, y, w, h);
  }
}
