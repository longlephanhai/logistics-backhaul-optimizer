import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DepotsService } from './depots.service';
import { CreateDepotDto } from './dto/create-depot.dto';
import { UpdateDepotDto } from './dto/update-depot.dto';

@Controller('depots')
export class DepotsController {
  constructor(private readonly depotsService: DepotsService) {}

  @Post()
  create(@Body() createDepotDto: CreateDepotDto) {
    return this.depotsService.create(createDepotDto);
  }

  @Get()
  findAll() {
    return this.depotsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.depotsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDepotDto: UpdateDepotDto) {
    return this.depotsService.update(+id, updateDepotDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.depotsService.remove(+id);
  }
}
