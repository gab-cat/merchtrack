import formData from 'form-data';
import Mailgun, { type MessagesSendResult } from 'mailgun.js';
import { MAILGUN_API_KEY, MAILGUN_DOMAIN, NODE_ENV } from '@/config';

const mailgunClientSingleton = () => {
  if (!MAILGUN_API_KEY) {
    throw new Error('MAILGUN_API_KEY is not defined');
  }
  if (!MAILGUN_DOMAIN) {
    throw new Error('MAILGUN_DOMAIN is not defined');
  }
  const mailgun = new Mailgun(formData);
  return mailgun.client({
    username: 'api',
    key: MAILGUN_API_KEY,
  });
};

declare const globalThis: {
  mailgunGlobal: ReturnType<typeof mailgunClientSingleton>;
} & typeof global;

const mailgunClient = globalThis.mailgunGlobal ?? mailgunClientSingleton();

export default mailgunClient;

if (NODE_ENV !== 'production') {globalThis.mailgunGlobal = mailgunClient;}

type EmailOptions = {
  to: string | string[]
  subject: string
  html: string
  from: string
}

export const sendEmail = async ({
  to,
  subject,
  html,
  from = 'MerchTrack Support'
}: EmailOptions): Promise<ActionsReturnType<MessagesSendResult>> => {
  try {
    const result = await mailgunClient.messages.create(MAILGUN_DOMAIN, {
      from: `${from} <no-reply@${MAILGUN_DOMAIN}>`,
      to,
      subject,
      html
    });
    return { success: true, data: result, message: 'Email sent successfully!' };
  } catch (error) {
    return { success: false, errors: { message: (error as Error).message, name: (error as Error).name } };
  }
};
