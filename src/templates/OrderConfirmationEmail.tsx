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
  Hr,
  Img,
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
            <Heading style={h1}>🎉 Thank You for Your Order!</Heading>
            
            <Text style={greeting}>Hi {customerName},</Text>
            <Text style={text}>
              Your order has been confirmed and is being processed. Here are your complete order details:
            </Text>

            <Section style={orderInfo}>
              <Row style={infoRow}>
                <Column>
                  <Text style={orderLabel}>Order Reference:</Text>
                  <Text style={orderValue}>#{order.id}</Text>
                </Column>
                <Column>
                  <Text style={orderLabel}>Order Date:</Text>
                  <Text style={orderValue}>
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </Column>
              </Row>
              <Row style={infoRow}>
                <Column>
                  <Text style={orderLabel}>Payment Status:</Text>
                  <Text style={orderValue}>{order.paymentStatus}</Text>
                </Column>
                <Column>
                  <Text style={orderLabel}>Order Status:</Text>
                  <Text style={orderValue}>{order.status}</Text>
                </Column>
              </Row>
            </Section>

            <Hr style={divider} />

            <Section style={orderSummary}>
              <Text style={h2}>Order Summary</Text>
              
              <Section style={itemsContainer}>
                {order.orderItems.map((item) => (
                  <Row key={item.id} style={itemRow}>
                    <Column style={itemImageCol}>
                      {item.variant.product.imageUrl && (
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
              </Section>

              <Hr style={divider} />

              <Section style={totalSection}>
                <Row style={subtotalRow}>
                  <Column>
                    <Text style={totalLabel}>Subtotal</Text>
                  </Column>
                  <Column>
                    <Text style={subtotalAmount}>
                      {formatPrice(order.orderItems.reduce(
                        (acc, item) => acc + (Number(item.price) * item.quantity),
                        0
                      ))}
                    </Text>
                  </Column>
                </Row>
                <Row style={totalRow}>
                  <Column>
                    <Text style={totalLabel}>Total Amount</Text>
                  </Column>
                  <Column>
                    <Text style={totalAmount}>{formatPrice(order.totalAmount)}</Text>
                  </Column>
                </Row>
              </Section>
            </Section>
            <Section style={nextSteps}>
              <Text style={h2}>What&apos;s Next?</Text>
              <Text style={text}>
                1. We&apos;ll process your order and update you on its status
                <br />
                2. You&apos;ll receive notifications as your order progresses
                <br />
                3. Track your order anytime through your MerchTrack account
              </Text>
            </Section>

            <Hr style={divider} />

            <Section style={faqSection}>
              <Heading style={h2}>Frequently Asked Questions</Heading>
              <div style={faqItem}>
                <Text style={faqQuestion}>When will my order be processed?</Text>
                <Text style={faqAnswer}>Orders are typically processed within 1-2 business days after payment confirmation.</Text>
              </div>
              <div style={faqItem}>
                <Text style={faqQuestion}>How can I track my order?</Text>
                <Text style={faqAnswer}>You can track your order status by logging into your MerchTrack account and visiting the Orders section.</Text>
              </div>
              <div style={faqItem}>
                <Text style={faqQuestion}>Can I modify my order?</Text>
                <Text style={faqAnswer}>Order modifications can be made within 1 hour of placing the order. Please contact our support team for assistance.</Text>
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

            <Text style={callToAction}>
              Need to check your order? Login to your MerchTrack account
            </Text>

            <Text style={footer}>
              Questions about your order? Contact our support team at{" "}
              <a href="https://merchtrack.tech/contacts" style={link}>
                our contact page
              </a>
              !
            </Text>

            <Hr style={divider} />
            
            <Section style={footer}>
              <Text style={footerText}>
                For any questions or concerns, visit our{" "}
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
  margin: "4px 0",
};

const orderValue = {
  fontSize: "16px",
  color: "#1a1a1a",
  fontWeight: "500",
  margin: "0 0 16px 0",
};

const h2 = {
  color: "#1a1a1a",
  fontSize: "20px",
  fontWeight: "600",
  margin: "24px 0 16px",
};

const orderSummary = {
  margin: "32px 0",
};

const itemsContainer = {
  margin: "16px 0",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  overflow: "hidden",
};

const itemRow = {
  padding: "16px",
  borderBottom: "1px solid #e2e8f0",
  display: "flex",
  alignItems: "center",
  backgroundColor: "#ffffff",
  transition: "background-color 0.2s ease",
};

const itemImageCol = {
  width: "60px",
};

const itemImage = {
  borderRadius: "4px",
  objectFit: "cover" as const,
};

const itemDetails = {
  flex: 1,
  padding: "0 16px",
};

const itemName = {
  fontSize: "16px",
  color: "#1a1a1a",
  margin: "0 0 4px 0",
};

const itemVariant = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "4px 0",
};

const itemQuantity = {
  fontSize: "14px",
  color: "#6b7280",
  margin: "0",
};

const itemPrice = {
  textAlign: "right" as const,
};

const priceText = {
  fontSize: "16px",
  color: "#1a1a1a",
  margin: "0",
};

const totalSection = {
  margin: "24px 0",
  backgroundColor: "#f8fafc",
  padding: "16px",
  borderRadius: "8px",
};

const subtotalRow = {
  padding: "8px 16px",
};

const subtotalAmount = {
  fontSize: "16px",
  color: "#1a1a1a",
  textAlign: "right" as const,
};

const totalRow = {
  padding: "16px 0",
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  marginTop: "24px",
};

const totalLabel = {
  fontSize: "16px",
  fontWeight: "600",
  color: "#1a1a1a",
  margin: "0",
  paddingLeft: "16px",
};

const totalAmount = {
  fontSize: "18px",
  fontWeight: "600",
  color: "#5046e4",
  margin: "0",
  textAlign: "right" as const,
  paddingRight: "16px",
};

const nextSteps = {
  margin: "32px 0",
  padding: "24px",
  backgroundColor: "#f0f9ff",
  borderRadius: "8px",
  border: "1px solid #e0f2fe",
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

const infoRow = {
  display: "flex",
  justifyContent: "space-between",
  padding: "12px 0",
  borderBottom: "1px solid #f0f0f0",
};

const link = {
  color: "#5046e4",
  textDecoration: "none",
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

export default OrderConfirmationEmail;