import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface PasswordResetEmailProps {
  userName: string;
  resetLink: string;
  expiresIn?: number; // in hours
}

export const PasswordResetEmail = ({
  userName,
  resetLink,
  expiresIn = 1,
}: PasswordResetEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Réinitialisez votre mot de passe - Jokko</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Logo / Brand Section */}
          <Section style={header}>
            <Text style={logo}>Jokko</Text>
          </Section>

          {/* Main Content */}
          <Section style={content}>
            <Heading style={h1}>Réinitialisation de mot de passe</Heading>

            <Text style={greeting}>Bonjour {userName},</Text>

            <Text style={paragraph}>
              Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton
              ci-dessous pour définir un nouveau mot de passe pour votre compte.
            </Text>

            {/* CTA Button */}
            <Section style={buttonContainer}>
              <Button style={button} href={resetLink}>
                Réinitialiser mon mot de passe
              </Button>
            </Section>

            {/* Security Info */}
            <Section style={infoBox}>
              <Text style={infoText}>
                ⏱️ Ce lien est valide pendant <strong>{expiresIn} heure{expiresIn > 1 ? "s" : ""}</strong>
              </Text>
              <Text style={infoText}>
                🔒 Pour votre sécurité, ce lien ne peut être utilisé qu'une seule fois
              </Text>
            </Section>

            <Text style={warningText}>
              Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email.
              Votre mot de passe actuel restera inchangé.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Le bouton ne fonctionne pas ? Copiez et collez ce lien dans votre navigateur :
            </Text>
            <Link href={resetLink} style={footerLink}>
              {resetLink}
            </Link>

            <Text style={footerCopyright}>
              © {new Date().getFullYear()} Jokko. Tous droits réservés.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default PasswordResetEmail;

// ============================================================================
// Styles
// ============================================================================

const main = {
  backgroundColor: "#f4f7fa",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
  padding: "40px 0",
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "600px",
  borderRadius: "12px",
  overflow: "hidden",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
};

// Header
const header = {
  backgroundColor: "#000000",
  padding: "32px 40px",
  textAlign: "center" as const,
};

const logo = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "700",
  letterSpacing: "1px",
  margin: "0",
  textTransform: "uppercase" as const,
};

// Content
const content = {
  padding: "48px 40px",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "28px",
  fontWeight: "700",
  lineHeight: "1.3",
  margin: "0 0 24px",
  textAlign: "center" as const,
};

const greeting = {
  color: "#1a1a1a",
  fontSize: "18px",
  fontWeight: "500",
  margin: "0 0 16px",
};

const paragraph = {
  color: "#4a5568",
  fontSize: "16px",
  lineHeight: "1.6",
  margin: "0 0 32px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "40px 0",
};

const button = {
  backgroundColor: "#000000",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "16px 48px",
  transition: "all 0.2s ease",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
};

// Info Box
const infoBox = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  padding: "20px",
  margin: "32px 0",
  border: "1px solid #e2e8f0",
};

const infoText = {
  color: "#4a5568",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "8px 0",
};

const warningText = {
  color: "#718096",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "24px 0 0",
  fontStyle: "italic" as const,
};

const divider = {
  borderColor: "#e2e8f0",
  margin: "0",
};

// Footer
const footer = {
  backgroundColor: "#f8fafc",
  padding: "32px 40px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#718096",
  fontSize: "13px",
  lineHeight: "1.6",
  margin: "0 0 12px",
};

const footerLink = {
  color: "#4a5568",
  fontSize: "12px",
  wordBreak: "break-all" as const,
  textDecoration: "underline",
  display: "block",
  margin: "0 0 24px",
};

const footerCopyright = {
  color: "#a0aec0",
  fontSize: "12px",
  margin: "24px 0 0",
};
