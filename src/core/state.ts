import { AppState, DrawButton, ShapeFillMode, ToolType } from "./types";

type Listener = () => void;

const listeners: Listener[] = [];

export const state: AppState = {
  activeTool: "pencil",
  primaryColour: "#000000",
  secondaryColour: "#ffffff",
  brushSize: 2,
  shapeFillMode: "outline",
  canvasWidth: 800,
  canvasHeight: 600,
  zoom: 1,
};

export function drawColour(state: AppState, button: DrawButton): string {
  return button === "secondary" ? state.secondaryColour : state.primaryColour;
}

// The colour a shape is filled with: the other one from the outline
export function fillColour(state: AppState, button: DrawButton): string {
  return button === "secondary" ? state.primaryColour : state.secondaryColour;
}

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

export function setShapeFillMode(mode: ShapeFillMode): void {
  state.shapeFillMode = mode;
  notify();
}

export function setZoom(zoom: number): void {
  state.zoom = zoom;
  notify();
}

function notify(): void {
  for (const fn of listeners) {
    fn();
  }
}
