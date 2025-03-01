import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const paygateSchema = new Schema({
    id: {
        type: Number,
        unique: true,
        required: true,
        immutable: true,
    },
    name: {
        type: String,
        required: true,
    },
    service: {
        type: String,
        enum: ['recharge', 'withdrawal'],
        required: true,
    },
    logo_url: {
        type: String,
        required: true,
    },
    callback_code: {
        type: String,
        default: '',
    },
    bonus_point: {
        type: Number,
        default: 0,
    },
    promotion: {
        type: Number,
        default: 0,
    },
    vat_tax: {
        type: Number,
        default: 0,
    },
    minimum_payment: {
        type: Number,
        default: 0,
    },
    maximum_payment: {
        type: Number,
        default: 0,
    },
    question: {
        type: String,
        default: '',
    },
    description: {
        type: String,
        default: '',
    },
    status: {
        type: Boolean,
        default: true,
    },
    options: [
        {
            _id: false,
            userbank_id: {
                type: Schema.Types.ObjectId,
                ref: 'Userbank',
                required: true,
            },
            status: {
                type: Boolean,
                default: true,
            },
            created_at: {
                type: Date,
                default: Date.now,
            },
            updated_at: {
                type: Date,
                default: Date.now,
            },
        },
    ],
    created_at: {
        type: Date,
        default: Date.now,
    },
    updated_at: {
        type: Date,
        default: Date.now,
    },
});

paygateSchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.Paygate.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }

        this.id = id;
    }

    next();
});

export const Paygate = mongoose.model('Paygate', paygateSchema);
