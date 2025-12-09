import { Test, TestingModule } from '@nestjs/testing';
import { OtmailService } from './otmail.service';

describe('OtmailService', () => {
  let service: OtmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OtmailService],
    }).compile();

    service = module.get<OtmailService>(OtmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
