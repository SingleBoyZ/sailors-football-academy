"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import { useCart, cartTotalSen } from "@/store/cart";
import { formatSenCompact } from "@/lib/money";
import { checkoutSchema } from "@/lib/validations/checkout";
import { createCheckoutOrder } from "./actions";
import { MALAYSIA_STATES } from "@/content/malaysia-states";
import { PageHeader } from "@/components/ui/PageHeader";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";
import { TransitionLink } from "@/components/motion/TransitionLink";

const SHIPPING_SEN_ESTIMATE = 800;

export default function CheckoutPage() {
  const items = useCart((s) => s.items);
  const subtotal = cartTotalSen(items);

  const [deliveryMethod, setDeliveryMethod] = useState<"DELIVERY" | "PICKUP">("PICKUP");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shipping = deliveryMethod === "DELIVERY" ? SHIPPING_SEN_ESTIMATE : 0;
  const total = subtotal + shipping;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const input = {
      customerName: String(formData.get("customerName") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      deliveryMethod,
      address:
        deliveryMethod === "DELIVERY"
          ? {
              line1: String(formData.get("line1") ?? ""),
              line2: String(formData.get("line2") ?? "") || undefined,
              city: String(formData.get("city") ?? ""),
              state: String(formData.get("state") ?? ""),
              postcode: String(formData.get("postcode") ?? ""),
            }
          : undefined,
      items: items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
    };

    const parsed = checkoutSchema.safeParse(input);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check the form for errors.");
      return;
    }

    setSubmitting(true);
    const result = await createCheckoutOrder(parsed.data);
    // A successful call redirects server-side and never returns here.
    if (result && "error" in result) {
      setError(result.error);
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <>
        <PageHeader eyebrow="Checkout" title="Your Bag Is Empty" />
        <Container className="py-16 text-center">
          <Button href="/store">Browse the Store</Button>
        </Container>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Checkout" title="Complete Your Order" />
      <section className="py-16 sm:py-24">
        <Container className="grid gap-12 lg:grid-cols-12">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 lg:col-span-7">
            <div>
              <h2 className="font-display mb-4 text-xl">Your Details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full Name" name="customerName" required />
                <Field label="Email" name="email" type="email" required />
                <Field label="Phone (e.g. 012-3456789)" name="phone" required className="sm:col-span-2" />
              </div>
            </div>

            <div>
              <h2 className="font-display mb-4 text-xl">Delivery</h2>
              <div className="flex gap-3">
                {(["PICKUP", "DELIVERY"] as const).map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setDeliveryMethod(method)}
                    className={`flex-1 border px-4 py-3 text-sm transition-colors ${
                      deliveryMethod === method
                        ? "border-brand-ink bg-brand-ink text-brand-white"
                        : "border-brand-ink/20"
                    }`}
                  >
                    {method === "PICKUP" ? "Pickup at FootballHub Rimbayu" : "Delivery"}
                  </button>
                ))}
              </div>

              {deliveryMethod === "DELIVERY" && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Address Line 1" name="line1" required className="sm:col-span-2" />
                  <Field label="Address Line 2 (optional)" name="line2" className="sm:col-span-2" />
                  <Field label="City" name="city" required />
                  <label className="flex flex-col gap-1 text-sm">
                    <span>State</span>
                    <select
                      name="state"
                      required
                      defaultValue=""
                      className="border border-brand-ink/15 bg-brand-white px-3 py-2.5"
                    >
                      <option value="" disabled>
                        Select state
                      </option>
                      {MALAYSIA_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Field label="Postcode" name="postcode" required />
                </div>
              )}
            </div>

            {error && <p className="bg-brand-warning/10 text-brand-warning-dark border border-brand-warning/30 p-3 text-sm">{error}</p>}

            <Button type="submit" size="lg" disabled={submitting} className="mt-2">
              {submitting ? "Redirecting to Billplz…" : `Pay ${formatSenCompact(total)} with Billplz`}
            </Button>
          </form>

          <div className="lg:col-span-5">
            <h2 className="font-display mb-4 text-xl">Order Summary</h2>
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li key={item.variantId} className="flex gap-4">
                  <div className="relative h-16 w-16 shrink-0 bg-brand-sand">
                    <Image src={item.image} alt={item.productName} fill className="object-cover" sizes="64px" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{item.productName}</p>
                    <p className="text-brand-muted text-xs">
                      {item.variantLabel} &times; {item.qty}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">{formatSenCompact(item.priceSen * item.qty)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-col gap-2 border-t border-brand-ink/10 pt-4 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-muted">Subtotal</span>
                <span>{formatSenCompact(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-muted">
                  {deliveryMethod === "DELIVERY" ? "Shipping (estimate)" : "Pickup"}
                </span>
                <span>{deliveryMethod === "DELIVERY" ? formatSenCompact(shipping) : "Free"}</span>
              </div>
              <div className="font-display flex justify-between text-lg">
                <span>Total</span>
                <span>{formatSenCompact(total)}</span>
              </div>
            </div>

            <TransitionLink href="/store" className="text-brand-muted mt-6 inline-block text-sm underline">
              &larr; Continue shopping
            </TransitionLink>
          </div>
        </Container>
      </section>
    </>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${className ?? ""}`}>
      <span>{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="border border-brand-ink/15 bg-brand-white px-3 py-2.5"
      />
    </label>
  );
}
