export type ToolType =
  | "pencil"
  | "brush"
  | "eraser"
  | "bucket"
  | "line"
  | "rectangle"
  | "ellipse"
  | "eyedropper"
  | "selection"
  | "text";

export type ShapeFillMode = "outline" | "outline-fill" | "fill";

export interface Point {
  x: number;
  y: number;
}

// Which mouse button is drawing: left draws with the primary colour, right with the secondary
export type DrawButton = "primary" | "secondary";

export interface AppState {
  activeTool: ToolType;
  primaryColour: string;
  secondaryColour: string;
  brushSize: number;
  shapeFillMode: ShapeFillMode;
  canvasWidth: number;
  canvasHeight: number;
  zoom: number;
}

export interface DrawTool {
  name: ToolType;
  label: string;
  icon: string;
  onPointerDown(ctx: CanvasRenderingContext2D, point: Point, state: AppState, button: DrawButton): void;
  onPointerMove(ctx: CanvasRenderingContext2D, point: Point, state: AppState, button: DrawButton): void;
  onPointerUp(ctx: CanvasRenderingContext2D, point: Point, state: AppState, button: DrawButton): void;
}
