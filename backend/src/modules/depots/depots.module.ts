import { Module } from '@nestjs/common';
import { DepotsService } from './depots.service';
import { DepotsController } from './depots.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Depot, DepotSchema } from './schema/depot.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Depot.name, schema: DepotSchema }
  ])],
  controllers: [DepotsController],
  providers: [DepotsService],
  exports: [DepotsService],
})
export class DepotsModule { }
