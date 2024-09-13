import { Injectable } from '@nestjs/common';
import * as Imap from 'imap-simple';
import { FetchOptions } from './fetchOption.interface';

@Injectable()
export class ImapClientService {
  async connect(imapConfig: Imap.ImapSimpleOptions): Promise<Imap.ImapSimple> {
    return await Imap.connect(imapConfig);
  }

  async openInbox(connection: Imap.ImapSimple): Promise<void> {
    await connection.openBox('INBOX');
  }

  async search(
    connection: Imap.ImapSimple,
    searchCriteria: any[],
    fetchOptions: FetchOptions
  ): Promise<Imap.Message[]> {
    return await connection.search(searchCriteria, fetchOptions);
  }

  async markAsSeen(connection: Imap.ImapSimple, uid: number): Promise<void> {
    await connection.addFlags(uid, '\\Seen');
  }

  closeConnection(connection: Imap.ImapSimple): void {
    connection.end();
  }
}
