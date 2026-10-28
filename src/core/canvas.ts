import { state, subscribe, setZoom, setCanvasSize } from "./state";
import { DrawButton, Point } from "./types";
import { getActiveTool } from "../tools/registry";
import { saveSnapshot } from "./history";
import { dropSelection } from "../tools/selection";

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let drawing = false;
let button: DrawButton = "primary";

const ZOOM_LEVELS = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8];

export const MIN_CANVAS_SIZE = 1;
export const MAX_CANVAS_SIZE = 4096;

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

  initResizeHandle();

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
  positionResizeHandle();
}

// The wrapper's 4px margin and 1px border put the canvas's bottom-right
// corner at this offset inside the canvas area
function canvasCorner(width: number, height: number): Point {
  return { x: 5 + width * state.zoom, y: 5 + height * state.zoom };
}

function positionResizeHandle(): void {
  const handle = document.getElementById("canvas-resize-handle");
  if (!handle) return;
  const corner = canvasCorner(canvas.width, canvas.height);
  handle.style.left = `${corner.x}px`;
  handle.style.top = `${corner.y}px`;
}

function initResizeHandle(): void {
  const handle = document.getElementById("canvas-resize-handle");
  const preview = document.getElementById("canvas-resize-preview");
  if (!handle || !preview) return;

  let start: { x: number; y: number; width: number; height: number } | null = null;

  const sizeFor = (e: PointerEvent) => ({
    width: clampCanvasSize(start!.width + (e.clientX - start!.x) / state.zoom),
    height: clampCanvasSize(start!.height + (e.clientY - start!.y) / state.zoom),
  });

  handle.addEventListener("pointerdown", (e) => {
    if (drawing) return;
    e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    start = { x: e.clientX, y: e.clientY, width: canvas.width, height: canvas.height };
  });

  handle.addEventListener("pointermove", (e) => {
    if (!start) return;
    const { width, height } = sizeFor(e);
    const corner = canvasCorner(width, height);
    preview.style.display = "block";
    preview.style.left = "5px";
    preview.style.top = "5px";
    preview.style.width = `${corner.x - 5}px`;
    preview.style.height = `${corner.y - 5}px`;
    updateStatusCoords({ x: width, y: height });
  });

  const finish = (e: PointerEvent) => {
    if (!start) return;
    const { width, height } = sizeFor(e);
    start = null;
    preview.style.display = "none";
    dropSelection();
    resizeCanvas(width, height);
  };
  handle.addEventListener("pointerup", finish);
  handle.addEventListener("pointercancel", (e) => {
    start = null;
    preview.style.display = "none";
    handle.releasePointerCapture(e.pointerId);
  });
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

export function clampCanvasSize(size: number): number {
  return Math.min(MAX_CANVAS_SIZE, Math.max(MIN_CANVAS_SIZE, Math.round(size)));
}

// Keeps the drawing anchored at the top-left corner. Shrinking crops it and
// growing fills the new area with the secondary colour, like MS Paint.
export function resizeCanvas(width: number, height: number): void {
  width = clampCanvasSize(width);
  height = clampCanvasSize(height);
  if (width === canvas.width && height === canvas.height) return;

  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);
  // Setting the size clears the canvas and resets the context
  canvas.width = width;
  canvas.height = height;
  ctx.fillStyle = state.secondaryColour;
  ctx.fillRect(0, 0, width, height);
  ctx.putImageData(image, 0, 0);

  setCanvasSize(width, height);
  saveSnapshot();
}
