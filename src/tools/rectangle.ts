import { DrawTool, Point, AppState } from "../core/types";

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

  onPointerMove(ctx: CanvasRenderingContext2D, point: Point, state: AppState): void {
    if (!startPoint || !savedImageData) return;
    ctx.putImageData(savedImageData, 0, 0);
    drawRect(ctx, startPoint, point, state);
  },

  onPointerUp(ctx: CanvasRenderingContext2D, point: Point, state: AppState): void {
    if (!startPoint) return;
    if (savedImageData) ctx.putImageData(savedImageData, 0, 0);
    drawRect(ctx, startPoint, point, state);
    startPoint = null;
    savedImageData = null;
  },
};

function drawRect(
  ctx: CanvasRenderingContext2D,
  from: Point,
  to: Point,
  state: AppState
): void {
  const x = from.x;
  const y = from.y;
  const w = to.x - from.x;
  const h = to.y - from.y;

  if (state.shapeFillMode !== "outline") {
    ctx.fillStyle = state.secondaryColour;
    ctx.fillRect(x, y, w, h);
  }
  if (state.shapeFillMode !== "fill") {
    ctx.strokeStyle = state.primaryColour;
    ctx.lineWidth = state.brushSize;
    ctx.strokeRect(x, y, w, h);
  }
}
