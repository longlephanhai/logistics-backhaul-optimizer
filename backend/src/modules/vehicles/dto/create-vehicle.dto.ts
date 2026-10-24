import { GeoLocationDto } from '@/depots/dto/create-depot.dto';
import { Type } from 'class-transformer';

import mongoose from 'mongoose';
import { VehicleStatus, VehicleType } from '../vehicles.type';
import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';

export class CreateVehicleDto {
    @IsNotEmpty({ message: 'Biển số xe không được để trống' })
    @IsString({ message: 'Biển số xe phải là chuỗi ký tự' })
    plateNumber: string;

    @IsOptional()
    @IsString({ message: 'Tên model xe phải là chuỗi ký tự' })
    modelName?: string;

    @IsNotEmpty({ message: 'Chủ sở hữu (owner / carrier) không được để trống' })
    @IsMongoId({ message: 'ID chủ sở hữu phải là Mongo ID hợp lệ' })
    owner: mongoose.Schema.Types.ObjectId;

    @IsOptional()
    @IsMongoId({ message: 'ID tài xế phải là Mongo ID hợp lệ' })
    driver?: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: 'Loại thùng xe không được để trống' })
    @IsEnum(VehicleType, {
        message: 'Loại thùng xe phải là một trong các giá trị: CLOSED_BOX, TARPAULIN, REFRIGERATED, FLATBED',
    })
    vehicleType: VehicleType;

    @IsNotEmpty({ message: 'Tải trọng tối đa không được để trống' })
    @IsNumber({}, { message: 'Tải trọng tối đa phải là số' })
    @Min(100, { message: 'Tải trọng tối thiểu là 100 kg' })
    @Max(30000, { message: 'Tải trọng tối đa không vượt quá 30,000 kg (30 tấn)' })
    maxWeightKg: number;

    @IsNotEmpty({ message: 'Thể tích thùng tối đa không được để trống' })
    @IsNumber({}, { message: 'Thể tích thùng tối đa phải là số' })
    @Min(1.0, { message: 'Thể tích thùng tối thiểu là 1.0 m3' })
    @Max(200.0, { message: 'Thể tích thùng tối đa không vượt quá 200 m3' })
    maxVolumeCbm: number;

    @IsOptional()
    @IsNumber({}, { message: 'Chiều dài thùng xe phải là số' })
    @Min(1.0, { message: 'Chiều dài thùng xe tối thiểu là 1 mét' })
    lengthM?: number;

    @IsOptional()
    @IsNumber({}, { message: 'Chiều rộng thùng xe phải là số' })
    @Min(1.0, { message: 'Chiều rộng thùng xe tối thiểu là 1 mét' })
    widthM?: number;

    @IsOptional()
    @IsNumber({}, { message: 'Chiều cao thùng xe phải là số' })
    @Min(1.0, { message: 'Chiều cao thùng xe tối thiểu là 1 mét' })
    heightM?: number;

    @IsNotEmpty({ message: 'Định mức dầu khi chạy rỗng không được để trống' })
    @IsNumber({}, { message: 'Định mức dầu khi chạy rỗng phải là số' })
    @Min(1, { message: 'Định mức dầu tối thiểu là 1 lít/100km' })
    fuelEmptyRate: number;

    @IsNotEmpty({ message: 'Định mức dầu khi đầy tải không được để trống' })
    @IsNumber({}, { message: 'Định mức dầu khi đầy tải phải là số' })
    @Min(1, { message: 'Định mức dầu tối thiểu là 1 lít/100km' })
    fuelFullRate: number;

    @IsNotEmpty({ message: 'Đơn giá vận hành mỗi km (costPerKm) không được để trống' })
    @IsNumber({}, { message: 'Đơn giá vận hành mỗi km phải là số' })
    @Min(1000, { message: 'Đơn giá vận hành tối thiểu là 1,000 VNĐ/km' })
    costPerKm: number;

    @IsOptional()
    @IsEnum(VehicleStatus, {
        message: 'Trạng thái xe phải là: IDLE, IN_TRANSIT hoặc MAINTENANCE',
    })
    status?: VehicleStatus;

    @IsOptional()
    @ValidateNested()
    @Type(() => GeoLocationDto)
    currentLocation?: GeoLocationDto;

    @IsOptional()
    @IsMongoId({ message: 'ID bãi xe hiện tại phải là Mongo ID hợp lệ' })
    currentDepot?: mongoose.Schema.Types.ObjectId;

    @IsOptional()
    @IsNumber({}, { message: 'Điểm tín nhiệm phải là số' })
    @Min(1.0, { message: 'Điểm tín nhiệm tối thiểu là 1.0' })
    @Max(5.0, { message: 'Điểm tín nhiệm tối đa là 5.0' })
    rating?: number;
}
