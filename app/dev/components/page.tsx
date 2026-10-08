"use client";

import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Dialog,
  Icon,
  Input,
  Select,
  Table,
  Tabs,
  Td,
  Textarea,
  Th,
  TierSlider,
  useToast,
} from "@/components/ui";
import type { EnterpriseCvTier } from "@/types";

export default function ComponentGallery() {
  const [tier, setTier] = useState<EnterpriseCvTier>(500);
  const [open, setOpen] = useState(false);
  const toast = useToast();

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 p-4 sm:p-8">
      <h1 className="text-xl font-medium">Component gallery</h1>

      <Card className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Buttons</h2>
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
        <h2 className="text-lg font-medium">Form controls</h2>
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
        <h2 className="text-lg font-medium">Badges</h2>
        <div className="flex flex-wrap gap-2">
          <Badge>Neutral</Badge>
          <Badge tone="primary">Primary</Badge>
          <Badge tone="match">92% match</Badge>
          <Badge tone="warning">Low confidence</Badge>
          <Badge tone="danger">Filtered out</Badge>
        </div>
      </Card>

      <Card className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Tier slider</h2>
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
                      <Badge tone="primary">Reviewing</Badge>
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
