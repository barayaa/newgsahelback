import { Module } from '@nestjs/common';
import { OtmailService } from './otmail.service';

@Module({
  providers: [OtmailService],
  exports: [OtmailService],
})
export class OtpmailModule {}
