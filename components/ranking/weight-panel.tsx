"use client";

import { useId } from "react";
import { Button, Card } from "@/components/ui";
import { DIMENSION_LABELS, weightsTotal } from "@/lib/scoring";
import { SCORE_DIMENSIONS, type ScoreDimension, type ScoreWeights } from "@/types";

interface WeightPanelProps {
  weights: ScoreWeights;
  onChange: (dimension: ScoreDimension, value: number) => void;
  onReset: () => void;
}

export function WeightPanel({ weights, onChange, onReset }: WeightPanelProps) {
  const base = useId();
  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium text-text-primary">Scoring weights</h2>
          <p className="text-sm text-text-secondary">
            Adjust what matters most. The list re-ranks instantly and always totals {weightsTotal(weights)}%.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SCORE_DIMENSIONS.map((dimension) => {
          const id = `${base}-${dimension}`;
          return (
            <div key={dimension} className="flex flex-col gap-1">
              <label htmlFor={id} className="flex justify-between text-sm font-medium text-text-primary">
                {DIMENSION_LABELS[dimension]}
                <span className="text-text-secondary">{weights[dimension]}%</span>
              </label>
              <input
                id={id}
                type="range"
                min={0}
                max={100}
                step={1}
                value={weights[dimension]}
                onChange={(event) => onChange(dimension, Number(event.target.value))}
                className="w-full accent-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-focus"
              />
            </div>
          );
        })}
      </div>
    </Card>
  );
}
