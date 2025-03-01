import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const invoiceSchema = new Schema({
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
    type: {
        type: String,
        enum: ['service', 'deposit', 'withdraw', 'recharge', 'withdrawal'],
        required: true,
    },
    currency: {
        type: String,
        enum: ['VND', 'USD'],
        required: true,
    },
    recurring_type: {
        type: String,
        enum: ['buy', 'service', 'register', 'renew', 'upgrade', 'destroy'],
        required: true,
    },
    products: [
        {
            _id: false,
            title: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                default: '',
            },
            unit_price: {
                type: Number,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            fees: {
                type: Number,
                default: 0,
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
        },
    ],
    coupons: [
        {
            _id: false,
            code: {
                type: String,
                required: true,
            },
            discount_type: {
                type: String,
                enum: ['percentage', 'fixed'],
                required: true,
            },
            discount_value: {
                type: Number,
                min: 1,
                required: true,
            },
            description: {
                type: String,
                default: '',
            },
        },
    ],
    status: {
        type: String,
        enum: ['pending', 'completed', 'canceled'],
        required: true,
    },
    bonus_point: {
        type: Number,
        default: 0,
    },
    total_price: {
        type: Number,
        required: true,
    },
    total_payment: {
        type: Number,
        required: true,
    },
    pay_method: {
        type: String,
        enum: ['credit_card', 'debit_card', 'bank_transfer', 'e-wallet', 'app_wallet'],
        required: true,
    },
    userbank_id: {
        type: Schema.Types.ObjectId,
        ref: 'Userbank',
        default: null,
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
    processed_at: {
        type: Date,
        default: Date.now,
    },
    expired_at: {
        type: Date,
        default: Date.now,
    },
});

invoiceSchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.Invoice.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }

        this.id = id;
    }

    next();
});

export const Invoice = mongoose.model('Invoice', invoiceSchema);
