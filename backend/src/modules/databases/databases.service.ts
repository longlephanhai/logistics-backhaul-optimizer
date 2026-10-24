import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Permission } from '@/permissions/schema/permission.schema';
import { User } from '@/users/schema/user.schema';
import { Role } from '@/roles/schema/role.schema';
import { UsersService } from '@/users/users.service';
import { ADMIN_ROLE, INIT_PERMISSIONS, USER_ROLE } from './sample-data';


@Injectable()
export class DatabasesService implements OnModuleInit {
    private readonly logger = new Logger(DatabasesService.name);

    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Permission.name) private permissionModel: Model<Permission>,

        @InjectModel(Role.name) private roleModel: Model<Role>,

        private configService: ConfigService,
        private userService: UsersService
    ) { }


    async onModuleInit() {
        const isInit = this.configService.get<string>("SHOULD_INIT");
        if (Boolean(isInit)) {

            const countUser = await this.userModel.countDocuments({})
            const countPermission = await this.permissionModel.countDocuments({});
            const countRole = await this.roleModel.countDocuments({});

            //create permissions
            if (countPermission === 0) {
                await this.permissionModel.insertMany(INIT_PERMISSIONS);
            }

            // create role
            if (countRole === 0) {
                const permissions = await this.permissionModel.find({}).select("_id");
                await this.roleModel.insertMany([
                    {
                        name: ADMIN_ROLE,
                        description: "Admin sở hữu toàn bộ quyền của hệ thống",
                        isActive: true,
                        permissions: permissions
                    },
                    {
                        name: USER_ROLE,
                        description: "Người dùng/Ứng viên sử dụng hệ thống",
                        isActive: true,
                        permissions: [] 
                    }
                ]);
            }

            if (countUser === 0) {
                const adminRole = await this.roleModel.findOne({ name: ADMIN_ROLE });
                const userRole = await this.roleModel.findOne({ name: USER_ROLE })
                await this.userModel.insertMany([
                    {
                        name: "Admin",
                        email: "admin@gmail.com",
                        password: this.userService.getHashPassword(this.configService.get<string>("INIT_PASSWORD")!),
                        role: adminRole?._id
                    },
                    {
                        name: "User",
                        email: "user@gmail.com",
                        password: this.userService.getHashPassword(this.configService.get<string>("INIT_PASSWORD")!),
                        role: userRole?._id
                    },
                ])
            }

            if (countUser > 0 && countRole > 0 && countPermission > 0) {
                this.logger.log('>>> ALREADY INIT SAMPLE DATA...');
            }
        }
    }
}