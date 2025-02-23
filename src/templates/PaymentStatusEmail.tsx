import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Img,
} from "@react-email/components";

interface PaymentStatusEmailProps {
  orderNumber: string;
  customerName: string;
  amount: number;
  status: 'verified' | 'refunded';
  refundReason?: string;
}

export const PaymentStatusEmail = ({
  orderNumber,
  customerName,
  amount,
  status,
  refundReason,
}: PaymentStatusEmailProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  const getStatusMessage = () => {
    switch (status) {
    case 'verified':
      return `Your payment of ${formatPrice(amount)} for order #${orderNumber} has been verified successfully.`;
    case 'refunded':
      return `A refund of ${formatPrice(amount)} for order #${orderNumber} has been processed.`;
    default:
      return "";
    }
  };

  return (
    <Html>
      <Head />
      <Preview>Payment {status === 'verified' ? 'Verification' : 'Refund'} - Order #{orderNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <div style={headerContent}>
              <Img
                src="https://merchtrack.tech/img/logo-white.png"
                width={45}
                height={45}
                alt="MerchTrack"
                style={logo}
              />
              <Text style={headerText}>MerchTrack</Text>
            </div>
          </Section>

          <Section style={contentContainer}>
            <Heading style={h1}>
              {status === 'verified' ? '✅ Payment Verified' : '💰 Payment Refunded'}
            </Heading>
            
            <Text style={greeting}>Hi {customerName},</Text>
            
            <Section style={statusSection}>
              <Text style={statusMessage}>{getStatusMessage()}</Text>
              
              {status === 'refunded' && refundReason && (
                <Text style={text}>
                  <strong>Reason for refund:</strong> {refundReason}
                </Text>
              )}
            </Section>

            {status === 'verified' && (
              <Section style={infoSection}>
                <Text style={text}>
                  We&apos;ll start processing your order right away. You&apos;ll receive another email when your order status changes.
                </Text>
              </Section>
            )}

            {status === 'refunded' && (
              <Section style={infoSection}>
                <Text style={text}>
                  The refund has been initiated and should be reflected in your account within 3-5 business days, depending on your payment method.
                </Text>
              </Section>
            )}

            <Hr style={divider} />

            <Section style={faqSection}>
              <Heading style={h2}>Frequently Asked Questions</Heading>
              <div style={faqItem}>
                <Text style={faqQuestion}>How long does payment verification take?</Text>
                <Text style={faqAnswer}>Payment verification usually takes 1-2 business days depending on your payment method.</Text>
              </div>
              <div style={faqItem}>
                <Text style={faqQuestion}>What payment methods do you accept?</Text>
                <Text style={faqAnswer}>We accept major credit/debit cards, GCash, Maya, and bank transfers.</Text>
              </div>
              <div style={faqItem}>
                <Text style={faqQuestion}>How can I track my order?</Text>
                <Text style={faqAnswer}>You can track your order by logging into your MerchTrack account and visiting the Orders section.</Text>
              </div>
            </Section>

            <Section style={buttonContainer}>
              <Text style={callToAction}>
                Visit our website to explore more products or check your order status
              </Text>
              <a href="https://merchtrack.tech" style={button}>
                Visit MerchTrack
              </a>
            </Section>

            <Hr style={divider} />

            <Section style={footer}>
              <Text style={footerText}>
                Have questions? Visit our{" "}
                <a href="https://merchtrack.tech/contacts" style={link}>
                  Contact Page
                </a>
                {" "}or reach out to our support team.
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
};

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
  margin: "0 auto",
  width: "fit-content",
};

const headerText = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "600",
  margin: "0",
  lineHeight: "45px",
};

const logo = {
  margin: "0",
  display: "block",
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

const greeting = {
  fontSize: "18px",
  lineHeight: "1.4",
  margin: "24px 0",
  color: "#484848",
};

const text = {
  fontSize: "16px",
  lineHeight: "1.4",
  color: "#484848",
  margin: "24px 0",
};

const statusSection = {
  margin: "32px 0",
  padding: "24px",
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
};

const statusMessage = {
  fontSize: "16px",
  color: "#1a1a1a",
  margin: "0",
  fontWeight: "500",
};

const infoSection = {
  margin: "24px 0",
};

const callToAction = {
  fontSize: "16px",
  color: "#5046e4",
  margin: "32px 0",
  textAlign: "center" as const,
  fontWeight: "500",
};

const divider = {
  borderTop: "1px solid #e2e8f0",
  margin: "32px 0",
};

const footer = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "24px 0",
  textAlign: "center" as const,
};

const h2 = {
  color: "#1a1a1a",
  fontSize: "20px",
  fontWeight: "600",
  margin: "0 0 16px",
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

const link = {
  color: "#5046e4",
  textDecoration: "none",
  fontWeight: "500",
};

const footerText = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "0 0 12px",
  textAlign: "center" as const,
};

const footerContact = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "8px 0",
  textAlign: "center" as const,
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

export default PaymentStatusEmail;