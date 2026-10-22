import { setTool } from "../core/state";
import { ToolType } from "../core/types";
import { clearCanvas } from "../core/canvas";
import { exportAsPNG } from "../core/export";

// TODO: Ctrl+Z / Ctrl+Shift+Z for undo/redo (needs an undo history stack, #1)
// TODO: Ctrl+A select all, and Delete clearing only the selection (needs a selection tool, #7)

const TOOL_HOTKEYS: Record<string, ToolType> = {
  p: "pencil",
  b: "brush",
  e: "eraser",
  g: "bucket",
  l: "line",
  r: "rectangle",
  o: "ellipse",
  i: "eyedropper",
};

export function initKeyboard(): void {
  document.addEventListener("keydown", onKeyDown);
}

function onKeyDown(e: KeyboardEvent): void {
  if (isTypingTarget(e.target)) return;

  const key = e.key.toLowerCase();

  if (e.ctrlKey || e.metaKey) {
    if (key === "s" && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      exportAsPNG();
    }
    return;
  }

  if (e.altKey) return;

  if (e.key === "Delete") {
    e.preventDefault();
    clearCanvas();
    return;
  }

  const tool = TOOL_HOTKEYS[key];
  if (tool && !e.shiftKey) {
    e.preventDefault();
    setTool(tool);
  }
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement
  );
}
