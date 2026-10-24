import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { DepotStatus } from "../depots.type";

export type DepotDocument = HydratedDocument<Depot>;

@Schema({ timestamps: true })
export class Depot {
    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ required: true })
    address: string;

    @Prop({
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
            required: true,
        },
        coordinates: {
            type: [Number],
            required: true,
        },
    })
    location: {
        type: string;
        coordinates: [number, number];
    };

    // sức chứa xe tối đa
    @Prop({ required: true, min: 1 })
    capacityTrucks: number;

    @Prop({
        type: String,
        enum: DepotStatus,
        default: DepotStatus.ACTIVE,
    })
    status: DepotStatus;

    @Prop({ default: null })
    contactPhone?: string;

    @Prop({ default: null })
    contactPerson?: string;

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
export const DepotSchema = SchemaFactory.createForClass(Depot);

DepotSchema.index({ location: '2dsphere' });
DepotSchema.index({ status: 1 });