import { state, subscribe } from "../core/state";

export function initStatusBar(): void {
  update();
  subscribe(update);
}

function update(): void {
  const dims = document.getElementById("status-dimensions");
  if (dims) dims.textContent = `${state.canvasWidth} x ${state.canvasHeight}`;

  const tool = document.getElementById("status-tool");
  if (tool) tool.textContent = state.activeTool;

  const zoom = document.getElementById("status-zoom");
  if (zoom) zoom.textContent = `${Math.round(state.zoom * 100)}%`;
}
