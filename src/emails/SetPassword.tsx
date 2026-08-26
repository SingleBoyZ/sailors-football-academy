import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./components/EmailLayout";
import { SITE } from "@/content/site";

export type SetPasswordProps = {
  guardianName: string;
  email: string;
  token: string;
};

export default function SetPassword({ guardianName, email, token }: SetPasswordProps) {
  const url = `${SITE.url}/set-password?email=${encodeURIComponent(email)}&token=${token}`;
  return (
    <EmailLayout previewText="Set your Sailors Football Academy parent portal password">
      <Heading style={{ fontSize: 20, margin: "0 0 8px" }}>Set your portal password</Heading>
      <Text style={{ color: emailStyles.MUTED, fontSize: 14, lineHeight: 1.6 }}>
        Hi {guardianName}, we&apos;ve created a parent portal account for you at {email}. Set a password to
        access it — from there you can pay fees, track balances, and download receipts.
      </Text>
      <Button
        href={url}
        style={{
          backgroundColor: emailStyles.BRAND_RED,
          color: "#ffffff",
          padding: "12px 24px",
          fontSize: 14,
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        Set Password
      </Button>
      <Text style={{ color: emailStyles.MUTED, fontSize: 12, marginTop: 16 }}>
        This link expires in 48 hours.
      </Text>
    </EmailLayout>
  );
}
