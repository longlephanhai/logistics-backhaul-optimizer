import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '@/users/users.module';
import { AuthModule } from '@/auth/auth.module';
import { RolesModule } from '@/roles/roles.module';
import { PermissionsModule } from '@/permissions/permissions.module';
import { DatabasesModule } from '@/databases/databases.module';
import { VehiclesModule } from '@/vehicles/vehicles.module';
import { DepotsModule } from '@/depots/depots.module';
import { OrdersModule } from '@/orders/orders.module';




@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    RolesModule,
    PermissionsModule,
    DatabasesModule,
    VehiclesModule,
    DepotsModule,
    OrdersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
