import { Column, Heading, Row, Section, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./components/EmailLayout";
import { formatSenCompact } from "@/lib/money";

export type OrderConfirmationProps = {
  orderNo: string;
  customerName: string;
  items: { productName: string; variantLabel: string; qty: number; unitPriceSen: number }[];
  subtotalSen: number;
  shippingSen: number;
  totalSen: number;
  deliveryMethod: "DELIVERY" | "PICKUP";
};

export default function OrderConfirmation({
  orderNo,
  customerName,
  items,
  subtotalSen,
  shippingSen,
  totalSen,
  deliveryMethod,
}: OrderConfirmationProps) {
  return (
    <EmailLayout previewText={`Order ${orderNo} confirmed — thanks for your order`}>
      <Heading style={{ fontSize: 20, margin: "0 0 8px" }}>Order confirmed</Heading>
      <Text style={{ color: emailStyles.MUTED, fontSize: 14, margin: "0 0 20px" }}>
        Thanks, {customerName} — we&apos;ve received your order <strong>{orderNo}</strong> and payment has
        been confirmed.
      </Text>

      <Section>
        {items.map((item) => (
          <Row key={`${item.productName}-${item.variantLabel}`} style={{ marginBottom: 8 }}>
            <Column>
              <Text style={{ fontSize: 14, margin: 0 }}>
                {item.productName} — {item.variantLabel} &times; {item.qty}
              </Text>
            </Column>
            <Column align="right">
              <Text style={{ fontSize: 14, margin: 0 }}>{formatSenCompact(item.unitPriceSen * item.qty)}</Text>
            </Column>
          </Row>
        ))}
      </Section>

      <Row style={{ marginTop: 12 }}>
        <Column>
          <Text style={{ fontSize: 13, color: emailStyles.MUTED, margin: 0 }}>Subtotal</Text>
        </Column>
        <Column align="right">
          <Text style={{ fontSize: 13, color: emailStyles.MUTED, margin: 0 }}>{formatSenCompact(subtotalSen)}</Text>
        </Column>
      </Row>
      <Row>
        <Column>
          <Text style={{ fontSize: 13, color: emailStyles.MUTED, margin: 0 }}>
            {deliveryMethod === "DELIVERY" ? "Shipping" : "Pickup at FootballHub Rimbayu"}
          </Text>
        </Column>
        <Column align="right">
          <Text style={{ fontSize: 13, color: emailStyles.MUTED, margin: 0 }}>
            {deliveryMethod === "DELIVERY" ? formatSenCompact(shippingSen) : "—"}
          </Text>
        </Column>
      </Row>
      <Row style={{ marginTop: 8 }}>
        <Column>
          <Text style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Total</Text>
        </Column>
        <Column align="right">
          <Text style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>{formatSenCompact(totalSen)}</Text>
        </Column>
      </Row>
    </EmailLayout>
  );
}
