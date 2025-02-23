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
  Hr,
  Img,
  Row,
  Column,
} from "@react-email/components";
import { ExtendedOrder } from "@/types/orders";

interface OrderStatusEmailProps {
  orderNumber: string;
  customerName: string;
  newStatus: OrderStatus;
  surveyLink?: string;
  order: ExtendedOrder;
};

export const OrderStatusEmail = ({
  orderNumber,
  customerName,
  newStatus,
  surveyLink,
  order,
}: OrderStatusEmailProps) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'PHP'
    }).format(price);
  };

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

  const getStatusEmoji = () => {
    switch (newStatus) {
    case OrderStatus.PROCESSING:
      return "⚙️";
    case OrderStatus.READY:
      return "📦";
    case OrderStatus.DELIVERED:
      return "✨";
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
              {getStatusEmoji()} Order Status Update
            </Heading>
            
            <Text style={greeting}>Hi {customerName},</Text>

            <Section style={statusSection}>
              <Text style={statusBadge}>
                {newStatus.toUpperCase()}
              </Text>
              <Text style={statusMessage}>{getStatusMessage()}</Text>
            </Section>

            <Section style={orderInfo}>
              <Row style={infoRow}>
                <Column>
                  <Text style={orderLabel}>Order Reference:</Text>
                  <Text style={orderValue}>#{orderNumber}</Text>
                </Column>
                <Column>
                  <Text style={orderLabel}>Order Date:</Text>
                  <Text style={orderValue}>
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Text>
                </Column>
              </Row>
              {order.estimatedDelivery && (
                <Row style={infoRow}>
                  <Column>
                    <Text style={orderLabel}>Estimated Delivery:</Text>
                    <Text style={orderValue}>
                      {new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </Text>
                  </Column>
                </Row>
              )}
            </Section>

            {newStatus === OrderStatus.DELIVERED && surveyLink && (
              <Section style={surveySection}>
                <Text style={surveyText}>Your feedback helps us improve! 🌟</Text>
                <Button style={button} href={surveyLink}>
                              Share Your Experience
                </Button>
              </Section>
            )}

            <Section style={itemsContainer}>
              <Text style={h2}>Order Items</Text>
              {order.orderItems.map((item) => (
                <Row key={item.id} style={itemRow}>
                  <Column style={itemImageCol}>
                    {item.variant.product.imageUrl[0] && (
                      <Img
                        src={item.variant.product.imageUrl[0]}
                        width={60}
                        height={60}
                        alt={item.variant.product.title}
                        style={itemImage}
                      />
                    )}
                  </Column>
                  <Column style={itemDetails}>
                    <Text style={itemName}>{item.variant.product.title}</Text>
                    <Text style={itemVariant}>
                      Variant: {item.variant.variantName}
                    </Text>
                    <Text style={itemQuantity}>
                      Quantity: {item.quantity} × {formatPrice(Number(item.price))}
                    </Text>
                  </Column>
                  <Column style={itemPrice}>
                    <Text style={priceText}>
                      {formatPrice(Number(item.price) * item.quantity)}
                    </Text>
                  </Column>
                </Row>
              ))}
              
              <Section style={totalSection}>
                <Row style={subtotalRow}>
                  <Column>
                    <Text style={totalLabel}>Total Amount</Text>
                  </Column>
                  <Column>
                    <Text style={totalAmount}>
                      {formatPrice(Number(order.totalAmount))}
                    </Text>
                  </Column>
                </Row>
              </Section>
            </Section>

            <Hr style={divider} />

            <Section style={faqSection}>
              <Heading style={h2}>Frequently Asked Questions</Heading>
              <div style={faqItem}>
                <Text style={faqQuestion}>How long does order processing take?</Text>
                <Text style={faqAnswer}>Orders are typically processed within 1-2 business days after payment confirmation.</Text>
              </div>
              <div style={faqItem}>
                <Text style={faqQuestion}>When will my order be delivered?</Text>
                <Text style={faqAnswer}>Standard shipping takes 3-5 business days, while express delivery is available for 1-2 business days.</Text>
              </div>
              <div style={faqItem}>
                <Text style={faqQuestion}>How can I track my delivery?</Text>
                <Text style={faqAnswer}>You can track your order status by logging into your MerchTrack account and visiting the Orders section.</Text>
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
                Have questions about your order? Visit our{" "}
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

const statusSection = {
  margin: "32px 0",
  padding: "24px",
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  textAlign: "center" as const,
};

const statusBadge = {
  display: "inline-block",
  padding: "6px 12px",
  backgroundColor: "#5046e4",
  color: "#ffffff",
  borderRadius: "16px",
  fontSize: "14px",
  fontWeight: "600",
  marginBottom: "16px",
};

const statusMessage = {
  fontSize: "16px",
  color: "#1a1a1a",
  margin: "0",
  fontWeight: "500",
};

const surveySection = {
  margin: "32px 0",
  textAlign: "center" as const,
  backgroundColor: "#fdf9e7",
  padding: "24px",
  borderRadius: "8px",
};

const surveyText = {
  fontSize: "16px",
  color: "#1a1a1a",
  marginBottom: "16px",
};

const button = {
  backgroundColor: "#5046e4",
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  padding: "12px 24px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  border: "none",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
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
  lineHeight: "45px", // Match the logo height
};

const itemImageCol = {
  width: "60px",
};

const itemImage = {
  borderRadius: "4px",
  objectFit: "cover" as const,
};

const itemVariant = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "4px 0",
};

const infoRow = {
  marginBottom: "16px",
};

const itemsContainer = {
  margin: "32px 0",
  backgroundColor: "#ffffff",
  borderRadius: "8px",
};

const itemRow = {
  padding: "16px",
  borderBottom: "1px solid #e2e8f0",
  display: "flex",
  alignItems: "center",
};

const itemDetails = {
  flex: "1",
  padding: "0 16px",
};

const itemName = {
  fontSize: "16px",
  color: "#1a1a1a",
  fontWeight: "500",
  margin: "0 0 4px",
};

const itemQuantity = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "4px 0 0",
};

const orderInfo = {
  margin: "32px 0",
  padding: "24px",
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
};

const orderLabel = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "0 0 4px",
};

const orderValue = {
  fontSize: "16px",
  color: "#1a1a1a",
  fontWeight: "500",
  margin: "0",
};

const h2 = {
  color: "#1a1a1a",
  fontSize: "20px",
  fontWeight: "600",
  margin: "0 0 16px",
  padding: "0",
};

const itemPrice = {
  textAlign: "right" as const,
  width: "100px",
};

const priceText = {
  fontSize: "16px",
  color: "#1a1a1a",
  margin: "0",
  fontWeight: "500",
};

const totalSection = {
  margin: "24px 0 0",
  backgroundColor: "#f8fafc",
  padding: "16px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
};

const subtotalRow = {
  padding: "8px 16px",
};

const totalLabel = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0",
};

const totalAmount = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#5046e4",
  margin: "0",
  textAlign: "right" as const,
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

export default OrderStatusEmail;