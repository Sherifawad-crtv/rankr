import { mockMessages } from "@/lib/mocks/data";
import { simulateLatency } from "@/lib/mocks/latency";
import type { Message } from "@/types";

// TODO(backend): wire to real endpoint
export async function listMessages(threadId: string): Promise<Message[]> {
  return simulateLatency(mockMessages.filter((m) => m.threadId === threadId));
}
