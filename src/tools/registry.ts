import { DrawTool, ToolType } from "../core/types";
import { state } from "../core/state";
import { pencilTool } from "./pencil";
import { brushTool } from "./brush";
import { eraserTool } from "./eraser";
import { bucketTool } from "./bucket";
import { lineTool } from "./line";
import { rectangleTool } from "./rectangle";
import { ellipseTool } from "./ellipse";
import { eyedropperTool } from "./eyedropper";
import { selectionTool } from "./selection";
import { textTool } from "./text";

const tools: Map<ToolType, DrawTool> = new Map();

export function registerAllTools(): void {
  const allTools: DrawTool[] = [
    pencilTool,
    brushTool,
    eraserTool,
    bucketTool,
    lineTool,
    rectangleTool,
    ellipseTool,
    eyedropperTool,
    selectionTool,
    textTool,
  ];

  for (const tool of allTools) {
    tools.set(tool.name, tool);
  }
}

export function getActiveTool(): DrawTool {
  return tools.get(state.activeTool)!;
}

export function getAllTools(): DrawTool[] {
  return Array.from(tools.values());
}
