import { IsEmail, IsMongoId, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import mongoose from "mongoose";

export class CreateUserDto {
    @IsNotEmpty({ message: 'Tên không được để trống' })
    @IsString()
    name: string;

    @IsNotEmpty({ message: 'Email không được để trống' })
    @IsEmail({})
    email: string;

    @IsNotEmpty({ message: 'Password không được để trống' })
    @MinLength(6, { message: 'Password phải có ít nhất 6 ký tự' })
    password: string;

    @IsNotEmpty({ message: 'Phone không được để trống' })
    @IsString()
    phone: string;

    @IsOptional()
    @IsString()
    avatar?: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsNotEmpty({ message: 'Role không được để trống', })
    @IsMongoId({ message: 'Role có định dạng là mongo id', })
    role: mongoose.Schema.Types.ObjectId;
}

export class RegisterUserDto {
    @IsNotEmpty({ message: 'Tên không được để trống' })
    @IsString()
    name: string;

    @IsNotEmpty({ message: 'Email không được để trống' })
    @IsEmail({})
    email: string;

    @IsNotEmpty({ message: 'Password không được để trống' })
    @MinLength(6, { message: 'Password phải có ít nhất 6 ký tự' })
    password: string;

    @IsNotEmpty({ message: 'Phone không được để trống' })
    @IsString()
    phone: string;

    @IsOptional()
    @IsString()
    avatar?: string;

    @IsOptional()
    @IsString()
    address?: string;
}

