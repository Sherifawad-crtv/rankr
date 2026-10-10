import type { Invoice } from "@/types";

export const mockBilling: { renewsAt: string; invoices: Invoice[] } = {
  renewsAt: "2026-11-01T00:00:00Z",
  invoices: [
    { id: "inv-1003", issuedAt: "2026-10-01T00:00:00Z", amount: null, status: "paid" },
    { id: "inv-1002", issuedAt: "2026-09-01T00:00:00Z", amount: null, status: "paid" },
    { id: "inv-1001", issuedAt: "2026-08-01T00:00:00Z", amount: null, status: "paid" },
  ],
};
