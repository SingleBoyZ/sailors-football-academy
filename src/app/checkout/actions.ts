"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createBill } from "@/lib/billplz";
import { generateOrderNo } from "@/lib/codes";
import { getSetting } from "@/lib/settings";
import { checkoutSchema, type CheckoutInput } from "@/lib/validations/checkout";
import { SITE } from "@/content/site";

export type CheckoutResult = { error: string };

export async function createCheckoutOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid checkout details" };
  }
  const data = parsed.data;

  // Re-fetch variants and prices server-side — the client-computed cart total is never trusted.
  const variantIds = data.items.map((i) => i.variantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });

  if (variants.length !== variantIds.length) {
    return { error: "One or more items in your cart are no longer available." };
  }

  for (const item of data.items) {
    const variant = variants.find((v) => v.id === item.variantId);
    if (!variant || !variant.product.active) {
      return { error: "One or more items in your cart are no longer available." };
    }
    if (variant.stock < item.qty) {
      return { error: `Only ${variant.stock} left of "${variant.product.name} (${variant.label})".` };
    }
  }

  const subtotalSen = data.items.reduce((sum, item) => {
    const variant = variants.find((v) => v.id === item.variantId)!;
    const unitPrice = variant.priceOverrideSen ?? variant.product.priceSen;
    return sum + unitPrice * item.qty;
  }, 0);

  const shippingSen =
    data.deliveryMethod === "DELIVERY" ? await getSetting("shippingSen", 800) : 0;
  const totalSen = subtotalSen + shippingSen;

  const collectionId = process.env.BILLPLZ_COLLECTION_ID_STORE;
  if (!collectionId) {
    return { error: "Store payments are not configured yet. Please contact the academy directly." };
  }

  const orderNo = generateOrderNo();

  const order = await prisma.order.create({
    data: {
      orderNo,
      customerName: data.customerName,
      email: data.email,
      phone: data.phone,
      deliveryMethod: data.deliveryMethod,
      address: data.deliveryMethod === "DELIVERY" ? data.address : undefined,
      subtotalSen,
      shippingSen,
      totalSen,
      status: "PENDING",
      items: {
        create: data.items.map((item) => {
          const variant = variants.find((v) => v.id === item.variantId)!;
          return {
            variantId: variant.id,
            productName: variant.product.name,
            variantLabel: variant.label,
            qty: item.qty,
            unitPriceSen: variant.priceOverrideSen ?? variant.product.priceSen,
          };
        }),
      },
    },
  });

  let bill;
  try {
    bill = await createBill({
      collectionId,
      email: data.email,
      name: data.customerName,
      amountSen: totalSen,
      description: `Sailors FA store order ${orderNo}`,
      callbackUrl: `${SITE.url}/api/billplz/callback`,
      redirectUrl: `${SITE.url}/checkout/success`,
      referenceLabel: "Order No",
      referenceValue: orderNo,
    });
  } catch (error) {
    console.error("createCheckoutOrder: Billplz bill creation failed", error);
    return { error: "Could not start payment. Please try again in a moment." };
  }

  await prisma.$transaction([
    prisma.order.update({
      where: { id: order.id },
      data: { billplzBillId: bill.id, billplzUrl: bill.url },
    }),
    prisma.payment.create({
      data: {
        orderId: order.id,
        type: "STORE_ORDER",
        amount: totalSen,
        status: "PENDING",
        billplzBillId: bill.id,
        billplzUrl: bill.url,
        payerName: data.customerName,
        payerEmail: data.email,
      },
    }),
  ]);

  redirect(bill.url);
}
