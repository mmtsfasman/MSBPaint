import { DrawTool, Point, AppState } from "../core/types";

const FONT_SIZES = [
  { label: "Small", size: 12 },
  { label: "Medium", size: 20 },
  { label: "Large", size: 32 },
];
const FONT_FAMILY = "sans-serif";

interface TextOverlay {
  container: HTMLDivElement;
  input: HTMLInputElement;
  point: Point;
  ctx: CanvasRenderingContext2D;
  state: AppState;
}

let overlay: TextOverlay | null = null;
let justPlaced = false;
let fontSize = FONT_SIZES[0].size;

export const textTool: DrawTool = {
  name: "text",
  label: "Text",
  icon: "A",

  onPointerDown(ctx: CanvasRenderingContext2D, point: Point, state: AppState): void {
    // Clicking away from an open text box confirms it
    if (overlay) {
      commit();
      return;
    }
    overlay = createOverlay(ctx, point, state);
    justPlaced = true;
  },

  onPointerMove(): void {},

  onPointerUp(): void {
    // Focus after the press so the canvas mousedown doesn't steal it back
    if (justPlaced && overlay) overlay.input.focus();
    justPlaced = false;
  },
};

function createOverlay(
  ctx: CanvasRenderingContext2D,
  point: Point,
  state: AppState
): TextOverlay {
  const container = document.createElement("div");
  container.className = "text-overlay";
  container.style.left = `${point.x}px`;
  container.style.top = `${point.y}px`;

  const input = document.createElement("input");
  input.type = "text";
  input.className = "text-overlay-input";
  input.size = 1;
  input.style.color = state.primaryColour;
  applyFontSize(input);

  const sizePicker = document.createElement("select");
  sizePicker.className = "text-overlay-size";
  sizePicker.title = "Font size";
  for (const option of FONT_SIZES) {
    const el = document.createElement("option");
    el.value = String(option.size);
    el.textContent = option.label;
    el.selected = option.size === fontSize;
    sizePicker.appendChild(el);
  }

  input.addEventListener("input", () => {
    input.size = Math.max(input.value.length, 1);
  });
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") commit();
    else if (e.key === "Escape") cancel();
  });
  sizePicker.addEventListener("change", () => {
    fontSize = Number(sizePicker.value);
    applyFontSize(input);
    input.focus();
  });
  container.addEventListener("focusout", (e) => {
    if (!container.contains(e.relatedTarget as Node | null)) commit();
  });

  container.appendChild(input);
  container.appendChild(sizePicker);
  ctx.canvas.parentElement!.appendChild(container);

  return { container, input, point, ctx, state };
}

function applyFontSize(input: HTMLInputElement): void {
  input.style.font = `${fontSize}px ${FONT_FAMILY}`;
  input.style.height = `${fontSize}px`;
}

function commit(): void {
  if (!overlay) return;
  const { input, point, ctx, state } = overlay;
  const text = input.value;
  close();
  if (!text) return;

  ctx.fillStyle = state.primaryColour;
  ctx.font = `${fontSize}px ${FONT_FAMILY}`;
  ctx.textBaseline = "top";
  ctx.fillText(text, point.x, point.y);
}

function cancel(): void {
  close();
}

function close(): void {
  if (!overlay) return;
  const { container } = overlay;
  // Clear first so the focusout fired by removal doesn't commit again
  overlay = null;
  container.remove();
}
