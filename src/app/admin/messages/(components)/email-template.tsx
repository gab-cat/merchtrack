// eslint-disable-next-line import/named
import { Html, Head, Preview, Body, Container, Section, Heading, Text, Link, Button } from '@react-email/components';

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
          {/* Header with university branding */}
          <Section style={header}>
            <img
              src="/placeholder.svg?height=60&width=200&text=University+Logo"
              alt="University Logo"
              style={logo}
            />
            <Heading style={heading}>MerchTrack Support</Heading>
          </Section>

          {/* Email content */}
          <Section style={content}>
            <Text style={text}>Dear <b>{customerName}</b>,</Text>
            <Text style={text}>{replyContent}</Text>
            <Text style={text}>
              We hope this information helps. If you have any further questions, please don&apos;t hesitate to ask.
            </Text>
            <Text style={text}>Best regards,</Text>
            <Text style={text}><b>MerchTrack Support Team</b></Text>
          </Section>

          {/* Quick FAQs */}
          <Section style={faqSection}>
            <Heading style={subHeading}>Quick FAQs</Heading>
            <Text style={text}><strong>What are your store hours?</strong> Our store is open Monday to Friday from 9 AM to 6 PM, and Saturday from 10 AM to 4 PM. We are closed on Sundays and university holidays.</Text>
            <Text style={text}><strong>Do you offer textbook rentals?</strong> Yes, we offer textbook rentals for many of our titles. Rental periods typically last for the duration of the semester. Check our website or visit the store for more details on specific titles.</Text>
            <Text style={text}><strong>What&apos;s your return policy?</strong> We offer a 30-day return policy for most items, provided they are in original condition with receipt. Textbooks can be returned within the first two weeks of the semester. Some restrictions may apply to electronic items and custom orders.</Text>
          </Section>

          {/* Helpful links and information */}
          <Section style={content}>
            <Heading style={subHeading}>Helpful Links</Heading>
            <ul style={list}>
              <li><Link href="https://merchtrack.tech" style={link}>Online Catalog</Link></li>
              <li><Link href="https://merchtrack.tech" style={link}>Textbook Lookup</Link></li>
              <li><Link href="https://merchtrack.tech" style={link}>Store Policies</Link></li>
              <li><Link href="https://merchtrack.tech" style={link}>Campus Map</Link></li>
            </ul>
            <Button style={button} href="https://merchtrack.tech">Visit Our Website</Button>
            <Button style={button} href="https://merchtrack.tech">Track Your Order</Button>
          </Section>

          {/* Footer with contact information */}
          <Section style={footer}>
            <Text style={footerText}>Ateneo Avenue | Ateneo de Naga University, Naga City 4400</Text>
            <Text style={footerText}>Phone: (555) 123-4567 | Email: support@merchtrack.tech</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: 'Poppins, sans-serif',
};

const container = {
  margin: '5px auto',
  padding: '20px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  maxWidth: '550px',
};

const header = {
  textAlign: 'center' as const,
  padding: '20px 0',
  backgroundColor: '#2C59DB',
  color: '#ffffff',
  borderRadius: '7px'
};

const logo = {
  marginBottom: '10px',
  height: '60px',
};

const heading = {
  fontSize: '24px',
  fontWeight: 'bold',
};

const content = {
  padding: '20px',
};

const text = {
  fontSize: '16px',
  lineHeight: '1.5',
  marginBottom: '20px',
};

const faqSection = {
  padding: '20px',
  backgroundColor: '#f0f4f8',
  borderRadius: '8px',
};

const subHeading = {
  fontSize: '20px',
  fontWeight: 'bold',
  marginBottom: '10px',
};

const list = {
  paddingLeft: '20px',
  marginBottom: '20px',
};

const link = {
  color: '#2C59DB',
  textDecoration: 'none',
};

const button = {
  display: 'inline-block',
  padding: '10px 20px',
  margin: '10px 0',
  backgroundColor: '#2C59DB',
  color: '#ffffff',
  textDecoration: 'none',
  borderRadius: '4px',
  marginRight: '10px',
};

const footer = {
  textAlign: 'center' as const,
  padding: '20px',
  backgroundColor: '#f0f4f8',
  borderRadius: '8px',
};

const footerText = {
  fontSize: '14px',
  color: '#666666',
};

