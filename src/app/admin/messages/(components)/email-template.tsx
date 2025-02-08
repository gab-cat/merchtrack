import { Html, Head, Preview, Body, Container, Section, Heading, Text, Link, Button, Img } from '@react-email/components';
import { emailStyles, emailContent } from '@/constants/';

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
      <Body style={emailStyles.main}>
        <Container style={emailStyles.container}>
          {/* Header with university branding */}
          <Section style={emailStyles.header}>
            <Img
              src={emailContent.storeInfo.logoUrl}
              alt="MerchTrack Logo"
              style={emailStyles.logo}
            />
            <Heading style={emailStyles.heading}>MerchTrack Support</Heading>
          </Section>

          {/* Email content */}
          <Section style={emailStyles.content}>
            <Text style={emailStyles.text}>Hi there <b>{customerName}</b>!</Text>
            <Text style={emailStyles.text}>{replyContent}</Text>
            <Text style={emailStyles.text}>
              We hope this information helps. If you have any further questions, please don&apos;t hesitate to ask.
            </Text>
            <Text style={emailStyles.text}>Best regards,</Text>
            <Text style={emailStyles.text}><b>MerchTrack Support Team</b></Text>
          </Section>

          {/* Quick FAQs */}
          <Section style={emailStyles.faqSection}>
            <Heading style={emailStyles.subHeading}>Quick FAQs</Heading>
            {emailContent.faqs.map(({ question, answer }) => (
              <Text key={question} style={emailStyles.text}>
                <strong>{question}</strong> {answer}
              </Text>
            ))}
          </Section>

          {/* Helpful links and information */}
          <Section style={emailStyles.content}>
            <Heading style={emailStyles.subHeading}>Helpful Links</Heading>
            <ul style={emailStyles.list}>
              {emailContent.helpfulLinks.map(({ text, url }) => (
                <li key={text}>
                  <Link href={url} style={emailStyles.link}>{text}</Link>
                </li>
              ))}
            </ul>
            {emailContent.buttons.map(({ text, url }) => (
              <Button key={text} style={emailStyles.button} href={url}>{text}</Button>
            ))}
          </Section>

          {/* Footer with contact information */}
          <Section style={emailStyles.footer}>
            <Text style={emailStyles.footerText}>{emailContent.storeInfo.address}</Text>
            <Text style={emailStyles.footerText}>
              Phone: {emailContent.storeInfo.phone} | Email: {emailContent.storeInfo.email}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

