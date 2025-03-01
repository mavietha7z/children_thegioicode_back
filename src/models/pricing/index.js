import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const pricingSchema = new Schema({
    id: {
        type: Number,
        unique: true,
        required: true,
        immutable: true,
    },
    service_id: {
        type: Schema.Types.ObjectId,
        refPath: 'service_type',
        required: true,
    },
    service_type: {
        type: String,
        enum: ['Template', 'Source', 'CloudServerProduct'],
        required: true,
    },
    cycles_id: {
        type: Schema.Types.ObjectId,
        ref: 'Cycles',
        required: true,
    },
    original_price: {
        type: Number,
        min: 0,
        required: true,
    },
    price: {
        type: Number,
        min: 0,
        required: true,
    },
    discount: {
        type: Number,
        min: 0,
        max: 100,
        required: true,
    },
    creation_fee: {
        type: Number,
        default: 0,
    },
    penalty_fee: {
        type: Number,
        default: 0,
    },
    renewal_fee: {
        type: Number,
        default: 0,
    },
    upgrade_fee: {
        type: Number,
        default: 0,
    },
    cancellation_fee: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
    brokerage_fee: {
        type: Number,
        default: 0,
    },
    other_fees: {
        type: Number,
        default: 0,
    },
    bonus_point: {
        type: Number,
        default: 0,
    },
    status: {
        type: Boolean,
        default: true,
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

pricingSchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.Pricing.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }

        this.id = id;
    }

    next();
});

export const Pricing = mongoose.model('Pricing', pricingSchema);
