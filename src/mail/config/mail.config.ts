import * as dotenv from 'dotenv';

dotenv.config();

export const getEmailConfig = (mailbox: string) => {
  switch (mailbox) {
    case 'fchcgcgvv@gmail.com':
      return {
        user: process.env.EMAIL_USER_GMAIL,
        password: process.env.EMAIL_PASSWORD_GMAIL,
        host: process.env.EMAIL_HOST_GMAIL,
      };
    default:
      throw new Error('Unknown mailbox');
  }
};
