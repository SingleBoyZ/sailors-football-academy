import { describe, expect, it } from "vitest";
import { allocateAmountToInvoices, outstandingForInvoices, invoiceDescription, type AllocatableInvoice } from "./allocate";

const invoices: AllocatableInvoice[] = [
  { id: "reg", type: "REGISTRATION", periodMonth: 6, periodYear: 2026, amountDue: 17_000, amountPaid: 0 },
  { id: "jun", type: "MONTHLY_FEE", periodMonth: 6, periodYear: 2026, amountDue: 21_000, amountPaid: 0 },
  { id: "jul", type: "MONTHLY_FEE", periodMonth: 7, periodYear: 2026, amountDue: 21_000, amountPaid: 0 },
];

describe("allocateAmountToInvoices", () => {
  it("settles registration before monthly fees regardless of date", () => {
    const result = allocateAmountToInvoices(invoices, 17_000);
    expect(result.allocations).toEqual([{ invoiceId: "reg", amountSen: 17_000 }]);
    expect(result.invoiceUpdates).toEqual([{ invoiceId: "reg", amountPaid: 17_000, status: "SETTLED" }]);
    expect(result.remainingSen).toBe(0);
  });

  it("spills over into the earliest open monthly invoice once registration is covered", () => {
    const result = allocateAmountToInvoices(invoices, 17_000 + 10_000);
    expect(result.allocations).toEqual([
      { invoiceId: "reg", amountSen: 17_000 },
      { invoiceId: "jun", amountSen: 10_000 },
    ]);
    expect(result.invoiceUpdates[1]).toEqual({ invoiceId: "jun", amountPaid: 10_000, status: "PARTIAL" });
  });

  it("marks an invoice PARTIAL when only part of it is covered", () => {
    const partial: AllocatableInvoice[] = [{ id: "jun", type: "MONTHLY_FEE", periodMonth: 6, periodYear: 2026, amountDue: 21_000, amountPaid: 0 }];
    const result = allocateAmountToInvoices(partial, 15_000);
    expect(result.invoiceUpdates).toEqual([{ invoiceId: "jun", amountPaid: 15_000, status: "PARTIAL" }]);
    expect(result.remainingSen).toBe(0);
  });

  it("skips invoices already SETTLED and applies to the next open one", () => {
    const mixed: AllocatableInvoice[] = [
      { id: "jun", type: "MONTHLY_FEE", periodMonth: 6, periodYear: 2026, amountDue: 21_000, amountPaid: 21_000 },
      { id: "jul", type: "MONTHLY_FEE", periodMonth: 7, periodYear: 2026, amountDue: 21_000, amountPaid: 0 },
    ];
    const result = allocateAmountToInvoices(mixed, 5_000);
    expect(result.allocations).toEqual([{ invoiceId: "jul", amountSen: 5_000 }]);
  });

  it("carries unapplied money forward as remainingSen when it exceeds total owed", () => {
    const single: AllocatableInvoice[] = [{ id: "jun", type: "MONTHLY_FEE", periodMonth: 6, periodYear: 2026, amountDue: 21_000, amountPaid: 0 }];
    const result = allocateAmountToInvoices(single, 30_000);
    expect(result.remainingSen).toBe(9_000);
    expect(result.invoiceUpdates).toEqual([{ invoiceId: "jun", amountPaid: 21_000, status: "SETTLED" }]);
  });

  it("orders monthly invoices earliest period first when registration is already settled", () => {
    const monthlyOnly: AllocatableInvoice[] = [
      { id: "aug", type: "MONTHLY_FEE", periodMonth: 8, periodYear: 2026, amountDue: 21_000, amountPaid: 0 },
      { id: "jun", type: "MONTHLY_FEE", periodMonth: 6, periodYear: 2026, amountDue: 21_000, amountPaid: 0 },
      { id: "jul", type: "MONTHLY_FEE", periodMonth: 7, periodYear: 2026, amountDue: 21_000, amountPaid: 0 },
    ];
    const result = allocateAmountToInvoices(monthlyOnly, 21_000);
    expect(result.allocations).toEqual([{ invoiceId: "jun", amountSen: 21_000 }]);
  });
});

describe("outstandingForInvoices", () => {
  it("sums amountDue minus amountPaid across invoices", () => {
    expect(outstandingForInvoices(invoices)).toBe(17_000 + 21_000 + 21_000);
  });

  it("ignores overpaid rows (never goes negative per-invoice)", () => {
    const overpaid: AllocatableInvoice[] = [{ id: "x", type: "MONTHLY_FEE", periodMonth: 1, periodYear: 2026, amountDue: 100, amountPaid: 150 }];
    expect(outstandingForInvoices(overpaid)).toBe(0);
  });
});

describe("invoiceDescription", () => {
  it("labels registration invoices without a period", () => {
    expect(invoiceDescription("REGISTRATION", 6, 2026)).toBe("Registration Fee");
  });

  it("labels monthly invoices with month name and year", () => {
    expect(invoiceDescription("MONTHLY_FEE", 6, 2026)).toBe("Monthly Fee — June 2026");
  });
});
