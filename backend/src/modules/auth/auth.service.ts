import { BadRequestException, Injectable } from '@nestjs/common';
import { IUser } from '@/users/users.type';
import { Response } from 'express';
import { UsersService } from '@/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RolesService } from '@/roles/roles.service';
import { Number } from 'mongoose';
import { NumberLiteralType } from 'typescript';
import { RegisterUserDto } from '@/users/dto/create-user.dto';

@Injectable()
export class AuthService {

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private rolesService: RolesService
  ) { }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user) {
      const isValid = this.usersService.isValidPassword(pass, user.password);
      if (isValid === true) {
        const userRole = user.role as unknown as { _id: string; name: string }
        const temp = await this.rolesService.findOne(userRole._id);

        const objUser = {
          ...user.toObject(),
          permissions: temp?.permissions ?? []
        }

        return objUser;
      }
    }

    return null;
  }

  createRefreshToken = (payload: any) => {
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
      expiresIn: this.configService.get<number>("JWT_REFRESH_EXPIRE")
    });
    return refresh_token;
  }

  async login(user: IUser, response: Response) {
    const { _id, name, email, role, permissions } = user;
    const payload = {
      sub: "token login",
      iss: "from server",
      _id,
      name,
      email,
      role
    };

    const refresh_token = this.createRefreshToken(payload);

    await this.usersService.updateUserToken(refresh_token, _id);

    response.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      maxAge: this.configService.get<number>("JWT_REFRESH_EXPIRE")
    })

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id,
        name,
        email,
        role,
        permissions
      },
    };
  }

  async register(user: RegisterUserDto) {
    let newUser = await this.usersService.register(user);

    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt
    };
  }

  async processNewToken(refreshToken: string, response: Response) {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET")
      })
      let user = await this.usersService.findUserByToken(refreshToken);
      if (user) {
        const { _id, name, email, role } = user;
        const payload = {
          sub: "token refresh",
          iss: "from server",
          _id,
          name,
          email,
          role
        };

        const refresh_token = this.createRefreshToken(payload);

        await this.usersService.updateUserToken(refresh_token, _id.toString());

        const userRole = user.role as unknown as { _id: string; name: string }
        const temp = await this.rolesService.findOne(userRole._id)

        response.clearCookie("refresh_token");

        response.cookie('refresh_token', refresh_token, {
          httpOnly: true,
          maxAge: this.configService.get<number>("JWT_REFRESH_EXPIRE")
        })


        return {
          access_token: this.jwtService.sign(payload),
          user: {
            _id,
            name,
            email,
            role,
            permissions: temp?.permissions ?? []
          }
        };
      } else {
        throw new BadRequestException(`Refresh token không hợp lệ. Vui lòng login.`)
      }
    } catch (error) {
      throw new BadRequestException(`Refresh token không hợp lệ. Vui lòng login.`)
    }
  }

  async logout(response: Response, user: IUser) {
    await this.usersService.updateUserToken("", user._id);
    response.clearCookie("refresh_token");
    return "ok";
  }
}
