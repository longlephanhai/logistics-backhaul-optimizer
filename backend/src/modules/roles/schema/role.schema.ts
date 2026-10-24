import { Permission } from '@/permissions/schema/permission.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';


export type RoleDocument = HydratedDocument<Role>;

@Schema({ timestamps: true })
export class Role {
    @Prop()
    name: string;

    @Prop()
    description: string;

    @Prop()
    isActive: boolean;


    @Prop({ type: [mongoose.Schema.Types.ObjectId], ref: Permission.name })
    permissions: mongoose.Schema.Types.ObjectId[] | Permission[];


    @Prop({ type: Object })
    createdBy: {
        _id: mongoose.Schema.Types.ObjectId | string;
        email: string;
    }

    @Prop({ type: Object })
    updatedBy: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    }

    @Prop({ type: Object })
    deletedBy: {
        _id: mongoose.Schema.Types.ObjectId;
        email: string;
    }

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;

    @Prop({ default: false })
    isDeleted: boolean;

    @Prop()
    deletedAt: Date;
}

export const RoleSchema = SchemaFactory.createForClass(Role);