import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { MarkFulfilledButton } from "@/components/admin/MarkFulfilledButton";
import { formatSenCompact } from "@/lib/money";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) notFound();

  const address = order.address as { line1: string; line2?: string; city: string; state: string; postcode: string } | null;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">{order.orderNo}</h1>
          <p className="text-brand-muted text-sm">{order.createdAt.toLocaleDateString("en-MY")}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          {order.status === "PAID" && <MarkFulfilledButton orderId={order.id} />}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="bg-brand-white border border-brand-ink/10 p-5">
          <h2 className="font-display mb-3 text-lg">Customer</h2>
          <p className="text-sm font-semibold">{order.customerName}</p>
          <p className="text-brand-muted text-sm">{order.email}</p>
          <p className="text-brand-muted text-sm">{order.phone}</p>
        </section>

        <section className="bg-brand-white border border-brand-ink/10 p-5">
          <h2 className="font-display mb-3 text-lg">Delivery</h2>
          <p className="text-sm font-semibold">{order.deliveryMethod === "PICKUP" ? "Pickup at FootballHub Rimbayu" : "Delivery"}</p>
          {address && (
            <p className="text-brand-muted mt-1 text-sm">
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} {address.postcode}
            </p>
          )}
        </section>
      </div>

      <section className="bg-brand-white border border-brand-ink/10 p-5">
        <h2 className="font-display mb-4 text-lg">Items</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-brand-muted border-b border-brand-ink/10 text-left">
              <th className="py-2 font-normal">Product</th>
              <th className="py-2 font-normal">Qty</th>
              <th className="py-2 font-normal">Unit Price</th>
              <th className="py-2 font-normal">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-brand-ink/5">
                <td className="py-2">{item.productName} — {item.variantLabel}</td>
                <td className="py-2">{item.qty}</td>
                <td className="py-2">{formatSenCompact(item.unitPriceSen)}</td>
                <td className="py-2">{formatSenCompact(item.unitPriceSen * item.qty)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex flex-col items-end gap-1 text-sm">
          <div className="flex w-48 justify-between"><span className="text-brand-muted">Subtotal</span><span>{formatSenCompact(order.subtotalSen)}</span></div>
          <div className="flex w-48 justify-between"><span className="text-brand-muted">Shipping</span><span>{formatSenCompact(order.shippingSen)}</span></div>
          <div className="font-display flex w-48 justify-between text-lg"><span>Total</span><span>{formatSenCompact(order.totalSen)}</span></div>
        </div>
      </section>
    </div>
  );
}
