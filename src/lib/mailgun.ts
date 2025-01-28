import formData from 'form-data';
import Mailgun, { type MessagesSendResult } from 'mailgun.js';

const mailgunClientSingleton = () => {
  const mailgun = new Mailgun(formData);
  return mailgun.client({
    username: 'api',
    key: process.env.MAILGUN_API_KEY as string,
  });
};

declare const globalThis: {
  mailgunGlobal: ReturnType<typeof mailgunClientSingleton>;
} & typeof global;

const mailgunClient = globalThis.mailgunGlobal ?? mailgunClientSingleton();

export default mailgunClient;

if (process.env.NODE_ENV !== 'production') {globalThis.mailgunGlobal = mailgunClient;}

type EmailOptions = {
  to: string | string[]
  subject: string
  text: string
  from: string
}

export const sendEmail = async ({
  to,
  subject,
  text,
  from = 'MerchTrack Support'
}: EmailOptions): Promise<ActionsReturnType<MessagesSendResult>> => {
  try {
    const result = await mailgunClient.messages.create(process.env.MAILGUN_DOMAIN as string, {
      from: `${from} <no-reply@${process.env.MAILGUN_DOMAIN}>`,
      to,
      subject,
      html: text
    });
    return { success: true, data: result, message: 'Email sent successfully!' };
  } catch (error) {
    return { success: false, errors: { message: (error as Error).message, name: (error as Error).name } };
  }
};
