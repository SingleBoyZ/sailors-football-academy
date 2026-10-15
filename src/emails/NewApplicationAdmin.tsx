import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./components/EmailLayout";
import { SITE } from "@/content/site";

export type NewApplicationAdminProps = {
  playerName: string;
  ageGroup: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  applicationId: string;
};

export default function NewApplicationAdmin({
  playerName,
  ageGroup,
  guardianName,
  guardianPhone,
  guardianEmail,
  applicationId,
}: NewApplicationAdminProps) {
  return (
    <EmailLayout previewText={`New enrolment application: ${playerName}`}>
      <Heading style={{ fontSize: 20, margin: "0 0 8px" }}>New enrolment application</Heading>
      <Text style={{ fontSize: 14, lineHeight: 1.6, margin: "0 0 4px" }}>
        <strong>{playerName}</strong> ({ageGroup}) — submitted by {guardianName}
      </Text>
      <Text style={{ color: emailStyles.MUTED, fontSize: 14, lineHeight: 1.6, margin: "0 0 20px" }}>
        {guardianPhone} &middot; {guardianEmail}
      </Text>
      <Button
        href={`${SITE.url}/admin/applications/${applicationId}`}
        style={{
          backgroundColor: emailStyles.BRAND_RED,
          color: "#ffffff",
          padding: "12px 24px",
          fontSize: 14,
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        Review Application
      </Button>
    </EmailLayout>
  );
}
