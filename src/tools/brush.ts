import { DrawTool, Point, AppState, DrawButton } from "../core/types";
import { drawColour } from "../core/state";

let lastPoint: Point | null = null;

export const brushTool: DrawTool = {
  name: "brush",
  label: "Brush",
  icon: "🖌️",

  onPointerDown(ctx: CanvasRenderingContext2D, point: Point, state: AppState, button: DrawButton): void {
    lastPoint = point;
    ctx.fillStyle = drawColour(state, button);
    const r = state.brushSize / 2;
    ctx.beginPath();
    ctx.arc(point.x, point.y, r, 0, Math.PI * 2);
    ctx.fill();
  },

  onPointerMove(ctx: CanvasRenderingContext2D, point: Point, state: AppState, button: DrawButton): void {
    if (!lastPoint) return;
    ctx.strokeStyle = drawColour(state, button);
    ctx.lineWidth = state.brushSize;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPoint = point;
  },

  onPointerUp(): void {
    lastPoint = null;
  },
};
