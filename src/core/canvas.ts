import { state, subscribe, setZoom } from "./state";
import { DrawButton, Point } from "./types";
import { getActiveTool } from "../tools/registry";
import { saveSnapshot } from "./history";

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let drawing = false;
let button: DrawButton = "primary";

const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8];

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
  // Right-click draws with the secondary colour, so the browser menu must not open
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

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
  // Only the left and right buttons draw, and a second button can't join a stroke
  if (drawing || (e.button !== 0 && e.button !== 2)) return;
  button = e.button === 2 ? "secondary" : "primary";
  drawing = true;
  canvas.setPointerCapture(e.pointerId);
  const point = getCanvasPoint(e);
  const tool = getActiveTool();
  tool.onPointerDown(ctx, point, state, button);
}

function onPointerMove(e: PointerEvent): void {
  const point = getCanvasPoint(e);
  updateStatusCoords(point);

  if (!drawing) return;
  const tool = getActiveTool();
  tool.onPointerMove(ctx, point, state, button);
}

function onPointerUp(e: PointerEvent): void {
  if (!drawing) return;
  drawing = false;
  const point = getCanvasPoint(e);
  const tool = getActiveTool();
  tool.onPointerUp(ctx, point, state, button);
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
