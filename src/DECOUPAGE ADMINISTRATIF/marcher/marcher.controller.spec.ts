import { Test, TestingModule } from '@nestjs/testing';
import { MarcherController } from './marcher.controller';
import { MarcherService } from './marcher.service';

describe('MarcherController', () => {
  let controller: MarcherController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MarcherController],
      providers: [MarcherService],
    }).compile();

    controller = module.get<MarcherController>(MarcherController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
