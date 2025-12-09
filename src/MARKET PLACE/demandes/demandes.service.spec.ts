import { Test, TestingModule } from '@nestjs/testing';
import { DemandesService } from './demandes.service';

describe('DemandesService', () => {
  let service: DemandesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DemandesService],
    }).compile();

    service = module.get<DemandesService>(DemandesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
