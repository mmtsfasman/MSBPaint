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

## Controls

- **Left click** on a colour swatch to set primary colour
- **Right click** on a colour swatch to set secondary colour
- **File** menu exports as PNG
- **Edit** menu clears the canvas
- **Undo** / **Redo** menu items, or **Ctrl+Z** / **Ctrl+Shift+Z**, step through the last 50 canvas states

## Project structure

```
src/
  core/       — canvas setup, app state, export
  tools/      — one file per drawing tool
  ui/         — toolbar, colour palette, status bar, menus
  styles/     — one CSS file per UI region
  main.ts     — boot sequence
```
