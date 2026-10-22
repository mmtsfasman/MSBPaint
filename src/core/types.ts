export type ToolType =
  | "pencil"
  | "brush"
  | "eraser"
  | "bucket"
  | "line"
  | "rectangle"
  | "ellipse"
  | "eyedropper";

export interface Point {
  x: number;
  y: number;
}

export interface AppState {
  activeTool: ToolType;
  primaryColour: string;
  secondaryColour: string;
  brushSize: number;
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
}

export interface DrawTool {
  name: ToolType;
  label: string;
  icon: string;
  onPointerDown(ctx: CanvasRenderingContext2D, point: Point, state: AppState): void;
  onPointerMove(ctx: CanvasRenderingContext2D, point: Point, state: AppState): void;
  onPointerUp(ctx: CanvasRenderingContext2D, point: Point, state: AppState): void;
}
