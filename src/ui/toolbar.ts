import { state, setTool, setBrushSize, setShapeFillMode, subscribe } from "../core/state";
import { ShapeFillMode } from "../core/types";
import { getAllTools } from "../tools/registry";

const BRUSH_SIZES = [1, 2, 4, 8];

const SHAPE_FILL_MODES: { mode: ShapeFillMode; label: string }[] = [
  { mode: "outline", label: "Outline" },
  { mode: "outline-fill", label: "Outline and fill" },
  { mode: "fill", label: "Fill" },
];

export function initToolbar(): void {
  const container = document.getElementById("toolbar")!;
  render(container);
  subscribe(() => render(container));
}

function render(container: HTMLElement): void {
  container.innerHTML = "";

  for (const tool of getAllTools()) {
    const btn = document.createElement("button");
    btn.className = "tool-button" + (state.activeTool === tool.name ? " active" : "");
    btn.title = tool.label;
    btn.textContent = tool.icon;
    btn.addEventListener("click", () => setTool(tool.name));
    container.appendChild(btn);
  }

  const sizeContainer = document.createElement("div");
  sizeContainer.className = "brush-size-picker";

  for (const size of BRUSH_SIZES) {
    const btn = document.createElement("button");
    btn.className = "brush-size-option" + (state.brushSize === size ? " active" : "");
    btn.title = `${size}px`;

    const dot = document.createElement("span");
    dot.className = "brush-size-dot";
    dot.style.width = `${Math.min(size, 12)}px`;
    dot.style.height = `${Math.min(size, 12)}px`;
    btn.appendChild(dot);

    btn.addEventListener("click", () => setBrushSize(size));
    sizeContainer.appendChild(btn);
  }

  container.appendChild(sizeContainer);

  if (state.activeTool === "rectangle" || state.activeTool === "ellipse") {
    const modeContainer = document.createElement("div");
    modeContainer.className = "shape-fill-picker";

    for (const { mode, label } of SHAPE_FILL_MODES) {
      const btn = document.createElement("button");
      btn.className = "shape-fill-option" + (state.shapeFillMode === mode ? " active" : "");
      btn.title = label;

      const swatch = document.createElement("span");
      swatch.className = `shape-fill-swatch shape-fill-${mode}`;
      btn.appendChild(swatch);

      btn.addEventListener("click", () => setShapeFillMode(mode));
      modeContainer.appendChild(btn);
    }

    container.appendChild(modeContainer);
  }
}
