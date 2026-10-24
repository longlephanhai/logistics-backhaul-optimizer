import { Injectable } from '@nestjs/common';
import { CreateDepotDto } from './dto/create-depot.dto';
import { UpdateDepotDto } from './dto/update-depot.dto';

@Injectable()
export class DepotsService {
  create(createDepotDto: CreateDepotDto) {
    return 'This action adds a new depot';
  }

  findAll() {
    return `This action returns all depots`;
  }

  findOne(id: number) {
    return `This action returns a #${id} depot`;
  }

  update(id: number, updateDepotDto: UpdateDepotDto) {
    return `This action updates a #${id} depot`;
  }

  remove(id: number) {
    return `This action removes a #${id} depot`;
  }
}
