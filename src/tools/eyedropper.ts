import { AppState, DrawButton, DrawTool, Point } from "../core/types";
import { setPrimaryColour, setSecondaryColour } from "../core/state";

function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("");
}

export const eyedropperTool: DrawTool = {
  name: "eyedropper",
  label: "Pick Colour",
  icon: "💧",

  onPointerDown(ctx: CanvasRenderingContext2D, point: Point, _state: AppState, button: DrawButton): void {
    pickColour(ctx, point, button);
  },

  onPointerMove(ctx: CanvasRenderingContext2D, point: Point, _state: AppState, button: DrawButton): void {
    pickColour(ctx, point, button);
  },

  onPointerUp(): void {},
};

function pickColour(ctx: CanvasRenderingContext2D, point: Point, button: DrawButton): void {
  const pixel = ctx.getImageData(point.x, point.y, 1, 1).data;
  const hex = rgbToHex(pixel[0], pixel[1], pixel[2]);
  if (button === "secondary") setSecondaryColour(hex);
  else setPrimaryColour(hex);
}
