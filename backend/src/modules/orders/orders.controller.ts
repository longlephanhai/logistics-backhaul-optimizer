import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { ResponseMessage, User } from '../../decorator/customizr';
import type { IUser } from '@/users/users.type';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ResponseMessage('Tạo mới đơn hàng thành công')
  create(@Body() createOrderDto: CreateOrderDto, @User() user: IUser) {
    return this.ordersService.create(createOrderDto, user);
  }

  @Get()
  @ResponseMessage('Lấy danh sách đơn hàng thành công')
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() qs: string,
  ) {
    return this.ordersService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Lấy chi tiết đơn hàng thành công')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Cập nhật đơn hàng thành công')
  update(
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
    @User() user: IUser,
  ) {
    return this.ordersService.update(id, updateOrderDto, user);
  }

  @Delete(':id')
  @ResponseMessage('Xóa đơn hàng thành công')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.ordersService.remove(id, user);
  }

  @Patch(':id/cancel')
  @ResponseMessage('Hủy đơn hàng thành công')
  cancel(
    @Param('id') id: string,
    @Body() cancelOrderDto: CancelOrderDto,
    @User() user: IUser,
  ) {
    return this.ordersService.cancel(id, cancelOrderDto, user);
  }
}
