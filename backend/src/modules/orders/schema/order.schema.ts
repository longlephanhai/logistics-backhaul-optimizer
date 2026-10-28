import { VehicleType } from "@/vehicles/vehicles.type";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument, Types } from "mongoose";
import { OrderStatus } from "../orders.type";
import { Vehicle } from "@/vehicles/schema/vehicle.schema";
import { User } from "@/users/schema/user.schema";

export type OrderDocument = HydratedDocument<Order>;

@Schema({ timestamps: true })
export class Order {
    @Prop({ required: true, uppercase: true, trim: true })
    orderCode: string;

    @Prop({ required: true, trim: true })
    cargoName: string;

    @Prop({ required: true, min: 10 })
    weightKg: number;

    @Prop({ required: true, min: 0.1 })
    volumeCbm: number;

    @Prop({ required: true, enum: VehicleType })
    requiredTruckType: VehicleType;

    @Prop({
        type: {
            address: { type: String, required: true },
            location: {
                type: { type: String, enum: ['Point'], default: 'Point' },
                coordinates: { type: [Number], required: true }, // [kinh độ, vĩ độ]
            },
            contactName: { type: String, default: null },
            contactPhone: { type: String, default: null },
        },
        required: true,
        _id: false,
    })
    pickupLocation: {
        address: string;
        location: { type: string; coordinates: [number, number] };
        contactName?: string;
        contactPhone?: string;
    };

    @Prop({
        type: {
            address: { type: String, required: true },
            location: {
                type: { type: String, enum: ['Point'], default: 'Point' },
                coordinates: { type: [Number], required: true }, // [kinh độ, vĩ độ]
            },
            contactName: { type: String, default: null },
            contactPhone: { type: String, default: null },
        },
        required: true,
        _id: false,
    })
    deliveryLocation: {
        address: string;
        location: { type: string; coordinates: [number, number] };
        contactName?: string;
        contactPhone?: string;
    };

    @Prop({ required: true })
    pickupReadyTime: Date;

    @Prop({ required: true })
    pickupClosingTime: Date;

    @Prop({ required: true })
    deliveryStartTime: Date;

    @Prop({ required: true })
    deliveryEndTime: Date;

    @Prop({ required: true, min: 0 })
    price: number;

    @Prop({ default: null, trim: true })
    contractNumber?: string;

    @Prop({ default: true })
    termsAccepted: boolean;

    @Prop({ default: null, trim: true })
    note?: string;

    @Prop({
        type: String,
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;

    @Prop({ default: null, trim: true })
    cancellationReason?: string;

    @Prop({ default: 0, min: 0 })
    cancellationFee?: number;

    @Prop({ default: null })
    cancelledAt?: Date;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: User.name, required: true })
    shipper: Types.ObjectId; // Chủ hàng (Người gửi hàng)

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Vehicle.name, default: null })
    assignedVehicle?: Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Trip', default: null })
    assignedTrip?: Types.ObjectId;

    @Prop({ type: Object, default: null })
    createdBy?: { _id: Types.ObjectId; email: string };

    @Prop({ type: Object, default: null })
    updatedBy?: { _id: Types.ObjectId; email: string };

    @Prop({ type: Object, default: null })
    deletedBy?: { _id: Types.ObjectId; email: string };

    @Prop()
    createdAt: Date;

    @Prop()
    updatedAt: Date;
    @Prop({ default: null })
    deletedAt?: Date;

    @Prop({ default: false })
    isDeleted: boolean;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ 'pickupLocation.location': '2dsphere' });
OrderSchema.index({ 'deliveryLocation.location': '2dsphere' });
OrderSchema.index({ status: 1 });
OrderSchema.index({ shipper: 1 });
OrderSchema.index({ orderCode: 1 });