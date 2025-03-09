import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const orderSchema = new Schema({
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
    invoice_id: {
        type: Number,
        unique: true,
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
            product_id: {
                type: Schema.Types.ObjectId,
                refPath: 'products.product_type',
                default: null,
            },
            product_type: {
                type: String,
                enum: ['Source', 'CloudServerProduct', 'OrderTemplate', 'OrderCloudServer'],
                default: null,
            },
            pricing_id: {
                type: Schema.Types.ObjectId,
                ref: 'Pricing',
                default: null,
            },
            module: {
                type: String,
                enum: ['buy', 'register', 'renew', 'upgrade'],
                required: true,
            },
            cart_product_id: {
                type: Schema.Types.ObjectId,
                ref: 'CartProduct',
                default: null,
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
        default: 'pending',
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
        enum: ['credit_card', 'debit_card', 'bank_transfer', 'app_wallet'],
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
    paid_at: {
        type: Date,
        default: Date.now,
    },
    expired_at: {
        type: Date,
        default: Date.now,
    },
});

orderSchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.Order.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }

        this.id = id;
    }

    next();
});

export const Order = mongoose.model('Order', orderSchema);
