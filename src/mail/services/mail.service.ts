import { Injectable } from '@nestjs/common';
import { simpleParser } from 'mailparser';
import { mondayMockData } from '../monday-response-ex';
import { getEmailConfig } from '../config/mail.config';
import { MailNotFoundException } from '../exception/mailNotFound.exception';
import { ImapClientService } from 'src/imap/imap-client.service';

@Injectable()
export class MailService {
  constructor(private readonly imapClientService: ImapClientService) {}

  async getUnreadEmails() {
    const results = [];

    for (const mail of mondayMockData) {
      const accountConfig = getEmailConfig(mail.mailbox);
      const imapConfig = {
        imap: {
          user: accountConfig.user,
          password: accountConfig.password,
          host: accountConfig.host,
          port: 993,
          tls: true,
          tlsOptions: {
            rejectUnauthorized: false,
          },
          connectTimeout: 100000,
          authTimeout: 30000,
        },
      };

      try {
        const connection = await this.imapClientService.connect(imapConfig);
        await this.imapClientService.openInbox(connection);

        const searchCriteria = [
          'UNSEEN',
          ['HEADER', 'SUBJECT', mail.subject],
          ['HEADER', 'FROM', mail.fromName],
        ];

        const fetchOptions = {
          bodies: ['HEADER.FIELDS (FROM TO SUBJECT DATE)', 'TEXT'],
          markSeen: false,
          struct: true,
        };

        const messages = await this.imapClientService.search(
          connection,
          searchCriteria,
          fetchOptions,
        );

        for (const message of messages) {
          const part = message?.parts.find(part => part.which === 'TEXT')?.body;

          const cleanedPart = part?.replace(/Content-Type: text\/html; charset=UTF-8[\s\S]*/, '');

          const parsedEmail = await simpleParser(cleanedPart, {skipTextToHtml: true,});

          results.push({
            text: parsedEmail.text || '',
            mailbox: mail.mailbox,
          });

          const uid = message.attributes.uid;
          await this.imapClientService.markAsSeen(connection, uid);
        }

        this.imapClientService.closeConnection(connection);
      } catch {
        throw new MailNotFoundException(mail.fromName, mail.subject);
      }
    }

    return results;
  }
}
