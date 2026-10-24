import { User } from "@/users/schema/user.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { VehicleStatus, VehicleType } from "../vehicles.type";
import { Depot } from "@/depots/schema/depot.schema";

export type VehicleDocument = HydratedDocument<Vehicle>;

@Schema({ timestamps: true })
export class Vehicle {
    @Prop({ required: true, unique: true })
    plateNumber: string;

    @Prop({ default: null, trim: true })
    modelName?: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
    owner: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, default: null })
    driver?: mongoose.Schema.Types.ObjectId;

    @Prop({ enum: VehicleType, required: true })
    vehicleType: VehicleType;

    @Prop({ required: true, min: 100, max: 30000 })
    maxWeightKg: number;

    @Prop({ required: true, min: 1.0, max: 200.0 })
    maxVolumeCbm: number;

    @Prop({ default: 6.2, min: 1.0 })
    lengthM: number; // Chiều dài (mét)

    @Prop({ default: 2.3, min: 1.0 })
    widthM: number; // Chiều rộng (mét)

    @Prop({ default: 2.5, min: 1.0 })
    heightM: number; // Chiều cao (mét)

    // Định mức dầu chạy rỗng & đầy tải (Lít/100km) phục vụ tính CO2 (ISO 14083)
    @Prop({ required: true, min: 1 })
    fuelEmptyRate: number;

    @Prop({ required: true, min: 1 })
    fuelFullRate: number;

    @Prop({ required: true, min: 1000 })
    costPerKm: number;

    @Prop({
        type: String,
        enum: VehicleStatus,
        default: VehicleStatus.IDLE,
    })
    status: VehicleStatus;

    @Prop({
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [lng, lat]
            default: [108.2022, 16.0544], // Tọa độ mặc định (vd: Đà Nẵng)
        },
    })
    currentLocation: {
        type: string;
        coordinates: [number, number];
    };

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Depot.name, default: null })
    currentDepot?: mongoose.Schema.Types.ObjectId;

    @Prop({ default: 5.0, min: 1.0, max: 5.0 })
    rating: number;

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

export const VehicleSchema = SchemaFactory.createForClass(Vehicle);

VehicleSchema.index({ currentLocation: '2dsphere' });
VehicleSchema.index({ status: 1 });
VehicleSchema.index({ owner: 1 });