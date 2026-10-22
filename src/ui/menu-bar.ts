import { clearCanvas, isDrawing } from "../core/canvas";
import { exportAsPNG } from "../core/export";
import { undo, redo } from "../core/history";

// TODO: implement actual dropdown menus instead of direct action on click

export function initMenuBar(): void {
  const menuItems = document.querySelectorAll<HTMLButtonElement>(".menu-item");

  for (const item of menuItems) {
    item.addEventListener("click", () => {
      const menu = item.dataset.menu;
      handleMenuAction(menu);
    });
  }

  document.addEventListener("keydown", onKeyDown);
}

function onKeyDown(e: KeyboardEvent): void {
  if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "z") return;
  e.preventDefault();
  if (e.shiftKey) {
    handleMenuAction("redo");
  } else {
    handleMenuAction("undo");
  }
}

function handleMenuAction(menu: string | undefined): void {
  switch (menu) {
    case "file":
      // For now, clicking File just saves as PNG
      exportAsPNG();
      break;
    case "edit":
      // For now, clicking Edit clears the canvas
      clearCanvas();
      break;
    case "undo":
      // Ignore while a stroke is in progress, it would be drawn over the restored image
      if (!isDrawing()) undo();
      break;
    case "redo":
      if (!isDrawing()) redo();
      break;
    case "view":
      // TODO: zoom controls
      break;
    case "help":
      alert("MSBPaint v0.1.0\n\nA very serious paint application.");
      break;
  }
}
