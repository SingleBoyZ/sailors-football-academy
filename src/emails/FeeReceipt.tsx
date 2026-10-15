import { Heading, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./components/EmailLayout";
import { formatSenCompact } from "@/lib/money";

export type FeeReceiptProps = {
  guardianName: string;
  memberName: string;
  amountPaidSen: number;
  pendingBalanceSen: number;
  receiptNo: string;
};

export default function FeeReceipt({
  guardianName,
  memberName,
  amountPaidSen,
  pendingBalanceSen,
  receiptNo,
}: FeeReceiptProps) {
  return (
    <EmailLayout previewText={`Receipt ${receiptNo} — payment of ${formatSenCompact(amountPaidSen)} received`}>
      <Heading style={{ fontSize: 20, margin: "0 0 8px" }}>Payment received</Heading>
      <Text style={{ color: emailStyles.MUTED, fontSize: 14, lineHeight: 1.6 }}>
        Hi {guardianName}, we&apos;ve received a payment of <strong>{formatSenCompact(amountPaidSen)}</strong> for{" "}
        {memberName}. Your PDF receipt ({receiptNo}) is attached to this email.
      </Text>
      {pendingBalanceSen > 0 ? (
        <Text style={{ color: emailStyles.BRAND_RED, fontSize: 14, fontWeight: 700, lineHeight: 1.6 }}>
          Outstanding balance: {formatSenCompact(pendingBalanceSen)}. You can settle this any time from
          your parent portal.
        </Text>
      ) : (
        <Text style={{ color: "#1f9d55", fontSize: 14, fontWeight: 700, lineHeight: 1.6 }}>
          This account is fully paid up — thank you!
        </Text>
      )}
    </EmailLayout>
  );
}
