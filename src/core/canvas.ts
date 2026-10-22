import { state, subscribe, setZoom } from "./state";
import { Point } from "./types";
import { getActiveTool } from "../tools/registry";

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let drawing = false;

const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8];

export function initCanvas(): void {
  canvas = document.getElementById("paint-canvas") as HTMLCanvasElement;
  ctx = canvas.getContext("2d")!;

  canvas.width = state.canvasWidth;
  canvas.height = state.canvasHeight;

  // Fill with white
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  canvas.addEventListener("pointerdown", onPointerDown);
  canvas.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("pointerup", onPointerUp);
  canvas.addEventListener("pointerleave", onPointerUp);

  const area = document.querySelector<HTMLElement>(".canvas-area");
  area?.addEventListener("wheel", onWheel, { passive: false });

  applyZoom();
  subscribe(applyZoom);
}

// The canvas is scaled with a CSS transform, which does not affect layout,
// so the wrapper is sized explicitly to keep the scroll area correct.
function applyZoom(): void {
  canvas.style.transform = `scale(${state.zoom})`;
  const wrapper = document.getElementById("canvas-wrapper");
  if (wrapper) {
    wrapper.style.width = `${canvas.width * state.zoom + 2}px`;
    wrapper.style.height = `${canvas.height * state.zoom + 2}px`;
  }
}

function onWheel(e: WheelEvent): void {
  if (!e.ctrlKey) return;
  e.preventDefault();
  if (e.deltaY < 0) zoomIn();
  else if (e.deltaY > 0) zoomOut();
}

export function zoomIn(): void {
  const next = ZOOM_LEVELS.find((z) => z > state.zoom);
  if (next !== undefined) setZoom(next);
}

export function zoomOut(): void {
  const next = [...ZOOM_LEVELS].reverse().find((z) => z < state.zoom);
  if (next !== undefined) setZoom(next);
}

export function resetZoom(): void {
  setZoom(1);
}

function getCanvasPoint(e: PointerEvent): Point {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.floor((e.clientX - rect.left) / state.zoom),
    y: Math.floor((e.clientY - rect.top) / state.zoom),
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

export function clearCanvas(): void {
  ctx.fillStyle = state.secondaryColour;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
