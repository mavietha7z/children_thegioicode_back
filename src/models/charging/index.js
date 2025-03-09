import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const chargingSchema = new Schema({
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
    telco: {
        type: String,
        required: true,
    },
    code: {
        type: String,
        required: true,
    },
    serial: {
        type: String,
        required: true,
    },
    declared_value: {
        type: Number,
        required: true,
    },
    value: {
        type: Number,
        default: 0,
    },
    amount: {
        type: Number,
        default: 0,
    },
    fees: {
        type: Number,
        default: 0,
    },
    request_id: {
        type: String,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    status: {
        type: Number,
        required: true,
    },
    trans_id: {
        type: String,
        unique: true,
        required: true,
    },
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
    approved_at: {
        type: Date,
        default: null,
    },
});

chargingSchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.Charging.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }

        this.id = id;
    }

    next();
});

export const Charging = mongoose.model('Charging', chargingSchema);
