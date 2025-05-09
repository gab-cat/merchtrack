import { Html, Head, Preview, Body, Container, Section, Heading, Text, Link, Button, Img, Hr } from '@react-email/components';
import { emailContent } from '@/constants/';

interface EmailTemplateProps {
  replyContent: string
  customerName: string
  subject: string
}

export default function ReplyEmailTemplate({ replyContent, customerName, subject }: Readonly<EmailTemplateProps>) {
  return (
    <Html>
      <Head />
      <Preview>A MerchTrack Support Team representative answered your inquiry: {subject}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <div style={headerContent}>
              <Img
                src={emailContent.storeInfo.logoUrl}
                width={40}
                height={40}
                alt="MerchTrack Logo"
                style={logo}
              />
              <Text style={headerText}>MerchTrack</Text>
            </div>
          </Section>

          <Section style={contentContainer}>
            <Heading style={h1}>We&apos;re Here to Help! 💫</Heading>

            {/* Main content */}
            <Section style={messageContainer}>
              <Text style={greeting}>Hi {customerName}!</Text>
              <Text style={text}>{replyContent}</Text>
              <Text style={text}>
                We hope this information helps. If you have any further questions, please don&apos;t hesitate to ask.
              </Text>
              
              <Hr style={divider} />
              
              <Text style={signature}>Best regards,</Text>
              <Text style={signatureName}>MerchTrack Support Team</Text>
            </Section>

            {/* Quick FAQs */}
            <Section style={faqSection}>
              <Heading style={h2}>Quick FAQs</Heading>
              <div style={faqItem}>
                <Text style={faqQuestion}>How can I track my orders?</Text>
                <Text style={faqAnswer}>Log into your MerchTrack account and visit the Orders section to track all your purchases.</Text>
              </div>
              <div style={faqItem}>
                <Text style={faqQuestion}>What are your shipping times?</Text>
                <Text style={faqAnswer}>Standard shipping takes 3-5 business days, while express delivery is available for 1-2 business days.</Text>
              </div>
              <div style={faqItem}>
                <Text style={faqQuestion}>Do you offer refunds?</Text>
                <Text style={faqAnswer}>Yes, we offer refunds within 7 days of delivery for unused items in original condition.</Text>
              </div>
            </Section>

            {/* Helpful links */}
            <Section style={linksSection}>
              <Heading style={h2}>Helpful Resources</Heading>
              <ul style={list}>
                {emailContent.helpfulLinks.map(({ text, url }) => (
                  <li key={text} style={listItem}>
                    <Link href={url} style={link}>{text}</Link>
                  </li>
                ))}
              </ul>
              
              <Section style={buttonContainer}>
                {emailContent.buttons.map(({ text, url }) => (
                  <Button key={text} style={button} href={url}>{text}</Button>
                ))}
              </Section>
            </Section>

            <Section style={buttonContainer}>
              <Text style={callToAction}>
                Need more information? Visit our website for detailed support
              </Text>
              <a href="https://merchtrack.tech" style={button}>
                Visit MerchTrack
              </a>
            </Section>

            <Hr style={divider} />

            {/* Footer */}
            <Section style={footer}>
              <Text style={footerText}>
                Still have questions? Visit our{" "}
                <a href="https://merchtrack.tech/contacts" style={link}>
                  Contact Page
                </a>
                {" "}for more support options.
              </Text>
              <Text style={footerContact}>
                Email: support@merchtrack.tech | Phone: +63 912 345 6789
              </Text>
              <Text style={footerAddress}>
                MerchTrack Inc. | 123 Business Avenue, Makati City, Philippines
              </Text>
              <Text style={footerCopyright}>
                © {new Date().getFullYear()} MerchTrack. All rights reserved.
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "0",
  marginBottom: "64px",
  borderRadius: "12px",
  overflow: "hidden",
  maxWidth: "600px",
};

const header = {
  backgroundColor: "#5046e4",
  padding: "24px",
  textAlign: "center" as const,
};

const headerContent = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
};

const headerText = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "600",
  margin: "0",
};

const logo = {
  margin: "0",
};

const contentContainer = {
  padding: "40px 48px",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "1.3",
  margin: "16px 0",
  padding: "0",
  textAlign: "center" as const,
};

const h2 = {
  color: "#1a1a1a",
  fontSize: "20px",
  fontWeight: "600",
  margin: "24px 0 16px",
};

const messageContainer = {
  margin: "32px 0",
};

const greeting = {
  fontSize: "18px",
  lineHeight: "1.4",
  margin: "24px 0",
  color: "#484848",
};

const text = {
  fontSize: "16px",
  lineHeight: "1.6",
  color: "#484848",
  margin: "24px 0",
};

const signature = {
  fontSize: "16px",
  color: "#484848",
  margin: "24px 0 8px",
};

const signatureName = {
  fontSize: "16px",
  color: "#1a1a1a",
  fontWeight: "600",
  margin: "0",
};

const faqSection = {
  margin: "32px 0",
  padding: "24px",
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
};

const faqItem = {
  margin: "16px 0",
};

const faqQuestion = {
  fontSize: "16px",
  color: "#1a1a1a",
  fontWeight: "600",
  margin: "0 0 8px",
};

const faqAnswer = {
  fontSize: "14px",
  color: "#484848",
  margin: "0",
  lineHeight: "1.6",
};

const linksSection = {
  margin: "32px 0",
};

const list = {
  listStyle: "none",
  padding: "0",
  margin: "16px 0",
};

const listItem = {
  margin: "8px 0",
};

const link = {
  color: "#5046e4",
  textDecoration: "none",
};

const buttonContainer = {
  margin: "32px 0",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#5046e4",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  padding: "12px 24px",
  textDecoration: "none",
  display: "inline-block",
  margin: "16px 0",
  border: "none",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
  transition: "background-color 0.2s ease",
};

const divider = {
  borderTop: "1px solid #e2e8f0",
  margin: "32px 0",
};

const footer = {
  textAlign: "center" as const,
  color: "#6b7280",
};

const footerText = {
  fontSize: "14px",
  margin: "8px 0",
};

const footerContact = {
  fontSize: "14px",
  margin: "8px 0",
};

const footerAddress = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "8px 0",
  textAlign: "center" as const,
};

const footerCopyright = {
  fontSize: "12px",
  color: "#9ca3af",
  margin: "16px 0 0",
  textAlign: "center" as const,
};

const callToAction = {
  fontSize: "16px",
  color: "#5046e4",
  margin: "32px 0",
  textAlign: "center" as const,
  fontWeight: "500",
};

