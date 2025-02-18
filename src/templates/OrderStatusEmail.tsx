import { OrderStatus } from "@prisma/client";
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Button,
} from "@react-email/components";

interface OrderStatusEmailProps {
  orderNumber: string;
  customerName: string;
  newStatus: OrderStatus;
  surveyLink?: string;
}

export const OrderStatusEmail = ({
  orderNumber,
  customerName,
  newStatus,
  surveyLink,
}: OrderStatusEmailProps) => {
  const getStatusMessage = () => {
    switch (newStatus) {
    case OrderStatus.PROCESSING:
      return "We're now processing your order and preparing your items.";
    case OrderStatus.READY:
      return "Your order is now ready for pickup/delivery!";
    case OrderStatus.DELIVERED:
      return "Your order has been completed! We'd love to hear your feedback.";
    default:
      return "";
    }
  };

  return (
    <Html>
      <Head />
      <Preview>Order Status Update - #{orderNumber}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Order Status Update</Heading>
          <Text style={text}>Hi {customerName},</Text>
          <Text style={text}>
            Your order #{orderNumber} has been updated to: <strong>{newStatus.toUpperCase()}</strong>
          </Text>

          <Section style={statusSection}>
            <Text style={text}>{getStatusMessage()}</Text>
          </Section>

          {newStatus === OrderStatus.DELIVERED && surveyLink && (
            <Section style={surveySection}>
              <Text style={text}>Please take a moment to share your experience with us:</Text>
              <Button style={button} href={surveyLink}>
                Take our Survey
              </Button>
            </Section>
          )}

          <Text style={text}>
            You can check your order details by logging into your MerchTrack account.
          </Text>

          <Text style={footer}>
            If you have any questions, please contact our support team.
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

const surveySection = {
  margin: "32px 0",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#5046e4",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  padding: "12px 24px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  marginTop: "48px",
};

export default OrderStatusEmail;