import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
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
          <Heading style={h1}>
            Payment {status === 'verified' ? 'Verified' : 'Refunded'}
          </Heading>
          
          <Text style={text}>Hi {customerName},</Text>
          
          <Section style={statusSection}>
            <Text style={text}>{getStatusMessage()}</Text>
            
            {status === 'refunded' && refundReason && (
              <Text style={text}>
                Reason for refund: {refundReason}
              </Text>
            )}
          </Section>

          {status === 'verified' && (
            <Text style={text}>
              We&apos;ll start processing your order right away. You&apos;ll receive another email when your order status changes.
            </Text>
          )}

          {status === 'refunded' && (
            <Text style={text}>
              The refund has been initiated and should be reflected in your account within 3-5 business days, depending on your payment method.
            </Text>
          )}

          <Text style={text}>
            You can check your order details by logging into your MerchTrack account.
          </Text>

          <Text style={footer}>
            If you have any questions about your {status === 'verified' ? 'payment' : 'refund'}, please contact our support team.
          </Text>
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
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  margin: "40px 0",
  padding: "0",
  textAlign: "center" as const,
};

const text = {
  color: "#333",
  fontSize: "16px",
  margin: "24px 0",
};

const statusSection = {
  margin: "24px 0",
  padding: "24px",
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  marginTop: "48px",
};

export default PaymentStatusEmail;