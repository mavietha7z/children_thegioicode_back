import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const cartProductSchema = new Schema({
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
    cart_id: {
        type: Schema.Types.ObjectId,
        ref: 'Cart',
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    module: {
        type: String,
        enum: ['buy', 'register', 'renew', 'upgrade'],
        required: true,
    },
    product_id: {
        type: Schema.Types.ObjectId,
        refPath: 'product_type',
        required: true,
    },
    product_type: {
        type: String,
        enum: ['Source', 'CloudServerProduct', 'OrderTemplate', 'OrderCloudServer'],
        required: true,
    },
    pricing_id: {
        type: Schema.Types.ObjectId,
        ref: 'Pricing',
        required: true,
    },
    quantity: {
        type: Number,
        min: 1,
        max: 100,
        required: true,
    },
    partner_service_id: {
        type: Schema.Types.ObjectId,
        ref: 'PartnerService',
        default: null,
    },
    coupon_id: {
        type: Schema.Types.ObjectId,
        ref: 'Coupon',
        default: null,
    },
    region_id: {
        type: Schema.Types.ObjectId,
        ref: 'CloudServerRegion',
        default: null,
    },
    image_id: {
        type: Schema.Types.ObjectId,
        ref: 'CloudServerImage',
        default: null,
    },
    plan: {
        id: {
            type: Number,
            default: null,
        },
        title: {
            type: String,
            default: null,
        },
        image_url: {
            type: String,
            default: null,
        },
        description: {
            type: String,
            default: null,
        },
    },
    display_name: {
        type: String,
        default: '',
    },
    additional_services: [
        {
            _id: false,
            required: {
                type: Boolean,
                default: false,
            },
            service_type: {
                type: String,
                enum: ['CloudServer'],
                required: true,
            },
            service_id: {
                type: Schema.Types.ObjectId,
                ref: 'CloudServerProduct',
                required: true,
            },
        },
    ],
    status: {
        type: String,
        enum: ['pending', 'wait_pay'],
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
});

cartProductSchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.CartProduct.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }

        this.id = id;
    }

    next();
});

export const CartProduct = mongoose.model('CartProduct', cartProductSchema);
