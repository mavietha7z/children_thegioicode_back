import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const orderCloudServerSchema = new Schema({
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
    plan_id: {
        type: Schema.Types.ObjectId,
        ref: 'CloudServerPlan',
        required: true,
    },
    region_id: {
        type: Schema.Types.ObjectId,
        ref: 'CloudServerRegion',
        required: true,
    },
    image_id: {
        type: Schema.Types.ObjectId,
        ref: 'CloudServerImage',
        required: true,
    },
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'CloudServerProduct',
        required: true,
    },
    pricing_id: {
        type: Schema.Types.ObjectId,
        ref: 'Pricing',
        required: true,
    },
    slug_url: {
        type: String,
        required: true,
        unique: true,
    },
    display_name: {
        type: String,
        required: true,
    },
    override_price: {
        type: Number,
        required: true,
    },
    auto_renew: {
        type: Boolean,
        default: false,
    },
    backup_server: {
        type: Boolean,
        default: false,
    },
    bandwidth_usage: {
        type: Number,
        default: 0,
    },
    disk_usage: {
        type: Number,
        default: 0,
    },
    cpu_usage: {
        type: Number,
        default: 0,
    },
    memory_usage: {
        type: Number,
        default: 0,
    },
    invoice_id: [
        {
            type: Number,
            required: true,
        },
    ],
    order_info: {
        uuid: {
            type: String,
            required: true,
        },
        order_id: {
            type: String,
            required: true,
        },
        access_ipv4: {
            type: String,
            required: true,
        },
        access_ipv6: {
            type: String,
            default: '',
        },
        hostname: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
        },
        port: {
            type: Number,
            required: true,
        },
    },
    status: {
        type: String,
        enum: ['activated', 'starting', 'restarting', 'stopping', 'rebuilding', 'resizing', 'stopped', 'suspended', 'expired', 'deleted'],
        required: true,
    },
    try_it: {
        type: Boolean,
        default: false,
    },
    method: {
        type: String,
        enum: ['register', 'api'],
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
    expired_at: {
        type: Date,
        required: true,
    },
});

orderCloudServerSchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.OrderCloudServer.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }

        this.id = id;
    }

    next();
});

export const OrderCloudServer = mongoose.model('OrderCloudServer', orderCloudServerSchema);
