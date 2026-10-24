import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, ResponseMessage, User } from '../../decorator/customizr';
import type { IUser } from './users.type';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @ResponseMessage("Thêm mới người dùng thành công")
  create(@Body() createUserDto: CreateUserDto, @User() user: IUser) {
    return this.usersService.create(createUserDto, user);
  }

  @Get()
  @ResponseMessage("Lấy danh sách người dùng thành công")
  findAll(
    @Query("current") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qs: string,) {
    return this.usersService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage("Lấy người dùng theo ID thành công")
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @ResponseMessage("Cập nhật ngươì dùng thành công")
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @User() user: IUser) {
    return this.usersService.update(updateUserDto, user, id);
  }

  @Delete(':id')
  @ResponseMessage("Xóa người dùng thành công")
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.usersService.remove(id, user);
  }
}
