import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateDepotDto } from './dto/create-depot.dto';
import { UpdateDepotDto } from './dto/update-depot.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Depot, DepotDocument } from './schema/depot.schema';
import mongoose, { Model } from 'mongoose';
import { IUser } from '@/users/users.type';
import aqp from 'api-query-params';

@Injectable()
export class DepotsService {
  constructor(
    @InjectModel(Depot.name) private depotModel: Model<DepotDocument>,
  ) {}

  async create(createDepotDto: CreateDepotDto, user: IUser) {
    const { name } = createDepotDto;

    const isExist = await this.depotModel.findOne({ name, isDeleted: false });
    if (isExist) {
      throw new BadRequestException(`Bãi xe với tên "${name}" đã tồn tại!`);
    }

    const newDepot = await this.depotModel.create({
      ...createDepotDto,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });

    return newDepot;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;

    if (filter.isDeleted === undefined) {
      filter.isDeleted = false;
    }

    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;

    const totalItems = await this.depotModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.depotModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select(projection as any)
      .exec();

    return {
      meta: {
        current: currentPage,
        pageSize: defaultLimit,
        pages: totalPages,
        total: totalItems,
      },
      result,
    };
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID bãi xe không hợp lệ: ${id}`);
    }

    const foundDepot = await this.depotModel.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!foundDepot) {
      throw new BadRequestException(`Không tìm thấy bãi xe với ID = ${id}`);
    }

    return foundDepot;
  }

  async update(id: string, updateDepotDto: UpdateDepotDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID bãi xe không hợp lệ: ${id}`);
    }

    const updated = await this.depotModel.updateOne(
      { _id: id },
      {
        ...updateDepotDto,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return updated;
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID bãi xe không hợp lệ: ${id}`);
    }

    return await this.depotModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
        isDeleted: true,
        deletedAt: new Date(),
      },
    );
  }
}
