import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role } from './schema/role.schema';
import mongoose, { Model } from 'mongoose';
import { IUser } from '@/users/users.type';
import aqp from 'api-query-params';
import { ADMIN_ROLE } from '@/databases/sample-data';

@Injectable()
export class RolesService {

  constructor(@InjectModel(Role.name) private roleModel: Model<Role>) { }

  async create(createRoleDto: CreateRoleDto, user: IUser) {
    const { name, description, isActive, permissions } = createRoleDto;


    const isExist = await this.roleModel.findOne({ name });
    if (isExist) {
      throw new BadRequestException(`Vai trò với tên="${name}" đã tồn tại!`)
    }

    const newRole = await this.roleModel.create({
      name, description, isActive, permissions,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })

    return {
      _id: newRole?._id,
      createdAt: newRole?.createdAt
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    let offset = (+currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.roleModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);


    const result = await this.roleModel.find(filter)
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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Không tìm thấy vai trò này")
    }

    const foundRole = await this.roleModel.findById(id);

    if (!foundRole) {
      throw new BadRequestException("Không tìm thấy vai trò này");
    }

    return foundRole.populate({
      path: "permissions",
      select: { _id: 1, apiPath: 1, name: 1, method: 1, module: 1 }
    });
  }

  async update(_id: string, updateRoleDto: UpdateRoleDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new BadRequestException("Không tìm thấy vai trò này")
    }

    const { name, description, isActive, permissions } = updateRoleDto;
    const userObjectId = new mongoose.Types.ObjectId(user._id);

    const updated = await this.roleModel.updateOne(
      { _id },
      {
        name, description, isActive, permissions,
        updatedBy: {
          _id: userObjectId as any,
          email: user.email
        }
      });

    return updated;
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("Không tìm thấy vai trò này");
    }

    const foundRole = await this.roleModel.findById(id);
    if (!foundRole) {
      throw new BadRequestException("Không tìm thấy vai trò này");
    }

    const userObjectId = new mongoose.Types.ObjectId(user._id);

    if (foundRole.name === ADMIN_ROLE) {
      throw new BadRequestException("Không thể xóa role ADMIN");
    }
    return await this.roleModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: userObjectId as any,
          email: user.email
        },
        isDeleted: true
      }
    )

  }
}