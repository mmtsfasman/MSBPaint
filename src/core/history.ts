import { getContext } from "./canvas";
import { setCanvasSize } from "./state";

const MAX_STATES = 50;

// A linear undo history: `entries[index]` is the current state, everything
// before it can be undone to and everything after it can be redone to.
export class History<T> {
  private entries: T[] = [];
  private index = -1;
  private readonly maxStates: number;

  constructor(maxStates: number) {
    this.maxStates = maxStates;
  }

  push(entry: T): void {
    // A new action discards anything that could have been redone
    this.entries.splice(this.index + 1);
    this.entries.push(entry);
    if (this.entries.length > this.maxStates) this.entries.shift();
    this.index = this.entries.length - 1;
  }

  undo(): T | undefined {
    if (!this.canUndo()) return undefined;
    this.index--;
    return this.entries[this.index];
  }

  redo(): T | undefined {
    if (!this.canRedo()) return undefined;
    this.index++;
    return this.entries[this.index];
  }

  canUndo(): boolean {
    return this.index > 0;
  }

  canRedo(): boolean {
    return this.index < this.entries.length - 1;
  }
}

const history = new History<ImageData>(MAX_STATES);

export function saveSnapshot(): void {
  const ctx = getContext();
  history.push(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height));
}

export function undo(): void {
  const snapshot = history.undo();
  if (snapshot) restore(snapshot);
}

export function redo(): void {
  const snapshot = history.redo();
  if (snapshot) restore(snapshot);
}

// A snapshot taken before a resize has the old dimensions, so the canvas
// takes them back before the pixels are restored
function restore(snapshot: ImageData): void {
  const ctx = getContext();
  if (ctx.canvas.width !== snapshot.width || ctx.canvas.height !== snapshot.height) {
    ctx.canvas.width = snapshot.width;
    ctx.canvas.height = snapshot.height;
    setCanvasSize(snapshot.width, snapshot.height);
  }
  ctx.putImageData(snapshot, 0, 0);
}
