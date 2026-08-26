import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./components/EmailLayout";
import { SITE } from "@/content/site";
import { formatSenCompact } from "@/lib/money";

export type ApplicationApprovedProps = {
  guardianName: string;
  playerName: string;
  memberCode: string;
  registrationFeeSen: number;
};

export default function ApplicationApproved({
  guardianName,
  playerName,
  memberCode,
  registrationFeeSen,
}: ApplicationApprovedProps) {
  return (
    <EmailLayout previewText={`${playerName} is approved — welcome aboard!`}>
      <Heading style={{ fontSize: 20, margin: "0 0 8px" }}>All aboard — application approved</Heading>
      <Text style={{ color: emailStyles.MUTED, fontSize: 14, lineHeight: 1.6 }}>
        Hi {guardianName}, great news — {playerName}&apos;s place at Sailors Football Academy is confirmed.
        Member code: <strong>{memberCode}</strong>.
      </Text>
      <Text style={{ color: emailStyles.MUTED, fontSize: 14, lineHeight: 1.6 }}>
        To lock in the training slot, pay the one-time registration fee of{" "}
        <strong>{formatSenCompact(registrationFeeSen)}</strong> (includes 2 training kits).
      </Text>
      <Button
        href={`${SITE.url}/pay`}
        style={{
          backgroundColor: emailStyles.BRAND_RED,
          color: "#ffffff",
          padding: "12px 24px",
          fontSize: 14,
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        Pay Registration Fee
      </Button>
      <Text style={{ color: emailStyles.MUTED, fontSize: 13, marginTop: 20 }}>
        You can track payments and balances any time from your{" "}
        <a href={`${SITE.url}/portal`} style={{ color: emailStyles.BRAND_RED }}>
          parent portal
        </a>
        .
      </Text>
    </EmailLayout>
  );
}
