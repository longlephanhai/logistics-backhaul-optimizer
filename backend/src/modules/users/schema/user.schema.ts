import { Role } from '@/roles/schema/role.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { UserStatus } from '../users.type';

export type UserDocument = HydratedDocument<User>;



@Schema({ timestamps: true })
export class User {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    password: string;

    @Prop({ default: null })
    phone?: string;

    @Prop({ default: null })
    avatar?: string;

    @Prop({ default: null })
    address?: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Role.name })
    role: mongoose.Schema.Types.ObjectId;

    @Prop()
    refreshToken: string;

    @Prop({
        type: String,
        enum: UserStatus,
        default: UserStatus.ACTIVE,
    })
    status: UserStatus;

    @Prop({ type: Object, default: null })
    createdBy?: {
        _id: Types.ObjectId;
        email: string;
    };

    @Prop({ type: Object, default: null })
    updatedBy?: {
        _id: Types.ObjectId;
        email: string;
    };

    @Prop({ type: Object, default: null })
    deletedBy?: {
        _id: Types.ObjectId;
        email: string;
    };

    @Prop({ default: false })
    isDeleted: boolean;

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;

    @Prop({ default: null })
    deletedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);