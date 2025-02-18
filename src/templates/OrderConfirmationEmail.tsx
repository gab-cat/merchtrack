import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Row,
  Column,
} from "@react-email/components";
import { ExtendedOrder } from "@/types/orders";

interface OrderConfirmationEmailProps {
  order: ExtendedOrder;
  customerName: string;
}

export const OrderConfirmationEmail = ({
  order,
  customerName,
}: OrderConfirmationEmailProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

  return (
    <Html>
      <Head />
      <Preview>Your MerchTrack Order Confirmation #{order.id}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Order Confirmation</Heading>
          <Text style={text}>Hi {customerName},</Text>
          <Text style={text}>Thank you for your order! We&apos;re processing it now and will keep you updated on its status.</Text>

          <Section style={orderInfo}>
            <Text style={h2}>Order Details</Text>
            <Text style={text}>Order Number: {order.id}</Text>
            <Text style={text}>Order Date: {new Date(order.createdAt).toLocaleDateString()}</Text>
          </Section>

          <Section style={orderSummary}>
            <Text style={h2}>Order Summary</Text>
            {order.orderItems.map((item) => (
              <Row key={item.id} style={itemRow}>
                <Column>
                  <Text style={text}>{item.variant.product.title} x{item.quantity}</Text>
                </Column>
                <Column>
                  <Text style={text}>{formatPrice(Number(item.price) * item.quantity)}</Text>
                </Column>
              </Row>
            ))}
            <Row style={totalRow}>
              <Column>
                <Text style={totalText}>Total</Text>
              </Column>
              <Column>
                <Text style={totalText}>{formatPrice(order.totalAmount)}</Text>
              </Column>
            </Row>
          </Section>

          <Text style={text}>
            You can track your order status by logging into your account at MerchTrack.
          </Text>

          <Text style={footer}>
            If you have any questions, please don&apos;t hesitate to contact our support team.
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

const h2 = {
  color: "#333",
  fontSize: "20px",
  fontWeight: "bold",
  margin: "20px 0",
};

const text = {
  color: "#333",
  fontSize: "16px",
  margin: "24px 0",
};

const orderInfo = {
  margin: "24px 0",
  borderTop: "1px solid #e6ebf1",
  borderBottom: "1px solid #e6ebf1",
  padding: "24px 0",
};

const orderSummary = {
  margin: "24px 0",
};

const itemRow = {
  display: "flex" as const,
  justifyContent: "space-between" as const,
  margin: "8px 0",
};

const totalRow = {
  ...itemRow,
  borderTop: "2px solid #e6ebf1",
  marginTop: "16px",
  paddingTop: "16px",
};

const totalText = {
  ...text,
  fontWeight: "bold",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  marginTop: "48px",
};

export default OrderConfirmationEmail;