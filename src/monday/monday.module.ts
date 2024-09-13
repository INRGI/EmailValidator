import { Module } from '@nestjs/common';
import { MondayService } from './monday.service';

@Module({
  providers: [MondayService]
})
export class MondayModule {}
