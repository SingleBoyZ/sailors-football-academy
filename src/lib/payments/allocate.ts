/**
 * Pure payment-allocation math, shared by the Prisma-backed data layer, the
 * Billplz webhook handler and the dev-only mock payment gateway so they all
 * apply money to invoices identically. Registration invoices settle before
 * monthly fees regardless of date, then oldest period first — a Payment can
 * span more than one Invoice (e.g. registration + first month paid
 * together).
 */

export type AllocatableInvoice = {
  id: string;
  type: string;
  periodMonth: number;
  periodYear: number;
  amountDue: number;
  amountPaid: number;
};

export type Allocation = {
  invoiceId: string;
  amountSen: number;
};

export type InvoiceUpdate = {
  invoiceId: string;
  amountPaid: number;
  status: "OPEN" | "PARTIAL" | "SETTLED";
};

export type AllocationResult = {
  allocations: Allocation[];
  invoiceUpdates: InvoiceUpdate[];
  remainingSen: number;
};

/**
 * Distributes `amountSen` across `invoices` (only those not already
 * SETTLED) oldest-first, registration ahead of monthly fees. Returns the
 * PaymentAllocation rows to create and the Invoice rows to update — callers
 * persist these however fits their storage (a Prisma transaction, or an
 * in-memory array mutation).
 */
export function allocateAmountToInvoices(
  invoices: AllocatableInvoice[],
  amountSen: number,
): AllocationResult {
  const sorted = [...invoices].sort((a, b) => {
    if (a.type === b.type) {
      if (a.periodYear !== b.periodYear) return a.periodYear - b.periodYear;
      return a.periodMonth - b.periodMonth;
    }
    return a.type === "REGISTRATION" ? -1 : b.type === "REGISTRATION" ? 1 : 0;
  });

  let remaining = amountSen;
  const allocations: Allocation[] = [];
  const invoiceUpdates: InvoiceUpdate[] = [];

  for (const invoice of sorted) {
    if (remaining <= 0) break;
    const owed = invoice.amountDue - invoice.amountPaid;
    if (owed <= 0) continue;

    const applied = Math.min(owed, remaining);
    remaining -= applied;

    allocations.push({ invoiceId: invoice.id, amountSen: applied });

    const newAmountPaid = invoice.amountPaid + applied;
    invoiceUpdates.push({
      invoiceId: invoice.id,
      amountPaid: newAmountPaid,
      status: newAmountPaid >= invoice.amountDue ? "SETTLED" : "PARTIAL",
    });
  }

  return { allocations, invoiceUpdates, remainingSen: remaining };
}

/** Outstanding balance (sen) across every not-yet-settled invoice. */
export function outstandingForInvoices(invoices: AllocatableInvoice[]): number {
  return invoices.reduce((sum, inv) => (inv.amountDue > inv.amountPaid ? sum + (inv.amountDue - inv.amountPaid) : sum), 0);
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function invoiceDescription(type: string, periodMonth: number, periodYear: number): string {
  if (type === "REGISTRATION") return "Registration Fee";
  return `Monthly Fee — ${MONTH_NAMES[periodMonth - 1]} ${periodYear}`;
}
