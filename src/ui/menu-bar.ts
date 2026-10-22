import { clearCanvas } from "../core/canvas";
import { exportAsPNG } from "../core/export";
import { dropSelection } from "../tools/selection";

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
    case "view":
      // TODO: zoom controls
      break;
    case "help":
      alert("MSBPaint v0.1.0\n\nA very serious paint application.");
      break;
  }
}
