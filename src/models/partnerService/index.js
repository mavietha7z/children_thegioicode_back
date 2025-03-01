import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const partnerServiceSchema = new Schema({
    id: {
        type: Number,
        required: true,
        immutable: true,
        unique: true,
    },
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    partner_id: {
        type: Schema.Types.ObjectId,
        ref: 'Partner',
        required: true,
    },
    category: {
        type: String,
        enum: ['CloudServer', 'Api'],
        required: true,
    },
    service_register: {
        type: Number,
        default: 0,
    },
    discount_type: [
        {
            type: String,
            enum: ['app', 'api'],
            required: true,
        },
    ],
    discount_rules: [
        {
            _id: false,
            service: {
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
        },
    ],
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
});

partnerServiceSchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.PartnerService.findOne({ id: id });
            if (!exist) {
                unique = true;
            }
        }

        this.id = id;
    }

    next();
});

export const PartnerService = mongoose.model('PartnerService', partnerServiceSchema);
