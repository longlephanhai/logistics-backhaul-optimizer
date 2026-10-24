import { Module } from '@nestjs/common';
import { DatabasesService } from './databases.service';
import { UsersService } from '@/users/users.service';
import { MongooseModule } from '@nestjs/mongoose';

import { Permission, PermissionSchema } from '@/permissions/schema/permission.schema';
import { Role, RoleSchema } from '@/roles/schema/role.schema';
import { User, UserSchema } from '@/users/schema/user.schema';


@Module({
  providers: [DatabasesService, UsersService],
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Permission.name, schema: PermissionSchema },
      { name: Role.name, schema: RoleSchema },
    ])
  ],

})
export class DatabasesModule { }