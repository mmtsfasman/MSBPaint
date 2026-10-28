# MSBPaint

A silly MS Paint clone. Very serious software.

## Getting started

```
npm install
npm run dev
```

Then open http://localhost:5173.

## Tools

- Pencil — freehand 1px drawing
- Brush — freehand drawing with configurable size
- Eraser — erases to the secondary colour
- Fill bucket — flood fill
- Line — click and drag to draw a line
- Rectangle — click and drag to draw a rectangle outline
- Ellipse — click and drag to draw an ellipse outline
- Eyedropper — pick a colour from the canvas
- Select — drag to select a region, drag inside it to move it, Ctrl+C / Ctrl+V to copy and paste, Delete to clear it to the secondary colour (on a moved or pasted selection, Delete removes the floating pixels and leaves what was underneath)
- Text — click to place text, pick a size, press Enter or click away to stamp it

## Controls

- **Left click** on a colour swatch to set primary colour
- **Right click** on a colour swatch to set secondary colour
- **Right drag** on the canvas draws with the secondary colour (the eyedropper picks into the secondary colour)
- **File** menu exports as PNG
- **Edit** menu clears the canvas
- **Undo** / **Redo** menu items, or **Ctrl+Z** / **Ctrl+Shift+Z**, step through the last 50 canvas states
- **Image** menu > **Attributes...** sets the canvas width and height (1 to 4096 px)
- Drag the handle on the bottom-right corner of the canvas to resize it. Resizing keeps the drawing anchored at the top-left, crops it when shrinking and fills new space with the secondary colour; undo restores the previous size
- **View** menu zooms in, zooms out or resets zoom (the zoom level is shown in the status bar)
- **Ctrl + scroll wheel** over the canvas zooms in and out

## Keyboard shortcuts

- **P** pencil, **B** brush, **E** eraser, **G** fill bucket, **L** line, **R** rectangle, **O** ellipse, **I** eyedropper
- **Ctrl+S** (or **Cmd+S**) exports as PNG
- **Delete** clears the canvas

## Project structure

```
src/
  core/       — canvas setup, app state, export
  tools/      — one file per drawing tool
  ui/         — toolbar, colour palette, status bar, menus
  styles/     — one CSS file per UI region
  main.ts     — boot sequence
```
