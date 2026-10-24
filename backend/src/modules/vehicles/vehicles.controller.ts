import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { ResponseMessage, User } from '../../decorator/customizr';
import type { IUser } from '@/users/users.type';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  @ResponseMessage('Tạo mới phương tiện thành công')
  create(@Body() createVehicleDto: CreateVehicleDto, @User() user: IUser) {
    return this.vehiclesService.create(createVehicleDto, user);
  }

  @Get()
  @ResponseMessage('Lấy danh sách phương tiện thành công')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.vehiclesService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Lấy thông tin phương tiện thành công')
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật phương tiện thành công')
  update(
    @Param('id') id: string,
    @Body() updateVehicleDto: UpdateVehicleDto,
    @User() user: IUser,
  ) {
    return this.vehiclesService.update(id, updateVehicleDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Xóa phương tiện thành công')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.vehiclesService.remove(id, user);
  }
}
