import { Module } from '@nestjs/common';
import { MailService } from './services/mail.service';
import { MailController } from './mail.controller';
import { LinkValidatorService } from './services/linkValidator.service';
import { DriveModule } from 'src/drive/drive.module';
import { ImapModule } from 'src/imap/imap.module';

@Module({
  providers: [MailService, LinkValidatorService],
  controllers: [MailController],
  imports: [ImapModule, DriveModule]
})
export class MailModule {}
