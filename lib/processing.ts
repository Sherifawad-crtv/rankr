import type { IconName } from "@/components/ui";
import type { MessageKey } from "@/lib/i18n";
import { PROCESSING_STEPS, type ProcessingStep, type UploadedCV } from "@/types";

export interface PipelineStage {
  id: "detect" | "read" | "understand" | "score" | "rank";
  icon: IconName;
  /** The CV step this stage tracks. The final "rank" stage has none. */
  step: ProcessingStep | null;
  tipKeys: MessageKey[];
}

export const PIPELINE_STAGES: PipelineStage[] = [
  { id: "detect", icon: "scan", step: "detecting", tipKeys: ["processing.stage.detect.tip1", "processing.stage.detect.tip2"] },
  { id: "read", icon: "file", step: "reading", tipKeys: ["processing.stage.read.tip1", "processing.stage.read.tip2"] },
  { id: "understand", icon: "brain", step: "parsing", tipKeys: ["processing.stage.understand.tip1", "processing.stage.understand.tip2"] },
  { id: "score", icon: "target", step: "scoring", tipKeys: ["processing.stage.score.tip1", "processing.stage.score.tip2"] },
  { id: "rank", icon: "ranking", step: null, tipKeys: ["processing.stage.rank.tip1"] },
];

/** How many pipeline steps a CV has fully passed (settled CVs count as all four). */
function stepsPassed(file: UploadedCV): number {
  if (file.status === "pending") return 0;
  if (file.status === "processing" && file.step) return PROCESSING_STEPS.indexOf(file.step);
  return PROCESSING_STEPS.length;
}

export function isFinished(files: UploadedCV[]): boolean {
  return files.every((file) => file.status === "done" || file.status === "failed");
}

/** Fraction (0-1) of the batch that has passed each pipeline stage. */
export function stageProgress(files: UploadedCV[]): number[] {
  const total = Math.max(1, files.length);
  const finished = isFinished(files);
  return PIPELINE_STAGES.map((stage, index) => {
    if (stage.step === null) return finished ? 1 : 0;
    return files.filter((file) => stepsPassed(file) > index).length / total;
  });
}

/** Index of the first stage that is not yet complete; PIPELINE_STAGES.length when everything is done. */
export function activeStageIndex(progress: number[]): number {
  const index = progress.findIndex((fraction) => fraction < 1);
  return index === -1 ? PIPELINE_STAGES.length : index;
}
