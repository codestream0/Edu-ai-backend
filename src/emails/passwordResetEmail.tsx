import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import React from "react";

interface PasswordResetEmailProps {
  resetUrl: string;
}

export default function PasswordResetEmail({
  resetUrl,
}: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />

      <Preview>Reset your EDU AI password</Preview>

      <Body style={styles.body}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Heading style={styles.logo}>EDU AI</Heading>
          </Section>

          <Section style={styles.content}>
            <Heading style={styles.heading}>
              Reset your password
            </Heading>

            <Text style={styles.text}>
              We received a request to reset your EDU AI account password.
            </Text>

            <Text style={styles.text}>
              Click the button below to create a new password.
            </Text>

            <Section style={styles.buttonContainer}>
              <Button href={resetUrl} style={styles.button}>
                Reset Password
              </Button>
            </Section>

            <Text style={styles.text}>
              This password reset link will expire in 5 minutes.
            </Text>

            <Text style={styles.mutedText}>
              If you didn't request a password reset, you can safely ignore
              this email.
            </Text>
          </Section>

          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              © 2026 EDU AI. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles = {
  body: {
    backgroundColor: "#F5F9FF",
    fontFamily:
      "Arial, Helvetica, sans-serif",
    margin: "0",
    padding: "40px 20px",
  },

  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    margin: "0 auto",
    maxWidth: "560px",
    overflow: "hidden",
  },

  header: {
    backgroundColor: "#2F80ED",
    padding: "28px 32px",
    textAlign: "center" as const,
  },

  logo: {
    color: "#FFFFFF",
    fontSize: "26px",
    fontWeight: "700",
    margin: "0",
  },

  content: {
    padding: "40px 32px",
  },

  heading: {
    color: "#111827",
    fontSize: "26px",
    fontWeight: "700",
    margin: "0 0 20px",
  },

  text: {
    color: "#4B5563",
    fontSize: "15px",
    lineHeight: "24px",
    margin: "0 0 16px",
  },

  buttonContainer: {
    margin: "30px 0",
    textAlign: "center" as const,
  },

  button: {
    backgroundColor: "#2F80ED",
    borderRadius: "8px",
    color: "#FFFFFF",
    display: "inline-block",
    fontSize: "15px",
    fontWeight: "600",
    padding: "14px 24px",
    textDecoration: "none",
  },

  mutedText: {
    color: "#6B7280",
    fontSize: "13px",
    lineHeight: "20px",
    marginTop: "24px",
  },

  footer: {
    borderTop: "1px solid #E5E7EB",
    padding: "20px 32px",
    textAlign: "center" as const,
  },

  footerText: {
    color: "#9CA3AF",
    fontSize: "12px",
    margin: "0",
  },
};