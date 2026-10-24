import { Test, TestingModule } from '@nestjs/testing';
import { DepotsController } from './depots.controller';
import { DepotsService } from './depots.service';

describe('DepotsController', () => {
  let controller: DepotsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DepotsController],
      providers: [DepotsService],
    }).compile();

    controller = module.get<DepotsController>(DepotsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
