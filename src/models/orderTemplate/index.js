import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const orderTemplateSchema = new Schema({
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
    template_id: {
        type: Schema.Types.ObjectId,
        ref: 'Template',
        required: true,
    },
    pricing_id: {
        type: Schema.Types.ObjectId,
        ref: 'Pricing',
        required: true,
    },
    invoice_id: [
        {
            type: Number,
            unique: true,
            required: true,
        },
    ],
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
    auto_renew: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['activated', 'wait_confirm', 'pending', 'inactivated', 'expired', 'blocked', 'deleted'],
        required: true,
    },
    app_domain: {
        type: String,
        required: true,
    },
    admin_domain: {
        type: String,
        default: '',
    },
    email_admin: {
        type: String,
        required: true,
    },
    password_admin: {
        type: String,
        required: true,
    },
    cloudflare: {
        id: {
            type: String,
            required: true,
        },
        plan: {
            type: Object,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
        },
        account: {
            type: Object,
            required: true,
        },
        name_servers: {
            type: [String],
            required: true,
        },
        original_name_servers: {
            type: [String],
            required: true,
        },
        created_on: {
            type: Date,
            default: Date.now,
        },
        modified_on: {
            type: Date,
            default: Date.now,
        },
        activated_on: {
            type: Date,
            default: null,
        },
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

orderTemplateSchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.OrderTemplate.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }

        this.id = id;
    }

    next();
});

export const OrderTemplate = mongoose.model('OrderTemplate', orderTemplateSchema);
