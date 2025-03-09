import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const orderSourceSchema = new Schema({
    id: {
        type: Number,
        unique: true,
        required: true,
        immutable: true,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    source_id: {
        type: Schema.Types.ObjectId,
        ref: 'Source',
        required: true,
    },
    invoice_id: {
        type: Number,
        required: true,
    },
    unit_price: {
        type: Number,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    cycles: {
        type: String,
        default: '',
    },
    discount: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
    total_price: {
        type: Number,
        required: true,
    },
    data_url: {
        type: String,
        default: '',
    },
    bonus_point: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'canceled', 'deleted'],
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
});

orderSourceSchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.OrderSource.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }

        this.id = id;
    }

    next();
});

export const OrderSource = mongoose.model('OrderSource', orderSourceSchema);
