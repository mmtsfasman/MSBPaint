import { clearCanvas, zoomIn, zoomOut, resetZoom } from "../core/canvas";
import { exportAsPNG } from "../core/export";

// TODO: implement actual dropdown menus instead of direct action on click
// TODO: implement Edit > Undo / Redo (needs an undo history stack)

export function initMenuBar(): void {
  const menuItems = document.querySelectorAll<HTMLButtonElement>(".menu-item");

  for (const item of menuItems) {
    item.addEventListener("click", () => {
      const menu = item.dataset.menu;
      handleMenuAction(menu);
    });
  }

  const viewMenu = document.getElementById("view-menu");
  if (!viewMenu) return;

  for (const item of viewMenu.querySelectorAll<HTMLButtonElement>(".menu-dropdown-item")) {
    item.addEventListener("click", () => {
      viewMenu.hidden = true;
      handleViewAction(item.dataset.action);
    });
  }

  document.addEventListener("click", (e) => {
    if (!(e.target as Element).closest(".menu-group")) viewMenu.hidden = true;
  });
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
      // For now, clicking Edit clears the canvas
      clearCanvas();
      break;
    case "view": {
      const viewMenu = document.getElementById("view-menu");
      if (viewMenu) viewMenu.hidden = !viewMenu.hidden;
      break;
    }
    case "help":
      alert("MSBPaint v0.1.0\n\nA very serious paint application.");
      break;
  }
}
