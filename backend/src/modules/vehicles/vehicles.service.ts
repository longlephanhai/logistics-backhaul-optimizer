import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Vehicle, VehicleDocument } from './schema/vehicle.schema';
import mongoose, { Model } from 'mongoose';
import { IUser } from '@/users/users.type';
import aqp from 'api-query-params';

@Injectable()
export class VehiclesService {
  constructor(
    @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
  ) {}

  async create(createVehicleDto: CreateVehicleDto, user: IUser) {
    const { plateNumber } = createVehicleDto;
    const formattedPlateNumber = plateNumber.trim().toUpperCase();

    const isExist = await this.vehicleModel.findOne({
      plateNumber: formattedPlateNumber,
      isDeleted: false,
    });
    if (isExist) {
      throw new BadRequestException(
        `Phương tiện với biển số "${formattedPlateNumber}" đã tồn tại trên hệ thống!`,
      );
    }

    const newVehicle = await this.vehicleModel.create({
      ...createVehicleDto,
      plateNumber: formattedPlateNumber,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });

    return newVehicle;
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

    const totalItems = await this.vehicleModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const defaultPopulate = [
      { path: 'owner', select: { name: 1, email: 1, phone: 1, _id: 1 } },
      { path: 'driver', select: { name: 1, email: 1, phone: 1, _id: 1 } },
      { path: 'currentDepot', select: { name: 1, address: 1, location: 1, _id: 1 } },
    ];

    const result = await this.vehicleModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population && Object.keys(population).length > 0 ? population : defaultPopulate)
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
      throw new BadRequestException(`ID phương tiện không hợp lệ: ${id}`);
    }

    const foundVehicle = await this.vehicleModel
      .findOne({ _id: id, isDeleted: false })
      .populate([
        { path: 'owner', select: { name: 1, email: 1, phone: 1, _id: 1 } },
        { path: 'driver', select: { name: 1, email: 1, phone: 1, _id: 1 } },
        { path: 'currentDepot', select: { name: 1, address: 1, location: 1, capacityTrucks: 1, _id: 1 } },
      ]);

    if (!foundVehicle) {
      throw new BadRequestException(`Không tìm thấy phương tiện với ID = ${id}`);
    }

    return foundVehicle;
  }

  async update(id: string, updateVehicleDto: UpdateVehicleDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID phương tiện không hợp lệ: ${id}`);
    }

    if (updateVehicleDto.plateNumber) {
      const formattedPlate = updateVehicleDto.plateNumber.trim().toUpperCase();
      const duplicate = await this.vehicleModel.findOne({
        _id: { $ne: id },
        plateNumber: formattedPlate,
        isDeleted: false,
      });
      if (duplicate) {
        throw new BadRequestException(
          `Biển số xe "${formattedPlate}" đã được sử dụng bởi phương tiện khác!`,
        );
      }
      updateVehicleDto.plateNumber = formattedPlate;
    }

    const updated = await this.vehicleModel.updateOne(
      { _id: id },
      {
        ...updateVehicleDto,
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
      throw new BadRequestException(`ID phương tiện không hợp lệ: ${id}`);
    }

    return await this.vehicleModel.updateOne(
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
