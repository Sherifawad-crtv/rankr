import type { IconName } from "@/components/ui";
import { PROCESSING_STEPS, type ProcessingStep, type UploadedCV } from "@/types";

export interface PipelineStage {
  id: "detect" | "read" | "understand" | "score" | "rank";
  label: string;
  icon: IconName;
  headline: string;
  tips: string[];
  /** The CV step this stage tracks. The final "rank" stage has none. */
  step: ProcessingStep | null;
}

export const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "detect",
    label: "Check",
    icon: "scan",
    headline: "Checking every file",
    tips: [
      "Telling scanned pages apart from regular PDFs.",
      "Making sure nothing is corrupted or unreadable.",
    ],
    step: "detecting",
  },
  {
    id: "read",
    label: "Read",
    icon: "file",
    headline: "Reading each CV",
    tips: [
      "Arabic, English or a mix. We read them all.",
      "Pulling text out of scanned pages too.",
    ],
    step: "reading",
  },
  {
    id: "understand",
    label: "Understand",
    icon: "brain",
    headline: "Finding skills and experience",
    tips: [
      "ReactJS, React.js and React count as one skill.",
      "Working out real years of experience, without double counting.",
    ],
    step: "parsing",
  },
  {
    id: "score",
    label: "Score",
    icon: "target",
    headline: "Matching against your job",
    tips: [
      "Required skills count the most.",
      "Anyone who misses a hard filter stays visible, with the reason.",
    ],
    step: "scoring",
  },
  {
    id: "rank",
    label: "Rank",
    icon: "ranking",
    headline: "Building your shortlist",
    tips: ["Sorting by best match. You make the final call."],
    step: null,
  },
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
