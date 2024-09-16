import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MailModule } from './mail/mail.module';
import 'dotenv/config';
import { ConfigModule } from '@nestjs/config';
import { validate } from './env.validation';

@Module({
  imports: [MailModule, ConfigModule.forRoot({validate})],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
