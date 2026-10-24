import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RolesService } from '@/roles/roles.service';
import { IUser } from '@/users/users.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        private rolesService: RolesService
    ) {
        const jwtSecret = configService.get<string>("JWT_ACCESS_TOKEN_SECRET");

        if (!jwtSecret) {
            throw new Error("JWT_ACCESS_TOKEN_SECRET is not defined");
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: jwtSecret,
        });
    }

    async validate(payload: IUser) {
        const { _id, name, email, role } = payload;

        const userRole = role as unknown as { _id: string; name: string }
        const temp = (await this.rolesService.findOne(userRole._id)).toObject();

        //req.user
        return {
            _id,
            name,
            email,
            role,
            permissions: temp?.permissions ?? []
        };
    }

}