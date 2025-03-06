import mongoose, { Schema } from 'mongoose';
import { generateRandomNumber } from '~/configs';

const apiSchema = new Schema({
    id: {
        type: Number,
        unique: true,
        required: true,
        immutable: true,
    },
    partner_id: {
        type: Number,
        unique: true,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        unique: true,
        required: true,
    },
    description: {
        type: String,
        default: '',
    },
    slug_url: {
        type: String,
        unique: true,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    old_price: {
        type: Number,
        required: true,
    },
    priority: {
        type: Number,
        required: true,
    },
    image_url: {
        type: String,
        default: '',
    },
    status: {
        type: String,
        enum: ['activated', 'maintenance', 'blocked'],
        default: 'maintenance',
    },
    free_usage: {
        type: Number,
        default: 0,
    },
    document_html: {
        type: String,
        default: '',
    },
    document_text: {
        type: String,
        default: '',
    },
    version: {
        type: String,
        default: '',
    },
    apikey: {
        key: {
            type: String,
            required: true,
        },
        used: {
            type: Number,
            default: 0,
        },
        status: {
            type: Boolean,
            default: true,
        },
        free_usage: {
            type: Number,
            default: 0,
        },
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

apiSchema.pre('validate', async function (next) {
    if (this.isNew && !this.id) {
        let id;
        let unique = false;

        while (!unique) {
            id = generateRandomNumber(8, 8);

            const exist = await mongoose.models.Api.findOne({ id });
            if (!exist) {
                unique = true;
            }
        }

        this.id = id;
    }

    next();
});

export const Api = mongoose.model('Api', apiSchema);
