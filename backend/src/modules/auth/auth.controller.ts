import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from '../../decorator/customizr';
import type { Request, Response } from 'express';
import type { IUser } from '@/users/users.type';
import { RegisterUserDto } from '@/users/dto/create-user.dto';
import { RolesService } from '@/roles/roles.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly roleService: RolesService
  ) { }

  @Post('/login')
  @ResponseMessage('Đăng nhập thành công')
  login(@Req() req: Request, @Res({ passthrough: true }) response: Response) {
    return this.authService.login(req.user as IUser, response);
  }

  @Public()
  @ResponseMessage("Đăng ký thành công")
  @Post('/register')
  handleRegister(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @ResponseMessage("Get user information")
  @Get('/account')
  async handleGetAccount(@User() user: IUser) {
    const temp = await this.roleService.findOne(user.role._id) as any;
    user.permissions = temp.permissions;
    return { user };
  }

  @Public()
  @ResponseMessage("Get User by refresh token")
  @Get('/refresh')
  handleRefreshToken(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
    const refreshToken = request.cookies["refresh_token"];
    return this.authService.processNewToken(refreshToken, response);
  }

  @ResponseMessage("Logout User")
  @Post('/logout')
  handleLogout(
    @Res({ passthrough: true }) response: Response,
    @User() user: IUser
  ) {
    return this.authService.logout(response, user);
  }
}
