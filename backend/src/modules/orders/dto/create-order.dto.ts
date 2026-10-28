import { GeoLocationDto } from '@/depots/dto/create-depot.dto';
import { VehicleType } from '@/vehicles/vehicles.type';
import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsDate,
    IsEnum,
    IsMongoId,
    IsNotEmpty,
    IsNumber,
    IsOptional,
    IsString,
    Min,
    ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';
import { OrderStatus } from '../orders.type';

export class OrderLocationDto {
    @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
    @IsString({ message: 'Địa chỉ phải là chuỗi ký tự' })
    address: string;

    @IsNotEmpty({ message: 'Tọa độ vị trí (location) không được để trống' })
    @ValidateNested()
    @Type(() => GeoLocationDto)
    location: GeoLocationDto;

    @IsOptional()
    @IsString({ message: 'Tên người liên hệ phải là chuỗi ký tự' })
    contactName?: string;

    @IsOptional()
    @IsString({ message: 'Số điện thoại người liên hệ phải là chuỗi ký tự' })
    contactPhone?: string;
}

export class CreateOrderDto {
    @IsOptional()
    @IsString({ message: 'Mã đơn hàng phải là chuỗi ký tự' })
    orderCode?: string;

    @IsNotEmpty({ message: 'Tên hàng hóa không được để trống' })
    @IsString({ message: 'Tên hàng hóa phải là chuỗi ký tự' })
    cargoName: string;

    @IsNotEmpty({ message: 'Khối lượng hàng hóa không được để trống' })
    @IsNumber({}, { message: 'Khối lượng hàng hóa phải là số' })
    @Min(10, { message: 'Khối lượng hàng hóa tối thiểu là 10 kg' })
    weightKg: number;

    @IsNotEmpty({ message: 'Thể tích hàng hóa không được để trống' })
    @IsNumber({}, { message: 'Thể tích hàng hóa phải là số' })
    @Min(0.1, { message: 'Thể tích hàng hóa tối thiểu là 0.1 m3' })
    volumeCbm: number;

    @IsNotEmpty({ message: 'Loại thùng xe yêu cầu không được để trống' })
    @IsEnum(VehicleType, {
        message: 'Loại thùng xe phải là một trong các giá trị: CLOSED_BOX, TARPAULIN, REFRIGERATED, FLATBED',
    })
    requiredTruckType: VehicleType;

    @IsNotEmpty({ message: 'Địa điểm bốc hàng (pickupLocation) không được để trống' })
    @ValidateNested()
    @Type(() => OrderLocationDto)
    pickupLocation: OrderLocationDto;

    @IsNotEmpty({ message: 'Địa điểm giao hàng (deliveryLocation) không được để trống' })
    @ValidateNested()
    @Type(() => OrderLocationDto)
    deliveryLocation: OrderLocationDto;

    @IsNotEmpty({ message: 'Thời gian sẵn sàng bốc hàng không được để trống' })
    @IsDate({ message: 'Thời gian sẵn sàng bốc hàng phải là định dạng ngày giờ hợp lệ' })
    @Type(() => Date)
    pickupReadyTime: Date;

    @IsNotEmpty({ message: 'Hạn chót bốc hàng không được để trống' })
    @IsDate({ message: 'Hạn chót bốc hàng phải là định dạng ngày giờ hợp lệ' })
    @Type(() => Date)
    pickupClosingTime: Date;

    @IsNotEmpty({ message: 'Thời gian bắt đầu giao hàng không được để trống' })
    @IsDate({ message: 'Thời gian bắt đầu giao hàng phải là định dạng ngày giờ hợp lệ' })
    @Type(() => Date)
    deliveryStartTime: Date;

    @IsNotEmpty({ message: 'Hạn chót giao hàng không được để trống' })
    @IsDate({ message: 'Hạn chót giao hàng phải là định dạng ngày giờ hợp lệ' })
    @Type(() => Date)
    deliveryEndTime: Date;

    @IsOptional()
    @IsNumber({}, { message: 'Giá cước phải là số' })
    @Min(0, { message: 'Giá cước không được âm' })
    price?: number;

    @IsOptional()
    @IsString({ message: 'Số hợp đồng B2B phải là chuỗi ký tự' })
    contractNumber?: string;

    @IsOptional()
    @IsBoolean({ message: 'Xác nhận điều khoản phải là boolean' })
    termsAccepted?: boolean;

    @IsOptional()
    @IsString({ message: 'Ghi chú phải là chuỗi ký tự' })
    note?: string;

    @IsOptional()
    @IsEnum(OrderStatus, {
        message: 'Trạng thái đơn hàng phải là: PENDING, ASSIGNED, IN_TRANSIT, COMPLETED hoặc CANCELLED',
    })
    status?: OrderStatus;

    @IsOptional()
    @IsMongoId({ message: 'ID chủ hàng (shipper) phải là Mongo ID hợp lệ' })
    shipper?: mongoose.Types.ObjectId;

    @IsOptional()
    @IsMongoId({ message: 'ID phương tiện gán phải là Mongo ID hợp lệ' })
    assignedVehicle?: mongoose.Types.ObjectId;

    @IsOptional()
    @IsMongoId({ message: 'ID chuyến xe gán phải là Mongo ID hợp lệ' })
    assignedTrip?: mongoose.Types.ObjectId;
}
