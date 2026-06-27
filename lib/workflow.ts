import type { WorkflowState } from "@/types/photo";

const transitions: Record<WorkflowState, WorkflowState[]> = {
  landing: ["method"],
  method: ["landing", "camera-permission", "upload"],
  "camera-permission": ["method", "camera", "upload", "error"],
  camera: ["method", "customize", "error"],
  upload: ["method", "customize"],
  customize: ["method", "printing"],
  printing: ["result"],
  result: ["landing", "customize", "cutting"],
  cutting: ["result", "landing", "customize"],
  error: ["method", "upload", "camera-permission", "landing"],
};

export function canTransition(from: WorkflowState, to: WorkflowState): boolean {
  return transitions[from].includes(to);
}
