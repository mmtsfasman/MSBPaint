import { DrawTool, Point, AppState, DrawButton } from "../core/types";
import { state, subscribe } from "../core/state";
import { saveSnapshot } from "../core/history";

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

let selection: Rect | null = null;
// Pixels lifted off the canvas (or pasted) that follow the selection while it moves
let floating: ImageData | null = null;
// Canvas contents underneath the floating pixels
let base: ImageData | null = null;
let clipboard: ImageData | null = null;

let mode: "select" | "move" | null = null;
let startPoint: Point | null = null;
let moveOffset: Point = { x: 0, y: 0 };

let marquee: HTMLDivElement | null = null;

export const selectionTool: DrawTool = {
  name: "selection",
  label: "Select",
  icon: "⬚",

  onPointerDown(ctx: CanvasRenderingContext2D, point: Point, state: AppState): void {
    if (selection && contains(selection, point)) {
      if (!floating) lift(ctx, selection, state);
      mode = "move";
      moveOffset = { x: point.x - selection.x, y: point.y - selection.y };
      return;
    }

    // Clicking outside drops the current selection where it is
    dropSelection();
    mode = "select";
    startPoint = point;
  },

  onPointerMove(ctx: CanvasRenderingContext2D, point: Point): void {
    if (mode === "select" && startPoint) {
      selection = clampToCanvas(ctx, rectFromPoints(startPoint, point));
      updateMarquee();
    } else if (mode === "move" && selection && floating && base) {
      selection = { ...selection, x: point.x - moveOffset.x, y: point.y - moveOffset.y };
      ctx.putImageData(base, 0, 0);
      ctx.putImageData(floating, selection.x, selection.y);
      updateMarquee();
    }
  },

  onPointerUp(ctx: CanvasRenderingContext2D, point: Point, state: AppState, button: DrawButton): void {
    selectionTool.onPointerMove(ctx, point, state, button);
    if (mode === "select" && selection && (selection.w === 0 || selection.h === 0)) {
      dropSelection();
    }
    mode = null;
    startPoint = null;
  },
};

export function initSelection(): void {
  const canvas = document.getElementById("paint-canvas") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;

  marquee = document.createElement("div");
  marquee.className = "selection-marquee";
  canvas.parentElement!.appendChild(marquee);

  document.addEventListener("keydown", (e) => onKeyDown(e, ctx));

  subscribe(() => {
    if (state.activeTool !== "selection") dropSelection();
  });
}

function onKeyDown(e: KeyboardEvent, ctx: CanvasRenderingContext2D): void {
  if (state.activeTool !== "selection") return;
  const key = e.key.toLowerCase();
  const ctrl = e.ctrlKey || e.metaKey;

  if (ctrl && key === "c" && selection && selection.w > 0 && selection.h > 0) {
    e.preventDefault();
    clipboard = floating ?? ctx.getImageData(selection.x, selection.y, selection.w, selection.h);
  } else if (ctrl && key === "v" && clipboard) {
    e.preventDefault();
    paste(ctx, clipboard);
  } else if (key === "delete" && selection) {
    e.preventDefault();
    if (floating && base) {
      ctx.putImageData(base, 0, 0);
    } else {
      ctx.fillStyle = state.secondaryColour;
      ctx.fillRect(selection.x, selection.y, selection.w, selection.h);
    }
    dropSelection();
    saveSnapshot();
  }
}

// Pastes at the top-left corner, like MS Paint, as a selection ready to be moved
function paste(ctx: CanvasRenderingContext2D, image: ImageData): void {
  dropSelection();
  base = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  floating = image;
  selection = { x: 0, y: 0, w: image.width, h: image.height };
  ctx.putImageData(floating, selection.x, selection.y);
  updateMarquee();
  saveSnapshot();
}

// Cuts the selected pixels out, leaving the secondary colour behind
function lift(ctx: CanvasRenderingContext2D, rect: Rect, state: AppState): void {
  floating = ctx.getImageData(rect.x, rect.y, rect.w, rect.h);
  ctx.fillStyle = state.secondaryColour;
  ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
  base = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.putImageData(floating, rect.x, rect.y);
}

// The floating pixels are already drawn on the canvas, so dropping just forgets them
export function dropSelection(): void {
  selection = null;
  floating = null;
  base = null;
  updateMarquee();
}

function updateMarquee(): void {
  if (!marquee) return;
  if (!selection) {
    marquee.style.display = "none";
    return;
  }
  marquee.style.display = "block";
  marquee.style.left = `${selection.x}px`;
  marquee.style.top = `${selection.y}px`;
  marquee.style.width = `${selection.w}px`;
  marquee.style.height = `${selection.h}px`;
}

function rectFromPoints(a: Point, b: Point): Rect {
  return {
    x: Math.min(a.x, b.x),
    y: Math.min(a.y, b.y),
    w: Math.abs(b.x - a.x),
    h: Math.abs(b.y - a.y),
  };
}

function clampToCanvas(ctx: CanvasRenderingContext2D, rect: Rect): Rect {
  const x = Math.max(0, rect.x);
  const y = Math.max(0, rect.y);
  const right = Math.min(ctx.canvas.width, rect.x + rect.w);
  const bottom = Math.min(ctx.canvas.height, rect.y + rect.h);
  return { x, y, w: Math.max(0, right - x), h: Math.max(0, bottom - y) };
}

function contains(rect: Rect, point: Point): boolean {
  return (
    point.x >= rect.x &&
    point.x < rect.x + rect.w &&
    point.y >= rect.y &&
    point.y < rect.y + rect.h
  );
}
