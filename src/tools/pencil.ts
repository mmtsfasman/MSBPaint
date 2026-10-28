import { DrawTool, Point, AppState, DrawButton } from "../core/types";
import { drawColour } from "../core/state";

let lastPoint: Point | null = null;

export const pencilTool: DrawTool = {
  name: "pencil",
  label: "Pencil",
  icon: "✏️",

  onPointerDown(ctx: CanvasRenderingContext2D, point: Point, state: AppState, button: DrawButton): void {
    lastPoint = point;
    ctx.fillStyle = drawColour(state, button);
    ctx.fillRect(point.x, point.y, 1, 1);
  },

  onPointerMove(ctx: CanvasRenderingContext2D, point: Point, state: AppState, button: DrawButton): void {
    if (!lastPoint) return;
    ctx.strokeStyle = drawColour(state, button);
    ctx.lineWidth = 1;
    ctx.lineCap = "round";
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
