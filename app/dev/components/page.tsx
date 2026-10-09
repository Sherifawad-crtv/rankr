"use client";

import { useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  ConfidenceIndicator,
  ConfirmDialog,
  DataTable,
  Dialog,
  Disclaimer,
  Icon,
  Input,
  MatchScore,
  Segmented,
  Select,
  Skeleton,
  SkillChip,
  Spinner,
  StatusPill,
  Table,
  Tabs,
  Td,
  Textarea,
  Th,
  TierSlider,
  useToast,
} from "@/components/ui";
import { BrandScope } from "@/components/brand/brand-scope";
import { solarIconNames } from "@/components/ui/icon-names";
import type { BillingCycle, EnterpriseCvTier } from "@/types";

const sampleRows = [
  { id: "1", name: "Ahmed Hassan", score: 87, stage: "Shortlisted" },
  { id: "2", name: "Sara Ali", score: 64, stage: "New" },
  { id: "3", name: "Omar Khaled", score: 41, stage: "New" },
];

export default function ComponentGallery() {
  const [tier, setTier] = useState<EnterpriseCvTier>(500);
  const [open, setOpen] = useState(false);
  const [cycle, setCycle] = useState<BillingCycle>("monthly");
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const toast = useToast();

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 p-4 sm:p-8">
      <h1 className="text-xl font-bold">Component gallery</h1>

      <Card className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-2">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm">
            <Icon name="upload" size={16} /> Upload CV
          </Button>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Motion and feedback</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button
            loading={loading}
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1500);
            }}
          >
            Tap for loading
          </Button>
          <Segmented
            label="Billing cycle"
            value={cycle}
            onChange={setCycle}
            options={[
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly" },
            ]}
          />
          <Spinner className="size-6 text-primary" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Scores, confidence and skills</h2>
        <Disclaimer />
        <div className="flex flex-wrap items-center gap-4">
          <MatchScore value={87} size="sm" />
          <MatchScore value={64} />
          <MatchScore value={41} size="lg" />
          <ConfidenceIndicator level="high" showLabel />
          <ConfidenceIndicator level="medium" showLabel />
          <ConfidenceIndicator level="low" />
          <Avatar name="Sara" size="md" />
        </div>
        <div className="flex flex-wrap gap-2">
          <SkillChip label="React" tier="required" state="matched" />
          <SkillChip label="TypeScript" tier="required" state="missing" />
          <SkillChip label="Docker" state="extra" />
          <SkillChip label="Figma" tier="niceToHave" />
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusPill status="pending" />
          <StatusPill status="processing" step="reading" />
          <StatusPill status="done" />
          <StatusPill status="failed" />
          <StatusPill status="done" duplicate />
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Data table (sort and select)</h2>
        <DataTable
          rows={sampleRows}
          getRowId={(row) => row.id}
          getRowLabel={(row) => row.name}
          defaultSort={{ columnId: "score", direction: "desc" }}
          selectedIds={selected}
          onSelectionChange={setSelected}
          columns={[
            { id: "name", header: "Candidate", cell: (row) => row.name, sortValue: (row) => row.name },
            { id: "score", header: "Score", cell: (row) => <MatchScore value={row.score} size="sm" />, sortValue: (row) => row.score },
            { id: "stage", header: "Stage", cell: (row) => <Badge>{row.stage}</Badge> },
          ]}
        />
        <div>
          <Button variant="danger" size="sm" onClick={() => setConfirmOpen(true)} disabled={selected.length === 0}>
            <Icon name="trash" size={16} /> Reject {selected.length || ""} selected
          </Button>
        </div>
        <ConfirmDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title="Reject selected candidates?"
          description="You decide this, not Rankr. Rejected candidates stay in your list and can be moved back."
          confirmLabel="Reject"
          tone="danger"
          onConfirm={() => new Promise((resolve) => setTimeout(resolve, 800))}
        />
      </Card>

      <BrandScope branding={{ name: "Example Org", logoUrl: null, primaryColor: "#E11D48" }}>
        <Card className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold">White-label scope (organisation brand colour)</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Apply now</Button>
            <Button variant="secondary">Secondary</Button>
            <Badge tone="primary">Primary badge</Badge>
            <MatchScore value={72} size="sm" />
            <Segmented
              label="Demo"
              value="a"
              onChange={() => undefined}
              options={[
                { value: "a", label: "One" },
                { value: "b", label: "Two" },
              ]}
            />
            <Checkbox defaultChecked label="Consent" />
          </div>
        </Card>
      </BrandScope>

      <Card className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Icons (Solar, linear and bold)</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {solarIconNames.map((name) => (
            <div key={name} className="flex flex-col items-center gap-1 text-text-secondary">
              <span className="flex gap-1 text-text-primary">
                <Icon name={name} />
                <Icon name={name} variant="bold" />
              </span>
              <span className="text-sm">{name}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Form controls</h2>
        <Input label="Job title" placeholder="Senior Product Designer" hint="Shown to candidates." />
        <Input label="Email" defaultValue="not-an-email" error="Enter a valid email." />
        <Select label="Location">
          <option>Cairo</option>
          <option>Alexandria</option>
        </Select>
        <Textarea label="Description" />
        <Checkbox label="I consent to processing these CVs." />
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Badges</h2>
        <div className="flex flex-wrap gap-2">
          <Badge>Neutral</Badge>
          <Badge tone="primary">Primary</Badge>
          <Badge tone="match">92% match</Badge>
          <Badge tone="warning">Low confidence</Badge>
          <Badge tone="danger">Filtered out</Badge>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Tier slider</h2>
        <TierSlider value={tier} onChange={setTier} />
      </Card>

      <Tabs
        items={[
          {
            id: "table",
            label: "Table",
            content: (
              <Table>
                <thead>
                  <tr>
                    <Th>Candidate</Th>
                    <Th>Stage</Th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <Td>Candidate One</Td>
                    <Td>
                      <Badge tone="primary">Shortlisted</Badge>
                    </Td>
                  </tr>
                </tbody>
              </Table>
            ),
          },
          {
            id: "overlays",
            label: "Overlays",
            content: (
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setOpen(true)}>
                  Open dialog
                </Button>
                <Button variant="secondary" onClick={() => toast.show("Saved", "match")}>
                  Show toast
                </Button>
              </div>
            ),
          },
        ]}
      />

      <Dialog open={open} onClose={() => setOpen(false)} title="Example dialog">
        <p className="text-text-secondary">Native dialog with focus trap and Esc to close.</p>
      </Dialog>
    </main>
  );
}
