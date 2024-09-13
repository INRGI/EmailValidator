import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MondayModule } from './monday/monday.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [MondayModule, MailModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
