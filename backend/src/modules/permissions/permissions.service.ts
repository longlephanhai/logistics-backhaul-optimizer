import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Permission } from './schema/permission.schema';
import { Model, Types } from 'mongoose';
import { IUser } from '@/users/users.type';
import aqp from 'api-query-params';

@Injectable()
export class PermissionsService {

  constructor(@InjectModel(Permission.name) private permissionModel: Model<Permission>) { }

  async create(createPermissionDto: CreatePermissionDto, user: IUser) {
    const { name, apiPath, method, module } = createPermissionDto;

    const isExist = await this.permissionModel.findOne({ apiPath, method });
    if (isExist) {
      throw new BadRequestException(`Quyền hạn với đường dẫn API=${apiPath} , phương thức=${method} đã tồn tại!`)
    }

    const newPermission = await this.permissionModel.create({
      name, apiPath, method, module,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })

    return {
      _id: newPermission?._id,
      createdAt: newPermission?.createdAt
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.permissionModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);


    const result = await this.permissionModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select(projection as any)
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: totalPages,
        total: totalItems
      },
      result
    }
  }

  async findOne(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException("not found permission")
    }

    return await this.permissionModel.findById(id);
  }

  async update(_id: string, updatePermissionDto: UpdatePermissionDto, user: IUser) {
    if (!Types.ObjectId.isValid(_id)) {
      throw new BadRequestException("not found permission")
    }
    const { module, method, apiPath, name } = updatePermissionDto;

    const updated = await this.permissionModel.updateOne(
      { _id: new Types.ObjectId(_id) },
      {
        module, method, apiPath, name,
        updatedBy: {
          _id: new Types.ObjectId(user._id),
          email: user.email
        }
      });
    return updated;
  }

  async remove(id: string, user: IUser) {
    const objectId = new Types.ObjectId(id);

    return await this.permissionModel.updateOne(
      { _id: objectId },
      {
        deletedBy: {
          _id: new Types.ObjectId(user._id),
          email: user.email
        },
        isDeleted: true
      })
  }
}
