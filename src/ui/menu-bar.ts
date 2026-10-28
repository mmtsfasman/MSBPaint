import { clearCanvas, isDrawing, zoomIn, zoomOut, resetZoom } from "../core/canvas";
import { exportAsPNG, exportAsJPEG } from "../core/export";
import { dropSelection } from "../tools/selection";
import { undo, redo } from "../core/history";

export function initMenuBar(): void {
  const groups = document.querySelectorAll<HTMLElement>(".menu-bar .menu-group");

  for (const group of groups) {
    const button = group.querySelector<HTMLButtonElement>(".menu-item");
    const dropdown = group.querySelector<HTMLElement>(".menu-dropdown");
    if (!button || !dropdown) continue;

    button.addEventListener("click", () => {
      const wasOpen = !dropdown.hidden;
      closeAllMenus();
      if (!wasOpen) openMenu(group);
    });

    // While one menu is open, hovering another menu switches to it
    button.addEventListener("mouseenter", () => {
      if (openGroup() && openGroup() !== group) {
        closeAllMenus();
        openMenu(group);
      }
    });

    for (const item of dropdown.querySelectorAll<HTMLButtonElement>(".menu-dropdown-item")) {
      item.addEventListener("click", () => {
        closeAllMenus();
        handleMenuAction(item.dataset.action);
      });
    }

    // Close when focus leaves the menu, e.g. by tabbing away
    group.addEventListener("focusout", (e) => {
      const next = e.relatedTarget as Node | null;
      if (next && !group.contains(next)) closeMenu(group);
    });
  }

  document.addEventListener("click", (e) => {
    if (!(e.target as Element).closest(".menu-group")) closeAllMenus();
  });

  window.addEventListener("blur", closeAllMenus);

  document.addEventListener("keydown", onKeyDown);
}

function openGroup(): HTMLElement | null {
  return document.querySelector<HTMLElement>(".menu-bar .menu-group.open");
}

function openMenu(group: HTMLElement): void {
  const dropdown = group.querySelector<HTMLElement>(".menu-dropdown");
  if (!dropdown) return;
  dropdown.hidden = false;
  group.classList.add("open");
  group.querySelector(".menu-item")?.setAttribute("aria-expanded", "true");
}

function closeMenu(group: HTMLElement): void {
  const dropdown = group.querySelector<HTMLElement>(".menu-dropdown");
  if (dropdown) dropdown.hidden = true;
  group.classList.remove("open");
  group.querySelector(".menu-item")?.setAttribute("aria-expanded", "false");
}

function closeAllMenus(): void {
  for (const group of document.querySelectorAll<HTMLElement>(".menu-bar .menu-group.open")) {
    closeMenu(group);
  }
}

function onKeyDown(e: KeyboardEvent): void {
  if (e.key === "Escape") {
    const group = openGroup();
    if (group) {
      e.preventDefault();
      closeMenu(group);
      group.querySelector<HTMLButtonElement>(".menu-item")?.focus();
    }
    return;
  }

  if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "z") return;
  e.preventDefault();
  if (e.shiftKey) {
    handleMenuAction("redo");
  } else {
    handleMenuAction("undo");
  }
}

function handleMenuAction(action: string | undefined): void {
  switch (action) {
    case "new":
      // Start over: a blank canvas at the default zoom
      dropSelection();
      clearCanvas();
      resetZoom();
      break;
    case "save-png":
      exportAsPNG();
      break;
    case "save-jpeg":
      exportAsJPEG();
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
    case "clear":
      // Drop any floating selection first so its saved background cannot
      // bring the cleared pixels back.
      dropSelection();
      clearCanvas();
      break;
    case "zoom-in":
      zoomIn();
      break;
    case "zoom-out":
      zoomOut();
      break;
    case "zoom-reset":
      resetZoom();
      break;
    case "about":
      alert("MSBPaint v0.1.0\n\nA very serious paint application.");
      break;
  }
}
