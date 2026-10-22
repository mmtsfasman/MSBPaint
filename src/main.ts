import { registerAllTools } from "./tools/registry";
import { initCanvas } from "./core/canvas";
import { initToolbar } from "./ui/toolbar";
import { initColourPalette } from "./ui/colour-palette";
import { initStatusBar } from "./ui/status-bar";
import { initMenuBar } from "./ui/menu-bar";
import { initSelection } from "./tools/selection";
import { initKeyboard } from "./ui/keyboard";

function boot(): void {
  registerAllTools();
  initCanvas();
  initSelection();
  initToolbar();
  initColourPalette();
  initStatusBar();
  initMenuBar();
  initKeyboard();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}
