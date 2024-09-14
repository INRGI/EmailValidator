import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { MailService } from './services/mail.service';
import { LinkValidatorService } from './services/linkValidator.service';
import { DriveService } from 'src/drive/drive.service';

@Controller('mail')
export class MailController {
  constructor(
    private readonly mailService: MailService,
    private readonly linkValidatorService: LinkValidatorService,
    private readonly driveService: DriveService,
    ) {}

  @Get('check')
  async checkEmails() {
      const emails = await this.mailService.getUnreadEmails();
      const emailResults = [];

      for (const email of emails) {
        const linkValidationResults = await this.linkValidatorService.validateLinks(email.text);
        const copyOriginal = await this.driveService.findProduct(email.copyName);
        console.log(copyOriginal)
        emailResults.push({
          ...email,
          links: linkValidationResults,
          original: copyOriginal,
        });
      }

      return emailResults;
  }
}
