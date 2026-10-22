import { state } from "./state";
import { Point } from "./types";
import { getActiveTool } from "../tools/registry";
import { saveSnapshot } from "./history";

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let drawing = false;

export function initCanvas(): void {
  canvas = document.getElementById("paint-canvas") as HTMLCanvasElement;
  ctx = canvas.getContext("2d")!;

  canvas.width = state.canvasWidth;
  canvas.height = state.canvasHeight;

  // Fill with white
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  saveSnapshot();

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointerleave", onPointerUp);
}

function getCanvasPoint(e: PointerEvent): Point {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.floor(e.clientX - rect.left),
    y: Math.floor(e.clientY - rect.top),
  };
}

function onPointerDown(e: PointerEvent): void {
  drawing = true;
  canvas.setPointerCapture(e.pointerId);
  const point = getCanvasPoint(e);
  const tool = getActiveTool();
  tool.onPointerDown(ctx, point, state);
}

function onPointerMove(e: PointerEvent): void {
  const point = getCanvasPoint(e);
  updateStatusCoords(point);

  if (!drawing) return;
  const tool = getActiveTool();
  tool.onPointerMove(ctx, point, state);
}

function onPointerUp(e: PointerEvent): void {
  if (!drawing) return;
  drawing = false;
  const point = getCanvasPoint(e);
  const tool = getActiveTool();
  tool.onPointerUp(ctx, point, state);
  // The eyedropper only reads pixels, so it has nothing to undo
  if (tool.name !== "eyedropper") saveSnapshot();
}

function updateStatusCoords(point: Point): void {
  const el = document.getElementById("status-coords");
  if (el) el.textContent = `${point.x}, ${point.y}px`;
}

export function getCanvas(): HTMLCanvasElement {
  return canvas;
}

export function getContext(): CanvasRenderingContext2D {
  return ctx;
}

export function isDrawing(): boolean {
  return drawing;
}

export function clearCanvas(): void {
  ctx.fillStyle = state.secondaryColour;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  saveSnapshot();
}
