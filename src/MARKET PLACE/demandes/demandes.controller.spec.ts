import { Test, TestingModule } from '@nestjs/testing';
import { DemandesController } from './demandes.controller';
import { DemandesService } from './demandes.service';

describe('DemandesController', () => {
  let controller: DemandesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DemandesController],
      providers: [DemandesService],
    }).compile();

    controller = module.get<DemandesController>(DemandesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
