import { mockSkills } from "@/lib/mocks/skills";
import { simulateList } from "@/lib/mocks/latency";
import type { Skill } from "@/types";

// TODO(backend): wire to real endpoint. The catalogue holds ~300 canonical skills with
// English and Arabic aliases; search and unknown-skill flagging happen server-side.
export async function listSkills(): Promise<Skill[]> {
  return simulateList(mockSkills);
}
