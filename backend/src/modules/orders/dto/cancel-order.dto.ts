import { IsNotEmpty, IsString } from 'class-validator';

export class CancelOrderDto {
    @IsNotEmpty({ message: 'Lý do hủy đơn không được để trống' })
    @IsString({ message: 'Lý do hủy đơn phải là chuỗi ký tự' })
    reason: string;
}
