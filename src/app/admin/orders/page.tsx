import { db } from "@/lib/data";
import { OrdersTable, type OrderRow } from "./OrdersTable";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await db.getOrders();

  const rows: OrderRow[] = orders.map((o) => ({
    id: o.id,
    orderNo: o.orderNo,
    customerName: o.customerName,
    date: o.createdAt.toLocaleDateString("en-MY"),
    totalSen: o.totalSen,
    deliveryMethod: o.deliveryMethod,
    status: o.status,
  }));

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl">Orders</h1>
      <OrdersTable rows={rows} />
    </div>
  );
}
