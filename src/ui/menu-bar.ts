import { clearCanvas, isDrawing, zoomIn, zoomOut, resetZoom, resizeCanvas } from "../core/canvas";
import { state } from "../core/state";
import { exportAsPNG } from "../core/export";
import { dropSelection } from "../tools/selection";
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

  initDropdown("view-menu", handleViewAction);
  initDropdown("image-menu", handleImageAction);
  initAttributesDialog();
}

function initDropdown(id: string, onAction: (action: string | undefined) => void): void {
  const menu = document.getElementById(id);
  if (!menu) return;

  for (const item of menu.querySelectorAll<HTMLButtonElement>(".menu-dropdown-item")) {
    item.addEventListener("click", () => {
      menu.hidden = true;
      onAction(item.dataset.action);
    });
  }

  // Closes on a click anywhere outside this menu, including on another menu
  document.addEventListener("click", (e) => {
    if (!menu.parentElement!.contains(e.target as Node)) menu.hidden = true;
  });
}

function toggleDropdown(id: string): void {
  const menu = document.getElementById(id);
  if (menu) menu.hidden = !menu.hidden;
}

function initAttributesDialog(): void {
  const dialog = document.getElementById("attributes-dialog") as HTMLDialogElement | null;
  if (!dialog) return;
  const form = dialog.querySelector("form")!;

  dialog.addEventListener("close", () => {
    if (dialog.returnValue !== "ok" || isDrawing()) return;
    const width = Number((form.elements.namedItem("width") as HTMLInputElement).value);
    const height = Number((form.elements.namedItem("height") as HTMLInputElement).value);
    if (!width || !height) return;
    resizeCanvas(width, height);
  });
}

function openAttributesDialog(): void {
  const dialog = document.getElementById("attributes-dialog") as HTMLDialogElement | null;
  if (!dialog) return;
  const form = dialog.querySelector("form")!;
  (form.elements.namedItem("width") as HTMLInputElement).value = String(state.canvasWidth);
  (form.elements.namedItem("height") as HTMLInputElement).value = String(state.canvasHeight);
  dialog.returnValue = "";
  // Drop any floating selection so its saved background, sized for the old
  // canvas, cannot be drawn back after the resize
  dropSelection();
  dialog.showModal();
}

function handleImageAction(action: string | undefined): void {
  if (action === "attributes") openAttributesDialog();
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

function handleViewAction(action: string | undefined): void {
  switch (action) {
    case "zoom-in":
      zoomIn();
      break;
    case "zoom-out":
      zoomOut();
      break;
    case "zoom-reset":
      resetZoom();
      break;
  }
}

function handleMenuAction(menu: string | undefined): void {
  switch (menu) {
    case "file":
      // For now, clicking File just saves as PNG
      exportAsPNG();
      break;
    case "edit":
      // For now, clicking Edit clears the canvas. Drop any floating selection
      // first so its saved background cannot bring the cleared pixels back.
      dropSelection();
      clearCanvas();
      break;
    case "undo":
      // Ignore while a stroke is in progress, it would be drawn over the restored image.
      // Drop any floating selection so its saved background cannot overwrite the restored image.
      if (!isDrawing()) {
        dropSelection();
        undo();
      }
      break;
    case "redo":
      if (!isDrawing()) {
        dropSelection();
        redo();
      }
      break;
    case "view":
      toggleDropdown("view-menu");
      break;
    case "image":
      toggleDropdown("image-menu");
      break;
    case "help":
      alert("MSBPaint v0.1.0\n\nA very serious paint application.");
      break;
  }
}
