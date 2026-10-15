import { Heading, Text } from "@react-email/components";
import { EmailLayout, emailStyles } from "./components/EmailLayout";

export type ApplicationReceivedProps = {
  guardianName: string;
  playerName: string;
  ageGroup: string;
};

export default function ApplicationReceived({ guardianName, playerName, ageGroup }: ApplicationReceivedProps) {
  return (
    <EmailLayout previewText={`We've received ${playerName}'s enrolment application`}>
      <Heading style={{ fontSize: 20, margin: "0 0 8px" }}>Application received</Heading>
      <Text style={{ color: emailStyles.MUTED, fontSize: 14, lineHeight: 1.6 }}>
        Hi {guardianName}, thanks for applying to Sailors Football Academy on behalf of {playerName}{" "}
        (estimated age group <strong>{ageGroup}</strong>).
      </Text>
      <Text style={{ color: emailStyles.MUTED, fontSize: 14, lineHeight: 1.6 }}>
        Our staff will review the application and get back to you. Once approved, we&apos;ll email you a
        link to set up your parent portal account and pay the registration fee to confirm the training
        slot.
      </Text>
      <Text style={{ color: emailStyles.MUTED, fontSize: 14, lineHeight: 1.6 }}>
        No payment is due yet — this is just confirmation that we&apos;ve received your application.
      </Text>
    </EmailLayout>
  );
}
