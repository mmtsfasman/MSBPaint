import { AppState, ToolType } from "./types";

type Listener = () => void;

const listeners: Listener[] = [];

export const state: AppState = {
  activeTool: "pencil",
  primaryColour: "#000000",
  secondaryColour: "#ffffff",
  brushSize: 2,
  canvasWidth: 800,
  canvasHeight: 600,
  zoom: 1,
};

export function subscribe(fn: Listener): void {
  listeners.push(fn);
}

export function setTool(tool: ToolType): void {
  state.activeTool = tool;
  notify();
}

export function setPrimaryColour(colour: string): void {
  state.primaryColour = colour;
  notify();
}

export function setSecondaryColour(colour: string): void {
  state.secondaryColour = colour;
  notify();
}

export function setBrushSize(size: number): void {
  state.brushSize = size;
  notify();
}

export function setZoom(zoom: number): void {
  state.zoom = zoom;
  notify();
}

export function setCanvasSize(width: number, height: number): void {
  state.canvasWidth = width;
  state.canvasHeight = height;
  notify();
}

function notify(): void {
  for (const fn of listeners) {
    fn();
  }
}
