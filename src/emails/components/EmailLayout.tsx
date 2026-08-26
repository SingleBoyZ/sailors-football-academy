import { Body, Container, Head, Hr, Html, Preview, Text } from "@react-email/components";
import type { ReactNode } from "react";

const BRAND_RED = "#e8232a";
const INK = "#0f0f10";
const MUTED = "#5b5b60";
const SAND = "#f7f5f2";

type EmailLayoutProps = {
  previewText: string;
  children: ReactNode;
};

export function EmailLayout({ previewText, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={{ backgroundColor: SAND, fontFamily: "Arial, Helvetica, sans-serif", margin: 0, padding: "32px 0" }}>
        <Container style={{ backgroundColor: "#ffffff", maxWidth: 480, padding: "32px 32px 24px" }}>
          <Text
            style={{
              color: BRAND_RED,
              fontSize: 20,
              fontWeight: 800,
              letterSpacing: 1,
              textTransform: "uppercase",
              margin: "0 0 4px",
            }}
          >
            Sailors Football Academy
          </Text>
          <Text style={{ color: MUTED, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", margin: "0 0 24px" }}>
            #KASITEMPUR — Together We Sail
          </Text>

          {children}

          <Hr style={{ borderColor: "#eee", margin: "32px 0 16px" }} />
          <Text style={{ color: MUTED, fontSize: 12, lineHeight: 1.6, margin: 0 }}>
            Royal Klang Sailors &middot; FootballHub Rimbayu, Bandar Rimbayu, Klang
            <br />
            WhatsApp 017-568 1830 &middot; @mysailorsfootballacademy
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export const emailStyles = { BRAND_RED, INK, MUTED, SAND };
