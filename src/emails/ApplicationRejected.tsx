import { Heading, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./components/EmailLayout";
import { SITE } from "@/content/site";

export type ApplicationRejectedProps = {
  guardianName: string;
  playerName: string;
  reason?: string;
};

export default function ApplicationRejected({ guardianName, playerName, reason }: ApplicationRejectedProps) {
  return (
    <EmailLayout previewText={`An update on ${playerName}'s application`}>
      <Heading style={{ fontSize: 20, margin: "0 0 8px" }}>An update on your application</Heading>
      <Text style={{ color: emailStyles.MUTED, fontSize: 14, lineHeight: 1.6 }}>
        Hi {guardianName}, thank you for your interest in Sailors Football Academy. Unfortunately we&apos;re
        unable to offer {playerName} a place at this time.
      </Text>
      {reason && (
        <Text style={{ color: emailStyles.MUTED, fontSize: 14, lineHeight: 1.6 }}>
          <strong>Reason:</strong> {reason}
        </Text>
      )}
      <Text style={{ color: emailStyles.MUTED, fontSize: 14, lineHeight: 1.6 }}>
        If you have questions, reach us on WhatsApp at {SITE.contact.whatsappDisplay}.
      </Text>
    </EmailLayout>
  );
}
