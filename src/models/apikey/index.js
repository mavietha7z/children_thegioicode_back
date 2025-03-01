import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const apikeySchema = new Schema({
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
    service_id: {
        type: Schema.Types.ObjectId,
        refPath: 'service_type',
        required: true,
    },
    service_type: {
        type: String,
        enum: ['Api'],
        required: true,
    },
    free_usage: {
        type: Number,
        default: 0,
    },
    webhooks: {
        url: [
            {
                _id: false,
                domain: {
                    type: String,
                    required: true,
                },
            },
        ],
        security_key: {
            type: String,
            default: '',
        },
    },
    key: {
        type: String,
        required: true,
    },
    use: {
        type: Number,
        default: 0,
    },
    category: {
        type: String,
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
});

apikeySchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.Apikey.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }

        this.id = id;
    }

    next();
});

export const Apikey = mongoose.model('Apikey', apikeySchema);
