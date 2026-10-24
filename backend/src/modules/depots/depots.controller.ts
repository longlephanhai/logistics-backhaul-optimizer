import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { DepotsService } from './depots.service';
import { CreateDepotDto } from './dto/create-depot.dto';
import { UpdateDepotDto } from './dto/update-depot.dto';
import { ResponseMessage, User } from '../../decorator/customizr';
import type { IUser } from '@/users/users.type';

@Controller('depots')
export class DepotsController {
  constructor(private readonly depotsService: DepotsService) {}

  @Post()
  @ResponseMessage('Tạo mới bãi xe thành công')
  create(@Body() createDepotDto: CreateDepotDto, @User() user: IUser) {
    return this.depotsService.create(createDepotDto, user);
  }

  @Get()
  @ResponseMessage('Lấy danh sách bãi xe thành công')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.depotsService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Lấy thông tin bãi xe thành công')
  findOne(@Param('id') id: string) {
    return this.depotsService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật thông tin bãi xe thành công')
  update(
    @Param('id') id: string,
    @Body() updateDepotDto: UpdateDepotDto,
    @User() user: IUser,
  ) {
    return this.depotsService.update(id, updateDepotDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Xóa bãi xe thành công')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.depotsService.remove(id, user);
  }
}
