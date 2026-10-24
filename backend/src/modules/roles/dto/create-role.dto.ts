import { IsArray, IsBoolean, IsMongoId, IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class CreateRoleDto {
    @IsNotEmpty({ message: 'Tên vai trò không được để trống', })
    name: string;

    @IsNotEmpty({ message: 'Miêu tả không được để trống', })
    description: string;

    @IsNotEmpty({ message: 'Kích hoạt không được để trống', })
    @IsBoolean({ message: 'Kích hoạt có giá trị boolean' })
    isActive: boolean;

    @IsNotEmpty({ message: 'Quyền không được để trống', })
    @IsMongoId({ each: true, message: "Mỗi quyền hạn có định dạng MongoId" })
    @IsArray({ message: 'Quyền hạn có định dạng là array', })
    permissions: mongoose.Schema.Types.ObjectId[];

}