import { Type } from 'class-transformer';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min, ValidateNested } from 'class-validator';
import { DepotStatus } from '../depots.type';

export class GeoLocationDto {
    @IsOptional()
    @IsString()
    type?: string = 'Point';

    @IsNotEmpty({ message: 'Tọa độ coordinates không được để trống' })
    @IsArray({ message: 'Tọa độ coordinates phải là mảng [kinh độ, vĩ độ]' })
    @ArrayMinSize(2, { message: 'Tọa độ phải có đủ kinh độ và vĩ độ' })
    @ArrayMaxSize(2, { message: 'Tọa độ chỉ gồm [kinh độ, vĩ độ]' })
    @IsNumber({}, { each: true, message: 'Kinh độ và vĩ độ phải là số thực' })
    coordinates: [number, number]; // [lng, lat]
}

export class CreateDepotDto {
    @IsNotEmpty({ message: 'Tên bãi xe không được để trống' })
    @IsString({ message: 'Tên bãi xe phải là chuỗi ký tự' })
    name: string;

    @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
    @IsString({ message: 'Địa chỉ phải là chuỗi ký tự' })
    address: string;

    @IsNotEmpty({ message: 'Vị trí bãi xe (location) không được để trống' })
    @ValidateNested()
    @Type(() => GeoLocationDto)
    location: GeoLocationDto;

    @IsNotEmpty({ message: 'Sức chứa xe tối đa không được để trống' })
    @IsNumber({}, { message: 'Sức chứa phải là một con số' })
    @Min(1, { message: 'Sức chứa bãi xe tối thiểu là 1' })
    capacityTrucks: number;

    @IsOptional()
    @IsEnum(DepotStatus, { message: 'Trạng thái bãi xe không hợp lệ (ACTIVE hoặc INACTIVE)' })
    status?: DepotStatus;

    @IsOptional()
    @IsString({ message: 'Số điện thoại liên hệ phải là chuỗi ký tự' })
    contactPhone?: string;

    @IsOptional()
    @IsString({ message: 'Người liên hệ phải là chuỗi ký tự' })
    contactPerson?: string;
}
