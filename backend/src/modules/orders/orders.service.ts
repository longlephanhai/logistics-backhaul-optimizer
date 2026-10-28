import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { CancelOrderDto } from './dto/cancel-order.dto';
import { Order, OrderDocument } from './schema/order.schema';
import { OrderStatus } from './orders.type';
import { IUser } from '@/users/users.type';
import aqp from 'api-query-params';

import { Vehicle, VehicleDocument } from '@/vehicles/schema/vehicle.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Vehicle.name) private vehicleModel: Model<VehicleDocument>,
  ) {}

  async create(createOrderDto: CreateOrderDto, user: IUser) {

    let formattedOrderCode = createOrderDto.orderCode?.trim().toUpperCase();
    if (!formattedOrderCode) {
      const timestamp = Date.now().toString().slice(-6);
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      formattedOrderCode = `ORD-${timestamp}${randomSuffix}`;
    }


    const isExist = await this.orderModel.findOne({
      orderCode: formattedOrderCode,
      isDeleted: false,
    });
    if (isExist) {
      throw new BadRequestException(
        `Mã đơn hàng "${formattedOrderCode}" đã tồn tại trên hệ thống!`,
      );
    }

    const pickupReady = new Date(createOrderDto.pickupReadyTime);
    const pickupClosing = new Date(createOrderDto.pickupClosingTime);
    const deliveryStart = new Date(createOrderDto.deliveryStartTime);
    const deliveryEnd = new Date(createOrderDto.deliveryEndTime);

    if (pickupReady >= pickupClosing) {
      throw new BadRequestException(
        'Thời gian sẵn sàng bốc hàng phải trước hạn chót bốc hàng!',
      );
    }

    if (deliveryStart >= deliveryEnd) {
      throw new BadRequestException(
        'Thời gian bắt đầu giao hàng phải trước hạn chót giao hàng!',
      );
    }

    if (pickupClosing > deliveryStart) {
      throw new BadRequestException(
        'Thời gian giao hàng phải sau thời gian bốc hàng!',
      );
    }

    const shipperId = new mongoose.Types.ObjectId(
      createOrderDto.shipper?.toString() || user._id,
    );

    const newOrder = await this.orderModel.create({
      ...createOrderDto,
      orderCode: formattedOrderCode,
      price: createOrderDto.price || 0,
      shipper: shipperId,
      status: createOrderDto.status || OrderStatus.PENDING,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });

    return newOrder;
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

    const totalItems = await this.orderModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const defaultPopulate = [
      { path: 'shipper', select: { name: 1, email: 1, phone: 1, _id: 1 } },
      { path: 'assignedVehicle', select: { plateNumber: 1, vehicleType: 1, maxWeightKg: 1, maxVolumeCbm: 1, _id: 1 } },
    ];

    const result = await this.orderModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any || { createdAt: -1 })
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
      throw new BadRequestException(`ID đơn hàng không hợp lệ: ${id}`);
    }

    const foundOrder = await this.orderModel
      .findOne({ _id: id, isDeleted: false })
      .populate([
        { path: 'shipper', select: { name: 1, email: 1, phone: 1, _id: 1 } },
        { path: 'assignedVehicle', select: { plateNumber: 1, vehicleType: 1, maxWeightKg: 1, maxVolumeCbm: 1, _id: 1 } },
      ]);

    if (!foundOrder) {
      throw new BadRequestException(`Không tìm thấy đơn hàng với ID = ${id}`);
    }

    return foundOrder;
  }

  async update(id: string, updateOrderDto: UpdateOrderDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID đơn hàng không hợp lệ: ${id}`);
    }

    const currentOrder = await this.orderModel.findOne({ _id: id, isDeleted: false });
    if (!currentOrder) {
      throw new BadRequestException(`Không tìm thấy đơn hàng với ID = ${id}`);
    }

    if (currentOrder.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Không thể chỉnh sửa đơn hàng đã hoàn thành!');
    }

    if (currentOrder.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Không thể chỉnh sửa đơn hàng đã bị hủy!');
    }

    if (updateOrderDto.orderCode) {
      const formattedCode = updateOrderDto.orderCode.trim().toUpperCase();
      const duplicate = await this.orderModel.findOne({
        _id: { $ne: id },
        orderCode: formattedCode,
        isDeleted: false,
      });
      if (duplicate) {
        throw new BadRequestException(
          `Mã đơn hàng "${formattedCode}" đã được sử dụng bởi đơn hàng khác!`,
        );
      }
      updateOrderDto.orderCode = formattedCode;
    }

    const updated = await this.orderModel.updateOne(
      { _id: id },
      {
        ...updateOrderDto,
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
      throw new BadRequestException(`ID đơn hàng không hợp lệ: ${id}`);
    }

    const currentOrder = await this.orderModel.findOne({ _id: id, isDeleted: false });
    if (!currentOrder) {
      throw new BadRequestException(`Không tìm thấy đơn hàng với ID = ${id}`);
    }

    if (currentOrder.status === OrderStatus.IN_TRANSIT) {
      throw new BadRequestException('Không thể xóa đơn hàng đang trong hành trình vận chuyển!');
    }

    return await this.orderModel.updateOne(
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

  async cancel(id: string, cancelOrderDto: CancelOrderDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`ID đơn hàng không hợp lệ: ${id}`);
    }

    const order = await this.orderModel.findOne({ _id: id, isDeleted: false });
    if (!order) {
      throw new BadRequestException(`Không tìm thấy đơn hàng với ID = ${id}`);
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Đơn hàng này đã ở trạng thái đã hủy trước đó!');
    }

    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Không thể hủy đơn hàng đã hoàn tất giao hàng!');
    }

    const now = new Date();
    let cancellationFee = 0;

    // 1. Đơn còn PENDING: Hủy tự do, phí = 0đ
    if (order.status === OrderStatus.PENDING) {
      cancellationFee = 0;
    }
    // 2. Đơn đã gán xe (ASSIGNED): Kiểm tra mốc 2 tiếng trước giờ lấy
    else if (order.status === OrderStatus.ASSIGNED) {
      const hoursUntilPickup =
        (new Date(order.pickupReadyTime).getTime() - now.getTime()) / (1000 * 3600);

      if (hoursUntilPickup <= 2) {
        // Hủy sát giờ bốc hàng (<= 2h): Phạt 200.000 VNĐ hỗ trợ tiền dầu
        cancellationFee = 200000;
      } else {
        // Hủy sớm (> 2h): Miễn phí
        cancellationFee = 0;
      }
    }
    // 3. Đơn đã vào hành trình (IN_TRANSIT): Phạt phí TONU 50% cước
    else if (order.status === OrderStatus.IN_TRANSIT) {
      cancellationFee = Math.round(order.price * 0.5);
    }

    await this.orderModel.updateOne(
      { _id: id },
      {
        status: OrderStatus.CANCELLED,
        cancellationReason: cancelOrderDto.reason,
        cancellationFee,
        cancelledAt: now,
        updatedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return {
      _id: id,
      orderCode: order.orderCode,
      status: OrderStatus.CANCELLED,
      cancellationFee,
      cancellationReason: cancelOrderDto.reason,
      cancelledAt: now,
    };
  }
}
