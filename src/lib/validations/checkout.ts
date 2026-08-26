import { z } from "zod";
import { MALAYSIA_STATES } from "@/content/malaysia-states";

export const cartItemSchema = z.object({
  variantId: z.string().min(1),
  qty: z.number().int().min(1).max(20),
});

export const checkoutSchema = z
  .object({
    customerName: z.string().trim().min(2, "Enter the customer's full name"),
    email: z.string().trim().email("Enter a valid email address"),
    phone: z
      .string()
      .trim()
      .regex(/^(\+?6?01)[0-46-9]-*[0-9]{7,8}$/, "Enter a valid Malaysian phone number"),
    deliveryMethod: z.enum(["DELIVERY", "PICKUP"]),
    address: z
      .object({
        line1: z.string().trim().min(3, "Enter the street address"),
        line2: z.string().trim().optional(),
        city: z.string().trim().min(2, "Enter the city"),
        state: z.enum(MALAYSIA_STATES),
        postcode: z.string().trim().regex(/^\d{5}$/, "Enter a valid 5-digit postcode"),
      })
      .optional(),
    items: z.array(cartItemSchema).min(1, "Your cart is empty"),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryMethod === "DELIVERY" && !data.address) {
      ctx.addIssue({
        code: "custom",
        message: "Delivery address is required for delivery orders",
        path: ["address"],
      });
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
