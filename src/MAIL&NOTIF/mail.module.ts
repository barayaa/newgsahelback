import { Module } from '@nestjs/common';
import { mailService } from './mail.service';

@Module({
  providers: [mailService],
  exports: [mailService],
})
export class MailModule {}
